import db from "@/db/db";
import { PasskeyTable, UsersTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export const insertPasskeys = async (
  passkeys: typeof PasskeyTable.$inferInsert,
) => {
  return db.insert(PasskeyTable).values(passkeys).returning();
};

export const getPasskeys = async (userid: number, bodyId?: string) => {
  if (userid && bodyId) {
    return db.query.PasskeyTable.findFirst({
      where: and(
        eq(PasskeyTable.userId, userid),
        eq(PasskeyTable.cread_id, bodyId),
      ),
    });
  } else {
    return db.query.PasskeyTable.findMany({
      where: eq(PasskeyTable.userId, userid),
    });
  }
};

export const insertUser = async (user: typeof UsersTable.$inferInsert) => {
  return db.insert(UsersTable).values(user).returning();
};

export const getUserswithnim = async (nim: string) => {
  return db.select().from(UsersTable).where(eq(UsersTable.nim, nim));
};
