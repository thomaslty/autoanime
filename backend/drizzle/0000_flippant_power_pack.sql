CREATE TABLE "sonarr_series" (
	"id" serial PRIMARY KEY NOT NULL,
	"sonarr_id" integer NOT NULL,
	"title" text NOT NULL,
	"title_slug" varchar,
	"overview" text,
	"poster_path" varchar,
	"banner_path" varchar,
	"network" varchar,
	"air_day" varchar,
	"air_time" varchar,
	"show_type" varchar,
	"status" varchar,
	"profile_id" integer,
	"language_profile_id" integer,
	"season_count" integer,
	"total_episode_count" integer,
	"episode_file_count" integer,
	"size_on_disk" integer,
	"monitored" boolean DEFAULT true,
	"is_auto_download_enabled" boolean DEFAULT false,
	"download_status" varchar,
	"last_synced_at" timestamp DEFAULT now(),
	"raw_data" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "sonarr_series_sonarr_id_unique" UNIQUE("sonarr_id")
);
--> statement-breakpoint
CREATE INDEX "idx_sonarr_series_title" ON "sonarr_series" USING btree ("title");--> statement-breakpoint
CREATE INDEX "idx_sonarr_series_status" ON "sonarr_series" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_sonarr_series_last_synced" ON "sonarr_series" USING btree ("last_synced_at");