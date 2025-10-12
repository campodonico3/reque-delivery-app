import { integer, pgTable, varchar, timestamp, text, decimal, pgEnum, doublePrecision, boolean, time } from "drizzle-orm/pg-core";
import { relations } from 'drizzle-orm';

// ==================================================== USERS TABLE =======================================================
export const usersTable = pgTable("users", {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(), // Agregar campo password
  phone: varchar('phone', { length: 20 }), // Agregar campo phone (opcional)
  profile_img: text('profile_img'), // Agregar campo profile_img (opcional)
  created_at: timestamp('created_at').defaultNow().notNull(), // Agregar timestamp
  updated_at: timestamp('updated_at').defaultNow(), // Agregar timestamp
});

// ==================================================== ADDRESSES TABLE ====================================================
/// Enum para tipos de dirección
export const addressTypeEnum = pgEnum("address_type", [
  'home',
  'work',
  'other'
]);

export const addressesTable = pgTable("addresses", {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  street: varchar({ length: 255 }).notNull(),
  city: varchar({ length: 100 }).notNull(),
  state: varchar({ length: 100 }).notNull(),
  zipCode: varchar({ length: 20 }).notNull(),
  latitude: doublePrecision().notNull(),
  longitude: doublePrecision().notNull(),
  apartmentNumber: varchar({ length: 50 }),
  deliveryInstructions: text(),
  type: addressTypeEnum().default("other").notNull(),
  isDefault: boolean().default(false).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().$onUpdate(() => new Date()),
});

// =========================================== RESTAURANT CATEGORIES TABLE =================================================
export const restaurantStatusEnum = pgEnum('restaurant_status', [
  'active', // Activo y aceptando pedidos
  'inactive', // Temporalmente cerrado
  'suspended' // Suspendido por el admin
]);

export const restaurantCategoriesTable = pgTable('restaurant_categories', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  iconUrl: text('icon_url'),
  isActive: boolean('is_active').default(true).notNull(),
  displayOrder: integer('display_orde').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// =========================================== RESTAURANTS TABLE =================================================
export const restaurantsTable = pgTable('restaurants', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull(),
  description: text('description'),
  logoUrl: text('logo_url'),
  bannerUrl: text('banner_url'),

  // Ubicación
  street: varchar('street', { length: 255 }).notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }).notNull(),
  zipCode: varchar('zip_code', { length: 20 }).notNull(),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),

  // Contacto
  phone: varchar('phone', { length: 20 }).notNull(),
  email: varchar('email', { length: 255 }),

  // Configuración de delivery
  deliveryFee: decimal('delivery_fee', { precision: 10, scale: 2 }).default('0').notNull(),
  minimumOrder: decimal('minimum_order', { precision: 10, scale: 2 }).default('0').notNull(),
  deliveryRadius: doublePrecision('delivery_radius').default(5).notNull(), // km
  estimatedDeliveryTime: integer('estimated_delivery_time').default(30).notNull(), // minutos (mejor que timestamp si es solo duración)

  // Estado y ratings
  status: restaurantStatusEnum('status').default('active').notNull(),
  isOpen: boolean('is_open').default(true).notNull(),
  averageRating: doublePrecision('average_rating').default(0),
  totalReviews: integer('total_reviews').default(0),
  totalOrders: integer('total_orders').default(0),

  // Featured
  isFeatured: boolean('is_featured').default(false).notNull(),
  featuredOrder: integer('featured_order').default(0),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ===================================== RESTAURANT TO CATEGORIES (Many to Many) =================================
