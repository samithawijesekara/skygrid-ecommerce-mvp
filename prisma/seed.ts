import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import { UserRoleEnum } from "@/enums/user-role.enum";
import { seedSubscriptionPlans } from "./seeds/subscription-plans";

const prisma = new PrismaClient();

// Load JSON seed data
const loadSeedData = (filePath: string) => {
  const fullPath = path.join(process.cwd(), filePath);
  return JSON.parse(fs.readFileSync(fullPath, "utf-8"));
};

async function main() {
  try {
    console.log("🚀 Starting database seeding...");

    /**
     * **********************************************************
     * ================ Super Admin User Seeding ===================
     * **********************************************************
     */
    const superAdmin = await prisma.user.findUnique({
      where: { email: "admin@admin.com" }, // Use the Super Admin's email
    });

    if (!superAdmin) {
      console.log("ℹ️ Super admin user not found. Creating...");

      // Hash password for Super Admin
      const hashedPassword = await bcrypt.hash("Password@123", 10); // Use a strong password here

      // Create Super Admin User
      await prisma.user.create({
        data: {
          firstName: "Super",
          lastName: "Admin",
          email: "admin@admin.com",
          hashedPassword: hashedPassword,
          roles: [UserRoleEnum.SUPER_ADMIN],
          isAccountActivate: true,
          profileImage:
            "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
        },
      });

      console.log("✅ Super Admin user created!");
    } else {
      console.log(
        "ℹ️ Super Admin user already exists. Skipping user creation."
      );
    }

    /**
     * **********************************************************
     * ================ Country Types Seeding ===================
     * **********************************************************
     */
    const countryTypes = loadSeedData("./prisma/seeds/country-types.json");
    const existingCountries = await prisma.countryType.findMany();
    if (existingCountries.length === 0) {
      await prisma.countryType.createMany({ data: countryTypes });
      console.log("✅ Country types seeded!");
    } else {
      console.log("ℹ️ Country types already exist. Skipping seed.");
    }

    /**
     * **********************************************************
     * =============== User Role Types Seeding ==================
     * **********************************************************
     */
    const userRoleTypes = loadSeedData("./prisma/seeds/user-role-types.json");
    const existingUserRoleTypes = await prisma.userRoleType.findMany();
    if (existingUserRoleTypes.length === 0) {
      await prisma.userRoleType.createMany({ data: userRoleTypes });
      console.log("✅ User role types seeded!");
    } else {
      console.log("ℹ️ User role types already exist. Skipping seed.");
    }

    /**
     * **********************************************************
     * ================ Contact Form Category Types Seeding ===================
     * **********************************************************
     */
    const contactFormCategoryTypes = loadSeedData(
      "./prisma/seeds/contact-form-category-types.json"
    );
    const existingContactFormCategoryTypes =
      await prisma.contactFormCategoryType.findMany();
    if (existingContactFormCategoryTypes.length === 0) {
      await prisma.contactFormCategoryType.createMany({
        data: contactFormCategoryTypes,
      });
      console.log("✅ Contact form category types seeded!");
    } else {
      console.log(
        "ℹ️ Contact form category types already exist. Skipping seed."
      );
    }

    // Seed subscription plans
    await seedSubscriptionPlans();

    console.log("🎉 Database seeding completed!");
  } catch (error) {
    console.error("❌ Seeding error:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
