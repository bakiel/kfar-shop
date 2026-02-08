# KFAR Marketplace Visual Assets Inventory

**Last Updated:** January 2025
**Total Images:** 577 files
**Total Size:** 81 MB
**Status:** All image paths verified and working

---

## Directory Structure

```
public/images/
├── teva-deli/          (47 files) - Teva Deli products + logo
├── people-store/       (24 files) - People Store logo + banner
├── garden-of-light/    (13 files) - Garden of Light products + logo
├── queens-cuisine/     (27 files) - Queens Cuisine products + logo
├── gahn-delight/       (4 files)  - Gahn Delight products + logo
├── vop-shop/           (16 files) - VOP Shop products + logo
├── vendors/            (260 files)
│   ├── teva-deli/      - Teva Deli banner + unique assets
│   ├── people-store/   - People Store banner
│   ├── garden-of-light/ - Garden of Light banner
│   ├── queens-cuisine/ - Queens Cuisine banner
│   ├── gahn-delight/   - Gahn Delight banner
│   ├── vop-shop/       - VOP Shop banner
│   └── [root files]    - People Store + VOP Shop product images
├── community/          (103 files) - Village of Peace community photos
├── profiles/           (26 files) - Customer/user profile images
├── hero/               (11 files) - Homepage hero images
├── logos/              (14 files) - KFAR brand logos
├── banners/            (6 files)  - General banner images
├── vendor-banners/     (6 files)  - Additional vendor banners
├── backgrounds/        (4 files)  - Background images
├── templates/          (4 files)  - Store template previews
├── customer-onboarding/ (6 files) - Onboarding flow images
└── events/             (3 files)  - Event images
```

---

## Vendor Assets by Store

### 1. Teva Deli (47 products)
- **Logo:** `/images/teva-deli/teva_deli_official_logo_master_brand_israeli_vegan_food_company.jpg`
- **Banner:** `/images/vendors/teva-deli/banner.jpg`
- **Products:** `/images/teva-deli/teva_deli_vegan_*.jpg`

### 2. People Store (23 products)
- **Logo:** `/images/people-store/peoples_store_official_logo_master_brand_community_market.jpg`
- **Banner:** `/images/vendors/people-store/banner.jpg`
- **Products:** `/images/vendors/Peoples Store - *.jpg`

### 3. Queens Cuisine (12 products)
- **Logo:** `/images/queens-cuisine/queens_cuisine_official_logo_master_brand_plant_based_catering.jpg`
- **Banner:** `/images/vendors/queens-cuisine/banner.jpg`
- **Products:** `/images/queens-cuisine/queens_cuisine_*.jpg`

### 4. Garden of Light (9 products)
- **Logo:** `/images/garden-of-light/garden_of_light_official_logo_master_brand_organic_vegan_deli.jpg`
- **Banner:** `/images/vendors/garden-of-light/banner.jpg`
- **Products:** `/images/garden-of-light/*.jpg`

### 5. Gahn Delight (7 products)
- **Logo:** `/images/gahn-delight/gahn_delight_official_logo_master_brand_ice_cream.jpg`
- **Banner:** `/images/vendors/gahn-delight/banner.jpg`
- **Products:** `/images/gahn-delight/gahn_delight_*.jpg`

### 6. VOP Shop (15 products)
- **Logo:** `/images/vop-shop/vop_shop_official_logo_master_brand_village_of_peace.jpg`
- **Banner:** `/images/vendors/vop-shop/banner.jpg`
- **Products:** `/images/vendors/vop_shop_*.jpg`

---

## Image Path Patterns by Type

| Asset Type | Path Pattern | Example |
|------------|--------------|---------|
| Vendor Logo | `/images/[vendor]/[vendor]_official_logo_*.jpg` | `/images/teva-deli/teva_deli_official_logo_master_brand_israeli_vegan_food_company.jpg` |
| Vendor Banner | `/images/vendors/[vendor]/banner.jpg` | `/images/vendors/teva-deli/banner.jpg` |
| Teva Deli Products | `/images/teva-deli/teva_deli_vegan_*.jpg` | `/images/teva-deli/teva_deli_vegan_seitan_kubeh_*.jpg` |
| People Store Products | `/images/vendors/Peoples Store - *.jpg` | `/images/vendors/Peoples Store - Coconut Water.jpg` |
| VOP Shop Products | `/images/vendors/vop_shop_*.jpg` | `/images/vendors/vop_shop_heritage_home_decor_*.jpg` |
| Community Photos | `/images/community/*.jpg` | `/images/community/village_of_peace_community_authentic_dimona_israel_african_hebrew_israelites_01.jpg` |
| Template Previews | `/images/templates/*-preview.jpg` | `/images/templates/modern-preview.jpg` |

---

## Data Layer Integration

### Main Data Files
- `/lib/data/wordpress-style-data-layer.ts` - Vendor definitions (logos, banners)
- `/lib/data/teva-deli-complete-catalog.ts` - Teva Deli products
- `/lib/data/people-store-catalog.ts` - People Store products
- `/lib/data/review-mock-data.ts` - Review author images
- `/lib/data/about-page-data.ts` - Community page images

### Image Path Verification
All 123 unique image paths in the data layer have been verified to exist on disk.

---

## Adding New Assets

### New Vendor
1. Create folder: `/public/images/[vendor-slug]/`
2. Add logo: `[vendor]_official_logo_*.jpg`
3. Create banner folder: `/public/images/vendors/[vendor-slug]/`
4. Add banner: `banner.jpg`
5. Add product images to vendor folder

### New Product
1. Add image to vendor's product folder
2. Update catalog file with image path
3. Follow naming convention: `[vendor]_[category]_[product_name].jpg`

### Image Requirements
- Format: JPG preferred (smaller file size)
- Logos: ~60KB max, square aspect ratio
- Banners: ~150KB max, 16:9 or 3:1 aspect ratio
- Products: ~100KB max, square or 4:3 aspect ratio

---

## Summary Statistics

| Category | Count |
|----------|-------|
| **Total Images** | 577 |
| **Total Size** | 81 MB |
| **Vendors** | 6 |
| **Total Products** | 106 |
| **Hero Images** | 11 |
| **Community Photos** | 103 |
| **Brand Logos** | 14 |

### Products by Vendor

| Vendor | Product Count |
|--------|---------------|
| Teva Deli | 47 |
| People's Store | 23 |
| Queens Cuisine | 27 |
| VOP Shop | 16 |
| Garden of Light | 13 |
| Gahn Delight | 4 |

---

## Cleanup Completed (January 2025)

The following cleanup was performed:
- Fixed 25 community image path mismatches in `review-mock-data.ts`
- Created 3 service provider placeholder images
- Created 4 template preview images
- Removed 46 duplicate Teva Deli images from `/images/vendors/` root
- Updated image path references from `/images/vendors/` to `/images/teva-deli/`

**Space Saved:** ~10 MB (from 91 MB to 81 MB)
**Files Removed:** 71 duplicate files

---

*Last updated: January 2025*
