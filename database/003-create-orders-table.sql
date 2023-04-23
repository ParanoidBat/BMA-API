BEGIN;

CREATE TYPE order_status AS ENUM ('Pending', 'Delivered');

CREATE TABLE IF NOT EXISTS orders(
  id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  item TEXT NOT NULL,
  created DATE NOT NULL DEFAULT NOW()::DATE,
  user_id INTEGER NOT NULL,
  order_status order_status DEFAULT 'Pending'
);
CREATE INDEX orders_id_user_id_idx ON orders(id, user_id);

CREATE SEQUENCE orders_id_seq
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

ALTER SEQUENCE orders_id_seq OWNED BY orders.id;
ALTER TABLE ONLY orders ALTER COLUMN id SET DEFAULT nextval('orders_id_seq'::regclass);

END;
