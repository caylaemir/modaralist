import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("[cleanup] Starting database cleanup for temporary categories...");

  // 1. Find all categories we want to clean up.
  // We want to target categories whose slug:
  // - Contains "avci-kamp" (case-insensitive)
  // - Contains "motosiklet" (case-insensitive)
  // - Contains "tshirt-classic" (case-insensitive)
  // - Is exactly "kapsonlu"
  const allCategories = await db.category.findMany({
    include: {
      translations: true,
      products: true,
    },
  });

  const targets = allCategories.filter((c) => {
    const slug = c.slug.toLowerCase();
    return (
      slug.includes("avci-kamp") ||
      slug.includes("motosiklet") ||
      slug.includes("tshirt-classic") ||
      slug === "kapsonlu"
    );
  });

  console.log(`[cleanup] Found ${targets.length} temporary categories to remove.`);

  if (targets.length === 0) {
    console.log("[cleanup] Nothing to clean up.");
    return;
  }

  // 2. Move any products assigned to these categories to their parent category (or null) to prevent product loss.
  for (const cat of targets) {
    if (cat.products.length > 0) {
      console.log(`[cleanup] Category ${cat.slug} has ${cat.products.length} products. Re-assigning to parent...`);
      await db.product.updateMany({
        where: { categoryId: cat.id },
        data: { categoryId: cat.parentId },
      });
    }
  }

  // 3. To delete categories safely without foreign key violations on parent-child relations,
  // we delete them layer by layer (deepest children first).
  // We can determine depth by splitting slug or parentId chains.
  // But a simple loop: keep deleting leaf categories (categories with no children in targets) until none are left.
  const targetIds = new Set(targets.map((t) => t.id));
  
  while (targetIds.size > 0) {
    // Find categories in our target list that do not have any children *which are also in the target list*.
    const leaves = [];
    for (const id of targetIds) {
      const hasTargetChildren = await db.category.count({
        where: {
          parentId: id,
          id: { in: Array.from(targetIds) },
        },
      });
      if (hasTargetChildren === 0) {
        leaves.push(id);
      }
    }

    if (leaves.length === 0) {
      // Loop backup just in case of cycles (should not happen)
      console.log("[cleanup] Break cycle detection.");
      break;
    }

    console.log(`[cleanup] Deleting ${leaves.length} leaf categories...`);
    
    // Delete them
    await db.category.deleteMany({
      where: { id: { in: leaves } },
    });

    // Remove from our set
    leaves.forEach((id) => targetIds.delete(id));
  }

  console.log("[cleanup] Database cleanup finished successfully.");
}

main()
  .catch((e) => {
    console.error("[cleanup] HATA:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
