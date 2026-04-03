import os
import random
from pathlib import Path
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.core.files import File
from django.utils.text import slugify
from restaurant.models import Restaurant
from menu.models import Category, MenuItem, Cuisine
from django.db import transaction
from django.db.models import Q

User = get_user_model()

# ──────────────────────────────────────────────────────────────────────────────
# Auto-detect local images directory
# - Locally: backend/initial_images/ folder probably exists → use local files
# - On Render: folder won't have images (only the README) → use Unsplash URLs
# ──────────────────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent  # → backend/
LOCAL_IMAGES_DIR = BASE_DIR / 'initial_images'
USE_LOCAL_IMAGES = (LOCAL_IMAGES_DIR / 'cuisines').exists()


def get_image(subfolder: str, filename: str, unsplash_url: str):
    """
    Returns either:
    - A Django File object (from local disk) if the file exists
    - A plain Unsplash URL string as fallback
    """
    if USE_LOCAL_IMAGES:
        path = LOCAL_IMAGES_DIR / subfolder / filename
        if path.exists():
            return ('local', path)
    return ('url', f"{unsplash_url}?q=60&w=600&auto=format&fit=crop")


def save_image_to_model(instance, field_name: str, image_info):
    """
    Given image_info = ('local', Path) or ('url', str),
    either saves the File to the model or sets the URL string directly.
    """
    kind, value = image_info
    field = getattr(instance, field_name)

    if kind == 'local':
        with open(value, 'rb') as f:
            field.save(value.name, File(f), save=True)
    else:
        # For Unsplash URLs: store the URL string directly in the ImageField
        # Django ImageField can store any string (URL or path) in the DB
        instance.__class__.objects.filter(pk=instance.pk).update(**{field_name: value})


