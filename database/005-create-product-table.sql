BEGIN;

CREATE TABLE IF NOT EXISTS product(
  name TEXT NOT NULL,
  model TEXT,
  tagline TEXT,
  description TEXT,
  price NUMERIC NOT NULL
);

CREATE INDEX product_name_idx ON product(name);

END;
