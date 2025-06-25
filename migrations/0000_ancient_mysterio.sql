CREATE TABLE "biblioteca_musicas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"cantor" text,
	"link_youtube" text,
	"partitura" text,
	"link_download" text,
	"secao_liturgica" text,
	"observacoes" text,
	"youtube_video_id" text,
	"thumbnail" text,
	"duracao" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "missa_musicos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"missa_id" uuid NOT NULL,
	"musico_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "missas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"data" date NOT NULL,
	"horario" time NOT NULL,
	"tipo" text NOT NULL,
	"observacoes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "musicas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"missa_id" uuid NOT NULL,
	"nome" text NOT NULL,
	"cantor" text,
	"link_youtube" text,
	"partitura" text,
	"link_download" text,
	"secao_liturgica" text NOT NULL,
	"observacoes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "musico_anotacoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"musico_id" uuid NOT NULL,
	"texto" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "musico_sugestoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"musico_id" uuid NOT NULL,
	"texto" text NOT NULL,
	"status" text DEFAULT 'pendente' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "musicos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"funcao" text NOT NULL,
	"disponivel" boolean DEFAULT true NOT NULL,
	"email" text,
	"telefone" text,
	"foto" text,
	"observacoes_permanentes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "missa_musicos" ADD CONSTRAINT "missa_musicos_missa_id_missas_id_fk" FOREIGN KEY ("missa_id") REFERENCES "public"."missas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "missa_musicos" ADD CONSTRAINT "missa_musicos_musico_id_musicos_id_fk" FOREIGN KEY ("musico_id") REFERENCES "public"."musicos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "musicas" ADD CONSTRAINT "musicas_missa_id_missas_id_fk" FOREIGN KEY ("missa_id") REFERENCES "public"."missas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "musico_anotacoes" ADD CONSTRAINT "musico_anotacoes_musico_id_musicos_id_fk" FOREIGN KEY ("musico_id") REFERENCES "public"."musicos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "musico_sugestoes" ADD CONSTRAINT "musico_sugestoes_musico_id_musicos_id_fk" FOREIGN KEY ("musico_id") REFERENCES "public"."musicos"("id") ON DELETE cascade ON UPDATE no action;