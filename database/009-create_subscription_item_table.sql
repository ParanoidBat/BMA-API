BEGIN;

CREATE TYPE item_status AS ENUM ('open', 'paid', 'pending');

CREATE TABLE IF NOT EXISTS subscription_item(
  id INTEGER NOT NULL,
  product TEXT,
  quantity INTEGER DEFAULT 1,
  package TEXT,
  status item_status DEFAULT 'open',
  due_on DATE DEFAULT NOW() + INTERVAL '10 days'
);

CREATE INDEX id_package_status_idx ON subscription_item(id, package, status);

CREATE SEQUENCE sub_item_id_seq
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

ALTER SEQUENCE sub_item_id_seq OWNED BY subscription_item.id;
ALTER TABLE ONLY subscription_item ALTER COLUMN id SET DEFAULT nextval('sub_item_id_seq'::regclass);

END;
