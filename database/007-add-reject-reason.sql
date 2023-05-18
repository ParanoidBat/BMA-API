BEGIN;

ALTER TABLE leave_request ADD COLUMN reject_reason TEXT;

END;
