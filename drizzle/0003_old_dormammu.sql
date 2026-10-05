ALTER TABLE "advisors" ADD COLUMN "advisor_code" varchar(50);--> statement-breakpoint
ALTER TABLE "advisors" ADD COLUMN "title" varchar(150) DEFAULT 'Licensed Financial Advisor' NOT NULL;--> statement-breakpoint
ALTER TABLE "advisors" ADD COLUMN "is_default" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "advisors" ADD COLUMN "calendly_url" varchar(255);--> statement-breakpoint
ALTER TABLE "advisors" ADD COLUMN "linkedin_url" varchar(255);--> statement-breakpoint
ALTER TABLE "advisors" ADD COLUMN "avatar_url" text;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "insights_view_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "last_viewed_insights_at" timestamp;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "insights_email_sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "advisors" ADD CONSTRAINT "advisors_advisor_code_unique" UNIQUE("advisor_code");