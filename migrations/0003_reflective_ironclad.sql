CREATE TYPE "public"."assessment_type" AS ENUM('Quiz', 'Exam', 'Assignment');--> statement-breakpoint
CREATE TYPE "public"."auth_user_role" AS ENUM('admin', 'trainer', 'trainee', 'user');--> statement-breakpoint
CREATE TYPE "public"."blog_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."contact_status" AS ENUM('unread', 'in_progress', 'replied', 'archived');--> statement-breakpoint
CREATE TYPE "public"."contact_type" AS ENUM('message', 'booking');--> statement-breakpoint
CREATE TYPE "public"."content_type" AS ENUM('Video', 'Text', 'Quiz');--> statement-breakpoint
CREATE TYPE "public"."course_level" AS ENUM('beginner', 'intermediate', 'expert');--> statement-breakpoint
CREATE TYPE "public"."course_status" AS ENUM('Draft', 'Published', 'Archived');--> statement-breakpoint
CREATE TYPE "public"."delivery_mode" AS ENUM('self_paced', 'live', 'hybrid');--> statement-breakpoint
CREATE TYPE "public"."notification_status" AS ENUM('read', 'unread');--> statement-breakpoint
CREATE TYPE "public"."priority_level" AS ENUM('high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "public"."registration_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'inactive', 'banned');--> statement-breakpoint
CREATE TABLE "assessments" (
	"assessment_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"module_id" uuid NOT NULL,
	"assessment_type" "assessment_type" NOT NULL,
	"max_score" integer NOT NULL,
	"passing_score" integer NOT NULL,
	"time_limit" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "auth_users" (
	"user_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(255) DEFAULT 'abc' NOT NULL,
	"last_name" varchar(255) DEFAULT 'def' NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" "auth_user_role" DEFAULT 'trainee' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"last_login" timestamp with time zone,
	CONSTRAINT "auth_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "blogposts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"content" text,
	"author_id" uuid,
	"publish_date" timestamp,
	"status" "blog_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "blogposts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "carbon_topics" (
	"topic_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "certificates" (
	"certificate_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"course_start_date" date NOT NULL,
	"course_end_date" date NOT NULL,
	"issue_date" timestamp with time zone NOT NULL,
	"valid_until" timestamp with time zone,
	"issuer_name" varchar(255) DEFAULT 'Ussama Ben Abdessalem',
	"issuer_role" varchar(255) DEFAULT 'CEO of Carbon Jar',
	"certificate_code" varchar(32) NOT NULL,
	"certificate_slug" varchar(255) NOT NULL,
	"pdf_url" varchar(512) DEFAULT '',
	"certificate_hash" varchar(255) NOT NULL,
	"is_revoked" boolean DEFAULT false,
	"revoked_reason" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "certificates_certificate_code_unique" UNIQUE("certificate_code"),
	CONSTRAINT "certificates_certificate_slug_unique" UNIQUE("certificate_slug")
);
--> statement-breakpoint
CREATE TABLE "contactrequests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "contact_type" NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20),
	"subject" varchar(255),
	"message" text,
	"meeting_type" varchar(255),
	"scheduled_date" timestamp,
	"duration_minutes" integer,
	"status" "contact_status" DEFAULT 'unread' NOT NULL,
	"priority" "priority_level",
	"submitted_at" timestamp with time zone DEFAULT now(),
	"responded_at" timestamp with time zone,
	"user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "course_prerequisites" (
	"course_id" uuid NOT NULL,
	"prerequisite_course_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"course_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"carbon_accounting_focus" boolean DEFAULT false,
	"carbon_topic_id" uuid,
	"level" "course_level" NOT NULL,
	"creation_date" timestamp with time zone DEFAULT now(),
	"last_updated" timestamp with time zone DEFAULT now(),
	"status" "course_status" DEFAULT 'Draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "enrollments" (
	"enrollment_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"enrollment_date" timestamp with time zone DEFAULT now(),
	"progress_percentage" integer DEFAULT 0,
	"completion_status" varchar(50) DEFAULT 'in_progress',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "learning_analytics" (
	"analytics_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"total_users" integer DEFAULT 0,
	"total_courses" integer DEFAULT 0,
	"total_enrollments" integer DEFAULT 0,
	"total_completions" integer DEFAULT 0,
	"total_certificates" integer DEFAULT 0,
	"last_updated" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "modules" (
	"module_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text,
	"content_type" "content_type" NOT NULL,
	"order" integer NOT NULL,
	"estimated_duration" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipient_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"content" text NOT NULL,
	"status" "notification_status" DEFAULT 'unread' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"question_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" uuid NOT NULL,
	"text" text NOT NULL,
	"options" json,
	"correct_answer" varchar(255),
	"explanation" text,
	"order" integer
);
--> statement-breakpoint
CREATE TABLE "training_sessions" (
	"session_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"instructor_id" uuid,
	"max_participants" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
DROP TABLE "users" CASCADE;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_module_id_modules_module_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("module_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blogposts" ADD CONSTRAINT "blogposts_author_id_auth_users_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."auth_users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_user_id_auth_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_course_id_courses_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("course_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contactrequests" ADD CONSTRAINT "contactrequests_user_id_auth_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_prerequisites" ADD CONSTRAINT "course_prerequisites_course_id_courses_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("course_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_prerequisites" ADD CONSTRAINT "course_prerequisites_prerequisite_course_id_courses_course_id_fk" FOREIGN KEY ("prerequisite_course_id") REFERENCES "public"."courses"("course_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_carbon_topic_id_carbon_topics_topic_id_fk" FOREIGN KEY ("carbon_topic_id") REFERENCES "public"."carbon_topics"("topic_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_user_id_auth_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_course_id_courses_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("course_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modules" ADD CONSTRAINT "modules_course_id_courses_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("course_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_id_auth_users_user_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."auth_users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_assessment_id_assessments_assessment_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("assessment_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_course_id_courses_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("course_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_instructor_id_auth_users_user_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."auth_users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_assessments_module_id" ON "assessments" USING btree ("module_id");--> statement-breakpoint
CREATE INDEX "idx_auth_users_email" ON "auth_users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_blogposts_slug" ON "blogposts" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_blogposts_author" ON "blogposts" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "idx_certificates_user_id" ON "certificates" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_certificates_course_id" ON "certificates" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "idx_certificates_hash" ON "certificates" USING btree ("certificate_hash");--> statement-breakpoint
CREATE INDEX "idx_certificates_slug" ON "certificates" USING btree ("certificate_slug");--> statement-breakpoint
CREATE INDEX "idx_certificates_code" ON "certificates" USING btree ("certificate_code");--> statement-breakpoint
CREATE INDEX "idx_contactrequests_email" ON "contactrequests" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_contactrequests_user_id" ON "contactrequests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_courses_title" ON "courses" USING btree ("title");--> statement-breakpoint
CREATE INDEX "idx_courses_carbon_topic_id" ON "courses" USING btree ("carbon_topic_id");--> statement-breakpoint
CREATE INDEX "idx_enrollments_user_id" ON "enrollments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_enrollments_course_id" ON "enrollments" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "idx_modules_course_id" ON "modules" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "idx_modules_order" ON "modules" USING btree ("order");--> statement-breakpoint
CREATE INDEX "idx_notifications_recipient" ON "notifications" USING btree ("recipient_id");--> statement-breakpoint
CREATE INDEX "idx_questions_assessment_id" ON "questions" USING btree ("assessment_id");--> statement-breakpoint
CREATE INDEX "idx_training_sessions_course_id" ON "training_sessions" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "idx_training_sessions_instructor_id" ON "training_sessions" USING btree ("instructor_id");