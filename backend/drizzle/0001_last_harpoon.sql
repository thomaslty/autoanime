CREATE TABLE "rss_parser" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"rss_template_id" integer,
	"item_path" varchar NOT NULL,
	"field_mappings" jsonb NOT NULL,
	"sample_url" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "rss_parser_rss_template_id_unique" UNIQUE("rss_template_id")
);
--> statement-breakpoint
ALTER TABLE "rss_parser" ADD CONSTRAINT "rss_parser_rss_template_id_rss_template_id_fk" FOREIGN KEY ("rss_template_id") REFERENCES "public"."rss_template"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_rss_parser_template" ON "rss_parser" USING btree ("rss_template_id");--> statement-breakpoint
CREATE INDEX "idx_rss_parser_name" ON "rss_parser" USING btree ("name");