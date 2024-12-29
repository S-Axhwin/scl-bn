import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/node-postgres';
import { students } from './db/schema';


import adminRoute from './routes/admin';

const app = new Hono();


const db = drizzle(process.env.DATABASE_URL!);

app.route("/api/admin", adminRoute);





app.get('/', (c) => {
  return c.text('Hello Hono!')
});


app.get("/user", async (c) => {
  const users = await db.select().from(students)
  return c.json(users)
});

app.post("/user", async (c) => { 
  const { name, rollNumber, classId, dob, parentContact } = await c.req.json() as any;

  // name: varchar("name", { length: 255 }).notNull(),
  // rollNumber: varchar("roll_number", { length: 50 }).notNull().unique(),
  // classId: uuid("class_id").references(() => classes.id),
  // dob: date("dob"),
  // parentContact: varchar("parent_contact", { length: 15 }),

  const newUser = await db.insert(students).values({name, rollNumber, classId, dob, parentContact}).returning()
  return c.json(newUser);
});

export default app
