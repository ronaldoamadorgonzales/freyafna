CREATE TYPE "public"."advisor_role" AS ENUM('ADMIN', 'ADVISOR');--> statement-breakpoint
ALTER TABLE "advisors" ADD COLUMN "password_hash" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "advisors" ADD COLUMN "role" "advisor_role" DEFAULT 'ADVISOR' NOT NULL;