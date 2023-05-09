BEGIN;

CREATE TABLE IF NOT EXISTS coupon(
  name TEXT NOT NULL,
  percent_off INTEGER,
  active BOOLEAN DEFAULT true
);

CREATE INDEX coupon_name_active_idx ON coupon(name,active);

END;
