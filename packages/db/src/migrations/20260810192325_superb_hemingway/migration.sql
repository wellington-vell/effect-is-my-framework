CREATE TABLE "todos" (
	"id" serial PRIMARY KEY,
	"title" varchar(255) NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
