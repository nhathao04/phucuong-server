/**
 * Migration: Remove redundant product columns that are now covered by attribute_values.
 * Run: npx ts-node --transpile-only scripts/migrations/migrate-product-columns.ts
 */
import "reflect-metadata";
import { DataSource } from "typeorm";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

(async () => {
  const dbName = process.env.DB_NAME || "phucuongDB";

  const ds = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: dbName,
    entities: [],
    synchronize: false,
    logging: true,
  });

  await ds.initialize();
  const q = ds.createQueryRunner();
  await q.connect();

  try {
    // ── Step 1: Add sortOrder to product_attributes if missing ───────────────
    console.log("\n=== Step 1: Add sortOrder to product_attributes ===");
    const paCols = await q.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'product_attributes' AND table_schema = 'public'
    `);
    const paExisting = new Set(paCols.map((r: any) => r.column_name));
    if (!paExisting.has("sortOrder")) {
      await q.query(`ALTER TABLE product_attributes ADD COLUMN "sortOrder" INTEGER DEFAULT 0`);
      console.log(`  [ADDED] "sortOrder" to product_attributes`);
    } else {
      console.log(`  [EXISTS] "sortOrder" in product_attributes`);
    }

    // ── Step 2: Ensure master attributes exist ───────────────────────────────
    console.log("\n=== Step 2: Ensure master attributes ===");
    const MASTERS = [
      { code: "origin",              name: "Origin",              groupKey: "specifications", type: "text",    unit: null, defaultValue: null, placeholder: "e.g. Ben Tre, Vietnam",      footnote: null,                                               sectionLabel: "Product Overview",  sortOrder: 2 },
      { code: "shelf_life",          name: "Shelf life",          groupKey: "specifications", type: "text",    unit: null, defaultValue: null, placeholder: "e.g. 12 months",           footnote: "Shelf life depends on proper storage and handling conditions after delivery.", sectionLabel: "Specifications", sortOrder: 7 },
      { code: "storage_conditions",  name: "Storage conditions", groupKey: "specifications", type: "text",    unit: null, defaultValue: null, placeholder: "e.g. −18°C or below",    footnote: null,                                               sectionLabel: "Specifications",    sortOrder: 5 },
      { code: "hs_code",             name: "HS Code",             groupKey: "documents",      type: "text",    unit: null, defaultValue: null, placeholder: "e.g. 0801.32",          footnote: null,                                               sectionLabel: null,               sortOrder: 1 },
      { code: "export_port",          name: "Export port",         groupKey: "logistics",      type: "text",    unit: null, defaultValue: null, placeholder: "e.g. Cat Lai Port",    footnote: null,                                               sectionLabel: null,               sortOrder: 1 },
      { code: "sample_available",    name: "Sample available",   groupKey: "documents",      type: "boolean", unit: null, defaultValue: null, placeholder: null,                footnote: null,                                               sectionLabel: null,               sortOrder: 2 },
      { code: "lab_report",          name: "Lab report available", groupKey: "documents",    type: "boolean", unit: null, defaultValue: null, placeholder: null,                footnote: null,                                               sectionLabel: null,               sortOrder: 3 },
    ];

    for (const attr of MASTERS) {
      const existing = await q.query(`SELECT id FROM product_attributes WHERE code = $1`, [attr.code]);
      if (existing.length === 0) {
        await q.query(
          `INSERT INTO product_attributes (code,name,"groupKey",type,unit,"defaultValue",placeholder,footnote,"sectionLabel","sortOrder","isActive")
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,true)`,
          [attr.code, attr.name, attr.groupKey, attr.type, attr.unit, attr.defaultValue, attr.placeholder, attr.footnote, attr.sectionLabel, attr.sortOrder],
        );
        console.log(`  [CREATED] ${attr.code}`);
      } else {
        await q.query(
          `UPDATE product_attributes SET name=$2,"groupKey"=$3,type=$4,unit=$5,"defaultValue"=$6,placeholder=$7,footnote=$8,"sectionLabel"=$9,"sortOrder"=$10 WHERE code=$1`,
          [attr.code, attr.name, attr.groupKey, attr.type, attr.unit, attr.defaultValue, attr.placeholder, attr.footnote, attr.sectionLabel, attr.sortOrder],
        );
        console.log(`  [UPDATED] ${attr.code}`);
      }
    }

    // ── Step 3: Migrate data & drop columns ───────────────────────────────────
    console.log("\n=== Step 3: Migrate data and drop columns ===");
    const prodCols = await q.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'products' AND table_schema = 'public'
    `);
    const prodExisting = new Set(prodCols.map((r: any) => r.column_name));

    const colsToDrop = [
      "origin", "shelfLife", "storageCondition",
      "hsCode", "exportPort", "sampleAvailable", "labReportAvailable",
    ];

    const colsStillExist = colsToDrop.filter((c) => prodExisting.has(c));

    if (colsStillExist.length > 0) {
      const products = await q.query(
        `SELECT id, ${colsStillExist.map((c) => `"${c}"`).join(", ")} FROM products WHERE ${colsStillExist.map((c) => `"${c}" IS NOT NULL`).join(" OR ")}`,
      );
      console.log(`  Found ${products.length} products with data`);

      const attrIdRows = await q.query(
        `SELECT id, code FROM product_attributes WHERE code = ANY($1)`,
        [["origin","shelf_life","storage_conditions","hs_code","export_port","sample_available","lab_report"]],
      );
      const attrIdMap: Record<string, number> = {};
      for (const row of attrIdRows) {
        attrIdMap[row.code] = row.id;
      }
      const colToCode: Record<string, string> = {
        origin: "origin", shelfLife: "shelf_life", storageCondition: "storage_conditions",
        hsCode: "hs_code", exportPort: "export_port", sampleAvailable: "sample_available", labReportAvailable: "lab_report",
      };

      let migrated = 0;
      for (const p of products) {
        for (const col of colsStillExist) {
          const code = colToCode[col];
          if (!p[col] || !attrIdMap[code]) continue;
          const value = col === "sampleAvailable" || col === "labReportAvailable"
            ? (p[col] ? "Yes" : "No") : p[col];
          const existing = await q.query(
            `SELECT id FROM product_attribute_values WHERE "productId" = $1 AND "attributeId" = $2`,
            [p.id, attrIdMap[code]],
          );
          if (existing.length === 0) {
            await q.query(
              `INSERT INTO product_attribute_values ("productId","attributeId",value) VALUES ($1,$2,$3)`,
              [p.id, attrIdMap[code], value],
            );
          } else {
            await q.query(
              `UPDATE product_attribute_values SET value = $3 WHERE "productId" = $1 AND "attributeId" = $2`,
              [p.id, attrIdMap[code], value],
            );
          }
          migrated++;
        }
      }
      console.log(`  Migrated ${migrated} attribute values`);
    } else {
      console.log(`  All columns already migrated`);
    }

    // Drop columns
    for (const col of colsToDrop) {
      if (!prodExisting.has(col)) {
        console.log(`  [SKIP] "${col}" does not exist`);
        continue;
      }
      await q.query(`ALTER TABLE products DROP COLUMN "${col}"`);
      console.log(`  [DROPPED] "${col}"`);
    }

    console.log("\n=== DONE ===");
  } finally {
    await q.release();
    await ds.destroy();
  }
})().catch((err) => {
  console.error("ERROR", err);
  process.exit(1);
});