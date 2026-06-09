import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(helmet());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", app: "invo-api", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Invo API running on port ${PORT}`);
});
