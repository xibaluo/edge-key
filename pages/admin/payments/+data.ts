import { getPaymentConfigs } from "../../../modules/payment/service";

export type Data = Awaited<ReturnType<typeof data>>;

export async function data(pageContext: {
  prisma: import("../../../generated/prisma/client").PrismaClient;
  session?: { user?: { role?: string } };
}) {
  if (pageContext.session?.user?.role !== "admin") {
    return {
      configs: {
        BEPUSDT: null,
        EPAY: null,
        ALIPAY: null,
      },
    };
  }

  return {
    configs: await getPaymentConfigs(pageContext.prisma),
  };
}
