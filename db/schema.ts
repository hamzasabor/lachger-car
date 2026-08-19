import { pgTable, serial, integer, text } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const cars = pgTable("cars", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  price: integer("price").notNull(),
  image: text("image").notNull(),
  images: text("images").notNull().default("[]"),
  description: text("description").notNull().default(""),
  transmission: text("transmission").notNull(),
  fuel: text("fuel").notNull(),
  seats: integer("seats").notNull().default(5),
  available: integer("available").notNull().default(1),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  reference: text("reference").notNull(),
  carId: integer("car_id"),
  carName: text("car_name").notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  city: text("city").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  message: text("message").notNull().default(""),
  status: text("status").notNull().default("En attente"),
  adminReply: text("admin_reply").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const adminSettings = pgTable("admin_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
