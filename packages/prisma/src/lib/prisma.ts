import { PrismaClient } from "./generated/client.js";

import "dotenv/config";

const prisma = new PrismaClient();

export { prisma };
