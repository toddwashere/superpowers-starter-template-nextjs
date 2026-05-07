import { PrismaClient } from "../src/generated/prisma";
import { hashPassword } from "better-auth/crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...\n");

  const passwordHash = await hashPassword("password123");

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@example.com",
      emailVerified: true,
      role: "admin",
    },
  });
  console.log("Created admin user:", adminUser.email);

  // Create credential account for admin
  await prisma.account.upsert({
    where: {
      providerId_accountId: {
        providerId: "credential",
        accountId: adminUser.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      providerId: "credential",
      accountId: adminUser.id,
      password: passwordHash,
    },
  });

  // Create regular user
  const regularUser = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      name: "Regular User",
      email: "user@example.com",
      emailVerified: true,
      role: "user",
    },
  });
  console.log("Created regular user:", regularUser.email);

  // Create credential account for regular user
  await prisma.account.upsert({
    where: {
      providerId_accountId: {
        providerId: "credential",
        accountId: regularUser.id,
      },
    },
    update: {},
    create: {
      userId: regularUser.id,
      providerId: "credential",
      accountId: regularUser.id,
      password: passwordHash,
    },
  });

  // Create organization
  const org = await prisma.organization.upsert({
    where: { slug: "acme-inc" },
    update: {},
    create: {
      name: "Acme Inc",
      slug: "acme-inc",
    },
  });
  console.log("Created organization:", org.name, `(/${org.slug})`);

  // Add admin as owner
  await prisma.member.upsert({
    where: {
      organizationId_userId: {
        organizationId: org.id,
        userId: adminUser.id,
      },
    },
    update: {},
    create: {
      organizationId: org.id,
      userId: adminUser.id,
      role: "owner",
    },
  });
  console.log("Added admin as owner of", org.name);

  // Add regular user as member
  await prisma.member.upsert({
    where: {
      organizationId_userId: {
        organizationId: org.id,
        userId: regularUser.id,
      },
    },
    update: {},
    create: {
      organizationId: org.id,
      userId: regularUser.id,
      role: "member",
    },
  });
  console.log("Added regular user as member of", org.name);

  console.log("\nSeeding complete!");
  console.log("\nCredentials:");
  console.log("  Admin: admin@example.com / password123");
  console.log("  User:  user@example.com / password123");
  console.log("  Org:   /acme-inc");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
