import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();
if (!process.env.POSTGRES_PASSWORD) {
  console.error("POSTGRES_PASSWORD environment variable is not set.");
  process.exit(1);
}

const pool = new Pool({
  user: process.env.POSTGRES_USER || "postgres",
  host: "localhost",
  database: process.env.POSTGRES_DB || "sigma",
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});
async function getProductsByCategory(category) {
  const client = await pool.connect();

  try {
    const res = await client.query(
      `SELECT id, name, brand, retail_price FROM products WHERE category = $1`,
      [category]
    );

    console.log(`Products in category "${category}":`);
    res.rows.forEach((row) => {
      console.log(`- ${row.name} by ${row.brand} ($${row.retail_price})`);
    });
  } catch (error) {
    console.error("Query error:", error);
  } finally {
    client.release();
  }
}

getProductsByCategory("Accessories");
