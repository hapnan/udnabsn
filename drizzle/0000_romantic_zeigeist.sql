CREATE TABLE IF NOT EXISTS "passkeys" (
	"cread_id" text PRIMARY KEY NOT NULL,
	"publicKey" "bytea" NOT NULL,
	"userId" integer NOT NULL,
	"webauthnUserID" text NOT NULL,
	"counter" bigint NOT NULL,
	"deviceType" varchar(32) NOT NULL,
	"backedUp" boolean NOT NULL,
	"transports" varchar(255) NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"last_used" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "passkeys_webauthnUserID_unique" UNIQUE("webauthnUserID")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"nim" varchar(256) NOT NULL,
	"name" varchar(256) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "passkeys" ADD CONSTRAINT "passkeys_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "index_idx" ON "passkeys" ("webauthnUserID");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_idx" ON "users" ("nim");