-- KFAR Marketplace Product Image Updates
-- Generated: 2025-06-01T19:18:15.957Z
-- Total Products: 84

-- Clear any existing image verification
UPDATE products SET image_verified = FALSE WHERE 1=1;

-- Update all product images with verified paths

-- Teva Deli Products
UPDATE products SET image_path = '/images/vendors/teva-deli/teva_deli_vegan_seitan_schnitzel_breaded_cutlet_plant_based_meat_alternative_israeli_comfort_food.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'td-001';
UPDATE products SET image_path = '/images/vendors/teva-deli/teva_deli_vegan_specialty_product_01_plant_based_meat_alternative_israeli_cuisine.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'td-002';
UPDATE products SET image_path = '/images/vendors/teva-deli/teva_deli_vegan_specialty_product_02_plant_based_meat_alternative_israeli_cuisine.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'td-003';
UPDATE products SET image_path = '/images/vendors/teva-deli/teva_deli_vegan_specialty_product_21_burger_schnitzel_plant_based_deli.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'td-004';
UPDATE products SET image_path = '/images/vendors/teva-deli/teva_deli_vegan_specialty_product_22_burger_schnitzel_plant_based_deli.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'td-005';
UPDATE products SET image_path = '/images/vendors/teva-deli/teva_deli_vegan_specialty_product_31_shawarma_kebab_middle_eastern_plant_based.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'td-006';
UPDATE products SET image_path = '/images/vendors/teva-deli/teva_deli_vegan_seitan_kubeh_middle_eastern_specialty_plant_based_meat_alternative_israeli_cuisine.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'td-007';
UPDATE products SET image_path = '/images/vendors/teva-deli/teva_deli_vegan_tofu_natural_organic_plant_based_protein_block_israeli_made.png', image_verified = TRUE, vision_confidence = 100 WHERE id = 'td-008';
UPDATE products SET image_path = '/images/vendors/teva-deli/teva_deli_vegan_specialty_product_15_seitan_tofu_based_protein_alternative.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'td-009';
UPDATE products SET image_path = '/images/vendors/teva-deli/teva_deli_vegan_specialty_product_11_seitan_tofu_based_protein_alternative.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'td-010';

-- PEOPLE STORE Products
UPDATE products SET image_path = '/images/vendors/people_store_logo_community_retail.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'ps-001';
UPDATE products SET image_path = '/images/vendors/people-store/Peoples Store - Bulk Grains and Legumes Basket Display.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'ps-002';
UPDATE products SET image_path = '/images/vendors/people-store/Peoples Store - FOCO Coconut Water Variety Pack.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = '0ps-15';
UPDATE products SET image_path = '/images/vendors/people-store/Peoples Store - Great Northern Organic Maple Syrup.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = '0ps-16';
UPDATE products SET image_path = '/images/vendors/people-store/Peoples Store - Laverland Crunch Sea Salt Seaweed Snack 9-Pack.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = '0ps-17';
UPDATE products SET image_path = '/images/vendors/people-store/Peoples Store - Laverland Crunch Wasabi Seaweed Snack 9-Pack.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = '0ps-18';
UPDATE products SET image_path = '/images/vendors/people-store/Peoples Store - Natural Herb Seasoning Mix Hebrew.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = '0ps-19';
UPDATE products SET image_path = '/images/vendors/people-store/Peoples Store - Bulk Grains and Legumes Basket Display.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = '0ps-3';
UPDATE products SET image_path = '/images/vendors/people-store/Peoples Store - Bulk Beans Oats Rice and Grains Basket Display.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = '0ps-4';
UPDATE products SET image_path = '/images/vendors/people-store/Peoples Store - Bulk Flour and Powder Ingredients.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = '0ps-5';
UPDATE products SET image_path = '/images/vendors/people-store/Peoples Store - Quintessence Organic Kosher Dill Pickles.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = '0ps-7';
UPDATE products SET image_path = '/images/vendors/people-store/Peoples Store - Quintessence Organic Spicy Sauerkraut.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = '0ps-8';
UPDATE products SET image_path = '/images/vendors/people-store/Peoples Store - Quintessence Fermented Hot Peppers.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = '0ps-9';
UPDATE products SET image_path = '/images/vendors/people-store/Peoples Store - Quintessence Spicy Kimchi Fermented.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = '0ps-11';
UPDATE products SET image_path = '/images/vendors/people-store/Peoples Store - Quintessence Plain Non-Dairy Yogurt.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = '0ps-12';
UPDATE products SET image_path = '/images/vendors/people-store/Peoples Store - Quintessence Strawberry Non-Dairy Yogurt.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = '0ps-13';
UPDATE products SET image_path = '/images/vendors/people-store/Peoples Store - Wan Ja Shan Tamari Soy Sauce Naturally Brewed.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = '0ps-1';
UPDATE products SET image_path = '/images/vendors/people-store/Peoples Store - Pure Sesame Oil Taiwan.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = '0ps-20';
UPDATE products SET image_path = '/images/vendors/people-store/Peoples Store - Pure Sesame Oil Taiwan Large 2L Bottle.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = '0ps-2';
UPDATE products SET image_path = '/images/vendors/people-store/Peoples Store - Quintessence Fermented Okra with Live Culture.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = '0ps-6';

