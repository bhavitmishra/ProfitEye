import { Hono } from "hono";
import { cors } from "hono/cors";
import userRouter from "./routes/user.route";
import productRouter from "./routes/product.route";
import historyRouter from "./routes/history.route";

const app = new Hono();
app.use(cors());

app.route("/api/v1/user/", userRouter);
app.route("/api/v1/product/", productRouter);
app.route("/api/v1/history/", historyRouter);

export default app;
