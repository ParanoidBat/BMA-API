BEGIN;

CREATE TABLE IF NOT EXISTS organization (
  id INTEGER NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT UNIQUE,
  users_count INTEGER DEFAULT 0,
  is_saturday_off BOOLEAN DEFAULT FALSE,
  users INTEGER[]
  created_on DATE DEFAULT NOW()::date
);
CREATE INDEX org_id_name_idx ON organization(id, name);

CREATE TABLE IF NOT EXISTS attendance (
  unique_attendance_string TEXT UNIQUE NOT NULL,
  date DATE NOT NULL,
  finger_id INTEGER NOT NULL,
  user_name TEXT NOT NULL,
  user_id INTEGER,
  organization_id INTEGER,
  check_in DATE,
  check_out DATE
);
CREATE INDEX att_org_user_idx ON attendance(organization_id, user_id);

CREATE TABLE IF NOT EXISTS credentials (
  email TEXT,
  password TEXT NOT NULL,
  user_id INTEGER,
  phone TEXT
);
CREATE INDEX creds_email_phone_idx ON credentials(email, phone);

CREATE TYPE status AS ENUM ('Pending', 'Accepted', 'Rejected');

CREATE TABLE IF NOT EXISTS leave_request (
  id BIGINT NOT NULL,
  user_id INTEGER NOT NULL,
  organization_id INTEGER NOT NULL,
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  reason TEXT,
  leave_status status DEFAULT 'Pending',
  created_on DATE DEFAULT NOW()::date
);
CREATE INDEX leave_req_id_org_idx ON leave_request(id, organization_id);

CREATE TABLE IF NOT EXISTS otp (
  otp TEXT,
  created TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  email TEXT UNIQUE
);
CREATE INDEX otp_otp_idx ON otp(otp);

CREATE TYPE role AS ENUM ('Worker', 'Manager', 'Admin');

CREATE TABLE IF NOT EXISTS users (
  id INTEGER NOT NULL,
  name TEXT NOT NULL,
  finger_id INTEGER NOT NULL,
  organization_id INTEGER NOT NULL,
  phone TEXT,
  address TEXT,
  salary INTEGER CHECK (salary > 0) DEFAULT 0,
  advance INTEGER DEFAULT 0,
  user_role role DEFAULT 'Worker'
);
CREATE INDEX user_id_org_idx ON users(id, organization_id);

CREATE SEQUENCE users_id_seq
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

ALTER SEQUENCE users_id_seq OWNED BY users.id;
ALTER TABLE ONLY users ALTER COLUMN id SET DEFAULT nextval('users_id_seq'::regclass);

CREATE SEQUENCE orgs_id_seq
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

ALTER SEQUENCE orgs_id_seq OWNED BY organization.id;
ALTER TABLE ONLY organization ALTER COLUMN id SET DEFAULT nextval('orgs_id_seq'::regclass);

CREATE SEQUENCE leaves_id_seq
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

ALTER SEQUENCE leaves_id_seq OWNED BY leave_request.id;
ALTER TABLE ONLY leave_request ALTER COLUMN id SET DEFAULT nextval('leaves_id_seq'::regclass);

END;
