ALTER TABLE "rss_config" ADD COLUMN "offset" integer;--> statement-breakpoint
ALTER TABLE "series_episodes" ADD COLUMN "rss_item_id" integer;--> statement-breakpoint
ALTER TABLE "series_episodes" ADD CONSTRAINT "series_episodes_rss_item_id_rss_item_id_fk" FOREIGN KEY ("rss_item_id") REFERENCES "public"."rss_item"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_episodes_rss_item" ON "series_episodes" USING btree ("rss_item_id");