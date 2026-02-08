CREATE TABLE "rss_config" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"regex" text NOT NULL,
	"rss_source_id" integer,
	"is_enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "series" ADD COLUMN "rss_config_id" integer;--> statement-breakpoint
ALTER TABLE "series_seasons" ADD COLUMN "rss_config_id" integer;--> statement-breakpoint
ALTER TABLE "rss_config" ADD CONSTRAINT "rss_config_rss_source_id_rss_id_fk" FOREIGN KEY ("rss_source_id") REFERENCES "public"."rss"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_rss_config_name" ON "rss_config" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_rss_config_rss_source" ON "rss_config" USING btree ("rss_source_id");--> statement-breakpoint
ALTER TABLE "series" ADD CONSTRAINT "series_rss_config_id_rss_config_id_fk" FOREIGN KEY ("rss_config_id") REFERENCES "public"."rss_config"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series_seasons" ADD CONSTRAINT "series_seasons_rss_config_id_rss_config_id_fk" FOREIGN KEY ("rss_config_id") REFERENCES "public"."rss_config"("id") ON DELETE set null ON UPDATE no action;