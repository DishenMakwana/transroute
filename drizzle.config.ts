import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  schemaFilter: ["transport"],
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://postgres:root1234@127.0.0.1:5432/postgres?schema=transport",
  },
});
