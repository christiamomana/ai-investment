import "dotenv/config";
import path from "path";
import { defineConfig } from "prisma/config";

const dbPath = path.resolve(process.cwd(), "db", "arena-alfa.db");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: `file:${dbPath}`,
  },
});
