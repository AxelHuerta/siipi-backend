import { Hono } from "hono";
import { getStudent } from "./controllers/student.controller.ts";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.post("/alumno", async (c) => {
  const body = await c.req.json();
  const { cookie } = body;

  const student = await getStudent(cookie);
  return c.json(student);
});

Deno.serve(app.fetch);
