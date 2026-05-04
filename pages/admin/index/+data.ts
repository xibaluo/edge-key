import { getDashboardMetrics } from "../../../modules/order/service";
import { getSiteSetting } from "../../../modules/site/service";

export type Data = ReturnType<typeof data>;

export async function data(pageContext: {
  prisma: import("../../../generated/prisma/client").PrismaClient;
  session?: { user?: { role?: string } };
}) {
  if (pageContext.session?.user?.role !== "admin") {
    return {
      metrics: [],
      site: null,
    };
  }

  return {
    metrics: await getDashboardMetrics(pageContext.prisma),
    site: await getSiteSetting(pageContext.prisma),
  };
}
