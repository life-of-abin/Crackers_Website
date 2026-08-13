import { createClient } from "@libsql/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "./app/generated/prisma/client";

const adapter = new PrismaLibSql({
  url: "file:dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany({ take: 5 });
  console.log("SUCCESS! Found users:", users);
}

main()
  .catch((err) => {
    console.error("FAILED to connect using libsql:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
