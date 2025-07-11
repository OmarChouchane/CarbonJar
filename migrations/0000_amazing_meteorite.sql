CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"clerk_id" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id")
);
