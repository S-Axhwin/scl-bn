ALTER TABLE "teachers" DROP CONSTRAINT "teachers_subject_id_subjects_id_fk";
--> statement-breakpoint
ALTER TABLE "subjects" ADD COLUMN "teacher_id" uuid;--> statement-breakpoint
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teachers" DROP COLUMN "subject_id";