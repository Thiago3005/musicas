-- Create authentication tables
CREATE TABLE IF NOT EXISTS "auth_users" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"nome" varchar(255) NOT NULL,
	"tipo" varchar(20) NOT NULL,
	"instrumento" varchar(100),
	"telefone" varchar(20),
	"foto" text,
	"ativo" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "auth_users_email_unique" UNIQUE("email")
);

CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "user_sessions" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"last_activity" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);