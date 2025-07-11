import { Hono } from "hono";
import { PrismaClient } from "../generated/prisma/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { verify } from "hono/jwt";
import { JWT_SECRET } from "../config";
import z from "zod";

// Types
type Jwt_Payload = { id: number };

// Hono Router Setup
const historyRouter = new Hono<{
  Bindings: { DATABASE_URL: string };
  Variables: { userId: number };
}>();

// Auth Middleware
historyRouter.use("/*", async (c, next) => {
  const token = c.req.header("Authorization")?.split(" ")[1];
  try {
    const payload = (await verify(token || "", JWT_SECRET)) as Jwt_Payload;
    c.set("userId", payload.id);
    await next();
  } catch (err) {
    return c.json({ msg: "Invalid or no token" }, 401);
  }
});

// ✅ POST /api/v1/history → Save Sale
historyRouter.post("/", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const userId = c.get("userId");

  const body = await c.req.json();

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
          create: products.map((p) => ({
            productId: p.productId,
            productName: p.productName,
            sellingPrice: p.sellingPrice,
            profit: p.profit,
          })),
        },
      },
      include: { products: true },
    });

    return c.json({ message: "Sale recorded", history });
  } catch (err) {
    return c.json({ error: "Failed to create history" }, 500);
  }
});

// ✅ GET /api/v1/history → Get Sale History Grouped by Date + Monthly Revenue
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
    let monthlyRevenue = 0;
    let monthlyProfit = 0;

    for (const h of histories) {
      const dateKey = h.createdAt.toISOString().split("T")[0];
      if (!groupedByDate[dateKey]) groupedByDate[dateKey] = [];
      groupedByDate[dateKey].push(h);
      monthlyRevenue += h.total;
      h.products.forEach((p) => {
        //@ts-ignore
        monthlyProfit += p.profit;
      });
    }

    return c.json({
      groupedByDate,
      monthlyRevenue,
      monthlyProfit,
    });
  } catch (err) {
    return c.json({ error: "Failed to fetch history" }, 500);
  }
});

export default historyRouter;
