CREATE TABLE "series_metadata" (
	"id" serial PRIMARY KEY NOT NULL,
	"series_id" integer NOT NULL,
	"title_slug" varchar,
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
	"profile_id" integer,
	"language_profile_id" integer,
	"episode_count" integer,
	"size_on_disk" bigint,
	"percent_of_episodes" numeric(5, 2),
	"rating_value" numeric(3, 1),
	"rating_votes" integer,
	"raw_data" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "series_metadata_series_id_unique" UNIQUE("series_id")
);
--> statement-breakpoint
DROP INDEX "idx_series_imdb";--> statement-breakpoint
DROP INDEX "idx_series_tmdb";--> statement-breakpoint
DROP INDEX "idx_series_tvdb";--> statement-breakpoint
ALTER TABLE "series_metadata" ADD CONSTRAINT "series_metadata_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_series_metadata_series" ON "series_metadata" USING btree ("series_id");--> statement-breakpoint
CREATE INDEX "idx_series_metadata_imdb" ON "series_metadata" USING btree ("imdb_id");--> statement-breakpoint
CREATE INDEX "idx_series_metadata_tmdb" ON "series_metadata" USING btree ("tmdb_id");--> statement-breakpoint
CREATE INDEX "idx_series_metadata_tvdb" ON "series_metadata" USING btree ("tvdb_id");--> statement-breakpoint
ALTER TABLE "series" DROP COLUMN "title_slug";--> statement-breakpoint
ALTER TABLE "series" DROP COLUMN "banner_path";--> statement-breakpoint
ALTER TABLE "series" DROP COLUMN "fanart_path";--> statement-breakpoint
ALTER TABLE "series" DROP COLUMN "clearlogo_path";--> statement-breakpoint
ALTER TABLE "series" DROP COLUMN "year";--> statement-breakpoint
ALTER TABLE "series" DROP COLUMN "ended";--> statement-breakpoint
ALTER TABLE "series" DROP COLUMN "genres";--> statement-breakpoint
ALTER TABLE "series" DROP COLUMN "network";--> statement-breakpoint
ALTER TABLE "series" DROP COLUMN "runtime";--> statement-breakpoint
ALTER TABLE "series" DROP COLUMN "certification";--> statement-breakpoint
ALTER TABLE "series" DROP COLUMN "series_type";--> statement-breakpoint
ALTER TABLE "series" DROP COLUMN "imdb_id";--> statement-breakpoint
ALTER TABLE "series" DROP COLUMN "tmdb_id";--> statement-breakpoint
ALTER TABLE "series" DROP COLUMN "tvdb_id";--> statement-breakpoint
ALTER TABLE "series" DROP COLUMN "tv_maze_id";--> statement-breakpoint
ALTER TABLE "series" DROP COLUMN "air_day";--> statement-breakpoint
ALTER TABLE "series" DROP COLUMN "air_time";--> statement-breakpoint
ALTER TABLE "series" DROP COLUMN "first_aired";--> statement-breakpoint
ALTER TABLE "series" DROP COLUMN "last_aired";--> statement-breakpoint
ALTER TABLE "series" DROP COLUMN "next_airing";--> statement-breakpoint
ALTER TABLE "series" DROP COLUMN "previous_airing";--> statement-breakpoint
ALTER TABLE "series" DROP COLUMN "added_at";--> statement-breakpoint
ALTER TABLE "series" DROP COLUMN "show_type";--> statement-breakpoint
ALTER TABLE "series" DROP COLUMN "profile_id";--> statement-breakpoint
ALTER TABLE "series" DROP COLUMN "language_profile_id";--> statement-breakpoint
ALTER TABLE "series" DROP COLUMN "episode_count";--> statement-breakpoint
ALTER TABLE "series" DROP COLUMN "size_on_disk";--> statement-breakpoint
ALTER TABLE "series" DROP COLUMN "percent_of_episodes";--> statement-breakpoint
ALTER TABLE "series" DROP COLUMN "rating_value";--> statement-breakpoint
ALTER TABLE "series" DROP COLUMN "rating_votes";--> statement-breakpoint
ALTER TABLE "series" DROP COLUMN "raw_data";