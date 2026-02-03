CREATE TABLE IF NOT EXISTS "rss" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"url" varchar NOT NULL,
	"template_id" integer DEFAULT 0 NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"last_fetched_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-break
CREATE TABLE IF NOT EXISTS "rss_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"rss_id" integer REFERENCES "rss"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
	"guid" varchar NOT NULL,
	"title" text,
	"description" text,
	"link" varchar,
	"published_date" timestamp,
	"magnet_link" text,
	"author" varchar,
	"category" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-break
CREATE INDEX IF NOT EXISTS "idx_rss_name" ON "rss" ("name");
--> statement-break
CREATE INDEX IF NOT EXISTS "idx_rss_is_enabled" ON "rss" ("is_enabled");
--> statement-break
CREATE INDEX IF NOT EXISTS "idx_rss_template_id" ON "rss" ("template_id");
--> statement-break
CREATE INDEX IF NOT EXISTS "idx_rss_item_rss_id" ON "rss_item" ("rss_id");
--> statement-break
CREATE INDEX IF NOT EXISTS "idx_rss_item_guid" ON "rss_item" ("guid");
--> statement-break
CREATE INDEX IF NOT EXISTS "idx_rss_item_published" ON "rss_item" ("published_date");
--> statement-break
DROP TABLE IF EXISTS "rss_feed_items";
--> statement-break
DROP TABLE IF EXISTS "rss_anime_configs";
--> statement-break
DROP TABLE IF EXISTS "rss_sources";
