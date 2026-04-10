# 📸 Local Seed Images

Place your local images here before running `python manage.py seed_kerala`.

The script will **auto-detect** these files. If found, local images are used.
If missing, it falls back to **Unsplash URLs** (used on the live Render server).

---

## `/cuisines/` — Global Cuisine Images (Home Page "What are you craving?")

| Filename | Cuisine |
|---|---|
| `biryani.jpg` | Biryani |
| `burger.jpg` | Burger |
| `pizza.jpg` | Pizza |
| `mandhi.jpg` | Mandhi |
| `seafood.jpg` | Seafood |
| `tea_snacks.jpg` | Tea & Snacks |
| `desserts.jpg` | Desserts |
| `chinese.jpg` | Chinese |
| `shawaya.jpg` | Shawaya |
| `breakfast.jpg` | Breakfast |
| `veg_specials.jpg` | Veg Specials |
| `juices.jpg` | Juices |
| `italian.jpg` | Italian |
| `south_indian.jpg` | South Indian |
| `north_indian.jpg` | North Indian |

---

## `/restaurants/` — Restaurant Logos/Banners

| Filename | Restaurant |
|---|---|
| `calicut_paragon.jpg` | Calicut Paragon |
| `rahmath.jpg` | Rahmath Hotel |
| `sagar.jpg` | Sagar Hotel |
| `zains.jpg` | Zains Hotel |
| `mezban.jpg` | Mezban |
| `topform.jpg` | Topform |
| `alkapuri.jpg` | Alkapuri |
| `kings_mouth.jpg` | King's Mouth |
| `hotel_de_choice.jpg` | Hotel de Choice |
| `mgrill_kzd.jpg` | M-Grill (Kozhikode) |
| `dhe_puttu.jpg` | Dhe Puttu |
| `paragon_lulu.jpg` | Paragon (Lulu) |
| `grand_pavilion.jpg` | Grand Pavilion |
| `hotel_seagull.jpg` | Hotel Seagull |
| `mullapanthal.jpg` | Mullapanthal |
| `arippa.jpg` | Arippa |
| `kashi_art.jpg` | Kashi Art Cafe |
| `dal_chili.jpg` | Dal Chili |
| `paragon_kochi.jpg` | Paragon Kochi |
| `ceylon_bake.jpg` | Ceylon Bake House |
| `hotel_othens.jpg` | Hotel Othens |
| `barka.jpg` | Barka |
| `mgrill_kannur.jpg` | M-Grill Kannur |
| `choice_hotel.jpg` | Choice Hotel |
| `sahara.jpg` | Sahara |
| `onas_kitchen.jpg` | Onas Kitchen |
| `raandhal.jpg` | Raandhal |
| `sahib_grill.jpg` | Sahib's Grill |
| `soft_drinks.jpg` | Soft Drinks |
| `cabane_special.jpg` | Cabane Special |

---

## `/menu_items/` — Individual Dish Images (New!)

Place your dish-specific images here. The script uses **Base Names** for mapping.

**Naming Pattern:** `dish_name.jpg` (lowercase, underscore instead of space)

| Filename (Example) | Base Dish Name |
|---|---|
| `chicken_biryani.jpg` | Chicken Biryani |
| `beef_biryani.jpg` | Beef Biryani |
| `chicken_burger.jpg` | Chicken Burger |
| `margherita_pizza.jpg` | Margherita Pizza |
| `chicken_mandhi.jpg` | Chicken Mandhi |
| `fish_curry_meals.jpg` | Fish Curry Meals |
| `falooda.jpg` | Falooda |
| `chicken_fried_rice.jpg`| Chicken Fried Rice |
| `full_shawaya.jpg` | Full Shawaya |
| `puttu_and_kadala.jpg` | Puttu and Kadala |
| `sharjah_shake.jpg` | Sharjah Shake |

> **Pro Tip:** You don't need 100 different filenames. If you have "Chicken Biryani Special" and "Chicken Biryani Combo", both will automatically use `chicken_biryani.jpg` if found.

---

> **Tip:** Recommended image size: **600×400px JPG**, max 500KB each.
> **Note:** Unsplash fallbacks have been removed. If a menu image is missing, it will now fall back to the **Cuisine image** (local).
