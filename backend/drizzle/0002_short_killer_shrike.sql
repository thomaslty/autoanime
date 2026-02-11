ALTER TABLE "downloads" ADD COLUMN "content_path" varchar;--> statement-breakpoint
ALTER TABLE "downloads" ADD COLUMN "save_path" varchar;--> statement-breakpoint
ALTER TABLE "downloads" DROP COLUMN "file_path";