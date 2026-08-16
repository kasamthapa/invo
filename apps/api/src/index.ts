import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { assertRequiredEnv } from "./config/env.js";
import { notFoundHandler, globalErrorHandler } from "./middleware/errorHandler.js";
import authRouter from "./modules/auth/auth.router.js";
import productsRouter from "./modules/products/products.router.js";
import billsRouter from "./modules/bills/bills.router.js";
import suppliersRouter from "./modules/suppliers/suppliers.router.js";
import purchasesRouter from "./modules/purchases/purchases.router.js";
import customersRouter from "./modules/customers/customers.router.js";
import expensesRouter from "./modules/expenses/expenses.router.js";
import storesRouter from "./modules/stores/stores.router.js";
import dashboardRouter from "./modules/dashboard/dashboard.router.js";

assertRequiredEnv();

const app = express();
const PORT = process.env.PORT ?? 3001;

// In production, only allow the configured web origin(s); comma-separated.
// Left open in dev so localhost on any port can hit the API.
const allowedOrigins = process.env.CORS_ORIGIN?.split(",").map((o) => o.trim());
app.use(
  cors({
    origin: process.env.NODE_ENV === "production" ? (allowedOrigins ?? false) : true,
  }),
);
app.use(helmet());
app.use(express.json());

app.use("/auth", authRouter);
app.use("/products", productsRouter);
app.use("/bills", billsRouter);
app.use("/suppliers", suppliersRouter);
app.use("/purchases", purchasesRouter);
app.use("/customers", customersRouter);
app.use("/expenses", expensesRouter);
app.use("/store", storesRouter);
app.use("/dashboard", dashboardRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", app: "invo-api", timestamp: new Date().toISOString() });
});

app.use(notFoundHandler);
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Invo API running on port ${PORT}`);
});
