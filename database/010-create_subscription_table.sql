BEGIN;

CREATE TYPE sub_status AS ENUM ('open', 'pending', 'partial', 'paid');

CREATE TABLE IF NOT EXISTS subscription(
  id INTEGER NOT NULL,
  subscription_items INTEGER[],
  coupon TEXT,
  status sub_status DEFAULT 'open',
  org_id TEXT NOT NULL
);

CREATE INDEX id_status_org_idx ON subscription(id, status, org_id);

CREATE SEQUENCE sub_id_seq
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

ALTER SEQUENCE sub_id_seq OWNED BY subscription.id;
ALTER TABLE ONLY subscription ALTER COLUMN id SET DEFAULT nextval('sub_id_seq'::regclass);

END;
