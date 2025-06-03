import {
  integer,
  pgTable,
  varchar,
  timestamp,
  text,
  boolean
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }),
  email: varchar({ length: 255 }).notNull().unique(),
  phoneNumber: varchar({ length: 15 }),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp()
});

export const walletTable = pgTable("wallet", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer().notNull().unique(),
  balance: integer().default(0).notNull(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp()
})

export const validationCodeTable = pgTable("validation_code", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer().notNull(),
  hashedCode: varchar({ length: 255 }).notNull(),
  status: varchar({ length: 50 }).notNull().default('PENDING'),
  createdAt: timestamp().defaultNow(),
  expiredAt: timestamp().notNull()
});

export const transactionTable = pgTable("transaction", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer().notNull(),
  value: integer().notNull(),
  title: text(),
  category: varchar({ length: 50 }).notNull(),
  type: varchar({ length: 50 }).notNull(),
  balanceBefore: integer(),
  balanceAfter: integer(),
  previousTransactionId: integer(),
  isSuperseded: boolean(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp()
});

export const onboardingTable = pgTable("onboarding", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer().notNull(),
  userEmail: varchar({ length: 255 }).notNull(),
  details: text().notNull(),
  goalAmount: integer().notNull(),
  months: integer().notNull(),
  goalCategory: varchar({ length: 50 }).notNull(),
  income: integer(),
  savings: integer(),
  investments: integer(),
  effort: varchar({ length: 50 }),
  extractFilename: varchar({ length: 255 }),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp()
});

export const categorizeExtractTable = pgTable("categorize_extract", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  onboardingId: integer().notNull(),
  status: varchar({ length: 50 }).notNull().default('PENDING'),
  retryCount: integer().notNull().default(0),
  lastProcessedAt: timestamp(),
  error: text(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp()
});

export const financialPlanningTable = pgTable("financial_planning", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  onboardingId: integer().notNull(),
  title: varchar({ length: 255 }).notNull(),
  description: text().notNull(),
  priority: varchar({ length: 50 }).notNull(),
  startDate: timestamp().notNull(),
  endDate: timestamp().notNull(),
  monthlyBudget: integer().notNull(),
  budgetCategories: text().notNull(),
  financialGoals: text().notNull(),
  monthlyProjections: text().notNull(),
  spendSugestionPerMonth: integer().notNull(),
  spendSugestionCategory: text().notNull(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp()
});