class Command(BaseCommand):
    help = 'Seeds the database with 30 restaurants and 3,000 items. Uses local images if present, Unsplash as fallback.'

    CATEGORY_GROUPS = {
        'malabar': ['Best Sellers', 'Malabar Specials', 'Biryanis', 'Kerala Meals', 'Seafood', 'Snacks', 'Beverages', 'Desserts'],
        'arabian': ['Best Sellers', 'Mandhi', 'Alfaham & Grill', 'Platters', 'Wraps', 'Beverages', 'Desserts', 'Combos'],
        'cafe': ['Best Sellers', 'Breakfast', 'Sandwiches', 'Pasta & Pizza', 'Coffee', 'Shakes', 'Desserts', 'Quick Bites'],
        'bakery': ['Best Sellers', 'Bakes', 'Breads', 'Puffs & Rolls', 'Cakes', 'Beverages', 'Snacks', 'Desserts'],
        'veg': ['Best Sellers', 'South Indian', 'North Indian', 'Curries', 'Rice Bowls', 'Juices', 'Desserts', 'Family Packs'],
        'grill': ['Best Sellers', 'BBQ', 'Shawarma', 'Burger & Sandwich', 'Rice & Noodles', 'Beverages', 'Desserts', 'Family Meals'],
    }

    CITY_ADDRESSES = {
        'Kozhikode': [
            'SM Street, Kozhikode, Kerala',
            'Mavoor Road, Kozhikode, Kerala',
            'Beach Road, Kozhikode, Kerala',
            'Palayam, Kozhikode, Kerala',
            'Nadakkavu, Kozhikode, Kerala',
            'Eranhipalam, Kozhikode, Kerala',
            'Medical College Junction, Kozhikode, Kerala',
            'Kallai Road, Kozhikode, Kerala',
            'Pavamani Road, Kozhikode, Kerala',
            'Ramanattukara, Kozhikode, Kerala',
        ],
        'Kochi': [
            'MG Road, Kochi, Kerala',
            'Fort Kochi, Kochi, Kerala',
            'Panampilly Nagar, Kochi, Kerala',
            'Edappally, Kochi, Kerala',
            'Kakkanad, Kochi, Kerala',
            'Marine Drive, Kochi, Kerala',
            'Kaloor, Kochi, Kerala',
            'Palarivattom, Kochi, Kerala',
            'Thevara, Kochi, Kerala',
            'Vyttila, Kochi, Kerala',
        ],
        'Kannur': [
            'Talap, Kannur, Kerala',
            'Fort Road, Kannur, Kerala',
            'Thalassery Road, Kannur, Kerala',
            'Payyambalam, Kannur, Kerala',
            'South Bazar, Kannur, Kerala',
            'Pallikunnu, Kannur, Kerala',
            'Mele Chovva, Kannur, Kerala',
            'Thavakkara, Kannur, Kerala',
            'Chakkarakkal, Kannur, Kerala',
            'Kizhunna, Kannur, Kerala',
        ],
    }

    def handle(self, *args, **kwargs):
        mode = "LOCAL IMAGES" if USE_LOCAL_IMAGES else "UNSPLASH URLs"
        random.seed(42)
        self.stdout.write(self.style.WARNING(f'Starting seeding engine - image mode: {mode}'))

        try:
            with transaction.atomic():
                self.clear_old_data()
                self.seed_admin_and_users()
                self.seed_global_cuisines()
                self.seed_mega_production_empire()

            self.stdout.write(self.style.SUCCESS('\nSUCCESS: 3,000+ items across 30 hotels!'))
            self.stdout.write(self.style.WARNING('Default password for all seeded users: password123'))
        except Exception as e:
            import traceback
            self.stdout.write(self.style.ERROR(f'Seeding failed: {str(e)}'))
            self.stdout.write(self.style.ERROR(traceback.format_exc()))

    def clear_old_data(self):
        self.stdout.write('Wiping old data...')
        MenuItem.objects.all().delete()
        Category.objects.all().delete()
        Cuisine.objects.all().delete()
        Restaurant.objects.all().delete()
        self.stdout.write('Database is now clean.')

    def seed_admin_and_users(self):
        self.stdout.write('Seeding portal users...')
        users = [
            {'email': 'admin@savor.com', 'username': 'savor_admin', 'role': 'admin', 'is_staff': True, 'is_superuser': True},
            {'email': 'customer1@savor.com', 'username': 'customer_kochi', 'role': 'customer'},
            {'email': 'customer2@savor.com', 'username': 'customer_kozhikode', 'role': 'customer'},
            {'email': 'customer3@savor.com', 'username': 'customer_kannur', 'role': 'customer'},
            {'email': 'rider1@savor.com', 'username': 'rider_kochi_1', 'role': 'delivery'},
            {'email': 'rider2@savor.com', 'username': 'rider_kochi_2', 'role': 'delivery'},
            {'email': 'rider3@savor.com', 'username': 'rider_kozhikode_1', 'role': 'delivery'},
            {'email': 'rider4@savor.com', 'username': 'rider_kozhikode_2', 'role': 'delivery'},
            {'email': 'rider5@savor.com', 'username': 'rider_kannur_1', 'role': 'delivery'},
            {'email': 'rider6@savor.com', 'username': 'rider_kannur_2', 'role': 'delivery'},
        ]
        for u_data in users:
            user = User.objects.filter(Q(email=u_data['email']) | Q(username=u_data['username'])).first()
            if not user:
                user = User.objects.create(email=u_data['email'], username=u_data['username'])

            user.role = u_data['role']
            user.is_staff = u_data.get('is_staff', False)
            user.is_superuser = u_data.get('is_superuser', False)
            user.is_active = True
            user.is_available = u_data['role'] == 'delivery'
            user.set_password('password123')
            user.save()

    def seed_global_cuisines(self):
        self.stdout.write('Seeding global cuisines...')

        # (cuisine_name, local_filename, unsplash_url)
        self.cuisines_data = {
            'Biryani':      ('biryani.jpg',      'https://images.unsplash.com/photo-1563379091339-03b21bc4a6f8'),
            'Burger':       ('burger.jpg',        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd'),
            'Pizza':        ('pizza.jpg',         'https://images.unsplash.com/photo-1513104890138-7c749659a591'),
            'Mandhi':       ('mandhi.jpg',        'https://images.unsplash.com/photo-1633945274405-b6c8069047b0'),
            'Seafood':      ('seafood.jpg',       'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2'),
            'Tea & Snacks': ('tea_snacks.jpg',    'https://images.unsplash.com/photo-1544787210-282fd23217c6'),
            'Desserts':     ('desserts.jpg',      'https://images.unsplash.com/photo-1551024506-0bccd828d307'),
            'Chinese':      ('chinese.jpg',       'https://images.unsplash.com/photo-1512058564366-18510be2db19'),
            'Shawaya':      ('shawaya.jpg',       'https://images.unsplash.com/photo-1599481238640-4c1288750d7a'),
            'Breakfast':    ('breakfast.jpg',     'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666'),
            'Veg Specials': ('veg_specials.jpg',  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'),
            'Juices':       ('juices.jpg',        'https://images.unsplash.com/photo-1513558161293-cdaf76589fd8'),
            'Italian':      ('italian.jpg',       'https://images.unsplash.com/photo-1473093226795-af9932fe5856'),
            'South Indian': ('south_indian.jpg',  'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8'),
            'North Indian': ('north_indian.jpg',  'https://images.unsplash.com/photo-1585937421612-70a008356fbe'),
        }

        for name, (filename, unsplash) in self.cuisines_data.items():
            image_info = get_image('cuisines', filename, unsplash)
            kind, value = image_info

            if kind == 'local':
                cuisine = Cuisine.objects.create(name=name)
                with open(value, 'rb') as f:
                    cuisine.image.save(filename, File(f), save=True)
                self.stdout.write(f'  OK {name} -> local image')
            else:
                Cuisine.objects.create(name=name, image=value)
                self.stdout.write(f'  OK {name} -> Unsplash URL')

    def seed_mega_production_empire(self):
        self.stdout.write('Building the 30-hotel demo data...')

        # (name, cuisine_label, local_filename, unsplash_url)
        cities = {
            'Kozhikode': [
                ('Calicut Paragon',  'Malabar, Seafood',        'calicut_paragon.jpg',  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4'),
                ('Rahmath Hotel',    'Malabar, Beef Specialty', 'rahmath.jpg',           'https://images.unsplash.com/photo-1552566626-52f8b828add9'),
                ('Sagar Hotel',      'South Indian, Biryani',   'sagar.jpg',             'https://images.unsplash.com/photo-1504674900247-0877df9cc836'),
                ('Zains Hotel',      'Traditional Malabar',     'zains.jpg',             'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b'),
                ('Mezban',           'Fine Dining, Indian',     'mezban.jpg',            'https://images.unsplash.com/photo-1559339352-11d035aa65de'),
                ('Topform',          'Biryani, Non-Veg',        'topform.jpg',           'https://images.unsplash.com/photo-1520201163981-8cc95007dd2a'),
                ('Alkapuri',         'Legendary Malabar',       'alkapuri.jpg',          'https://images.unsplash.com/photo-1511914265872-c40692f694e0'),
                ("King's Mouth",     'Arabian, Chinese',        'kings_mouth.jpg',       'https://images.unsplash.com/photo-1574096079513-d8259312b785'),
                ('Hotel de Choice',  'South Indian, Snacks',    'hotel_de_choice.jpg',   'https://images.unsplash.com/photo-1482049016688-2d3e1b311543'),
                ('M-Grill',          'Grill, BBQ, Continental', 'mgrill_kzd.jpg',        'https://images.unsplash.com/photo-1544025162-d76694265947'),
            ],
            'Kochi': [
                ('Dhe Puttu',        'Specialty Puttu',         'dhe_puttu.jpg',         'https://images.unsplash.com/photo-1414235077428-338989a2e8c0'),
                ('Paragon (Lulu)',   'Malabar, Premium',        'paragon_lulu.jpg',      'https://images.unsplash.com/photo-1555396273-367ea474df03'),
                ('Grand Pavilion',   'South Indian, Seafood',   'grand_pavilion.jpg',    'https://images.unsplash.com/photo-1493770348161-369560ae357d'),
                ('Hotel Seagull',    'Coastal, Continental',    'hotel_seagull.jpg',     'https://images.unsplash.com/photo-1551632432-c735e8399521'),
                ('Mullapanthal',     'Traditional Toddy Shop',  'mullapanthal.jpg',      'https://images.unsplash.com/photo-1543353071-873f17a7a088'),
                ('Arippa',           'Nadan Kerala Food',       'arippa.jpg',            'https://images.unsplash.com/photo-1563379091339-03b21bc4a6f8'),
                ('Kashi Art Cafe',   'Continental, European',   'kashi_art.jpg',         'https://images.unsplash.com/photo-1502301103665-0b95cc738def'),
                ('Dal Chili',        'North Indian, Snacks',    'dal_chili.jpg',         'https://images.unsplash.com/photo-1533777419517-3e4017e2e15a'),
                ('Paragon Kochi',    'Malabar Express',         'paragon_kochi.jpg',     'https://images.unsplash.com/photo-1551632432-c735e8399521'),
                ('Ceylon Bake House','Ceylonese, Bakery',       'ceylon_bake.jpg',       'https://images.unsplash.com/photo-1464306208223-e0b4495a5553'),
            ],
            'Kannur': [
                ('Hotel Othens',     'Legendary Nadan Food',    'hotel_othens.jpg',      'https://images.unsplash.com/photo-1543353071-873f17a7a088'),
                ('Barka',            'Mandhi, Arabian',         'barka.jpg',             'https://images.unsplash.com/photo-1633945274405-b6c8069047b0'),
                ('M-Grill Kannur',   'Modern Grill',            'mgrill_kannur.jpg',     'https://images.unsplash.com/photo-1544025162-d76694265947'),
                ('Choice Hotel',     'South Indian',            'choice_hotel.jpg',      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4'),
                ('Sahara',           'Traditional Arabic',      'sahara.jpg',            'https://images.unsplash.com/photo-1599481238640-4c1288750d7a'),
                ('Onas Kitchen',     'Homemade Kerala',         'onas_kitchen.jpg',      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'),
                ('Raandhal',         'Traditional Kerala',      'raandhal.jpg',          'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8'),
                ("Sahib's Grill",    'Steaks & BBQ',            'sahib_grill.jpg',       'https://images.unsplash.com/photo-1467003909585-2f8a72700288'),
                ('Soft Drinks',      'Juices & Desserts',       'soft_drinks.jpg',       'https://images.unsplash.com/photo-1513558161293-cdaf76589fd8'),
                ('Cabane Special',   'Fine Dining',             'cabane_special.jpg',    'https://images.unsplash.com/photo-1552566626-52f8b828add9'),
            ],
        }

        dish_map = {
            'Biryani':      ['Chicken Biryani', 'Beef Biryani', 'Mutton Biryani', 'Egg Biryani', 'Fish Biryani', 'Prawns Biryani'],
            'Burger':       ['Beef Burger', 'Chicken Burger', 'Cheese Burger', 'Special Zinger', 'Double Decker Burger'],
            'Pizza':        ['Margherita', 'Chicken Delight', 'Beef Salami', 'Veggie Supreme', 'Pepperoni'],
            'Mandhi':       ['Chicken Mandi', 'Alfam Mandi', 'Beef Mandi', 'Mutton Mandi', 'Kuzhimandi'],
            'Seafood':      ['Karimeen Pollichathu', 'Fish Moilee', 'Chemmeen Fry', 'Kallummakkaya Fry', 'Squid Roast'],
            'Tea & Snacks': ['Milk Tea', 'Kattan Chaya', 'Sulaimani', 'Pazham Pori', 'Unnakaya', 'Chicken Samosa'],
            'Desserts':     ['Gulab Jamun', 'Fruit Salad', 'Falooda', 'Vanilla Icecream', 'Chocolate Lava'],
            'Chinese':      ['Chicken Fried Rice', 'Veg Fried Rice', 'Chicken Noodles', 'Chilli Chicken', 'Gobi Manchurian'],
            'Shawaya':      ['Full Shawaya', 'Half Shawaya', 'Peri Peri Alfam', 'Mexican Grill', 'BBQ Chicken'],
            'Breakfast':    ['Appam & Stew', 'Idiyappam & Egg Curry', 'Masala Dosa', 'Puttu & Kadala', 'Porotta & Beef Fry'],
            'Veg Specials': ['Veg Meals', 'Paneer Butter Masala', 'Veg Kurma', 'Dal Fry', 'Gobi 65'],
            'Juices':       ['Sharjah Shake', 'Avil Milk', 'Chocolate Shake', 'Fresh Lime', 'Mint Lime'],
            'Italian':      ['Chicken Alfredo Pasta', 'Arrabbiata Pasta', 'Lasagna', 'Garlic Bread', 'Mushroom Risotto'],
            'North Indian': ['Butter Chicken', 'Kadai Chicken', 'Paneer Tikka Masala', 'Jeera Rice', 'Butter Naan'],
        }

        category_cuisine_map = {
            'Best Sellers': ['Biryani', 'Shawaya', 'Burger', 'Seafood', 'Chinese'],
            'Malabar Specials': ['Biryani', 'Seafood', 'Breakfast'],
            'Biryanis': ['Biryani'],
            'Kerala Meals': ['Breakfast', 'Seafood', 'Veg Specials'],
            'Seafood': ['Seafood'],
            'Snacks': ['Tea & Snacks'],
            'Beverages': ['Juices', 'Desserts'],
            'Desserts': ['Desserts'],
            'Mandhi': ['Mandhi'],
            'Alfaham & Grill': ['Shawaya'],
            'Platters': ['Mandhi', 'Shawaya', 'Chinese'],
            'Wraps': ['Burger', 'Shawaya'],
            'Combos': ['Biryani', 'Chinese', 'Burger'],
            'Breakfast': ['Breakfast', 'Tea & Snacks'],
            'Sandwiches': ['Burger'],
            'Pasta & Pizza': ['Pizza', 'Italian'],
            'Coffee': ['Tea & Snacks', 'Desserts'],
            'Shakes': ['Juices', 'Desserts'],
            'Quick Bites': ['Burger', 'Tea & Snacks', 'Chinese'],
            'Bakes': ['Desserts', 'Tea & Snacks'],
            'Breads': ['Breakfast'],
            'Puffs & Rolls': ['Tea & Snacks', 'Burger'],
            'Cakes': ['Desserts'],
            'South Indian': ['Breakfast', 'Veg Specials'],
            'North Indian': ['North Indian', 'Veg Specials'],
            'Curries': ['North Indian', 'Veg Specials', 'Seafood'],
            'Rice Bowls': ['Biryani', 'Chinese'],
            'Family Packs': ['Biryani', 'Mandhi', 'Veg Specials'],
            'BBQ': ['Shawaya'],
            'Shawarma': ['Shawaya', 'Burger'],
            'Burger & Sandwich': ['Burger'],
            'Rice & Noodles': ['Chinese', 'Biryani'],
            'Family Meals': ['Mandhi', 'Biryani', 'Chinese'],
        }

        cuisines = {c.name: c for c in Cuisine.objects.all()}
        owner_count = 1
        prices = [10, 15, 20, 25, 40, 50, 80, 100, 150, 180, 200, 250, 350, 450, 600]
        variations = ['', '(Special)', 'Combo', 'LITE', 'Premium', 'Nadan', 'Swag Style']

        for city, res_list in cities.items():
            self.stdout.write(f'Seeding {city}...')
            for name, cuisine_label, local_file, unsplash in res_list:
                owner_email, owner_username = self.build_owner_credentials(city, name, owner_count)
                owner, created = User.objects.get_or_create(
                    email=owner_email,
                    defaults={'username': owner_username}
                )
                owner.username = owner_username
                owner.role = 'restaurant'
                owner.is_staff = False
                owner.is_superuser = False
                owner.is_active = True
                owner.is_available = False
                owner.set_password('password123')
                owner.save()
                owner_count += 1

                # Resolve logo image
                logo_info = get_image('restaurants', local_file, unsplash)
                logo_kind, logo_value = logo_info

                # Create restaurant (logo set after if local)
                restaurant = Restaurant.objects.create(
                    owner=owner,
                    name=name,
                    cuisine=cuisine_label,
                    address=self.CITY_ADDRESSES[city][(owner_count - 2) % len(self.CITY_ADDRESSES[city])],
                    phone=f"9{''.join([str(random.randint(0,9)) for _ in range(9)])}",
                    logo='' if logo_kind == 'local' else logo_value,
                )

                # Save local logo if available
                if logo_kind == 'local':
                    with open(logo_value, 'rb') as f:
                        restaurant.logo.save(local_file, File(f), save=True)

                # Create 10 menu sections
                section_group = self.get_category_group(cuisine_label, name)
                sections = self.CATEGORY_GROUPS[section_group]
                cat_objs = [Category.objects.create(restaurant=restaurant, name=s) for s in sections]

                # Create 100 menu items with more realistic category mapping
                for i in range(100):
                    section = cat_objs[i % len(cat_objs)]
                    allowed_cuisines = category_cuisine_map.get(section.name, list(dish_map.keys()))
                    cuisine_type = random.choice(allowed_cuisines)
                    cuisine_obj = cuisines[cuisine_type]
                    dish_base = random.choice(dish_map[cuisine_type])
                    final_name = f"{dish_base} {random.choice(variations)}".strip()

                    # Menu item images always use Unsplash (no local for 3,000 items)
                    _, item_img_url = self.cuisines_data[cuisine_obj.name]
                    item_img = f"{item_img_url}?q=30&w=400&auto=format&fit=crop"

                    MenuItem.objects.create(
                        restaurant=restaurant,
                        category=section,
                        cuisine=cuisine_obj,
                        name=f"{final_name} #{i+1}",
                        description=f"Our authentic {final_name.lower()} — Chef's secret recipe from {city}.",
                        price=random.choice(prices),
                        image=item_img,
                        is_recommended=random.choice([True, False, False, False]),
                        is_popular=random.choice([True, False, False]),
                        is_available=True,
                    )

                self.stdout.write(f'  OK {name} - 100 items added')

    def get_category_group(self, cuisine_label, restaurant_name):
        label = f'{restaurant_name} {cuisine_label}'.lower()
        if any(keyword in label for keyword in ['mandhi', 'arabian', 'alfam', 'shawaya']):
            return 'arabian'
        if any(keyword in label for keyword in ['cafe', 'bake', 'continental', 'european']):
            return 'cafe'
        if any(keyword in label for keyword in ['bakery', 'ceylon']):
            return 'bakery'
        if any(keyword in label for keyword in ['veg', 'puttu', 'south indian']):
            return 'veg'
        if any(keyword in label for keyword in ['grill', 'bbq', 'steak']):
            return 'grill'
        return 'malabar'

    def build_owner_credentials(self, city, restaurant_name, owner_index):
        base_slug = slugify(f'{restaurant_name}-{city}')
        return (
            f'{base_slug}@savor.com',
            f'partner_{base_slug}_{owner_index}',
        )
