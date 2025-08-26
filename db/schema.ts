import {
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  pgEnum,
  real,
  varchar,
  boolean,
} from "drizzle-orm/pg-core";

// --- ENUM'lar (Sabit Seçenekler) ---
export const userRoleEnum = pgEnum("user_role", ["CUSTOMER", "STAFF", "ADMIN"]);
export const orderStatusEnum = pgEnum("order_status", [
  "PENDING",
  "PAID",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]);

// --- Kimlik Doğrulama ve Kullanıcı Tabloları ---

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  password: text("password"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  role: userRoleEnum("role").default("CUSTOMER"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  activeOrganizationId: text("active_organization_id"),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
});

// --- Yönetim Paneli Tabloları ---

export const category = pgTable("category", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  parentId: text("parentId"),
  level: integer("level").default(0).notNull(),
  sortOrder: integer("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  image: text("image"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const product = pgTable("product", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  images: text("images").array(),
  stock: integer("stock").default(0).notNull(),
  barcode: varchar("barcode", { length: 255 }).unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  categoryId: text("categoryId")
    .notNull()
    .references(() => category.id),
});

export const order = pgTable("order", {
  id: text("id").primaryKey(),
  total: real("total").notNull(),
  status: orderStatusEnum("status").default("PAID"),
  customerId: text("customerId").references(() => customer.id),
  paymentMethod: text("paymentMethod").default("card"),
  discount: real("discount").default(0),
  tax: real("tax").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  userId: text("userId").references(() => user.id),
});

export const customer = pgTable("customer", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone").notNull(),
  address: text("address"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const orderItem = pgTable("order_item", {
  id: text("id").primaryKey(),
  quantity: integer("quantity").notNull(),
  price: real("price").notNull(),
  orderId: text("orderId")
    .notNull()
    .references(() => order.id, { onDelete: "cascade" }),
  productId: text("productId")
    .notNull()
    .references(() => product.id),
});

// --- TİP TANIMLAMALARI (TYPE INFERENCE) ---
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export type Product = typeof product.$inferSelect;
export type NewProduct = typeof product.$inferInsert;

export type Category = typeof category.$inferSelect;
export type NewCategory = typeof category.$inferInsert;

export type Order = typeof order.$inferSelect;
export type NewOrder = typeof order.$inferInsert;

export type Customer = typeof customer.$inferSelect;
export type NewCustomer = typeof customer.$inferInsert;

export type OrderItem = typeof orderItem.$inferSelect;
export type NewOrderItem = typeof orderItem.$inferInsert;

// --- Schema Export for better-auth ---
export const schema = {
  user,
  session,
  account,
  verification,
  category,
  product,
  order,
  customer,
  orderItem,
};
