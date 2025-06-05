import { PrismaClient } from "@prisma/client";
import CONFIGURATIONS from "@/configurations/configurations";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (CONFIGURATIONS.ENVIRONMENT.NODE_ENV !== "production")
  globalThis.prismaGlobal = prisma;
