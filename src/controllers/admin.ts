import { Context } from "hono";
import {setCookie} from "hono/cookie";
import { z } from "zod"
import {sign} from "jsonwebtoken"
import { and, eq, inArray,  } from "drizzle-orm";
import { db } from "../db";
import { classes, students, subjects, teachers } from "../db/schema";
import { sql } from "drizzle-orm";


// login
export const login = async (c:Context) => {
    const {uId, pass} = await c.req.json();
    if(uId == "admin@school.com" && pass == "rootAdmin") {

        setCookie(c, "token", sign({role: "admin"}, "askldjf;l"));
        return c.json({mes: "logged in"}, 200)
    }
    return c.json({mes: "invaild crid"}, 400)
}

//classes
export const createClass = async (c: Context) => {
    const { grade, section } = await c.req.json();
    console.log(grade, section);
  
    try {
      // Check if a class with the same grade and section already exists
      const existingClass = await db
        .select()
        .from(classes)
        .where(and(
            eq(classes.grade, grade),
            eq(classes.section, section)

        ))
        .limit(1); // Get at most one record
  
      if (existingClass.length > 0) {
        return c.json({ message: "Class with this grade and section already exists." });
      }
  
      // Insert the new class if it doesn't exist
      const newClass = await db.insert(classes).values({
        grade,
        section
      }).returning(); // Fetch the newly inserted class
  
      return c.json({ message: "New class created", newClass });
    } catch (err) {
      console.error(err);
      return c.json({ message: "Unable to create class" }, 500);
    }
};

export const getClassesGroupedByGrade = async (ctx:Context) => {
    try {
      // Query to group classes by grade
      const result = await db
        .select({
          grade: classes.grade,
          classSections: sql`array_agg(${classes.section})`.as('class_sections'),
        })
        .from(classes)
        .groupBy(classes.grade);
  
      return ctx.json(result);
    } catch (error) {
      console.error(error);
      return ctx.json({ error: "Internal Server Error" }, 500);
    }
};

export const createTeachers = async (c:Context) => {
    // 
    const {name, email, password, } = await c.req.json();
    try {
        const newTeacher = await db.insert(teachers).values({name, email, passwordHash: password}).returning();
        return c.json({message: "new teacher created", newTeacher}, 200);
    } catch(e) {
        return c.json({message: "err while creating teacher", e}, 300);

    }
}

export const assignTeaToClasses = async (c: Context) => {
  const { teacherId, classIds } = await c.req.json() as any;

  // Validate the input
  if (!teacherId || !classIds) {
    return c.json({ message: "Invalid input. Teacher ID and class IDs are required." }, 400);
  }

  try {
    // Check if the teacher exists
    const teacherExists = await db
      .select()
      .from(teachers)
      .where(eq(teachers.id, teacherId))  // Corrected syntax using eq
      .limit(1);

    if (teacherExists.length === 0) {
      return c.json({ message: "Teacher not found." }, 404);
    }

    // Check if all the provided class IDs are valid
    const validClassIds = await db
      .select()
      .from(classes)
      .where(eq(classes.id, classIds));

    // Perform a single batch update to assign the teacher to the classes
    await db
      .update(classes)
      .set({ classTeacherId: teacherId })
      .where(eq(classes.id, classIds));

    return c.json({ message: "Teacher assigned to classes successfully." });
  } catch (error) {
    console.error(error);
    return c.json({ message: "Internal Server Error" }, 500);
  }
};

export const createSub = async (c:Context) => {
    const {name} = await c.req.json();
    try {
        const newSub = await db
        .insert(subjects)
        .values({name})
        .returning()
        
        return c.json({message: "new subject added", newSub});
    } catch(err) {
        return c.json({message: "unable to create new subject", err}, 300);
    }
}

export const assignTeaToSub = async (c: Context) => {
    const { teacherId, subjectIds } = await c.req.json();
  
    // Validate the input
    if (!teacherId || !subjectIds || !Array.isArray(subjectIds) || subjectIds.length === 0) {
      return c.json({ message: "Invalid input. Teacher ID and subject IDs are required." }, 400);
    }
  
    try {
      // Check if the teacher exists
      const teacherExists = await db
        .select()
        .from(teachers)
        .where(eq(teachers.id, teacherId))
        .limit(1);
  
      if (teacherExists.length === 0) {
        return c.json({ message: "Teacher not found." }, 404);
      }
  
      // Check if all the provided subject IDs are valid
      const validSubjectIds = await db
        .select()
        .from(subjects)
        .where(inArray(subjects.id, subjectIds));
  
      // If the count of valid subject IDs doesn't match the provided subject IDs, return an error
      if (validSubjectIds.length !== subjectIds.length) {
        return c.json({ message: "One or more subjects not found." }, 404);
      }
  
      // Perform a batch update to assign the teacher to the subjects
      await db
        .update(subjects)
        .set({ teacherId }) // Assuming the `teacherId` column exists in the `subjects` table
        .where(inArray(subjects.id, subjectIds));
  
      return c.json({ message: "Teacher assigned to subjects successfully." });
    } catch (error) {
      console.error(error);
      return c.json({ message: "Internal Server Error" }, 500);
    }
};

export const getStudents = async (ctx:Context) => {
    try {
      // Validate and parse query parameters
      const querySchema = z.object({
        page: z.string().regex(/^\d+$/).transform(Number).default('1'),
        limit: z.string().regex(/^\d+$/).transform(Number).default('50'),
      });
  
      const query = querySchema.safeParse(ctx.req.query());
  
      if (!query.success) {
        return ctx.json({ error: "Invalid query parameters", details: query.error.errors }, 400);
      }
  
      const { page, limit } = query.data;
  
      // Pagination logic
      const offset = (page - 1) * limit;
  
      // Fetch students from database with pagination
      const studentsResult = await db
        .select()
        .from(students)
        .limit(limit)
        .offset(offset);
  
      // Count total records
      const totalRecordsResult = await db.execute(sql`SELECT COUNT(*) AS count FROM ${students}`);
      const total = totalRecordsResult.rows[0].count;
  
      // Send paginated response
      return ctx.json({
        students: studentsResult,
        meta: {
          page,
          limit,
          total: Number(total),
          totalPages: Math.ceil(Number(total) / limit),
        },
      });
    } catch (error) {
      console.error("Error in getStudents:", error);
      return ctx.json({ error: "Internal Server Error" }, 500);
    }
};


export const createStudent = async (c: Context) => {
    try {
      const { name, roll_number, class_id, dob, parent_contact } = await c.req.json();
  
      if (!name || !roll_number ) {
        return c.json({ error: "Missing required fields" }, 400);
      }
  
      // Insert new student into the database
      const newStudent = await db
        .insert(students)
        .values({
          name,
          rollNumber: roll_number, // Matches schema
          classId: class_id, // Required field
          dob: dob ? dob : null, // Ensure `dob` is in ISO string format or null
          parentContact: parent_contact ?? null, // Optional field
        })
        .returning();
  
      return c.json({ message: "Student created successfully", student: newStudent });
    } catch (error) {
      console.error("Error creating student:", error);
      return c.json({ error: "Internal Server Error" }, 500);
    }
};

export const updateSectionStu = async (c:Context) => {
    
}
  