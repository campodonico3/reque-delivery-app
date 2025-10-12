CREATE TYPE "public"."address_type" AS ENUM('home', 'work', 'other');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'confirmed', 'preparing', 'ready', 'on_delivery', 'delivered', 'cancelled', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('cash', 'card', 'yape', 'plin', 'digital_wallet');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'completed', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."restaurant_status" AS ENUM('active', 'inactive', 'suspended');--> statement-breakpoint
CREATE TABLE "addresses" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "addresses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"street" varchar(255) NOT NULL,
	"city" varchar(100) NOT NULL,
	"state" varchar(100) NOT NULL,
	"zipCode" varchar(20) NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"apartmentNumber" varchar(50),
	"deliveryInstructions" text,
	"type" "address_type" DEFAULT 'other' NOT NULL,
	"isDefault" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "coupons_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"code" varchar(50) NOT NULL,
	"description" text,
	"discount_type" varchar(20) NOT NULL,
	"discount_value" numeric(10, 2) NOT NULL,
	"minimum_order_amount" numeric(10, 2),
	"max_discount_amount" numeric(10, 2),
	"max_uses_per_user" integer DEFAULT 1,
	"max_total_uses" integer,
	"current_uses" integer DEFAULT 0,
	"restaurant_id" integer,
	"valid_from" timestamp NOT NULL,
	"valid_until" timestamp NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "coupons_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "favorites_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"restaurant_id" integer,
	"product_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_item_options" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "order_item_options_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"order_item_id" integer NOT NULL,
	"option_id" integer NOT NULL,
	"option_name" varchar(100) NOT NULL,
	"price_modifier" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "order_items_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"order_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"product_image" text,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"total_price" numeric(10, 2) NOT NULL,
	"special_instructions" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "orders_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"order_number" varchar(50) NOT NULL,
	"user_id" integer NOT NULL,
	"restaurant_id" integer NOT NULL,
	"address_id" integer NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"delivery_fee" numeric(10, 2) DEFAULT '0' NOT NULL,
	"discount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"tax" numeric(10, 2) DEFAULT '0' NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"payment_status" "payment_status" DEFAULT 'pending' NOT NULL,
	"customer_notes" text,
	"restaurant_notes" text,
	"cancellation_reason" text,
	"estimated_delivery_time_at" timestamp,
	"confirmed_at" timestamp,
	"preparing_at" timestamp,
	"ready_at" timestamp,
	"on_delivery_at" timestamp,
	"delivered_at" timestamp,
	"cancelled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "product_categories" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "product_categories_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"restaurant_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"display_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "product_option_groups" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "product_option_groups_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"product_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"is_required" boolean DEFAULT false NOT NULL,
	"min_selection" integer DEFAULT 0,
	"max_selection" integer DEFAULT 1,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_options" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "product_options_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"group_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"price_modifier" numeric(10, 2) DEFAULT '0' NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	"is_default" boolean DEFAULT false,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "products_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"restaurant_id" integer NOT NULL,
	"category_id" integer,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"image_url" text,
	"price" numeric(10, 2) NOT NULL,
	"original_price" numeric(10, 2),
	"is_available" boolean DEFAULT true NOT NULL,
	"stock" integer,
	"preparation_time" integer,
	"calories" integer,
	"is_vegetarian" boolean DEFAULT false,
	"is_vegan" boolean DEFAULT false,
	"is_gluten_free" boolean DEFAULT false,
	"is_spicy" boolean DEFAULT false,
	"spicy_level" integer,
	"is_popular" boolean DEFAULT false,
	"is_featured" boolean DEFAULT false,
	"display_order" integer DEFAULT 0,
	"total_orders" integer DEFAULT 0,
	"average_rating" double precision DEFAULT 0,
	"total_reviews" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "restaurant_categories" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "restaurant_categories_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"icon_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_orde" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "restaurant_categories_name_unique" UNIQUE("name"),
	CONSTRAINT "restaurant_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "restaurant_hours" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "restaurant_hours_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"restaurant_id" integer NOT NULL,
	"day_of_week" integer NOT NULL,
	"open_time" time NOT NULL,
	"close_time" time NOT NULL,
	"is_closed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "restaurant_to_categories" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "restaurant_to_categories_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"restaurant_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "restaurants" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "restaurants_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"logo_url" text,
	"banner_url" text,
	"street" varchar(255) NOT NULL,
	"city" varchar(100) NOT NULL,
	"state" varchar(100) NOT NULL,
	"zip_code" varchar(20) NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"phone" varchar(20) NOT NULL,
	"email" varchar(255),
	"delivery_fee" numeric(10, 2) DEFAULT '0' NOT NULL,
	"minimum_order" numeric(10, 2) DEFAULT '0' NOT NULL,
	"delivery_radius" double precision DEFAULT 5 NOT NULL,
	"estimated_delivery_time" integer DEFAULT 30 NOT NULL,
	"status" "restaurant_status" DEFAULT 'active' NOT NULL,
	"is_open" boolean DEFAULT true NOT NULL,
	"average_rating" double precision DEFAULT 0,
	"total_reviews" integer DEFAULT 0,
	"total_orders" integer DEFAULT 0,
	"is_featured" boolean DEFAULT false NOT NULL,
	"featured_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "reviews_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"restaurant_id" integer,
	"product_id" integer,
	"order_id" integer,
	"rating" integer NOT NULL,
	"comment" text,
	"food_rating" integer,
	"service_rating" integer,
	"delivery_rating" integer,
	"is_verified_purchase" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" text NOT NULL,
	"phone" varchar(20),
	"profile_img" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item_options" ADD CONSTRAINT "order_item_options_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item_options" ADD CONSTRAINT "order_item_options_option_id_product_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."product_options"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_address_id_addresses_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_option_groups" ADD CONSTRAINT "product_option_groups_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_options" ADD CONSTRAINT "product_options_group_id_product_option_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."product_option_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_product_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurant_hours" ADD CONSTRAINT "restaurant_hours_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurant_to_categories" ADD CONSTRAINT "restaurant_to_categories_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurant_to_categories" ADD CONSTRAINT "restaurant_to_categories_category_id_restaurant_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."restaurant_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;