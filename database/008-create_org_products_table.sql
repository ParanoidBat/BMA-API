BEGIN;

CREATE TABLE IF NOT EXISTS org_products(
  org_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_mac TEXT NOT NULL,
  activated_on TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE INDEX org_product_idx ON org_products(org_id, product_name);

END;
