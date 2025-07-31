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
);