export const restaurantToCategoriesTable = pgTable('restaurant_to_categories', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  restaurantId: integer('restaurant_id').notNull().references(() => restaurantsTable.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id').notNull().references(() => restaurantCategoriesTable.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ===================================== RESTAURANT HOURS TABLE ==================================================
export const restaurantHoursTable = pgTable('restaurant_hours', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  restaurantId: integer('restaurant_id').notNull().references(() => restaurantsTable.id, { onDelete: 'cascade' }),
  dayOfWeek: integer('day_of_week').notNull(), // 0 = Domingo, 6 = Sábado
  openTime: time('open_time').notNull(),
  closeTime: time('close_time').notNull(),
  isClosed: boolean('is_closed').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==================================== PRODUCT CATEGORIES TABLE =================================================
export const productCategoriesTable = pgTable('product_categories', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  restaurantId: integer('restaurant_id').notNull().references(() => restaurantsTable.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  displayOrder: integer('display_order').default(0),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================ PRODUCTS TABLE ===================================================
export const productsTable = pgTable('products', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  restaurantId: integer('restaurant_id').notNull().references(() => restaurantsTable.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id').references(() => productCategoriesTable.id, { onDelete: 'set null' }),

  // Información básica
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull(),
  description: text('description'),
  imageUrl: text('image_url'),

  // Precio y disponibilidad
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal('original_price', { precision: 10, scale: 2 }), // Para mostrar descuentos
  isAvailable: boolean('is_available').default(true).notNull(),
  stock: integer('stock'), // null = sin límite

  // Metadata
  preparationTime: integer('preparation_time'), // minutos
  calories: integer('calories'),
  isVegetarian: boolean('is_vegetarian').default(false),
  isVegan: boolean('is_vegan').default(false),
  isGlutenFree: boolean('is_gluten_free').default(false),
  isSpicy: boolean('is_spicy').default(false),
  spicyLevel: integer('spicy_level'), // 1-5

  // Popular y destacado
  isPopular: boolean('is_popular').default(false),
  isFeatured: boolean('is_featured').default(false),
  displayOrder: integer('display_order').default(0),

  // Stats
  totalOrders: integer('total_orders').default(0),
  averageRating: doublePrecision('average_rating').default(0),
  totalReviews: integer('total_reviews').default(0),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ===================================== PRODUCT OPTIONS GROUPS TABLE ===========================================
export const productOptionGroupsTable = pgTable('product_option_groups', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  productId: integer('product_id').notNull().references(() => productsTable.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(), // "Tamaño", "Extras"
  isRequired: boolean('is_required').default(false).notNull(),
  minSelection: integer('min_selection').default(0),
  maxSelection: integer('max_selection').default(1), // 1 = radio, >1 = checkbox
  displayOrder: integer('display_order').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ===================================== PRODUCT OPTIONS TABLE ===================================================
export const productOptionsTable = pgTable('product_options', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  groupId: integer('group_id').notNull().references(() => productOptionGroupsTable.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  priceModifier: decimal('price_modifier', { precision: 10, scale: 2 }).default('0').notNull(), // +/- precio
  isAvailable: boolean('is_available').default(true).notNull(),
  isDefault: boolean('is_default').default(false),
  displayOrder: integer('display_order').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// =============================================== ORDERS TABLE ==================================================
export const orderStatusEnum = pgEnum('order_status', [
  'pending',     // Esperando confirmación del restaurante
  'confirmed',   // Confirmado por el restaurante
  'preparing',   // En preparación
  'ready',       // Listo para recoger
  'on_delivery', // En camino
  'delivered',   // Entregado
  'cancelled',   // Cancelado
  'rejected'     // Rechazado por el restaurante
]);

export const paymentMethodEnum = pgEnum('payment_method', [
  'cash',
  'card',
  'yape',
  'plin',
  'digital_wallet'
]);

export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'completed',
  'failed',
  'refunded'
]);

export const ordersTable = pgTable('orders', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  orderNumber: varchar('order_number', { length: 50 }).notNull().unique(), // Ej: "ORD-20250105-001"

  // Relaciones
  userId: integer('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  restaurantId: integer('restaurant_id').notNull().references(() => restaurantsTable.id, { onDelete: 'cascade' }),
  addressId: integer('address_id').notNull().references(() => addressesTable.id, { onDelete: 'cascade' }),

  // Estado
  status: orderStatusEnum('status').default('pending').notNull(),

  // Montos
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  deliveryFee: decimal('delivery_fee', { precision: 10, scale: 2 }).default('0').notNull(),
  discount: decimal('discount', { precision: 10, scale: 2 }).default('0').notNull(),
  tax: decimal('tax', { precision: 10, scale: 2 }).default('0').notNull(),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),

  // Pago
  paymentMethod: paymentMethodEnum('payment_method').notNull(),
  paymentStatus: paymentStatusEnum('payment_status').default('pending').notNull(),

  // Notas y tracking
  customerNotes: text('customer_notes'),
  restaurantNotes: text('restaurant_notes'),
  cancellationReason: text('cancellation_reason'),

  // Tiempos (usar timestamp para momentos, integer para duraciones)
  estimatedDeliveryTimeAt: timestamp('estimated_delivery_time_at'),
  confirmedAt: timestamp('confirmed_at'),
  preparingAt: timestamp('preparing_at'),
  readyAt: timestamp('ready_at'),
  onDeliveryAt: timestamp('on_delivery_at'),
  deliveredAt: timestamp('delivered_at'),
  cancelledAt: timestamp('cancelled_at'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================ ORDER ITEMS TABLE ================================================
export const orderItemsTable = pgTable("order_items", {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  orderId: integer('order_id').notNull().references(() => ordersTable.id, { onDelete: 'cascade' }),
  productId: integer('product_id').notNull().references(() => productsTable.id),

  // Snapshot del producto (por si cambia después)
  productName: varchar('product_name', { length: 255 }).notNull(),
  productImage: text('product_image'),

  quantity: integer('quantity').notNull(),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),

  specialInstructions: text('special_instructions'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ========================================== ORDER ITEM OPTIONS TABLE ============================================
export const orderItemOptionsTable = pgTable('order_item_options', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  orderItemId: integer('order_item_id').notNull().references(() => orderItemsTable.id, { onDelete: 'cascade' }),
  optionId: integer('option_id').notNull().references(() => productOptionsTable.id),

  // Snapshot
  optionName: varchar('option_name', { length: 100 }).notNull(),
  priceModifier: decimal('price_modifier', { precision: 10, scale: 2 }).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================= REVIEWS TABLE =============================================
export const reviewsTable = pgTable('reviews', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id').notNull().references(() => usersTable.id),
  restaurantId: integer('restaurant_id').references(() => restaurantsTable.id, { onDelete: 'cascade' }),
  productId: integer('product_id').references(() => productsTable.id, { onDelete: 'cascade' }),
  orderId: integer('order_id').references(() => ordersTable.id),

  rating: integer('rating').notNull(), // 1-5
  comment: text('comment'),

  // Ratings específicos (opcional)
  foodRating: integer('food_rating'),
  serviceRating: integer('service_rating'),
  deliveryRating: integer('delivery_rating'),

  isVerifiedPurchase: boolean('is_verified_purchase').default(false),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================= FAVORITES TABLE =============================================
export const favoritesTable = pgTable("favorites", {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  restaurantId: integer('restaurant_id').references(() => restaurantsTable.id, { onDelete: 'cascade' }),
  productId: integer('product_id').references(() => productsTable.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});


// ========================================== COUPONS TABLE (OPCIONAL) =======================================
export const couponsTable = pgTable("coupons", {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  description: text('description'),

  // Tipo de descuento
  discountType: varchar('discount_type', { length: 20 }).notNull(), // 'percentage' o 'fixed' (recomiendo enum)
  discountValue: decimal('discount_value', { precision: 10, scale: 2 }).notNull(),

  // Restricciones
  minimumOrderAmount: decimal('minimum_order_amount', { precision: 10, scale: 2 }),
  maxDiscountAmount: decimal('max_discount_amount', { precision: 10, scale: 2 }),
  maxUsesPerUser: integer('max_uses_per_user').default(1),
  maxTotalUses: integer('max_total_uses'),
  currentUses: integer('current_uses').default(0),

  // Aplicabilidad
  restaurantId: integer('restaurant_id').references(() => restaurantsTable.id), // null = todos

  // Vigencia
  validFrom: timestamp('valid_from').notNull(),
  validUntil: timestamp('valid_until').notNull(),
  isActive: boolean('is_active').default(true).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================ RELATIONS ====================================================
export const usersRelations = relations(usersTable, ({ many }) => ({
  addresses: many(addressesTable),
  orders: many(ordersTable),
  reviews: many(reviewsTable),
  favorites: many(favoritesTable),
}));

export const restaurantsRelations = relations(restaurantsTable, ({ many }) => ({
  categories: many(restaurantToCategoriesTable),
  hours: many(restaurantHoursTable),
  products: many(productsTable),
  productCategories: many(productCategoriesTable),
  orders: many(ordersTable),
  reviews: many(reviewsTable),
}));

export const productsRelations = relations(productsTable, ({ one, many }) => ({
  restaurant: one(restaurantsTable, {
    fields: [productsTable.restaurantId],
    references: [restaurantsTable.id],
  }),
  category: one(productCategoriesTable, {
    fields: [productsTable.categoryId],
    references: [productCategoriesTable.id],
  }),
  optionGroups: many(productOptionGroupsTable),
  reviews: many(reviewsTable),
}));

export const ordersRelations = relations(ordersTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [ordersTable.userId],
    references: [usersTable.id],
  }),
  restaurant: one(restaurantsTable, {
    fields: [ordersTable.restaurantId],
    references: [restaurantsTable.id],
  }),
  address: one(addressesTable, {
    fields: [ordersTable.addressId],
    references: [addressesTable.id],
  }),
  items: many(orderItemsTable),
}));