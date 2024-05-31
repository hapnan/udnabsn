import db from "@/db/db";
import { PasskeyTable, UsersTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export const insertPasskeys = async (
  passkeys: typeof PasskeyTable.$inferInsert,
) => {
  return await db.insert(PasskeyTable).values(passkeys).returning();
};

export const getPasskeys = async (userid: number, bodyId?: string) => {
  if (userid && bodyId) {
    return await db.query.PasskeyTable.findFirst({
      where: and(
        eq(PasskeyTable.userId, userid),
        eq(PasskeyTable.cread_id, bodyId),
      ),
    });
  } else {
    return await db.query.PasskeyTable.findMany({
      where: eq(PasskeyTable.userId, userid),
    });
  }
};

export const insertUser = async (user: typeof UsersTable.$inferInsert) => {
  return await db.insert(UsersTable).values(user).returning({
    nim: UsersTable.nim,
  });
};

export const getUserswithnim = async (nim: string) => {
  return await db.query.UsersTable.findFirst({
    where: eq(UsersTable.nim, nim),
  });
};

export const getuserall = async () => {
  return await db.select().from(UsersTable);
};
