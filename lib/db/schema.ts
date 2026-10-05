import { pgTable, uuid, varchar, integer, numeric, jsonb, timestamp, pgEnum, text, boolean } from "drizzle-orm/pg-core";

export const leadCategoryEnum = pgEnum("lead_category", ["HOT", "WARM", "COLD"]);
export const maritalStatusEnum = pgEnum("marital_status", ["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"]);
export const moduleTypeEnum = pgEnum("module_type", ["EDUCATION", "RETIREMENT", "INCOME_PROTECTION", "HEALTH_PROTECTION", "MILESTONE_SAVINGS"]);
export const advisorStatusEnum = pgEnum("advisor_status", ["ACTIVE", "INACTIVE"]);
export const assignmentStatusEnum = pgEnum("assignment_status", ["PENDING", "CONTACTED", "CONVERTED", "LOST"]);
export const advisorRoleEnum = pgEnum("advisor_role", ["ADMIN", "ADVISOR"]);

export const leads = pgTable("leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  mobileNumber: varchar("mobile_number", { length: 20 }),
  overallLeadScore: integer("overall_lead_score").default(0).notNull(),
  leadCategory: leadCategoryEnum("lead_category").default("COLD").notNull(),
  insightsViewCount: integer("insights_view_count").default(0).notNull(),
  lastViewedInsightsAt: timestamp("last_viewed_insights_at"),
  insightsEmailSentAt: timestamp("insights_email_sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const financialProfiles = pgTable("financial_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  leadId: uuid("lead_id").references(() => leads.id, { onDelete: "cascade" }).notNull().unique(),
  age: integer("age").notNull(),
  maritalStatus: maritalStatusEnum("marital_status").notNull(),
  dependentsCount: integer("dependents_count").notNull(),
  monthlyIncomeRange: varchar("monthly_income_range", { length: 50 }).notNull(),
  currentSavings: numeric("current_savings", { precision: 15, scale: 2 }).notNull(),
  retirementAgeGoal: integer("retirement_age_goal").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const fnaModulesResponses = pgTable("fna_modules_responses", {
  id: uuid("id").defaultRandom().primaryKey(),
  leadId: uuid("lead_id").references(() => leads.id, { onDelete: "cascade" }).notNull(),
  moduleType: moduleTypeEnum("module_type").notNull(),
  inputs: jsonb("inputs").notNull(),
  outputs: jsonb("outputs").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const advisors = pgTable("advisors", {
  id: uuid("id").defaultRandom().primaryKey(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 50 }),
  advisorCode: varchar("advisor_code", { length: 50 }).unique(),
  title: varchar("title", { length: 150 }).default("Licensed Financial Advisor").notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  calendlyUrl: varchar("calendly_url", { length: 255 }),
  linkedinUrl: varchar("linkedin_url", { length: 255 }),
  status: advisorStatusEnum("status").default("ACTIVE").notNull(),
  avatarUrl: text("avatar_url"),
  passwordHash: text("password_hash").default("").notNull(),
  role: advisorRoleEnum("role").default("ADVISOR").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leadAssignments = pgTable("lead_assignments", {
  id: uuid("id").defaultRandom().primaryKey(),
  leadId: uuid("lead_id").references(() => leads.id, { onDelete: "cascade" }).notNull().unique(),
  advisorId: uuid("advisor_id").references(() => advisors.id, { onDelete: "set null" }),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  status: assignmentStatusEnum("status").default("PENDING").notNull(),
  notes: text("notes"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
