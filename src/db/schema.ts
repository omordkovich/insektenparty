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

export const parties = pgTable("parties", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  ownerId: uuid("owner_id"),
  slug: text("slug").notNull().unique(),
  theme: text("theme").notNull(),
  kicker: text("kicker").notNull(),
  title: text("title").notNull(),
  greeting: text("greeting").notNull(),
  dateLabel: text("date_label").notNull(),
  timeLabel: text("time_label").notNull(),
  locationLabel: text("location_label").notNull(),
  defaultArrivalTime: text("default_arrival_time").notNull(),
  eventDate: date("event_date").notNull(),
  eventStartTime: time("event_start_time").notNull(),
  eventEndTime: time("event_end_time").notNull(),
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

export type Party = typeof parties.$inferSelect;
export type NewParty = typeof parties.$inferInsert;

export const guests = pgTable("guests", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  partyId: uuid("party_id").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  additionalGuests: integer("additional_guests").notNull().default(0),
  additionalGuestNames: text("additional_guest_names")
    .array()
    .notNull()
    .default([]),
  arrivalTime: time("arrival_time").notNull(),
  bringingSomething: boolean("bringing_something").notNull().default(false),
  bringingDescription: varchar("bringing_description", { length: 1000 }),
  hasMessage: boolean("has_message").notNull().default(false),
  message: varchar("message", { length: 1000 }),
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
