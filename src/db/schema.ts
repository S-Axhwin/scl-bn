import { pgTable, varchar, uuid, integer, date, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ENUM type for attendance status
export const attendanceStatus = pgEnum("attendance_status",["present", "absent", "leave"],);

// Students Table
export const students = pgTable("students", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`), // Generates a random UUID for each new student
  name: varchar("name", { length: 255 }).notNull(), // Student name, required
  rollNumber: varchar("roll_number", { length: 50 }).notNull().unique(), 
  classId: uuid("class_id")
    .references(() => classes.id),
  dob: date("dob"), // Date of birth, optional
  parentContact: varchar("parent_contact", { length: 15 }), // Parent contact number, optional
  createdAt: timestamp("created_at").defaultNow(), // Timestamp for creation, default to current time
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()), // Auto-update timestamp for last modification
});

// Teachers Table
export const teachers = pgTable("teachers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});


// Classes Table
export const classes = pgTable("classes", {
  id: uuid("id").primaryKey().defaultRandom(),
  grade: varchar("grade", { length: 10 }).notNull(),
  section: varchar("section", { length: 10 }).notNull(),
  classTeacherId: uuid("class_teacher_id").references(() => teachers.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

// Subjects Table
export const subjects = pgTable("subjects", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  teacherId: uuid("teacher_id").references(() => teachers.id), // Foreign key to teachers table
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});


// Attendance Table
export const attendance = pgTable("attendance", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id").references(() => students.id),
  classId: uuid("class_id").references(() => classes.id),
  date: date("date").notNull(),
  status: attendanceStatus("status").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Marks Table
export const marks = pgTable("marks", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id").references(() => students.id),
  subjectId: uuid("subject_id").references(() => subjects.id),
  examType: varchar("exam_type", { length: 255 }),
  marksObtained: integer("marks_obtained"),
  totalMarks: integer("total_marks"),
  createdAt: timestamp("created_at").defaultNow(),
});
