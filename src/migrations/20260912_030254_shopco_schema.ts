import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_roles" AS ENUM('admin', 'editor', 'customer');
  CREATE TYPE "public"."enum_users_status" AS ENUM('active', 'inactive');
  CREATE TYPE "public"."enum_brands_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__brands_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_categories_available_filter_groups" AS ENUM('price', 'color', 'size', 'brand', 'dressStyle');
  CREATE TYPE "public"."enum_categories_default_sort" AS ENUM('popular', 'newest', 'priceAscending', 'priceDescending');
  CREATE TYPE "public"."enum_categories_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__categories_v_version_available_filter_groups" AS ENUM('price', 'color', 'size', 'brand', 'dressStyle');
  CREATE TYPE "public"."enum__categories_v_version_default_sort" AS ENUM('popular', 'newest', 'priceAscending', 'priceDescending');
  CREATE TYPE "public"."enum__categories_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_products_featured_sections" AS ENUM('newArrivals', 'topSelling');
  CREATE TYPE "public"."enum_products_badge" AS ENUM('none', 'new', 'sale', 'bestSeller');
  CREATE TYPE "public"."enum_products_visibility" AS ENUM('catalog', 'hidden', 'archived');
  CREATE TYPE "public"."enum_products_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__products_v_version_featured_sections" AS ENUM('newArrivals', 'topSelling');
  CREATE TYPE "public"."enum__products_v_version_badge" AS ENUM('none', 'new', 'sale', 'bestSeller');
  CREATE TYPE "public"."enum__products_v_version_visibility" AS ENUM('catalog', 'hidden', 'archived');
  CREATE TYPE "public"."enum__products_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_reviews_status" AS ENUM('pending', 'approved', 'rejected', 'spam');
  CREATE TYPE "public"."enum_promotions_type" AS ENUM('percentage', 'fixed');
  CREATE TYPE "public"."enum_promotions_applies_to" AS ENUM('all', 'products', 'categories');
  CREATE TYPE "public"."enum_orders_delivery_method" AS ENUM('standard', 'express', 'pickup');
  CREATE TYPE "public"."enum_orders_payment_provider" AS ENUM('manual', 'stripe', 'midtrans');
  CREATE TYPE "public"."enum_orders_payment_status" AS ENUM('pending', 'paid', 'failed', 'refunded');
  CREATE TYPE "public"."enum_orders_fulfillment_status" AS ENUM('unfulfilled', 'processing', 'shipped', 'delivered', 'cancelled');
  CREATE TYPE "public"."enum_store_settings_currency" AS ENUM('USD', 'IDR');
  CREATE TYPE "public"."enum_header_navigation_items_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum_header_logo_type" AS ENUM('text', 'image');
  CREATE TYPE "public"."enum_header_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__header_v_version_navigation_items_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum__header_v_version_logo_type" AS ENUM('text', 'image');
  CREATE TYPE "public"."enum__header_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_footer_social_links_platform" AS ENUM('facebook', 'instagram', 'twitter', 'youtube', 'github');
  CREATE TYPE "public"."enum_footer_logo_type" AS ENUM('text', 'image');
  CREATE TYPE "public"."enum_footer_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__footer_v_version_social_links_platform" AS ENUM('facebook', 'instagram', 'twitter', 'youtube', 'github');
  CREATE TYPE "public"."enum__footer_v_version_logo_type" AS ENUM('text', 'image');
  CREATE TYPE "public"."enum__footer_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_homepage_new_arrivals_mode" AS ENUM('manual', 'automatic');
  CREATE TYPE "public"."enum_homepage_new_arrivals_automatic_source" AS ENUM('featured', 'newArrivals', 'topSelling');
  CREATE TYPE "public"."enum_homepage_top_selling_mode" AS ENUM('manual', 'automatic');
  CREATE TYPE "public"."enum_homepage_top_selling_automatic_source" AS ENUM('featured', 'newArrivals', 'topSelling');
  CREATE TYPE "public"."enum_homepage_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__homepage_v_version_new_arrivals_mode" AS ENUM('manual', 'automatic');
  CREATE TYPE "public"."enum__homepage_v_version_new_arrivals_automatic_source" AS ENUM('featured', 'newArrivals', 'topSelling');
  CREATE TYPE "public"."enum__homepage_v_version_top_selling_mode" AS ENUM('manual', 'automatic');
  CREATE TYPE "public"."enum__homepage_v_version_top_selling_automatic_source" AS ENUM('featured', 'newArrivals', 'topSelling');
  CREATE TYPE "public"."enum__homepage_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "users_roles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"status" "enum_users_status" DEFAULT 'active' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_product_card_url" varchar,
  	"sizes_product_card_width" numeric,
  	"sizes_product_card_height" numeric,
  	"sizes_product_card_mime_type" varchar,
  	"sizes_product_card_filesize" numeric,
  	"sizes_product_card_filename" varchar,
  	"sizes_product_detail_url" varchar,
  	"sizes_product_detail_width" numeric,
  	"sizes_product_detail_height" numeric,
  	"sizes_product_detail_mime_type" varchar,
  	"sizes_product_detail_filesize" numeric,
  	"sizes_product_detail_filename" varchar,
  	"sizes_open_graph_url" varchar,
  	"sizes_open_graph_width" numeric,
  	"sizes_open_graph_height" numeric,
  	"sizes_open_graph_mime_type" varchar,
  	"sizes_open_graph_filesize" numeric,
  	"sizes_open_graph_filename" varchar
  );
  
  CREATE TABLE "brands" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"description" varchar,
  	"website" varchar,
  	"logo_id" integer,
  	"logo_light_id" integer,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"is_featured" boolean DEFAULT false,
  	"sort_order" numeric DEFAULT 0,
  	"is_active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_brands_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_brands_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_description" varchar,
  	"version_website" varchar,
  	"version_logo_id" integer,
  	"version_logo_light_id" integer,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_is_featured" boolean DEFAULT false,
  	"version_sort_order" numeric DEFAULT 0,
  	"version_is_active" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__brands_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "categories_available_filter_groups" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_categories_available_filter_groups",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"description" varchar,
  	"hero_image_id" integer,
  	"default_sort" "enum_categories_default_sort" DEFAULT 'popular',
  	"show_filters" boolean DEFAULT true,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"meta_canonical_url" varchar,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"parent_id" integer,
  	"is_visible" boolean DEFAULT true,
  	"sort_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_categories_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "categories_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer
  );
  
  CREATE TABLE "_categories_v_version_available_filter_groups" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__categories_v_version_available_filter_groups",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_categories_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_description" varchar,
  	"version_hero_image_id" integer,
  	"version_default_sort" "enum__categories_v_version_default_sort" DEFAULT 'popular',
  	"version_show_filters" boolean DEFAULT true,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_canonical_url" varchar,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_parent_id" integer,
  	"version_is_visible" boolean DEFAULT true,
  	"version_sort_order" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__categories_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_categories_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer
  );
  
  CREATE TABLE "products_details" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar
  );
  
  CREATE TABLE "products_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"alt_override" varchar
  );
  
  CREATE TABLE "products_variants" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"color_name" varchar,
  	"color_hex" varchar,
  	"size" varchar,
  	"sku" varchar,
  	"price_override" numeric,
  	"stock" numeric DEFAULT 0,
  	"is_active" boolean DEFAULT true
  );
  
  CREATE TABLE "products_featured_sections" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_products_featured_sections",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"short_description" varchar,
  	"description" jsonb,
  	"featured_image_id" integer,
  	"sku" varchar,
  	"price" numeric,
  	"compare_at_price" numeric,
  	"cost_price" numeric,
  	"track_inventory" boolean DEFAULT true,
  	"stock" numeric DEFAULT 0,
  	"badge" "enum_products_badge" DEFAULT 'none',
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"meta_canonical_url" varchar,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"category_id" integer,
  	"brand_id" integer,
  	"visibility" "enum_products_visibility" DEFAULT 'catalog',
  	"is_featured" boolean DEFAULT false,
  	"sort_priority" numeric DEFAULT 0,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_products_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "products_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer
  );
  
  CREATE TABLE "_products_v_version_details" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"alt_override" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_variants" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"color_name" varchar,
  	"color_hex" varchar,
  	"size" varchar,
  	"sku" varchar,
  	"price_override" numeric,
  	"stock" numeric DEFAULT 0,
  	"is_active" boolean DEFAULT true,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_featured_sections" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__products_v_version_featured_sections",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_products_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_short_description" varchar,
  	"version_description" jsonb,
  	"version_featured_image_id" integer,
  	"version_sku" varchar,
  	"version_price" numeric,
  	"version_compare_at_price" numeric,
  	"version_cost_price" numeric,
  	"version_track_inventory" boolean DEFAULT true,
  	"version_stock" numeric DEFAULT 0,
  	"version_badge" "enum__products_v_version_badge" DEFAULT 'none',
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_canonical_url" varchar,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_category_id" integer,
  	"version_brand_id" integer,
  	"version_visibility" "enum__products_v_version_visibility" DEFAULT 'catalog',
  	"version_is_featured" boolean DEFAULT false,
  	"version_sort_priority" numeric DEFAULT 0,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__products_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_products_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer
  );
  
  CREATE TABLE "reviews" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"author_name" varchar NOT NULL,
  	"author_email" varchar NOT NULL,
  	"content" varchar NOT NULL,
  	"rating" numeric NOT NULL,
  	"verified_purchase" boolean DEFAULT false,
  	"moderator_notes" varchar,
  	"moderated_by_id" integer,
  	"moderated_at" timestamp(3) with time zone,
  	"product_id" integer NOT NULL,
  	"status" "enum_reviews_status" DEFAULT 'pending' NOT NULL,
  	"featured" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "promotions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"code" varchar NOT NULL,
  	"type" "enum_promotions_type" DEFAULT 'percentage' NOT NULL,
  	"value" numeric NOT NULL,
  	"minimum_subtotal" numeric,
  	"maximum_discount" numeric,
  	"applies_to" "enum_promotions_applies_to" DEFAULT 'all' NOT NULL,
  	"starts_at" timestamp(3) with time zone,
  	"ends_at" timestamp(3) with time zone,
  	"usage_limit" numeric,
  	"usage_limit_per_customer" numeric,
  	"used_count" numeric DEFAULT 0 NOT NULL,
  	"is_active" boolean DEFAULT true,
  	"priority" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "promotions_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer,
  	"categories_id" integer
  );
  
  CREATE TABLE "orders_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"product_id" integer,
  	"product_snapshot_id" varchar NOT NULL,
  	"category_id" varchar,
  	"product_name" varchar NOT NULL,
  	"sku" varchar NOT NULL,
  	"variant_color" varchar,
  	"variant_size" varchar,
  	"quantity" numeric NOT NULL,
  	"unit_price" numeric NOT NULL,
  	"line_total" numeric NOT NULL
  );
  
  CREATE TABLE "orders_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"status" varchar NOT NULL,
  	"message" varchar NOT NULL,
  	"occurred_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "orders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"customer_name" varchar NOT NULL,
  	"customer_email" varchar NOT NULL,
  	"customer_phone" varchar,
  	"shipping_address_recipient_name" varchar NOT NULL,
  	"shipping_address_line1" varchar NOT NULL,
  	"shipping_address_line2" varchar,
  	"shipping_address_city" varchar NOT NULL,
  	"shipping_address_province" varchar NOT NULL,
  	"shipping_address_postal_code" varchar NOT NULL,
  	"shipping_address_country" varchar DEFAULT 'Indonesia' NOT NULL,
  	"billing_same_as_shipping" boolean DEFAULT true,
  	"billing_address_recipient_name" varchar,
  	"billing_address_line1" varchar,
  	"billing_address_line2" varchar,
  	"billing_address_city" varchar,
  	"billing_address_province" varchar,
  	"billing_address_postal_code" varchar,
  	"billing_address_country" varchar DEFAULT 'Indonesia',
  	"delivery_method" "enum_orders_delivery_method" DEFAULT 'standard' NOT NULL,
  	"payment_provider" "enum_orders_payment_provider",
  	"payment_reference" varchar,
  	"subtotal" numeric NOT NULL,
  	"discount" numeric NOT NULL,
  	"delivery_fee" numeric DEFAULT 0 NOT NULL,
  	"tax_rate" numeric DEFAULT 0 NOT NULL,
  	"tax" numeric NOT NULL,
  	"total" numeric NOT NULL,
  	"internal_notes" varchar,
  	"order_number" varchar,
  	"payment_status" "enum_orders_payment_status" DEFAULT 'pending' NOT NULL,
  	"fulfillment_status" "enum_orders_fulfillment_status" DEFAULT 'unfulfilled' NOT NULL,
  	"customer_id" integer,
  	"promotion_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"brands_id" integer,
  	"categories_id" integer,
  	"products_id" integer,
  	"reviews_id" integer,
  	"promotions_id" integer,
  	"orders_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "store_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"store_name" varchar DEFAULT 'SHOP.CO' NOT NULL,
  	"support_email" varchar,
  	"support_phone" varchar,
  	"locale" varchar DEFAULT 'en-US' NOT NULL,
  	"currency" "enum_store_settings_currency" DEFAULT 'USD' NOT NULL,
  	"default_product_image_id" integer,
  	"default_delivery_fee" numeric DEFAULT 15 NOT NULL,
  	"free_shipping_threshold" numeric,
  	"tax_rate" numeric DEFAULT 0 NOT NULL,
  	"prices_include_tax" boolean DEFAULT false,
  	"cart_session_minutes" numeric DEFAULT 1440 NOT NULL,
  	"title_template" varchar DEFAULT '%s | SHOP.CO' NOT NULL,
  	"default_description" varchar,
  	"default_share_image_id" integer,
  	"maintenance_mode" boolean DEFAULT false,
  	"catalog_enabled" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "header_navigation_items_children" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "header_navigation_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"type" "enum_header_navigation_items_type" DEFAULT 'internal',
  	"category_id" integer,
  	"url" varchar,
  	"new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "header" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"announcement_enabled" boolean DEFAULT true,
  	"announcement_message" varchar,
  	"announcement_link_label" varchar,
  	"announcement_link_url" varchar,
  	"announcement_starts_at" timestamp(3) with time zone,
  	"announcement_ends_at" timestamp(3) with time zone,
  	"logo_type" "enum_header_logo_type" DEFAULT 'text',
  	"logo_text" varchar DEFAULT 'SHOP.CO',
  	"logo_image_id" integer,
  	"search_placeholder" varchar DEFAULT 'Search for products...',
  	"cart_label" varchar DEFAULT 'Open cart',
  	"account_label" varchar DEFAULT 'Open account',
  	"is_active" boolean DEFAULT true,
  	"_status" "enum_header_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_header_v_version_navigation_items_children" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_header_v_version_navigation_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"type" "enum__header_v_version_navigation_items_type" DEFAULT 'internal',
  	"category_id" integer,
  	"url" varchar,
  	"new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_header_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_announcement_enabled" boolean DEFAULT true,
  	"version_announcement_message" varchar,
  	"version_announcement_link_label" varchar,
  	"version_announcement_link_url" varchar,
  	"version_announcement_starts_at" timestamp(3) with time zone,
  	"version_announcement_ends_at" timestamp(3) with time zone,
  	"version_logo_type" "enum__header_v_version_logo_type" DEFAULT 'text',
  	"version_logo_text" varchar DEFAULT 'SHOP.CO',
  	"version_logo_image_id" integer,
  	"version_search_placeholder" varchar DEFAULT 'Search for products...',
  	"version_cart_label" varchar DEFAULT 'Open cart',
  	"version_account_label" varchar DEFAULT 'Open account',
  	"version_is_active" boolean DEFAULT true,
  	"version__status" "enum__header_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "footer_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_footer_social_links_platform",
  	"url" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "footer_link_groups_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "footer_link_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar
  );
  
  CREATE TABLE "footer_legal_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "footer_payment_methods" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"logo_id" integer,
  	"alt" varchar
  );
  
  CREATE TABLE "footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"logo_type" "enum_footer_logo_type" DEFAULT 'text',
  	"logo_text" varchar DEFAULT 'SHOP.CO',
  	"logo_image_id" integer,
  	"brand_description" varchar,
  	"newsletter_heading" varchar,
  	"newsletter_email_placeholder" varchar DEFAULT 'Enter your email address',
  	"newsletter_submit_label" varchar DEFAULT 'Subscribe to Newsletter',
  	"newsletter_success_message" varchar,
  	"newsletter_error_message" varchar,
  	"copyright" varchar,
  	"is_active" boolean DEFAULT true,
  	"show_newsletter" boolean DEFAULT true,
  	"_status" "enum_footer_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_footer_v_version_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"platform" "enum__footer_v_version_social_links_platform",
  	"url" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_footer_v_version_link_groups_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_footer_v_version_link_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_footer_v_version_legal_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_footer_v_version_payment_methods" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"logo_id" integer,
  	"alt" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_footer_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_logo_type" "enum__footer_v_version_logo_type" DEFAULT 'text',
  	"version_logo_text" varchar DEFAULT 'SHOP.CO',
  	"version_logo_image_id" integer,
  	"version_brand_description" varchar,
  	"version_newsletter_heading" varchar,
  	"version_newsletter_email_placeholder" varchar DEFAULT 'Enter your email address',
  	"version_newsletter_submit_label" varchar DEFAULT 'Subscribe to Newsletter',
  	"version_newsletter_success_message" varchar,
  	"version_newsletter_error_message" varchar,
  	"version_copyright" varchar,
  	"version_is_active" boolean DEFAULT true,
  	"version_show_newsletter" boolean DEFAULT true,
  	"version__status" "enum__footer_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "homepage_statistics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "homepage_dress_styles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"image_id" integer,
  	"category_id" integer
  );
  
  CREATE TABLE "homepage" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_heading" varchar,
  	"hero_description" varchar,
  	"hero_cta_label" varchar,
  	"hero_cta_url" varchar,
  	"hero_image_id" integer,
  	"hero_mobile_image_id" integer,
  	"brands_heading" varchar,
  	"new_arrivals_heading" varchar DEFAULT 'NEW ARRIVALS',
  	"new_arrivals_mode" "enum_homepage_new_arrivals_mode" DEFAULT 'manual',
  	"new_arrivals_automatic_source" "enum_homepage_new_arrivals_automatic_source" DEFAULT 'newArrivals',
  	"new_arrivals_category_id" integer,
  	"new_arrivals_limit" numeric DEFAULT 4,
  	"top_selling_heading" varchar DEFAULT 'TOP SELLING',
  	"top_selling_mode" "enum_homepage_top_selling_mode" DEFAULT 'manual',
  	"top_selling_automatic_source" "enum_homepage_top_selling_automatic_source" DEFAULT 'topSelling',
  	"top_selling_category_id" integer,
  	"top_selling_limit" numeric DEFAULT 4,
  	"dress_styles_heading" varchar DEFAULT 'BROWSE BY DRESS STYLE',
  	"testimonials_heading" varchar DEFAULT 'OUR HAPPY CUSTOMERS',
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"meta_canonical_url" varchar,
  	"structured_data_enabled" boolean DEFAULT true,
  	"published_at" timestamp(3) with time zone,
  	"_status" "enum_homepage_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "homepage_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"brands_id" integer,
  	"products_id" integer,
  	"reviews_id" integer
  );
  
  CREATE TABLE "_homepage_v_version_statistics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v_version_dress_styles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"image_id" integer,
  	"category_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_hero_heading" varchar,
  	"version_hero_description" varchar,
  	"version_hero_cta_label" varchar,
  	"version_hero_cta_url" varchar,
  	"version_hero_image_id" integer,
  	"version_hero_mobile_image_id" integer,
  	"version_brands_heading" varchar,
  	"version_new_arrivals_heading" varchar DEFAULT 'NEW ARRIVALS',
  	"version_new_arrivals_mode" "enum__homepage_v_version_new_arrivals_mode" DEFAULT 'manual',
  	"version_new_arrivals_automatic_source" "enum__homepage_v_version_new_arrivals_automatic_source" DEFAULT 'newArrivals',
  	"version_new_arrivals_category_id" integer,
  	"version_new_arrivals_limit" numeric DEFAULT 4,
  	"version_top_selling_heading" varchar DEFAULT 'TOP SELLING',
  	"version_top_selling_mode" "enum__homepage_v_version_top_selling_mode" DEFAULT 'manual',
  	"version_top_selling_automatic_source" "enum__homepage_v_version_top_selling_automatic_source" DEFAULT 'topSelling',
  	"version_top_selling_category_id" integer,
  	"version_top_selling_limit" numeric DEFAULT 4,
  	"version_dress_styles_heading" varchar DEFAULT 'BROWSE BY DRESS STYLE',
  	"version_testimonials_heading" varchar DEFAULT 'OUR HAPPY CUSTOMERS',
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_canonical_url" varchar,
  	"version_structured_data_enabled" boolean DEFAULT true,
  	"version_published_at" timestamp(3) with time zone,
  	"version__status" "enum__homepage_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_homepage_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"brands_id" integer,
  	"products_id" integer,
  	"reviews_id" integer
  );
  
  ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "brands" ADD CONSTRAINT "brands_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "brands" ADD CONSTRAINT "brands_logo_light_id_media_id_fk" FOREIGN KEY ("logo_light_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_brands_v" ADD CONSTRAINT "_brands_v_parent_id_brands_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_brands_v" ADD CONSTRAINT "_brands_v_version_logo_id_media_id_fk" FOREIGN KEY ("version_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_brands_v" ADD CONSTRAINT "_brands_v_version_logo_light_id_media_id_fk" FOREIGN KEY ("version_logo_light_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories_available_filter_groups" ADD CONSTRAINT "categories_available_filter_groups_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories_rels" ADD CONSTRAINT "categories_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories_rels" ADD CONSTRAINT "categories_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_categories_v_version_available_filter_groups" ADD CONSTRAINT "_categories_v_version_available_filter_groups_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_categories_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_categories_v" ADD CONSTRAINT "_categories_v_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_categories_v" ADD CONSTRAINT "_categories_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_categories_v" ADD CONSTRAINT "_categories_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_categories_v" ADD CONSTRAINT "_categories_v_version_parent_id_categories_id_fk" FOREIGN KEY ("version_parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_categories_v_rels" ADD CONSTRAINT "_categories_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_categories_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_categories_v_rels" ADD CONSTRAINT "_categories_v_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_details" ADD CONSTRAINT "products_details_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_gallery" ADD CONSTRAINT "products_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_gallery" ADD CONSTRAINT "products_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_variants" ADD CONSTRAINT "products_variants_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_featured_sections" ADD CONSTRAINT "products_featured_sections_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_details" ADD CONSTRAINT "_products_v_version_details_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_gallery" ADD CONSTRAINT "_products_v_version_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_version_gallery" ADD CONSTRAINT "_products_v_version_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_variants" ADD CONSTRAINT "_products_v_version_variants_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_featured_sections" ADD CONSTRAINT "_products_v_version_featured_sections_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_parent_id_products_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_featured_image_id_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_category_id_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_brand_id_brands_id_fk" FOREIGN KEY ("version_brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_moderated_by_id_users_id_fk" FOREIGN KEY ("moderated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "promotions_rels" ADD CONSTRAINT "promotions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."promotions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "promotions_rels" ADD CONSTRAINT "promotions_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "promotions_rels" ADD CONSTRAINT "promotions_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders_items" ADD CONSTRAINT "orders_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders_items" ADD CONSTRAINT "orders_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders_timeline" ADD CONSTRAINT "orders_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_promotion_id_promotions_id_fk" FOREIGN KEY ("promotion_id") REFERENCES "public"."promotions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_brands_fk" FOREIGN KEY ("brands_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reviews_fk" FOREIGN KEY ("reviews_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_promotions_fk" FOREIGN KEY ("promotions_id") REFERENCES "public"."promotions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_orders_fk" FOREIGN KEY ("orders_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "store_settings" ADD CONSTRAINT "store_settings_default_product_image_id_media_id_fk" FOREIGN KEY ("default_product_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "store_settings" ADD CONSTRAINT "store_settings_default_share_image_id_media_id_fk" FOREIGN KEY ("default_share_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "header_navigation_items_children" ADD CONSTRAINT "header_navigation_items_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header_navigation_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_navigation_items" ADD CONSTRAINT "header_navigation_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "header_navigation_items" ADD CONSTRAINT "header_navigation_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header" ADD CONSTRAINT "header_logo_image_id_media_id_fk" FOREIGN KEY ("logo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_header_v_version_navigation_items_children" ADD CONSTRAINT "_header_v_version_navigation_items_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_header_v_version_navigation_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_header_v_version_navigation_items" ADD CONSTRAINT "_header_v_version_navigation_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_header_v_version_navigation_items" ADD CONSTRAINT "_header_v_version_navigation_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_header_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_header_v" ADD CONSTRAINT "_header_v_version_logo_image_id_media_id_fk" FOREIGN KEY ("version_logo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_social_links" ADD CONSTRAINT "footer_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_link_groups_links" ADD CONSTRAINT "footer_link_groups_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_link_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_link_groups" ADD CONSTRAINT "footer_link_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_legal_links" ADD CONSTRAINT "footer_legal_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_payment_methods" ADD CONSTRAINT "footer_payment_methods_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_payment_methods" ADD CONSTRAINT "footer_payment_methods_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer" ADD CONSTRAINT "footer_logo_image_id_media_id_fk" FOREIGN KEY ("logo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_footer_v_version_social_links" ADD CONSTRAINT "_footer_v_version_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_link_groups_links" ADD CONSTRAINT "_footer_v_version_link_groups_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v_version_link_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_link_groups" ADD CONSTRAINT "_footer_v_version_link_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_legal_links" ADD CONSTRAINT "_footer_v_version_legal_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_payment_methods" ADD CONSTRAINT "_footer_v_version_payment_methods_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_footer_v_version_payment_methods" ADD CONSTRAINT "_footer_v_version_payment_methods_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v" ADD CONSTRAINT "_footer_v_version_logo_image_id_media_id_fk" FOREIGN KEY ("version_logo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_statistics" ADD CONSTRAINT "homepage_statistics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_dress_styles" ADD CONSTRAINT "homepage_dress_styles_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_dress_styles" ADD CONSTRAINT "homepage_dress_styles_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_dress_styles" ADD CONSTRAINT "homepage_dress_styles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage" ADD CONSTRAINT "homepage_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage" ADD CONSTRAINT "homepage_hero_mobile_image_id_media_id_fk" FOREIGN KEY ("hero_mobile_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage" ADD CONSTRAINT "homepage_new_arrivals_category_id_categories_id_fk" FOREIGN KEY ("new_arrivals_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage" ADD CONSTRAINT "homepage_top_selling_category_id_categories_id_fk" FOREIGN KEY ("top_selling_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage" ADD CONSTRAINT "homepage_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_brands_fk" FOREIGN KEY ("brands_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_reviews_fk" FOREIGN KEY ("reviews_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_statistics" ADD CONSTRAINT "_homepage_v_version_statistics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_dress_styles" ADD CONSTRAINT "_homepage_v_version_dress_styles_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_dress_styles" ADD CONSTRAINT "_homepage_v_version_dress_styles_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_dress_styles" ADD CONSTRAINT "_homepage_v_version_dress_styles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v" ADD CONSTRAINT "_homepage_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v" ADD CONSTRAINT "_homepage_v_version_hero_mobile_image_id_media_id_fk" FOREIGN KEY ("version_hero_mobile_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v" ADD CONSTRAINT "_homepage_v_version_new_arrivals_category_id_categories_id_fk" FOREIGN KEY ("version_new_arrivals_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v" ADD CONSTRAINT "_homepage_v_version_top_selling_category_id_categories_id_fk" FOREIGN KEY ("version_top_selling_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v" ADD CONSTRAINT "_homepage_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v_rels" ADD CONSTRAINT "_homepage_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_rels" ADD CONSTRAINT "_homepage_v_rels_brands_fk" FOREIGN KEY ("brands_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_rels" ADD CONSTRAINT "_homepage_v_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_rels" ADD CONSTRAINT "_homepage_v_rels_reviews_fk" FOREIGN KEY ("reviews_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_roles_order_idx" ON "users_roles" USING btree ("order");
  CREATE INDEX "users_roles_parent_idx" ON "users_roles" USING btree ("parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_product_card_sizes_product_card_filename_idx" ON "media" USING btree ("sizes_product_card_filename");
  CREATE INDEX "media_sizes_product_detail_sizes_product_detail_filename_idx" ON "media" USING btree ("sizes_product_detail_filename");
  CREATE INDEX "media_sizes_open_graph_sizes_open_graph_filename_idx" ON "media" USING btree ("sizes_open_graph_filename");
  CREATE INDEX "brands_name_idx" ON "brands" USING btree ("name");
  CREATE INDEX "brands_logo_idx" ON "brands" USING btree ("logo_id");
  CREATE INDEX "brands_logo_light_idx" ON "brands" USING btree ("logo_light_id");
  CREATE UNIQUE INDEX "brands_slug_idx" ON "brands" USING btree ("slug");
  CREATE INDEX "brands_updated_at_idx" ON "brands" USING btree ("updated_at");
  CREATE INDEX "brands_created_at_idx" ON "brands" USING btree ("created_at");
  CREATE INDEX "brands__status_idx" ON "brands" USING btree ("_status");
  CREATE INDEX "_brands_v_parent_idx" ON "_brands_v" USING btree ("parent_id");
  CREATE INDEX "_brands_v_version_version_name_idx" ON "_brands_v" USING btree ("version_name");
  CREATE INDEX "_brands_v_version_version_logo_idx" ON "_brands_v" USING btree ("version_logo_id");
  CREATE INDEX "_brands_v_version_version_logo_light_idx" ON "_brands_v" USING btree ("version_logo_light_id");
  CREATE INDEX "_brands_v_version_version_slug_idx" ON "_brands_v" USING btree ("version_slug");
  CREATE INDEX "_brands_v_version_version_updated_at_idx" ON "_brands_v" USING btree ("version_updated_at");
  CREATE INDEX "_brands_v_version_version_created_at_idx" ON "_brands_v" USING btree ("version_created_at");
  CREATE INDEX "_brands_v_version_version__status_idx" ON "_brands_v" USING btree ("version__status");
  CREATE INDEX "_brands_v_created_at_idx" ON "_brands_v" USING btree ("created_at");
  CREATE INDEX "_brands_v_updated_at_idx" ON "_brands_v" USING btree ("updated_at");
  CREATE INDEX "_brands_v_latest_idx" ON "_brands_v" USING btree ("latest");
  CREATE INDEX "categories_available_filter_groups_order_idx" ON "categories_available_filter_groups" USING btree ("order");
  CREATE INDEX "categories_available_filter_groups_parent_idx" ON "categories_available_filter_groups" USING btree ("parent_id");
  CREATE INDEX "categories_name_idx" ON "categories" USING btree ("name");
  CREATE INDEX "categories_hero_image_idx" ON "categories" USING btree ("hero_image_id");
  CREATE INDEX "categories_meta_meta_image_idx" ON "categories" USING btree ("meta_image_id");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE INDEX "categories__status_idx" ON "categories" USING btree ("_status");
  CREATE INDEX "categories_rels_order_idx" ON "categories_rels" USING btree ("order");
  CREATE INDEX "categories_rels_parent_idx" ON "categories_rels" USING btree ("parent_id");
  CREATE INDEX "categories_rels_path_idx" ON "categories_rels" USING btree ("path");
  CREATE INDEX "categories_rels_products_id_idx" ON "categories_rels" USING btree ("products_id");
  CREATE INDEX "_categories_v_version_available_filter_groups_order_idx" ON "_categories_v_version_available_filter_groups" USING btree ("order");
  CREATE INDEX "_categories_v_version_available_filter_groups_parent_idx" ON "_categories_v_version_available_filter_groups" USING btree ("parent_id");
  CREATE INDEX "_categories_v_parent_idx" ON "_categories_v" USING btree ("parent_id");
  CREATE INDEX "_categories_v_version_version_name_idx" ON "_categories_v" USING btree ("version_name");
  CREATE INDEX "_categories_v_version_version_hero_image_idx" ON "_categories_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_categories_v_version_meta_version_meta_image_idx" ON "_categories_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_categories_v_version_version_slug_idx" ON "_categories_v" USING btree ("version_slug");
  CREATE INDEX "_categories_v_version_version_parent_idx" ON "_categories_v" USING btree ("version_parent_id");
  CREATE INDEX "_categories_v_version_version_updated_at_idx" ON "_categories_v" USING btree ("version_updated_at");
  CREATE INDEX "_categories_v_version_version_created_at_idx" ON "_categories_v" USING btree ("version_created_at");
  CREATE INDEX "_categories_v_version_version__status_idx" ON "_categories_v" USING btree ("version__status");
  CREATE INDEX "_categories_v_created_at_idx" ON "_categories_v" USING btree ("created_at");
  CREATE INDEX "_categories_v_updated_at_idx" ON "_categories_v" USING btree ("updated_at");
  CREATE INDEX "_categories_v_latest_idx" ON "_categories_v" USING btree ("latest");
  CREATE INDEX "_categories_v_rels_order_idx" ON "_categories_v_rels" USING btree ("order");
  CREATE INDEX "_categories_v_rels_parent_idx" ON "_categories_v_rels" USING btree ("parent_id");
  CREATE INDEX "_categories_v_rels_path_idx" ON "_categories_v_rels" USING btree ("path");
  CREATE INDEX "_categories_v_rels_products_id_idx" ON "_categories_v_rels" USING btree ("products_id");
  CREATE INDEX "products_details_order_idx" ON "products_details" USING btree ("_order");
  CREATE INDEX "products_details_parent_id_idx" ON "products_details" USING btree ("_parent_id");
  CREATE INDEX "products_gallery_order_idx" ON "products_gallery" USING btree ("_order");
  CREATE INDEX "products_gallery_parent_id_idx" ON "products_gallery" USING btree ("_parent_id");
  CREATE INDEX "products_gallery_image_idx" ON "products_gallery" USING btree ("image_id");
  CREATE INDEX "products_variants_order_idx" ON "products_variants" USING btree ("_order");
  CREATE INDEX "products_variants_parent_id_idx" ON "products_variants" USING btree ("_parent_id");
  CREATE INDEX "products_featured_sections_order_idx" ON "products_featured_sections" USING btree ("order");
  CREATE INDEX "products_featured_sections_parent_idx" ON "products_featured_sections" USING btree ("parent_id");
  CREATE INDEX "products_name_idx" ON "products" USING btree ("name");
  CREATE INDEX "products_featured_image_idx" ON "products" USING btree ("featured_image_id");
  CREATE UNIQUE INDEX "products_sku_idx" ON "products" USING btree ("sku");
  CREATE INDEX "products_meta_meta_image_idx" ON "products" USING btree ("meta_image_id");
  CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");
  CREATE INDEX "products_category_idx" ON "products" USING btree ("category_id");
  CREATE INDEX "products_brand_idx" ON "products" USING btree ("brand_id");
  CREATE INDEX "products_updated_at_idx" ON "products" USING btree ("updated_at");
  CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");
  CREATE INDEX "products__status_idx" ON "products" USING btree ("_status");
  CREATE INDEX "products_rels_order_idx" ON "products_rels" USING btree ("order");
  CREATE INDEX "products_rels_parent_idx" ON "products_rels" USING btree ("parent_id");
  CREATE INDEX "products_rels_path_idx" ON "products_rels" USING btree ("path");
  CREATE INDEX "products_rels_products_id_idx" ON "products_rels" USING btree ("products_id");
  CREATE INDEX "_products_v_version_details_order_idx" ON "_products_v_version_details" USING btree ("_order");
  CREATE INDEX "_products_v_version_details_parent_id_idx" ON "_products_v_version_details" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_gallery_order_idx" ON "_products_v_version_gallery" USING btree ("_order");
  CREATE INDEX "_products_v_version_gallery_parent_id_idx" ON "_products_v_version_gallery" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_gallery_image_idx" ON "_products_v_version_gallery" USING btree ("image_id");
  CREATE INDEX "_products_v_version_variants_order_idx" ON "_products_v_version_variants" USING btree ("_order");
  CREATE INDEX "_products_v_version_variants_parent_id_idx" ON "_products_v_version_variants" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_featured_sections_order_idx" ON "_products_v_version_featured_sections" USING btree ("order");
  CREATE INDEX "_products_v_version_featured_sections_parent_idx" ON "_products_v_version_featured_sections" USING btree ("parent_id");
  CREATE INDEX "_products_v_parent_idx" ON "_products_v" USING btree ("parent_id");
  CREATE INDEX "_products_v_version_version_name_idx" ON "_products_v" USING btree ("version_name");
  CREATE INDEX "_products_v_version_version_featured_image_idx" ON "_products_v" USING btree ("version_featured_image_id");
  CREATE INDEX "_products_v_version_version_sku_idx" ON "_products_v" USING btree ("version_sku");
  CREATE INDEX "_products_v_version_meta_version_meta_image_idx" ON "_products_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_products_v_version_version_slug_idx" ON "_products_v" USING btree ("version_slug");
  CREATE INDEX "_products_v_version_version_category_idx" ON "_products_v" USING btree ("version_category_id");
  CREATE INDEX "_products_v_version_version_brand_idx" ON "_products_v" USING btree ("version_brand_id");
  CREATE INDEX "_products_v_version_version_updated_at_idx" ON "_products_v" USING btree ("version_updated_at");
  CREATE INDEX "_products_v_version_version_created_at_idx" ON "_products_v" USING btree ("version_created_at");
  CREATE INDEX "_products_v_version_version__status_idx" ON "_products_v" USING btree ("version__status");
  CREATE INDEX "_products_v_created_at_idx" ON "_products_v" USING btree ("created_at");
  CREATE INDEX "_products_v_updated_at_idx" ON "_products_v" USING btree ("updated_at");
  CREATE INDEX "_products_v_latest_idx" ON "_products_v" USING btree ("latest");
  CREATE INDEX "_products_v_rels_order_idx" ON "_products_v_rels" USING btree ("order");
  CREATE INDEX "_products_v_rels_parent_idx" ON "_products_v_rels" USING btree ("parent_id");
  CREATE INDEX "_products_v_rels_path_idx" ON "_products_v_rels" USING btree ("path");
  CREATE INDEX "_products_v_rels_products_id_idx" ON "_products_v_rels" USING btree ("products_id");
  CREATE INDEX "reviews_moderated_by_idx" ON "reviews" USING btree ("moderated_by_id");
  CREATE INDEX "reviews_product_idx" ON "reviews" USING btree ("product_id");
  CREATE INDEX "reviews_updated_at_idx" ON "reviews" USING btree ("updated_at");
  CREATE INDEX "reviews_created_at_idx" ON "reviews" USING btree ("created_at");
  CREATE UNIQUE INDEX "promotions_code_idx" ON "promotions" USING btree ("code");
  CREATE INDEX "promotions_updated_at_idx" ON "promotions" USING btree ("updated_at");
  CREATE INDEX "promotions_created_at_idx" ON "promotions" USING btree ("created_at");
  CREATE INDEX "promotions_rels_order_idx" ON "promotions_rels" USING btree ("order");
  CREATE INDEX "promotions_rels_parent_idx" ON "promotions_rels" USING btree ("parent_id");
  CREATE INDEX "promotions_rels_path_idx" ON "promotions_rels" USING btree ("path");
  CREATE INDEX "promotions_rels_products_id_idx" ON "promotions_rels" USING btree ("products_id");
  CREATE INDEX "promotions_rels_categories_id_idx" ON "promotions_rels" USING btree ("categories_id");
  CREATE INDEX "orders_items_order_idx" ON "orders_items" USING btree ("_order");
  CREATE INDEX "orders_items_parent_id_idx" ON "orders_items" USING btree ("_parent_id");
  CREATE INDEX "orders_items_product_idx" ON "orders_items" USING btree ("product_id");
  CREATE INDEX "orders_timeline_order_idx" ON "orders_timeline" USING btree ("_order");
  CREATE INDEX "orders_timeline_parent_id_idx" ON "orders_timeline" USING btree ("_parent_id");
  CREATE INDEX "orders_customer_email_idx" ON "orders" USING btree ("customer_email");
  CREATE INDEX "orders_total_idx" ON "orders" USING btree ("total");
  CREATE UNIQUE INDEX "orders_order_number_idx" ON "orders" USING btree ("order_number");
  CREATE INDEX "orders_customer_idx" ON "orders" USING btree ("customer_id");
  CREATE INDEX "orders_promotion_idx" ON "orders" USING btree ("promotion_id");
  CREATE INDEX "orders_updated_at_idx" ON "orders" USING btree ("updated_at");
  CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_brands_id_idx" ON "payload_locked_documents_rels" USING btree ("brands_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");
  CREATE INDEX "payload_locked_documents_rels_reviews_id_idx" ON "payload_locked_documents_rels" USING btree ("reviews_id");
  CREATE INDEX "payload_locked_documents_rels_promotions_id_idx" ON "payload_locked_documents_rels" USING btree ("promotions_id");
  CREATE INDEX "payload_locked_documents_rels_orders_id_idx" ON "payload_locked_documents_rels" USING btree ("orders_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "store_settings_default_product_image_idx" ON "store_settings" USING btree ("default_product_image_id");
  CREATE INDEX "store_settings_default_share_image_idx" ON "store_settings" USING btree ("default_share_image_id");
  CREATE INDEX "header_navigation_items_children_order_idx" ON "header_navigation_items_children" USING btree ("_order");
  CREATE INDEX "header_navigation_items_children_parent_id_idx" ON "header_navigation_items_children" USING btree ("_parent_id");
  CREATE INDEX "header_navigation_items_order_idx" ON "header_navigation_items" USING btree ("_order");
  CREATE INDEX "header_navigation_items_parent_id_idx" ON "header_navigation_items" USING btree ("_parent_id");
  CREATE INDEX "header_navigation_items_category_idx" ON "header_navigation_items" USING btree ("category_id");
  CREATE INDEX "header_logo_image_idx" ON "header" USING btree ("logo_image_id");
  CREATE INDEX "header__status_idx" ON "header" USING btree ("_status");
  CREATE INDEX "_header_v_version_navigation_items_children_order_idx" ON "_header_v_version_navigation_items_children" USING btree ("_order");
  CREATE INDEX "_header_v_version_navigation_items_children_parent_id_idx" ON "_header_v_version_navigation_items_children" USING btree ("_parent_id");
  CREATE INDEX "_header_v_version_navigation_items_order_idx" ON "_header_v_version_navigation_items" USING btree ("_order");
  CREATE INDEX "_header_v_version_navigation_items_parent_id_idx" ON "_header_v_version_navigation_items" USING btree ("_parent_id");
  CREATE INDEX "_header_v_version_navigation_items_category_idx" ON "_header_v_version_navigation_items" USING btree ("category_id");
  CREATE INDEX "_header_v_version_version_logo_image_idx" ON "_header_v" USING btree ("version_logo_image_id");
  CREATE INDEX "_header_v_version_version__status_idx" ON "_header_v" USING btree ("version__status");
  CREATE INDEX "_header_v_created_at_idx" ON "_header_v" USING btree ("created_at");
  CREATE INDEX "_header_v_updated_at_idx" ON "_header_v" USING btree ("updated_at");
  CREATE INDEX "_header_v_latest_idx" ON "_header_v" USING btree ("latest");
  CREATE INDEX "footer_social_links_order_idx" ON "footer_social_links" USING btree ("_order");
  CREATE INDEX "footer_social_links_parent_id_idx" ON "footer_social_links" USING btree ("_parent_id");
  CREATE INDEX "footer_link_groups_links_order_idx" ON "footer_link_groups_links" USING btree ("_order");
  CREATE INDEX "footer_link_groups_links_parent_id_idx" ON "footer_link_groups_links" USING btree ("_parent_id");
  CREATE INDEX "footer_link_groups_order_idx" ON "footer_link_groups" USING btree ("_order");
  CREATE INDEX "footer_link_groups_parent_id_idx" ON "footer_link_groups" USING btree ("_parent_id");
  CREATE INDEX "footer_legal_links_order_idx" ON "footer_legal_links" USING btree ("_order");
  CREATE INDEX "footer_legal_links_parent_id_idx" ON "footer_legal_links" USING btree ("_parent_id");
  CREATE INDEX "footer_payment_methods_order_idx" ON "footer_payment_methods" USING btree ("_order");
  CREATE INDEX "footer_payment_methods_parent_id_idx" ON "footer_payment_methods" USING btree ("_parent_id");
  CREATE INDEX "footer_payment_methods_logo_idx" ON "footer_payment_methods" USING btree ("logo_id");
  CREATE INDEX "footer_logo_image_idx" ON "footer" USING btree ("logo_image_id");
  CREATE INDEX "footer__status_idx" ON "footer" USING btree ("_status");
  CREATE INDEX "_footer_v_version_social_links_order_idx" ON "_footer_v_version_social_links" USING btree ("_order");
  CREATE INDEX "_footer_v_version_social_links_parent_id_idx" ON "_footer_v_version_social_links" USING btree ("_parent_id");
  CREATE INDEX "_footer_v_version_link_groups_links_order_idx" ON "_footer_v_version_link_groups_links" USING btree ("_order");
  CREATE INDEX "_footer_v_version_link_groups_links_parent_id_idx" ON "_footer_v_version_link_groups_links" USING btree ("_parent_id");
  CREATE INDEX "_footer_v_version_link_groups_order_idx" ON "_footer_v_version_link_groups" USING btree ("_order");
  CREATE INDEX "_footer_v_version_link_groups_parent_id_idx" ON "_footer_v_version_link_groups" USING btree ("_parent_id");
  CREATE INDEX "_footer_v_version_legal_links_order_idx" ON "_footer_v_version_legal_links" USING btree ("_order");
  CREATE INDEX "_footer_v_version_legal_links_parent_id_idx" ON "_footer_v_version_legal_links" USING btree ("_parent_id");
  CREATE INDEX "_footer_v_version_payment_methods_order_idx" ON "_footer_v_version_payment_methods" USING btree ("_order");
  CREATE INDEX "_footer_v_version_payment_methods_parent_id_idx" ON "_footer_v_version_payment_methods" USING btree ("_parent_id");
  CREATE INDEX "_footer_v_version_payment_methods_logo_idx" ON "_footer_v_version_payment_methods" USING btree ("logo_id");
  CREATE INDEX "_footer_v_version_version_logo_image_idx" ON "_footer_v" USING btree ("version_logo_image_id");
  CREATE INDEX "_footer_v_version_version__status_idx" ON "_footer_v" USING btree ("version__status");
  CREATE INDEX "_footer_v_created_at_idx" ON "_footer_v" USING btree ("created_at");
  CREATE INDEX "_footer_v_updated_at_idx" ON "_footer_v" USING btree ("updated_at");
  CREATE INDEX "_footer_v_latest_idx" ON "_footer_v" USING btree ("latest");
  CREATE INDEX "homepage_statistics_order_idx" ON "homepage_statistics" USING btree ("_order");
  CREATE INDEX "homepage_statistics_parent_id_idx" ON "homepage_statistics" USING btree ("_parent_id");
  CREATE INDEX "homepage_dress_styles_order_idx" ON "homepage_dress_styles" USING btree ("_order");
  CREATE INDEX "homepage_dress_styles_parent_id_idx" ON "homepage_dress_styles" USING btree ("_parent_id");
  CREATE INDEX "homepage_dress_styles_image_idx" ON "homepage_dress_styles" USING btree ("image_id");
  CREATE INDEX "homepage_dress_styles_category_idx" ON "homepage_dress_styles" USING btree ("category_id");
  CREATE INDEX "homepage_hero_image_idx" ON "homepage" USING btree ("hero_image_id");
  CREATE INDEX "homepage_hero_mobile_image_idx" ON "homepage" USING btree ("hero_mobile_image_id");
  CREATE INDEX "homepage_new_arrivals_new_arrivals_category_idx" ON "homepage" USING btree ("new_arrivals_category_id");
  CREATE INDEX "homepage_top_selling_top_selling_category_idx" ON "homepage" USING btree ("top_selling_category_id");
  CREATE INDEX "homepage_meta_meta_image_idx" ON "homepage" USING btree ("meta_image_id");
  CREATE INDEX "homepage__status_idx" ON "homepage" USING btree ("_status");
  CREATE INDEX "homepage_rels_order_idx" ON "homepage_rels" USING btree ("order");
  CREATE INDEX "homepage_rels_parent_idx" ON "homepage_rels" USING btree ("parent_id");
  CREATE INDEX "homepage_rels_path_idx" ON "homepage_rels" USING btree ("path");
  CREATE INDEX "homepage_rels_brands_id_idx" ON "homepage_rels" USING btree ("brands_id");
  CREATE INDEX "homepage_rels_products_id_idx" ON "homepage_rels" USING btree ("products_id");
  CREATE INDEX "homepage_rels_reviews_id_idx" ON "homepage_rels" USING btree ("reviews_id");
  CREATE INDEX "_homepage_v_version_statistics_order_idx" ON "_homepage_v_version_statistics" USING btree ("_order");
  CREATE INDEX "_homepage_v_version_statistics_parent_id_idx" ON "_homepage_v_version_statistics" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_version_dress_styles_order_idx" ON "_homepage_v_version_dress_styles" USING btree ("_order");
  CREATE INDEX "_homepage_v_version_dress_styles_parent_id_idx" ON "_homepage_v_version_dress_styles" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_version_dress_styles_image_idx" ON "_homepage_v_version_dress_styles" USING btree ("image_id");
  CREATE INDEX "_homepage_v_version_dress_styles_category_idx" ON "_homepage_v_version_dress_styles" USING btree ("category_id");
  CREATE INDEX "_homepage_v_version_version_hero_image_idx" ON "_homepage_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_homepage_v_version_version_hero_mobile_image_idx" ON "_homepage_v" USING btree ("version_hero_mobile_image_id");
  CREATE INDEX "_homepage_v_version_new_arrivals_version_new_arrivals_ca_idx" ON "_homepage_v" USING btree ("version_new_arrivals_category_id");
  CREATE INDEX "_homepage_v_version_top_selling_version_top_selling_cate_idx" ON "_homepage_v" USING btree ("version_top_selling_category_id");
  CREATE INDEX "_homepage_v_version_meta_version_meta_image_idx" ON "_homepage_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_homepage_v_version_version__status_idx" ON "_homepage_v" USING btree ("version__status");
  CREATE INDEX "_homepage_v_created_at_idx" ON "_homepage_v" USING btree ("created_at");
  CREATE INDEX "_homepage_v_updated_at_idx" ON "_homepage_v" USING btree ("updated_at");
  CREATE INDEX "_homepage_v_latest_idx" ON "_homepage_v" USING btree ("latest");
  CREATE INDEX "_homepage_v_rels_order_idx" ON "_homepage_v_rels" USING btree ("order");
  CREATE INDEX "_homepage_v_rels_parent_idx" ON "_homepage_v_rels" USING btree ("parent_id");
  CREATE INDEX "_homepage_v_rels_path_idx" ON "_homepage_v_rels" USING btree ("path");
  CREATE INDEX "_homepage_v_rels_brands_id_idx" ON "_homepage_v_rels" USING btree ("brands_id");
  CREATE INDEX "_homepage_v_rels_products_id_idx" ON "_homepage_v_rels" USING btree ("products_id");
  CREATE INDEX "_homepage_v_rels_reviews_id_idx" ON "_homepage_v_rels" USING btree ("reviews_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_roles" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "brands" CASCADE;
  DROP TABLE "_brands_v" CASCADE;
  DROP TABLE "categories_available_filter_groups" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "categories_rels" CASCADE;
  DROP TABLE "_categories_v_version_available_filter_groups" CASCADE;
  DROP TABLE "_categories_v" CASCADE;
  DROP TABLE "_categories_v_rels" CASCADE;
  DROP TABLE "products_details" CASCADE;
  DROP TABLE "products_gallery" CASCADE;
  DROP TABLE "products_variants" CASCADE;
  DROP TABLE "products_featured_sections" CASCADE;
  DROP TABLE "products" CASCADE;
  DROP TABLE "products_rels" CASCADE;
  DROP TABLE "_products_v_version_details" CASCADE;
  DROP TABLE "_products_v_version_gallery" CASCADE;
  DROP TABLE "_products_v_version_variants" CASCADE;
  DROP TABLE "_products_v_version_featured_sections" CASCADE;
  DROP TABLE "_products_v" CASCADE;
  DROP TABLE "_products_v_rels" CASCADE;
  DROP TABLE "reviews" CASCADE;
  DROP TABLE "promotions" CASCADE;
  DROP TABLE "promotions_rels" CASCADE;
  DROP TABLE "orders_items" CASCADE;
  DROP TABLE "orders_timeline" CASCADE;
  DROP TABLE "orders" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "store_settings" CASCADE;
  DROP TABLE "header_navigation_items_children" CASCADE;
  DROP TABLE "header_navigation_items" CASCADE;
  DROP TABLE "header" CASCADE;
  DROP TABLE "_header_v_version_navigation_items_children" CASCADE;
  DROP TABLE "_header_v_version_navigation_items" CASCADE;
  DROP TABLE "_header_v" CASCADE;
  DROP TABLE "footer_social_links" CASCADE;
  DROP TABLE "footer_link_groups_links" CASCADE;
  DROP TABLE "footer_link_groups" CASCADE;
  DROP TABLE "footer_legal_links" CASCADE;
  DROP TABLE "footer_payment_methods" CASCADE;
  DROP TABLE "footer" CASCADE;
  DROP TABLE "_footer_v_version_social_links" CASCADE;
  DROP TABLE "_footer_v_version_link_groups_links" CASCADE;
  DROP TABLE "_footer_v_version_link_groups" CASCADE;
  DROP TABLE "_footer_v_version_legal_links" CASCADE;
  DROP TABLE "_footer_v_version_payment_methods" CASCADE;
  DROP TABLE "_footer_v" CASCADE;
  DROP TABLE "homepage_statistics" CASCADE;
  DROP TABLE "homepage_dress_styles" CASCADE;
  DROP TABLE "homepage" CASCADE;
  DROP TABLE "homepage_rels" CASCADE;
  DROP TABLE "_homepage_v_version_statistics" CASCADE;
  DROP TABLE "_homepage_v_version_dress_styles" CASCADE;
  DROP TABLE "_homepage_v" CASCADE;
  DROP TABLE "_homepage_v_rels" CASCADE;
  DROP TYPE "public"."enum_users_roles";
  DROP TYPE "public"."enum_users_status";
  DROP TYPE "public"."enum_brands_status";
  DROP TYPE "public"."enum__brands_v_version_status";
  DROP TYPE "public"."enum_categories_available_filter_groups";
  DROP TYPE "public"."enum_categories_default_sort";
  DROP TYPE "public"."enum_categories_status";
  DROP TYPE "public"."enum__categories_v_version_available_filter_groups";
  DROP TYPE "public"."enum__categories_v_version_default_sort";
  DROP TYPE "public"."enum__categories_v_version_status";
  DROP TYPE "public"."enum_products_featured_sections";
  DROP TYPE "public"."enum_products_badge";
  DROP TYPE "public"."enum_products_visibility";
  DROP TYPE "public"."enum_products_status";
  DROP TYPE "public"."enum__products_v_version_featured_sections";
  DROP TYPE "public"."enum__products_v_version_badge";
  DROP TYPE "public"."enum__products_v_version_visibility";
  DROP TYPE "public"."enum__products_v_version_status";
  DROP TYPE "public"."enum_reviews_status";
  DROP TYPE "public"."enum_promotions_type";
  DROP TYPE "public"."enum_promotions_applies_to";
  DROP TYPE "public"."enum_orders_delivery_method";
  DROP TYPE "public"."enum_orders_payment_provider";
  DROP TYPE "public"."enum_orders_payment_status";
  DROP TYPE "public"."enum_orders_fulfillment_status";
  DROP TYPE "public"."enum_store_settings_currency";
  DROP TYPE "public"."enum_header_navigation_items_type";
  DROP TYPE "public"."enum_header_logo_type";
  DROP TYPE "public"."enum_header_status";
  DROP TYPE "public"."enum__header_v_version_navigation_items_type";
  DROP TYPE "public"."enum__header_v_version_logo_type";
  DROP TYPE "public"."enum__header_v_version_status";
  DROP TYPE "public"."enum_footer_social_links_platform";
  DROP TYPE "public"."enum_footer_logo_type";
  DROP TYPE "public"."enum_footer_status";
  DROP TYPE "public"."enum__footer_v_version_social_links_platform";
  DROP TYPE "public"."enum__footer_v_version_logo_type";
  DROP TYPE "public"."enum__footer_v_version_status";
  DROP TYPE "public"."enum_homepage_new_arrivals_mode";
  DROP TYPE "public"."enum_homepage_new_arrivals_automatic_source";
  DROP TYPE "public"."enum_homepage_top_selling_mode";
  DROP TYPE "public"."enum_homepage_top_selling_automatic_source";
  DROP TYPE "public"."enum_homepage_status";
  DROP TYPE "public"."enum__homepage_v_version_new_arrivals_mode";
  DROP TYPE "public"."enum__homepage_v_version_new_arrivals_automatic_source";
  DROP TYPE "public"."enum__homepage_v_version_top_selling_mode";
  DROP TYPE "public"."enum__homepage_v_version_top_selling_automatic_source";
  DROP TYPE "public"."enum__homepage_v_version_status";`)
}
