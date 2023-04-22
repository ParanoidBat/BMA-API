BEGIN;

CREATE TABLE IF NOT EXISTS shipment(
  user_id INTEGER NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  email TEXT
);
CREATE INDEX shipment_user_id_idx ON shipment(user_id);

END;
