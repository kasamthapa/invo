import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRouter from "./modules/auth/auth.router.js";
import productsRouter from "./modules/products/products.router.js";
import billsRouter from "./modules/bills/bills.router.js";
import suppliersRouter from "./modules/suppliers/suppliers.router.js";
import purchasesRouter from "./modules/purchases/purchases.router.js";
import customersRouter from "./modules/customers/customers.router.js";
import expensesRouter from "./modules/expenses/expenses.router.js";
import storesRouter from "./modules/stores/stores.router.js";

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
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

app.get("/health", (_req, res) => {
  res.json({ status: "ok", app: "invo-api", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Invo API running on port ${PORT}`);
});
