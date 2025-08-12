import { Hono } from "hono";
import { PrismaClient } from "../generated/prisma/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { verify } from "hono/jwt";
import { JWT_SECRET } from "../config";
import z from "zod";

// Types
type Jwt_Payload = { id: number };

const historyRouter = new Hono<{
  Bindings: { DATABASE_URL: string };
  Variables: { userId: number };
}>();

// Auth middleware
historyRouter.use("/*", async (c, next) => {
  const token = c.req.header("Authorization")?.split(" ")[1];
  try {
    const payload = (await verify(token || "", JWT_SECRET)) as Jwt_Payload;
    c.set("userId", payload.id);
    await next();
  } catch (err) {
    return c.json({ msg: "Invalid or missing token" }, 401);
  }
});

// POST: Add Sale
historyRouter.post("/", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const userId = c.get("userId");

  const schema = z.object({
    buyerNote: z.string().optional(),
    total: z.number(),
    products: z.array(
      z.object({
        productId: z.number(),
        productName: z.string(),
        sellingPrice: z.number(),
        profit: z.number(),
      })
    ),
  });

  const body = await c.req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error }, 400);
  }

  const { buyerNote, total, products } = parsed.data;

  try {
    const history = await prisma.history.create({
      data: {
        userId,
        buyerNote,
        total,
        products: {
          create: products,
        },
      },
      include: { products: true },
    });

    return c.json({ message: "Sale recorded", history });
  } catch (err) {
    return c.json({ error: "Failed to create history" }, 500);
  }
});

// GET: Sale History with Revenue Summary
historyRouter.get("/", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const userId = c.get("userId");

  try {
    const histories = await prisma.history.findMany({
      where: { userId },
      include: { products: true },
      orderBy: { createdAt: "desc" },
    });

    const groupedByDate: Record<string, typeof histories> = {};

    let thisMonthRevenue = 0;
    let thisMonthProfit = 0;
    let lastMonthRevenue = 0;
    let lastMonthProfit = 0;

    const now = new Date();
    const thisMonth = now.getMonth();
    const lastMonth = (thisMonth - 1 + 12) % 12;
    const thisYear = now.getFullYear();
    const lastMonthYear = lastMonth === 11 ? thisYear - 1 : thisYear;

    for (const h of histories) {
      const createdAt = new Date(h.createdAt);
      const key = createdAt.toISOString().split("T")[0];

      if (!groupedByDate[key]) groupedByDate[key] = [];
      groupedByDate[key].push(h);

      const month = createdAt.getMonth();
      const year = createdAt.getFullYear();

      if (month === thisMonth && year === thisYear) {
        thisMonthRevenue += h.total;
        // @ts-ignore
        h.products.forEach((p) => (thisMonthProfit += p.profit));
      } else if (month === lastMonth && year === lastMonthYear) {
        lastMonthRevenue += h.total;
        // @ts-ignore
        h.products.forEach((p) => (lastMonthProfit += p.profit));
      }
    }

    return c.json({
      groupedByDate,
      thisMonth: {
        revenue: thisMonthRevenue,
        profit: thisMonthProfit,
      },
      lastMonth: {
        revenue: lastMonthRevenue,
        profit: lastMonthProfit,
      },
    });
  } catch (err) {
    return c.json({ error: "Failed to fetch history" }, 500);
  }
});

export default historyRouter;
