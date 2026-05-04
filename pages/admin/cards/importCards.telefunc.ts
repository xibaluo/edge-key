import { assertAdminAccess } from "../../../modules/auth/service";
import { importCards } from "../../../modules/inventory/service";

export async function onImportCards(input: { productId: number; lines: string; batchNo?: string }) {
  assertAdminAccess();
  return importCards(input);
}
