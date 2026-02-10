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
	"download_status_id" integer,
	"rss_config_id" integer,
	"path" text,
	"last_synced_at" timestamp DEFAULT now(),
	"raw_data" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "series_sonarr_id_unique" UNIQUE("sonarr_id")
);
--> statement-breakpoint
CREATE TABLE "rss" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"url" varchar NOT NULL,
	"template_id" integer,
	"is_enabled" boolean DEFAULT true,
	"last_fetched_at" timestamp,
	"refresh_interval" varchar DEFAULT '1h',
	"refresh_interval_type" varchar DEFAULT 'human',
	"next_fetch_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rss_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"rss_id" integer,
	"guid" varchar NOT NULL,
	"title" text,
	"description" text,
	"link" varchar,
	"published_date" timestamp,
	"magnet_link" text,
	"author" varchar,
	"category" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rss_config" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"regex" text NOT NULL,
	"rss_source_id" integer,
	"offset" integer,
	"is_enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "downloads" (
	"id" serial PRIMARY KEY NOT NULL,
	"torrent_hash" varchar,
	"magnet_link" text NOT NULL,
	"series_episode_id" integer,
	"rss_item_id" integer,
	"category" varchar,
	"download_status_id" integer,
	"name" varchar,
	"size" bigint,
	"progress" numeric(5, 2) DEFAULT '0',
	"file_path" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "downloads_torrent_hash_unique" UNIQUE("torrent_hash")
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
	"download_status_id" integer,
	"rss_config_id" integer,
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
	"download_status_id" integer,
	"downloaded_at" timestamp,
	"rss_item_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "series_episodes_sonarr_episode_id_unique" UNIQUE("sonarr_episode_id")
);
--> statement-breakpoint
CREATE TABLE "download_status" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"label" varchar(50) NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "download_status_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "rss_template" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"label" varchar(50) NOT NULL,
	"description" text,
	"parser" varchar(50),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "rss_template_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "series" ADD CONSTRAINT "series_download_status_id_download_status_id_fk" FOREIGN KEY ("download_status_id") REFERENCES "public"."download_status"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series" ADD CONSTRAINT "series_rss_config_id_rss_config_id_fk" FOREIGN KEY ("rss_config_id") REFERENCES "public"."rss_config"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rss" ADD CONSTRAINT "rss_template_id_rss_template_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."rss_template"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rss_item" ADD CONSTRAINT "rss_item_rss_id_rss_id_fk" FOREIGN KEY ("rss_id") REFERENCES "public"."rss"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rss_config" ADD CONSTRAINT "rss_config_rss_source_id_rss_id_fk" FOREIGN KEY ("rss_source_id") REFERENCES "public"."rss"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "downloads" ADD CONSTRAINT "downloads_series_episode_id_series_episodes_id_fk" FOREIGN KEY ("series_episode_id") REFERENCES "public"."series_episodes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "downloads" ADD CONSTRAINT "downloads_rss_item_id_rss_item_id_fk" FOREIGN KEY ("rss_item_id") REFERENCES "public"."rss_item"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "downloads" ADD CONSTRAINT "downloads_download_status_id_download_status_id_fk" FOREIGN KEY ("download_status_id") REFERENCES "public"."download_status"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series_images" ADD CONSTRAINT "series_images_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series_alternate_titles" ADD CONSTRAINT "series_alternate_titles_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series_seasons" ADD CONSTRAINT "series_seasons_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series_seasons" ADD CONSTRAINT "series_seasons_download_status_id_download_status_id_fk" FOREIGN KEY ("download_status_id") REFERENCES "public"."download_status"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series_seasons" ADD CONSTRAINT "series_seasons_rss_config_id_rss_config_id_fk" FOREIGN KEY ("rss_config_id") REFERENCES "public"."rss_config"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series_episodes" ADD CONSTRAINT "series_episodes_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series_episodes" ADD CONSTRAINT "series_episodes_season_id_series_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."series_seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series_episodes" ADD CONSTRAINT "series_episodes_download_status_id_download_status_id_fk" FOREIGN KEY ("download_status_id") REFERENCES "public"."download_status"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series_episodes" ADD CONSTRAINT "series_episodes_rss_item_id_rss_item_id_fk" FOREIGN KEY ("rss_item_id") REFERENCES "public"."rss_item"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_series_title" ON "series" USING btree ("title");--> statement-breakpoint
CREATE INDEX "idx_series_status" ON "series" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_series_last_synced" ON "series" USING btree ("last_synced_at");--> statement-breakpoint
CREATE INDEX "idx_series_imdb" ON "series" USING btree ("imdb_id");--> statement-breakpoint
CREATE INDEX "idx_series_tmdb" ON "series" USING btree ("tmdb_id");--> statement-breakpoint
CREATE INDEX "idx_series_tvdb" ON "series" USING btree ("tvdb_id");--> statement-breakpoint
CREATE INDEX "idx_rss_name" ON "rss" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_rss_is_enabled" ON "rss" USING btree ("is_enabled");--> statement-breakpoint
CREATE INDEX "idx_rss_template_id" ON "rss" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "idx_rss_item_rss_id" ON "rss_item" USING btree ("rss_id");--> statement-breakpoint
CREATE INDEX "idx_rss_item_guid" ON "rss_item" USING btree ("guid");--> statement-breakpoint
CREATE INDEX "idx_rss_item_published" ON "rss_item" USING btree ("published_date");--> statement-breakpoint
CREATE INDEX "idx_rss_config_name" ON "rss_config" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_rss_config_rss_source" ON "rss_config" USING btree ("rss_source_id");--> statement-breakpoint
CREATE INDEX "idx_downloads_status" ON "downloads" USING btree ("download_status_id");--> statement-breakpoint
CREATE INDEX "idx_downloads_hash" ON "downloads" USING btree ("torrent_hash");--> statement-breakpoint
CREATE INDEX "idx_downloads_episode" ON "downloads" USING btree ("series_episode_id");--> statement-breakpoint
CREATE INDEX "idx_downloads_rss_item" ON "downloads" USING btree ("rss_item_id");--> statement-breakpoint
CREATE INDEX "idx_settings_key" ON "settings" USING btree ("key");--> statement-breakpoint
CREATE INDEX "idx_series_images_series" ON "series_images" USING btree ("series_id");--> statement-breakpoint
CREATE INDEX "idx_series_images_type" ON "series_images" USING btree ("cover_type");--> statement-breakpoint
CREATE INDEX "idx_series_alt_titles_series" ON "series_alternate_titles" USING btree ("series_id");--> statement-breakpoint
CREATE INDEX "idx_series_alt_titles_title" ON "series_alternate_titles" USING btree ("title");--> statement-breakpoint
CREATE INDEX "idx_series_seasons_series" ON "series_seasons" USING btree ("series_id");--> statement-breakpoint
CREATE INDEX "idx_series_seasons_number" ON "series_seasons" USING btree ("season_number");--> statement-breakpoint
CREATE INDEX "idx_episodes_series" ON "series_episodes" USING btree ("series_id");--> statement-breakpoint
CREATE INDEX "idx_episodes_season" ON "series_episodes" USING btree ("season_id");--> statement-breakpoint
CREATE INDEX "idx_episodes_sonarr_id" ON "series_episodes" USING btree ("sonarr_episode_id");--> statement-breakpoint
CREATE INDEX "idx_episodes_rss_item" ON "series_episodes" USING btree ("rss_item_id");--> statement-breakpoint
CREATE INDEX "idx_download_status_name" ON "download_status" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_download_status_sort" ON "download_status" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "idx_rss_template_name" ON "rss_template" USING btree ("name");