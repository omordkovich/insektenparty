import {
  boolean,
  date,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  time,
} from "drizzle-orm/pg-core";

export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  ownerId: uuid("owner_id"),
  slug: text("slug").notNull().unique(),
  // Permanent part of the address (see src/lib/slug.ts). Nullable until
  // migration step 2 (supabase/migrations/2026-10-07-2-*) has run.
  slugKey: text("slug_key").unique(),
  // First-name part of the address, fixed at creation ("" = none). Null
  // for events created before it existed.
  slugName: text("slug_name"),
  theme: text("theme").notNull(),
  kicker: text("kicker").notNull(),
  title: text("title").notNull(),
  greeting: text("greeting").notNull(),
  dateLabel: text("date_label").notNull(),
  timeLabel: text("time_label").notNull(),
  locationLabel: text("location_label").notNull(),
  defaultArrivalTime: text("default_arrival_time").notNull(),
  eventDate: date("event_date"),
  // Last day of a multi-day event; null for a single-day event.
  eventEndDate: date("event_end_date"),
  eventStartTime: time("event_start_time"),
  eventEndTime: time("event_end_time"),
  contactName: text("contact_name").notNull(),
  contactPhone: text("contact_phone").notNull(),
  contactEmail: text("contact_email").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Named EventRecord (not "Event") to avoid shadowing the global DOM Event type.
export type EventRecord = typeof events.$inferSelect;
export type NewEventRecord = typeof events.$inferInsert;

export const guests = pgTable("guests", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  eventId: uuid("event_id").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  additionalGuests: integer("additional_guests").notNull().default(0),
  additionalGuestNames: text("additional_guest_names")
    .array()
    .notNull()
    .default([]),
  // Null only for a declined guest.
  arrivalTime: time("arrival_time"),
  // Optional end of the arrival window; may be earlier (past midnight).
  arrivalEndTime: time("arrival_end_time"),
  // Optional "Ich bleibe bis" window (both null when not given).
  departureTime: time("departure_time"),
  departureEndTime: time("departure_end_time"),
  bringingSomething: boolean("bringing_something").notNull().default(false),
  bringingDescription: varchar("bringing_description", { length: 1000 }),
  hasMessage: boolean("has_message").notNull().default(false),
  message: varchar("message", { length: 1000 }),
  // "Ich sage ab": times, extra people and "Ich bringe was mit" stay empty.
  declined: boolean("declined").notNull().default(false),
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

// One row per unlock (append-only ledger). user_id references auth.users
// (FK + on delete cascade live in the Supabase migration, like events.owner_id
// which is also not modelled as a Drizzle reference).
export const userEntitlements = pgTable("user_entitlements", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  userId: uuid("user_id").notNull(),
  feature: text("feature").notNull(),
  quantity: integer("quantity").notNull().default(1),
  source: text("source").notNull().default("manual"),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type UserEntitlementRecord = typeof userEntitlements.$inferSelect;
