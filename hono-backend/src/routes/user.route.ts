import { Hono } from "hono";
import { PrismaClient } from "../generated/prisma/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { sign } from "hono/jwt";
import { zValidator } from "@hono/zod-validator";
import { JWT_SECRET } from "../config";

const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
  };
  Variables: {
    userId: number;
  };
}>();

userRouter.get("/", (c) => {
  return c.json({ msg: "helo ji" });
});

const signupSchema = z.object({
  name: z.string(),
  email: z.email(),
  password: z.string(),
});

userRouter.post("/signup", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const body = await c.req.json();
  const { success } = signupSchema.safeParse(body);
  if (!success) {
    return c.json({
      msg: "enter valid inputs",
    });
  }
  const hash = await bcrypt.hash(body.password, 10);

  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      password: hash,
    },
  });

  const token = await sign({ id: user.id }, JWT_SECRET);
  return c.json({ msg: "Successfully signed up", token });
});

const signinSchema = z.object({
  email: z.email(),
  password: z.string(),
});

userRouter.post("/signin", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const body = await c.req.json();
  const { success } = signinSchema.safeParse(body);
  if (!success) {
    return c.json({
      msg: "enter valid inputs",
    });
  }

  const user = await prisma.user.findUnique({
    where: { email: body.email },
  });

  if (!user || !(await bcrypt.compare(body.password, user.password))) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const token = await sign({ id: user.id }, JWT_SECRET);
  return c.json({ msg: "Successfully signed in", token });
});

export default userRouter;
