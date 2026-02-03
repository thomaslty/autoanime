CREATE TABLE "series" (
	"id" serial PRIMARY KEY NOT NULL,
	"sonarr_id" integer NOT NULL,
	"title" text NOT NULL,
	"title_slug" varchar,
	"overview" text,
	"poster_path" varchar,
	"banner_path" varchar,
	"fanart_path" varchar,
	"clearlogo_path" varchar,
	"year" integer,
	"ended" boolean DEFAULT false,
	"genres" text,
	"network" varchar,
	"runtime" integer,
	"certification" varchar,
	"series_type" varchar,
	"imdb_id" varchar,
	"tmdb_id" integer,
	"tvdb_id" integer,
	"tv_maze_id" integer,
	"air_day" varchar,
	"air_time" varchar,
	"first_aired" timestamp,
	"last_aired" timestamp,
	"next_airing" timestamp,
	"previous_airing" timestamp,
	"added_at" timestamp,
	"show_type" varchar,
	"status" varchar,
	"profile_id" integer,
	"language_profile_id" integer,
	"season_count" integer,
	"episode_count" integer,
	"total_episode_count" integer,
	"episode_file_count" integer,
	"size_on_disk" bigint,
	"percent_of_episodes" numeric(5, 2),
	"rating_value" numeric(3, 1),
	"rating_votes" integer,
	"monitored" boolean DEFAULT true,
	"is_auto_download_enabled" boolean DEFAULT false,
	"download_status" integer DEFAULT 0,
	"last_synced_at" timestamp DEFAULT now(),
	"raw_data" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "series_sonarr_id_unique" UNIQUE("sonarr_id")
);
--> statement-breakpoint
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
	"series_id" integer,
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
	"series_id" integer,
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
CREATE TABLE "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(255) NOT NULL,
	"value" text,
	"is_encrypted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "series_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"series_id" integer NOT NULL,
	"cover_type" varchar(50) NOT NULL,
	"url" text,
	"remote_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "series_alternate_titles" (
	"id" serial PRIMARY KEY NOT NULL,
	"series_id" integer NOT NULL,
	"title" varchar(500) NOT NULL,
	"scene_season_number" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "series_seasons" (
	"id" serial PRIMARY KEY NOT NULL,
	"series_id" integer NOT NULL,
	"season_number" integer NOT NULL,
	"monitored" boolean DEFAULT true,
	"episode_count" integer,
	"episode_file_count" integer,
	"total_episode_count" integer,
	"size_on_disk" bigint,
	"percent_of_episodes" numeric(5, 2),
	"next_airing" timestamp,
	"previous_airing" timestamp,
	"is_auto_download_enabled" boolean DEFAULT false,
	"auto_download_status" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "series_episodes" (
	"id" serial PRIMARY KEY NOT NULL,
	"series_id" integer NOT NULL,
	"season_id" integer,
	"sonarr_episode_id" integer NOT NULL,
	"title" text,
	"episode_number" integer NOT NULL,
	"season_number" integer NOT NULL,
	"overview" text,
	"air_date" timestamp,
	"has_file" boolean DEFAULT false,
	"monitored" boolean DEFAULT true,
	"is_auto_download_enabled" boolean DEFAULT false,
	"auto_download_status" integer DEFAULT 0,
	"downloaded_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "series_episodes_sonarr_episode_id_unique" UNIQUE("sonarr_episode_id")
);
--> statement-breakpoint
ALTER TABLE "rss_anime_configs" ADD CONSTRAINT "rss_anime_configs_rss_source_id_rss_sources_id_fk" FOREIGN KEY ("rss_source_id") REFERENCES "public"."rss_sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rss_anime_configs" ADD CONSTRAINT "rss_anime_configs_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rss_feed_items" ADD CONSTRAINT "rss_feed_items_rss_source_id_rss_sources_id_fk" FOREIGN KEY ("rss_source_id") REFERENCES "public"."rss_sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qbittorrent_downloads" ADD CONSTRAINT "qbittorrent_downloads_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series_images" ADD CONSTRAINT "series_images_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series_alternate_titles" ADD CONSTRAINT "series_alternate_titles_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series_seasons" ADD CONSTRAINT "series_seasons_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series_episodes" ADD CONSTRAINT "series_episodes_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series_episodes" ADD CONSTRAINT "series_episodes_season_id_series_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."series_seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_series_title" ON "series" USING btree ("title");--> statement-breakpoint
CREATE INDEX "idx_series_status" ON "series" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_series_last_synced" ON "series" USING btree ("last_synced_at");--> statement-breakpoint
CREATE INDEX "idx_series_imdb" ON "series" USING btree ("imdb_id");--> statement-breakpoint
CREATE INDEX "idx_series_tmdb" ON "series" USING btree ("tmdb_id");--> statement-breakpoint
CREATE INDEX "idx_series_tvdb" ON "series" USING btree ("tvdb_id");--> statement-breakpoint
CREATE INDEX "idx_rss_sources_name" ON "rss_sources" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_rss_sources_is_enabled" ON "rss_sources" USING btree ("is_enabled");--> statement-breakpoint
CREATE INDEX "idx_rss_anime_configs_name" ON "rss_anime_configs" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_rss_anime_configs_is_enabled" ON "rss_anime_configs" USING btree ("is_enabled");--> statement-breakpoint
CREATE INDEX "idx_rss_feed_items_link" ON "rss_feed_items" USING btree ("link");--> statement-breakpoint
CREATE INDEX "idx_rss_feed_items_is_processed" ON "rss_feed_items" USING btree ("is_processed");--> statement-breakpoint
CREATE INDEX "idx_rss_feed_items_rss_source" ON "rss_feed_items" USING btree ("rss_source_id");--> statement-breakpoint
CREATE INDEX "idx_qbittorrent_downloads_status" ON "qbittorrent_downloads" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_qbittorrent_downloads_hash" ON "qbittorrent_downloads" USING btree ("torrent_hash");--> statement-breakpoint
CREATE INDEX "idx_qbittorrent_downloads_series" ON "qbittorrent_downloads" USING btree ("series_id");--> statement-breakpoint
CREATE INDEX "idx_settings_key" ON "settings" USING btree ("key");--> statement-breakpoint
CREATE INDEX "idx_series_images_series" ON "series_images" USING btree ("series_id");--> statement-breakpoint
CREATE INDEX "idx_series_images_type" ON "series_images" USING btree ("cover_type");--> statement-breakpoint
CREATE INDEX "idx_series_alt_titles_series" ON "series_alternate_titles" USING btree ("series_id");--> statement-breakpoint
CREATE INDEX "idx_series_alt_titles_title" ON "series_alternate_titles" USING btree ("title");--> statement-breakpoint
CREATE INDEX "idx_series_seasons_series" ON "series_seasons" USING btree ("series_id");--> statement-breakpoint
CREATE INDEX "idx_series_seasons_number" ON "series_seasons" USING btree ("season_number");--> statement-breakpoint
CREATE INDEX "idx_episodes_series" ON "series_episodes" USING btree ("series_id");--> statement-breakpoint
CREATE INDEX "idx_episodes_season" ON "series_episodes" USING btree ("season_id");--> statement-breakpoint
CREATE INDEX "idx_episodes_sonarr_id" ON "series_episodes" USING btree ("sonarr_episode_id");