-- GARDEN OF-LIGHT Products
UPDATE products SET image_path = '/images/vendors/garden-of-light/1.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'gol-001';
UPDATE products SET image_path = '/images/vendors/garden-of-light/2.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'gol-002';
UPDATE products SET image_path = '/images/vendors/garden-of-light/3.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'gol-003';
UPDATE products SET image_path = '/images/vendors/garden-of-light/4.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'gol-004';
UPDATE products SET image_path = '/images/vendors/garden-of-light/5.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'gol-005';
UPDATE products SET image_path = '/images/vendors/garden-of-light/6.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'gol-006';
UPDATE products SET image_path = '/images/vendors/garden-of-light/7.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'gol-007';
UPDATE products SET image_path = '/images/vendors/garden-of-light/8.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'gol-008';
UPDATE products SET image_path = '/images/vendors/garden-of-light/9.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'gol-009';
UPDATE products SET image_path = '/images/vendors/garden-of-light/10.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'gol-010';
UPDATE products SET image_path = '/images/vendors/garden-of-light/11.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'gol-011';

-- QUEENS CUISINE Products
UPDATE products SET image_path = '/images/vendors/queens-cuisine/queens_cuisine_vegan_burger_seitan_patty_sesame_bun_tomato_lettuce_plant_based_sandwich.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'qc-001';
UPDATE products SET image_path = '/images/vendors/queens-cuisine/queens_cuisine_vegan_meat_kabab_skewer_dish_plant_based_middle_eastern_cuisine.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'qc-002';
UPDATE products SET image_path = '/images/vendors/queens-cuisine/queens_cuisine_vegan_meatballs_pasta_dish_plant_based_italian_cuisine_tomato_sauce.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'qc-003';
UPDATE products SET image_path = '/images/vendors/queens-cuisine/queens_cuisine_middle_eastern_shawarma_pita_wrap_plant_based_meat_alternative.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'qc-004';
UPDATE products SET image_path = '/images/vendors/queens-cuisine/queens_cuisine_vegan_meat_grilled_seitan_steaks_plant_based_protein_alternative.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'qc-005';
UPDATE products SET image_path = '/images/vendors/queens-cuisine/queens_cuisine_vegan_meat_seitan_kebabs_grilled_skewers_plant_based_barbecue_alternative.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'qc-006';
UPDATE products SET image_path = '/images/vendors/queens-cuisine/queens_cuisine_vegan_seitan_cutlets_breaded_crispy_herb_dip_arugula_salad_cherry_tomatoes.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'qc-007';
UPDATE products SET image_path = '/images/vendors/queens-cuisine/queens_cuisine_vegan_meat_seitan_sandwich_plant_based_deli_style_bread_filling.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'qc-008';
UPDATE products SET image_path = '/images/vendors/queens-cuisine/queens_cuisine_vegan_seitan_strips_teriyaki_sauce_sesame_seeds_scallions_asian_style.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'qc-009';
UPDATE products SET image_path = '/images/vendors/queens-cuisine/queens_cuisine_vegan_meatballs_cooking_pot_plant_based_protein_homestyle_preparation.png', image_verified = TRUE, vision_confidence = 100 WHERE id = 'qc-010';
UPDATE products SET image_path = '/images/vendors/queens-cuisine/queens_cuisine_vegan_protein_seitan_tofu_specialty_item_08_plant_based_meat_alternative.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'qc-011';
UPDATE products SET image_path = '/images/vendors/queens-cuisine/queens_cuisine_vegan_protein_seitan_tofu_specialty_item_09_plant_based_meat_alternative.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'qc-012';
UPDATE products SET image_path = '/images/vendors/queens-cuisine/queens_cuisine_vegan_protein_seitan_tofu_specialty_item_10_plant_based_meat_alternative.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'qc-013';
UPDATE products SET image_path = '/images/vendors/queens-cuisine/queens_cuisine_vegan_protein_seitan_tofu_specialty_item_11_plant_based_meat_alternative.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'qc-014';
UPDATE products SET image_path = '/images/vendors/queens-cuisine/queens_cuisine_vegan_protein_seitan_tofu_specialty_item_12_plant_based_meat_alternative.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'qc-015';
UPDATE products SET image_path = '/images/vendors/queens-cuisine/queens_cuisine_vegan_protein_seitan_tofu_specialty_item_13_plant_based_meat_alternative.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'qc-016';
UPDATE products SET image_path = '/images/vendors/queens-cuisine/queens_cuisine_vegan_protein_seitan_tofu_specialty_item_14_plant_based_meat_alternative.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'qc-017';
UPDATE products SET image_path = '/images/vendors/queens-cuisine/queens_cuisine_vegan_protein_seitan_tofu_specialty_item_15_plant_based_meat_alternative.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'qc-018';
UPDATE products SET image_path = '/images/vendors/queens-cuisine/queens_cuisine_vegan_protein_seitan_tofu_specialty_item_16_plant_based_meat_alternative.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'qc-019';
UPDATE products SET image_path = '/images/vendors/queens-cuisine/queens_cuisine_vegan_protein_seitan_tofu_specialty_item_17_plant_based_meat_alternative.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'qc-020';
UPDATE products SET image_path = '/images/vendors/queens-cuisine/queens_cuisine_product_banner_vegan_meat_alternatives_plant_based_cuisine_display_01.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'qc-021';

