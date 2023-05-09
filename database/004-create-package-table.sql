BEGIN;

CREATE TABLE IF NOT EXISTS package(
  id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  interval TEXT NOT NULL,
  interval_in_number INTEGER NOT NULL,
  price NUMERIC NOT NULL
);

CREATE INDEX pkg_id_product_idx ON package(id, product_name);

END;
