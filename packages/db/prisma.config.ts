import dotenv from "dotenv";
import path from "node:path";
import { defineConfig } from "prisma/config";

// Load .env from monorepo root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
});