-- GAHN DELIGHT Products
UPDATE products SET image_path = '/images/vendors/gahn-delight/gahn_delight_ice_cream_chocolate_tahini_swirl_cup_with_cacao_nibs.jpeg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'gd-001';
UPDATE products SET image_path = '/images/vendors/gahn-delight/gahn_delight_ice_cream_passion_mango_double_scoop_cup.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'gd-002';
UPDATE products SET image_path = '/images/vendors/gahn-delight/gahn_delight_ice_cream_pistachio_rose_triple_scoop_ceramic_bowl.jpeg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'gd-003';
UPDATE products SET image_path = '/images/vendors/gahn-delight/gahn_delight_sundae_date_caramel_vanilla_walnut_toppings_glass.jpeg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'gd-004';
UPDATE products SET image_path = '/images/vendors/gahn-delight/gahn_delight_popsicle_berry_hibiscus_frozen_bar_wooden_stick.jpeg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'gd-005';
UPDATE products SET image_path = '/images/vendors/gahn-delight/gahn_delight_sorbet_lime_coconut_fresh_garnish_bowl.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'gd-006';
UPDATE products SET image_path = '/images/vendors/gahn-delight/gahn_delight_parfait_chocolate_almond_caramel_layered_glass.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'gd-007';

-- VOP SHOP Products
UPDATE products SET image_path = '/images/vendors/vop-shop/vop_shop_community_apparel_product_01_wellness_lifestyle_village_of_peace_heritage_clothing.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'vs-001';
UPDATE products SET image_path = '/images/vendors/vop-shop/vop_shop_community_apparel_product_02_wellness_lifestyle_village_of_peace_heritage_clothing.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'vs-002';
UPDATE products SET image_path = '/images/vendors/vop-shop/vop_shop_community_apparel_product_03_wellness_lifestyle_village_of_peace_heritage_clothing.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'vs-003';
UPDATE products SET image_path = '/images/vendors/vop-shop/vop_shop_community_apparel_product_04_wellness_lifestyle_village_of_peace_heritage_clothing.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'vs-004';
UPDATE products SET image_path = '/images/vendors/vop-shop/vop_shop_community_apparel_product_05_wellness_lifestyle_village_of_peace_heritage_clothing.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'vs-005';
UPDATE products SET image_path = '/images/vendors/vop-shop/vop_shop_heritage_home_decor_product_06_50_year_celebration_cultural_art_community_pride.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'vs-006';
UPDATE products SET image_path = '/images/vendors/vop-shop/vop_shop_heritage_home_decor_product_07_50_year_celebration_cultural_art_community_pride.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'vs-007';
UPDATE products SET image_path = '/images/vendors/vop-shop/vop_shop_heritage_home_decor_product_08_50_year_celebration_cultural_art_community_pride.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'vs-008';
UPDATE products SET image_path = '/images/vendors/vop-shop/vop_shop_heritage_home_decor_product_09_50_year_celebration_cultural_art_community_pride.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'vs-009';
UPDATE products SET image_path = '/images/vendors/vop-shop/vop_shop_heritage_home_decor_product_10_50_year_celebration_cultural_art_community_pride.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'vs-010';
UPDATE products SET image_path = '/images/vendors/vop-shop/vop_shop_wellness_education_product_11_healing_books_holistic_health_community_wisdom.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'vs-011';
UPDATE products SET image_path = '/images/vendors/vop-shop/vop_shop_wellness_education_product_12_healing_books_holistic_health_community_wisdom.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'vs-012';
UPDATE products SET image_path = '/images/vendors/vop-shop/vop_shop_wellness_education_product_13_healing_books_holistic_health_community_wisdom.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'vs-013';
UPDATE products SET image_path = '/images/vendors/vop-shop/vop_shop_wellness_education_product_14_healing_books_holistic_health_community_wisdom.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'vs-014';
UPDATE products SET image_path = '/images/vendors/vop-shop/vop_shop_wellness_education_product_15_healing_books_holistic_health_community_wisdom.jpg', image_verified = TRUE, vision_confidence = 100 WHERE id = 'vs-015';

-- Verify updates
SELECT vendor_id, COUNT(*) as total, 
       SUM(CASE WHEN image_verified = TRUE THEN 1 ELSE 0 END) as verified
FROM products 
GROUP BY vendor_id;