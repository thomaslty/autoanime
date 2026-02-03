CREATE TABLE "series_episodes" (
	"id" serial PRIMARY KEY NOT NULL,
	"sonarr_series_id" integer NOT NULL,
	"season_id" integer,
	"sonarr_episode_id" integer NOT NULL,
	"title" text,
	"episode_number" integer NOT NULL,
	"season_number" integer NOT NULL,
	"overview" text,
	"air_date" timestamp,
	"has_file" boolean DEFAULT false,
	"monitored" boolean DEFAULT true,
	"auto_download_status" varchar,
	"downloaded_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "series_episodes_sonarr_episode_id_unique" UNIQUE("sonarr_episode_id")
);
--> statement-breakpoint
ALTER TABLE "series_episodes" ADD CONSTRAINT "series_episodes_sonarr_series_id_sonarr_series_id_fk" FOREIGN KEY ("sonarr_series_id") REFERENCES "public"."sonarr_series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series_episodes" ADD CONSTRAINT "series_episodes_season_id_series_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."series_seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_episodes_series" ON "series_episodes" USING btree ("sonarr_series_id");--> statement-breakpoint
CREATE INDEX "idx_episodes_season" ON "series_episodes" USING btree ("season_id");--> statement-breakpoint
CREATE INDEX "idx_episodes_sonarr_id" ON "series_episodes" USING btree ("sonarr_episode_id");