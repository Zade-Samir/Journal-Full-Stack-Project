-- V6: Add starred column to journal table to support pinning/starring important entries
ALTER TABLE journal ADD COLUMN starred BOOLEAN NOT NULL DEFAULT FALSE;
