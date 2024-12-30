-- SQL dump generated using DBML (dbml.dbdiagram.io)
-- Database: PostgreSQL
-- Generated at: 2024-12-30T18:19:16.742Z

CREATE TABLE "user" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "email" varchar NOT NULL,
  "password" varchar NOT NULL,
  "username" varchar NOT NULL,
  "useragent" jsonb,
  "authType" varchar NOT NULL,
  "isVerified" boolean NOT NULL DEFAULT false,
  "isBlocked" boolean NOT NULL DEFAULT false,
  "createdAt" timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  "updatedAt" timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "token" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "userId" uuid NOT NULL,
  "token" varchar NOT NULL,
  "tokenType" varchar NOT NULL,
  "expires" timestamp NOT NULL,
  "blackListed" boolean NOT NULL DEFAULT false,
  "createdAt" timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  "updatedAt" timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "profile" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "userId" uuid NOT NULL,
  "nickName" varchar NOT NULL,
  "thumbnailCid" varchar NOT NULL,
  "createdAt" timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  "updatedAt" timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE INDEX ON "token" ("userId");

CREATE INDEX ON "profile" ("userId");

COMMENT ON COLUMN "user"."useragent" IS 'country, region, timezone, city, ll, metro, area, os, browser, deviceType, user_last_login_date, user_ip';

COMMENT ON COLUMN "user"."authType" IS 'user role';

ALTER TABLE "token" ADD FOREIGN KEY ("userId") REFERENCES "user" ("id");

ALTER TABLE "profile" ADD FOREIGN KEY ("userId") REFERENCES "user" ("id");
