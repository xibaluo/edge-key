import { getSiteSetting } from "../../../modules/site/service";

export type Data = ReturnType<typeof data>;

export async function data(pageContext: { prisma: import("../../../generated/prisma/client").PrismaClient }) {
  return {
    site: await getSiteSetting(pageContext.prisma),
  };
}
