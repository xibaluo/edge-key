import { getAdminCategories, getAdminProducts } from "../../../modules/catalog/service";

export type Data = ReturnType<typeof data>;

export async function data(pageContext: {
  prisma: import("../../../generated/prisma/client").PrismaClient;
  session?: { user?: { role?: string } };
}) {
  if (pageContext.session?.user?.role !== "admin") {
    return {
      products: [],
      categories: [],
    };
  }

  const products = await getAdminProducts(pageContext.prisma);
  return {
    products,
    total: products.length,
    categories: await getAdminCategories(pageContext.prisma),
  };
}
