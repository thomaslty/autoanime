CREATE TABLE "series_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"sonarr_series_id" integer NOT NULL,
	"cover_type" varchar(50) NOT NULL,
	"url" text,
	"remote_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "series_alternate_titles" (
	"id" serial PRIMARY KEY NOT NULL,
	"sonarr_series_id" integer NOT NULL,
	"title" varchar(500) NOT NULL,
	"scene_season_number" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "series_seasons" (
	"id" serial PRIMARY KEY NOT NULL,
	"sonarr_series_id" integer NOT NULL,
	"season_number" integer NOT NULL,
	"monitored" boolean DEFAULT true,
	"episode_count" integer,
	"episode_file_count" integer,
	"total_episode_count" integer,
	"size_on_disk" bigint,
	"percent_of_episodes" numeric(5, 2),
	"next_airing" timestamp,
	"previous_airing" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "sonarr_series" ALTER COLUMN "size_on_disk" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "sonarr_series" ADD COLUMN "fanart_path" varchar;--> statement-breakpoint
ALTER TABLE "sonarr_series" ADD COLUMN "clearlogo_path" varchar;--> statement-breakpoint
ALTER TABLE "sonarr_series" ADD COLUMN "year" integer;--> statement-breakpoint
ALTER TABLE "sonarr_series" ADD COLUMN "ended" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "sonarr_series" ADD COLUMN "genres" text;--> statement-breakpoint
ALTER TABLE "sonarr_series" ADD COLUMN "runtime" integer;--> statement-breakpoint
ALTER TABLE "sonarr_series" ADD COLUMN "certification" varchar;--> statement-breakpoint
ALTER TABLE "sonarr_series" ADD COLUMN "series_type" varchar;--> statement-breakpoint
ALTER TABLE "sonarr_series" ADD COLUMN "imdb_id" varchar;--> statement-breakpoint
ALTER TABLE "sonarr_series" ADD COLUMN "tmdb_id" integer;--> statement-breakpoint
ALTER TABLE "sonarr_series" ADD COLUMN "tvdb_id" integer;--> statement-breakpoint
ALTER TABLE "sonarr_series" ADD COLUMN "tv_maze_id" integer;--> statement-breakpoint
ALTER TABLE "sonarr_series" ADD COLUMN "first_aired" timestamp;--> statement-breakpoint
ALTER TABLE "sonarr_series" ADD COLUMN "last_aired" timestamp;--> statement-breakpoint
ALTER TABLE "sonarr_series" ADD COLUMN "next_airing" timestamp;--> statement-breakpoint
ALTER TABLE "sonarr_series" ADD COLUMN "previous_airing" timestamp;--> statement-breakpoint
ALTER TABLE "sonarr_series" ADD COLUMN "added_at" timestamp;--> statement-breakpoint
ALTER TABLE "sonarr_series" ADD COLUMN "episode_count" integer;--> statement-breakpoint
ALTER TABLE "sonarr_series" ADD COLUMN "percent_of_episodes" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "sonarr_series" ADD COLUMN "rating_value" numeric(3, 1);--> statement-breakpoint
ALTER TABLE "sonarr_series" ADD COLUMN "rating_votes" integer;--> statement-breakpoint
ALTER TABLE "series_images" ADD CONSTRAINT "series_images_sonarr_series_id_sonarr_series_id_fk" FOREIGN KEY ("sonarr_series_id") REFERENCES "public"."sonarr_series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series_alternate_titles" ADD CONSTRAINT "series_alternate_titles_sonarr_series_id_sonarr_series_id_fk" FOREIGN KEY ("sonarr_series_id") REFERENCES "public"."sonarr_series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series_seasons" ADD CONSTRAINT "series_seasons_sonarr_series_id_sonarr_series_id_fk" FOREIGN KEY ("sonarr_series_id") REFERENCES "public"."sonarr_series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_series_images_series" ON "series_images" USING btree ("sonarr_series_id");--> statement-breakpoint
CREATE INDEX "idx_series_images_type" ON "series_images" USING btree ("cover_type");--> statement-breakpoint
CREATE INDEX "idx_series_alt_titles_series" ON "series_alternate_titles" USING btree ("sonarr_series_id");--> statement-breakpoint
CREATE INDEX "idx_series_alt_titles_title" ON "series_alternate_titles" USING btree ("title");--> statement-breakpoint
CREATE INDEX "idx_series_seasons_series" ON "series_seasons" USING btree ("sonarr_series_id");--> statement-breakpoint
CREATE INDEX "idx_series_seasons_number" ON "series_seasons" USING btree ("season_number");--> statement-breakpoint
CREATE INDEX "idx_sonarr_series_imdb" ON "sonarr_series" USING btree ("imdb_id");--> statement-breakpoint
CREATE INDEX "idx_sonarr_series_tmdb" ON "sonarr_series" USING btree ("tmdb_id");--> statement-breakpoint
CREATE INDEX "idx_sonarr_series_tvdb" ON "sonarr_series" USING btree ("tvdb_id");