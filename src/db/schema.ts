import {
  bigint,
  boolean,
  customType,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const UsersTable = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    nim: varchar("nim", { length: 256 }).notNull(),
    name: varchar("name", { length: 256 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (users) => {
    return {
      uniqueIdx: uniqueIndex("unique_idx").on(users.nim),
    };
  },
);
const bytea = customType<{ data: Buffer; notNull: false; default: false }>({
  dataType() {
    return "bytea";
  },
});
export const PasskeyTable = pgTable(
  "passkeys",
  {
    cread_id: text("cread_id").primaryKey(),
    publicKey: bytea("publicKey").notNull(),
    userId: integer("userId")
      .notNull()
      .references(() => UsersTable.id),
    webauthnUserID: text("webauthnUserID").notNull().unique(),
    counter: bigint("counter", { mode: "bigint" }).notNull(),
    deviceType: varchar("deviceType", { length: 32 }).notNull(),
    backedUp: boolean("backedUp").notNull(),
    transports: varchar("transports", { length: 255 }).notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .defaultNow()
      .notNull(),
    last_used: timestamp("last_used", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },

  (passkeys) => {
    return {
      indexIdx: index("index_idx").on(passkeys.webauthnUserID),
    };
  },
);
