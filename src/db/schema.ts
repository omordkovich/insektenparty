import {
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
  time,
} from "drizzle-orm/pg-core";

export const guests = pgTable("guests", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  additionalGuests: integer("additional_guests").notNull().default(0),
  arrivalTime: time("arrival_time").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Guest = typeof guests.$inferSelect;
export type NewGuest = typeof guests.$inferInsert;
