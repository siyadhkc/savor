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

local seed data usage
## admin
Email: admin@savor.com
Username: savor_admin
Password: password123
Role: ADMIN

## customer
| Name         | Email                                                         | Username     |
| ------------ | ------------------------------------------------------------- | ------------ |
| Amina Joseph | [customer_amina@savor.com](mailto:customer_amina@savor.com)   | amina_joseph |
| Nikhil Das   | [customer_nikhil@savor.com](mailto:customer_nikhil@savor.com) | nikhil_das   |
| Riya Mathew  | [customer_riya@savor.com](mailto:customer_riya@savor.com)     | riya_mathew  |
| Farhan Ali   | [customer_farhan@savor.com](mailto:customer_farhan@savor.com) | farhan_ali   |
| Sana Fathima | [customer_sana@savor.com](mailto:customer_sana@savor.com)     | sana_fathima |
| Arjun Menon  | [customer_arjun@savor.com](mailto:customer_arjun@savor.com)   | arjun_menon  |

## delivery agents
| Name              | Email                                                             | Username          | Available |
| ----------------- | ----------------------------------------------------------------- | ----------------- | --------- |
| Kochi Rider 1     | [rider_kochi_1@savor.com](mailto:rider_kochi_1@savor.com)         | kochi_rider_1     | ✅         |
| Kochi Rider 2     | [rider_kochi_2@savor.com](mailto:rider_kochi_2@savor.com)         | kochi_rider_2     | ✅         |
| Kozhikode Rider 1 | [rider_kozhikode_1@savor.com](mailto:rider_kozhikode_1@savor.com) | kozhikode_rider_1 | ✅         |
| Kozhikode Rider 2 | [rider_kozhikode_2@savor.com](mailto:rider_kozhikode_2@savor.com) | kozhikode_rider_2 | ✅         |
| Kannur Rider 1    | [rider_kannur_1@savor.com](mailto:rider_kannur_1@savor.com)       | kannur_rider_1    | ✅         |
| Kannur Rider 2    | [rider_kannur_2@savor.com](mailto:rider_kannur_2@savor.com)       | kannur_rider_2    | ❌         |

## Restaurant owners
| Restaurant      | Email                                                                             | Username                             |
| --------------- | --------------------------------------------------------------------------------- | ------------------------------------ |
| Calicut Paragon | [calicut-paragon-kozhikode@savor.com](mailto:calicut-paragon-kozhikode@savor.com) | restaurant_calicut-paragon-kozhikode |
| Rahmath Hotel   | [rahmath-hotel-kozhikode@savor.com](mailto:rahmath-hotel-kozhikode@savor.com)     | restaurant_rahmath-hotel-kozhikode   |
| Sagar Hotel     | [sagar-hotel-kozhikode@savor.com](mailto:sagar-hotel-kozhikode@savor.com)         | restaurant_sagar-hotel-kozhikode     |
| Restaurant     | Email                                                                   |
| -------------- | ----------------------------------------------------------------------- |
| Dhe Puttu      | [dhe-puttu-kochi@savor.com](mailto:dhe-puttu-kochi@savor.com)           |
| Paragon Lulu   | [paragon-lulu-kochi@savor.com](mailto:paragon-lulu-kochi@savor.com)     |
| Grand Pavilion | [grand-pavilion-kochi@savor.com](mailto:grand-pavilion-kochi@savor.com) |
| Restaurant     | Email                                                                     |
| -------------- | ------------------------------------------------------------------------- |
| Hotel Othens   | [hotel-othens-kannur@savor.com](mailto:hotel-othens-kannur@savor.com)     |
| Barka          | [barka-kannur@savor.com](mailto:barka-kannur@savor.com)                   |
| M-Grill Kannur | [m-grill-kannur-kannur@savor.com](mailto:m-grill-kannur-kannur@savor.com) |



i will show a work flow of this project 
## step1 admin
admin
show dashboard users,
## step2 customer
login
browse resturent
add to cart 
place order
## step3 restaurant admin
Login
Accept order
Change status
## Delivery agent 
Login
Accept delivery
Mark delivered
earning dashboard
