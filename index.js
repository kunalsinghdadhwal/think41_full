import fs from "fs";
import csv from "csv-parser";
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

async function createProductsTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY,
        cost DECIMAL(10, 2),
        category VARCHAR(255),
        name VARCHAR(500),
        brand VARCHAR(255),
        retail_price DECIMAL(10, 2),
        department VARCHAR(255),
        sku VARCHAR(255),
        distribution_center_id INTEGER
      )
    `);
    console.log("Products table created successfully!");
  } catch (error) {
    console.error("Error creating products table:", error);
  } finally {
    client.release();
  }
}

async function loadCsvToDb(filePath) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const stream = fs.createReadStream(filePath).pipe(csv());

    for await (const row of stream) {
      const {
        id,
        cost,
        category,
        name,
        brand,
        retail_price,
        department,
        sku,
        distribution_center_id,
      } = row;

      await client.query(
        `INSERT INTO products (id, cost, category, name, brand, retail_price, department, sku, distribution_center_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO UPDATE SET
           cost = EXCLUDED.cost,
           category = EXCLUDED.category,
           name = EXCLUDED.name,
           brand = EXCLUDED.brand,
           retail_price = EXCLUDED.retail_price,
           department = EXCLUDED.department,
           sku = EXCLUDED.sku,
           distribution_center_id = EXCLUDED.distribution_center_id;`,
        [
          id,
          cost,
          category,
          name,
          brand,
          retail_price,
          department,
          sku,
          distribution_center_id,
        ]
      );
    }

    await client.query("COMMIT");
    console.log("CSV data loaded successfully!");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error loading CSV data:", error);
  } finally {
    client.release();
  }
}

async function main() {
  await createProductsTable();
  await loadCsvToDb("./archive/products.csv");
  await pool.end();
}

main().catch(console.error);
