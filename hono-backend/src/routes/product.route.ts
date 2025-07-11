import { Hono } from "hono";
import { PrismaClient } from "../generated/prisma/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { verify } from "hono/jwt";
import { JWT_SECRET } from "../config";
import z, { number } from "zod";
import { id } from "zod/locales";

const productRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
  };
  Variables: {
    userId: number;
  };
}>();
type Jwt_Payload = {
  id: number;
};

productRouter.use("/*", async (c, next) => {
  const headers = c.req.header("Authorization") || "";
  const token = headers.split(" ")[1];
  try {
    const resp = (await verify(token, JWT_SECRET)) as Jwt_Payload;

    if (resp) {
      c.set("userId", resp.id);
      await next();
    } else {
      return c.json({ msg: "Unauthorized: Invalid token payload" }, 401);
    }
  } catch (error) {
    return c.json({
      msg: "Invald or no token",
    });
  }
});
productRouter.get("/", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const userId = c.get("userId");
  const product = await prisma.product.findMany({
    where: {
      userId: userId,
    },
  });
  return c.json({
    products: product,
  });
});
productRouter.get("/:id", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const userId = c.get("userId");
  const idParam = c.req.param("id");
  const id = parseInt(idParam);

  if (isNaN(id)) {
    return c.json({ msg: "Invalid product ID" }, 400);
  }

  const product = await prisma.product.findFirst({
    where: {
      userId,
      id,
    },
  });

  return c.json({
    product,
  });
});
productRouter.get("/search/", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const userId = c.get("userId");
  const name = c.req.query("name");

  const product = await prisma.product.findMany({
    where: {
      name: {
        contains: name, // substring match
        mode: "insensitive", // ignore case
      },
    },
  });
  return c.json({
    product,
  });
});

const productSchema = z.object({
  name: z.string(),
  buyingprice: z.number(),
  sellingprice: z.number(),
});

productRouter.post("/", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const body = await c.req.json();
  const { success } = productSchema.safeParse(body);
  if (!success) {
    return c.json({
      msg: "enter valid inputs",
    });
  }

  const existing = await prisma.product.findFirst({
    where: {
      name: body.name,
      buyingprice: body.buyingprice,
      sellingprice: body.sellingprice,
      userId: c.get("userId"), // Optional, if product names can repeat across users
    },
  });

  if (existing) {
    return c.json({ msg: "product already exists" }, 400);
  }

  const newProduct = await prisma.product.create({
    data: {
      name: body.name,
      buyingprice: body.buyingprice,
      sellingprice: body.sellingprice,
      profit: body.sellingprice - body.buyingprice,
      userId: c.get("userId"),
    },
  });
  return c.json({
    msg: "product created successfully",
  });
});
const updateSchema = z.object({
  name: z.string().optional(),
  buyingprice: z.number().optional(),
  sellingprice: z.number().optional(),
});

productRouter.put("/:id", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const id = Number(c.req.param("id"));
  const userId = c.get("userId");
  const body = await c.req.json();

  if (isNaN(id)) {
    return c.json({ msg: "Invalid ID" }, 400);
  }

  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ msg: "Enter valid inputs" }, 400);
  }

  const existing = await prisma.product.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    return c.json({ msg: "Product not found or unauthorized" }, 403);
  }

  const update = await prisma.product.update({
    where: { id },
    data: parsed.data,
  });

  return c.json({
    msg: "Product updated successfully",
    update,
  });
});

productRouter.delete("/:id", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const userId = c.get("userId");
  const id = Number(c.req.param("id")); // get from route param

  if (isNaN(id)) {
    return c.json({ msg: "Invalid product ID" }, 400);
  }

  const existing = await prisma.product.findUnique({
    where: { id },
  });

  if (!existing || existing.userId !== userId) {
    return c.json({ msg: "Not authorized or product not found" }, 403);
  }

  await prisma.product.delete({
    where: { id },
  });

  return c.json({
    msg: "Deleted successfully",
  });
});

export default productRouter;
