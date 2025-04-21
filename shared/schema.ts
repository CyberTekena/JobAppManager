import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  email: text("email"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
});

// Applications table
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  jobTitle: text("job_title").notNull(),
  company: text("company").notNull(),
  location: text("location"),
  status: text("status").notNull().default("applied"),
  appliedDate: timestamp("applied_date").notNull().defaultNow(),
  deadline: timestamp("deadline"),
  jobDescription: text("job_description"),
  resumeUsed: text("resume_used"),
  coverLetterUsed: text("cover_letter_used"),
  url: text("url"),
  salary: text("salary"),
  contactInfo: text("contact_info"),
  priority: text("priority").default("medium"),
  tags: text("tags").array(),
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  userId: true,
});

// Notes/comments for applications
export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull().references(() => applications.id),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
});

export const insertNoteSchema = createInsertSchema(notes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Timeline events for application
export const timelineEvents = pgTable("timeline_events", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull().references(() => applications.id),
  userId: integer("user_id").notNull().references(() => users.id),
  eventType: text("event_type").notNull(), // applied, interview, offer, rejected, etc.
  eventDate: timestamp("event_date").notNull(),
  description: text("description"),
  details: jsonb("details"), // can store additional info like interview type, salary offered, etc.
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTimelineEventSchema = createInsertSchema(timelineEvents).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;

export type Note = typeof notes.$inferSelect;
export type InsertNote = z.infer<typeof insertNoteSchema>;

export type TimelineEvent = typeof timelineEvents.$inferSelect;
export type InsertTimelineEvent = z.infer<typeof insertTimelineEventSchema>;

// Status options
export const ApplicationStatus = {
  APPLIED: "applied",
  INTERVIEW: "interview",
  OFFER: "offer",
  REJECTED: "rejected"
} as const;

export type ApplicationStatusType = typeof ApplicationStatus[keyof typeof ApplicationStatus];
