CREATE TYPE "public"."lead_category" AS ENUM('HOT', 'WARM', 'COLD');--> statement-breakpoint
CREATE TYPE "public"."marital_status" AS ENUM('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED');--> statement-breakpoint
CREATE TYPE "public"."module_type" AS ENUM('EDUCATION', 'RETIREMENT', 'INCOME_PROTECTION', 'HEALTH_PROTECTION', 'MILESTONE_SAVINGS');--> statement-breakpoint
CREATE TABLE "financial_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"age" integer NOT NULL,
	"marital_status" "marital_status" NOT NULL,
	"dependents_count" integer NOT NULL,
	"monthly_income_range" varchar(50) NOT NULL,
	"current_savings" numeric(15, 2) NOT NULL,
	"retirement_age_goal" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "financial_profiles_lead_id_unique" UNIQUE("lead_id")
);
--> statement-breakpoint
CREATE TABLE "fna_modules_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"module_type" "module_type" NOT NULL,
	"inputs" jsonb NOT NULL,
	"outputs" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"mobile_number" varchar(20),
	"overall_lead_score" integer DEFAULT 0 NOT NULL,
	"lead_category" "lead_category" DEFAULT 'COLD' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "leads_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "financial_profiles" ADD CONSTRAINT "financial_profiles_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fna_modules_responses" ADD CONSTRAINT "fna_modules_responses_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;