import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/node-postgres';
import { usersTable } from './db/schema';
  
const app = new Hono();

const db = drizzle(process.env.DATABASE_URL!);

app.get('/', (c) => {
  return c.text('Hello Hono!')
});

app.get("/user", async (c) => {
  const users = await db.select().from(usersTable)
  return c.json(users)
});

app.post("/user", async (c) => { 
  const { name, age, email } = await c.req.json() as any;
  const newUser = await db.insert(usersTable).values({name, age,email}).returning()
  return c.json(newUser);
  
});

export default app
