CREATE TABLE "rss_sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"url" varchar NOT NULL,
	"is_enabled" boolean DEFAULT true,
	"last_fetched_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rss_anime_configs" (
	"id" serial PRIMARY KEY NOT NULL,
	"rss_source_id" integer,
	"sonarr_series_id" integer,
	"name" varchar NOT NULL,
	"url" varchar NOT NULL,
	"is_enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rss_feed_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"rss_source_id" integer,
	"title" text NOT NULL,
	"link" varchar NOT NULL,
	"guid" varchar,
	"pub_date" timestamp,
	"is_processed" boolean DEFAULT false,
	"downloaded_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "qbittorrent_downloads" (
	"id" serial PRIMARY KEY NOT NULL,
	"torrent_hash" varchar,
	"magnet_link" text NOT NULL,
	"sonarr_series_id" integer,
	"category" varchar,
	"status" varchar,
	"name" varchar,
	"size" bigint,
	"progress" numeric(5, 2),
	"download_path" varchar,
	"save_path" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "qbittorrent_downloads_torrent_hash_unique" UNIQUE("torrent_hash")
);
--> statement-breakpoint
ALTER TABLE "rss_anime_configs" ADD CONSTRAINT "rss_anime_configs_rss_source_id_rss_sources_id_fk" FOREIGN KEY ("rss_source_id") REFERENCES "public"."rss_sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rss_anime_configs" ADD CONSTRAINT "rss_anime_configs_sonarr_series_id_sonarr_series_id_fk" FOREIGN KEY ("sonarr_series_id") REFERENCES "public"."sonarr_series"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rss_feed_items" ADD CONSTRAINT "rss_feed_items_rss_source_id_rss_sources_id_fk" FOREIGN KEY ("rss_source_id") REFERENCES "public"."rss_sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qbittorrent_downloads" ADD CONSTRAINT "qbittorrent_downloads_sonarr_series_id_sonarr_series_id_fk" FOREIGN KEY ("sonarr_series_id") REFERENCES "public"."sonarr_series"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_rss_sources_name" ON "rss_sources" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_rss_sources_is_enabled" ON "rss_sources" USING btree ("is_enabled");--> statement-breakpoint
CREATE INDEX "idx_rss_anime_configs_name" ON "rss_anime_configs" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_rss_anime_configs_is_enabled" ON "rss_anime_configs" USING btree ("is_enabled");--> statement-breakpoint
CREATE INDEX "idx_rss_feed_items_link" ON "rss_feed_items" USING btree ("link");--> statement-breakpoint
CREATE INDEX "idx_rss_feed_items_is_processed" ON "rss_feed_items" USING btree ("is_processed");--> statement-breakpoint
CREATE INDEX "idx_rss_feed_items_rss_source" ON "rss_feed_items" USING btree ("rss_source_id");--> statement-breakpoint
CREATE INDEX "idx_qbittorrent_downloads_status" ON "qbittorrent_downloads" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_qbittorrent_downloads_hash" ON "qbittorrent_downloads" USING btree ("torrent_hash");--> statement-breakpoint
CREATE INDEX "idx_qbittorrent_downloads_series" ON "qbittorrent_downloads" USING btree ("sonarr_series_id");