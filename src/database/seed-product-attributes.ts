import { NestFactory } from "@nestjs/core";
import { Repository } from "typeorm";
import { getRepositoryToken } from "@nestjs/typeorm";
import { AppModule } from "../app.module";
import { Product } from "../modules/products/entities/product.entity";
import {
  ProductAttribute,
  ProductAttributeGroup,
  ProductAttributeType,
} from "../modules/products/entities/product-attribute.entity";
import { ProductAttributeOption } from "../modules/products/entities/product-attribute-option.entity";
import { ProductAttributeMapping } from "../modules/products/entities/product-attribute-mapping.entity";
import { ProductContainerConfig } from "../modules/products/entities/product-container-config.entity";

// ────────────────────────────────────────────────────────────────────────────
// Seed product attributes / mappings / container configs so the Inquiry Step 2
// form has something to render. Idempotent — safe to run repeatedly.
//
// Master catalog:
//   "coconut_size"      (packing,      select)  Small / Medium / Large
//   "husk_type"         (packing,      select)  Semi Husked / Fully Husked
//   "packaging_type"    (packing,      select)  PP Bag / Carton / Bulk
//   "moisture_content"  (specifications, number)%
//   "shelf_life"        (specifications, text)   months
//   "lead_time"         (logistics,    number)   days
//
// Defaults for Coconut family.
// ────────────────────────────────────────────────────────────────────────────

interface OptionSeed {
  value: string;
  isCustomTrigger?: boolean;
  customPlaceholder?: string;
}

interface AttributeSeed {
  code: string;
  name: string;
  groupKey: ProductAttributeGroup;
  type: ProductAttributeType;
  unit?: string | null;
  placeholder?: string | null;
  defaultValue?: string | null;
  options: OptionSeed[];
  required: boolean;
}

const COCONUT_ATTRIBUTES: AttributeSeed[] = [
  {
    code: "coconut_size",
    name: "Coconut Size",
    groupKey: ProductAttributeGroup.SPECIFICATIONS,
    type: ProductAttributeType.SELECT,
    options: [
      { value: "Small (10-12 cm)" },
      { value: "Medium (12-15 cm)" },
      { value: "Large (15-18 cm)" },
      {
        value: "Custom",
        isCustomTrigger: true,
        customPlaceholder:
          "Describe your preferred size (e.g. 14 cm diameter)",
      },
    ],
    defaultValue: "Medium (12-15 cm)",
    placeholder: "Choose coconut size",
    required: true,
  },
  {
    code: "husk_type",
    name: "Husk Type",
    groupKey: ProductAttributeGroup.SPECIFICATIONS,
    type: ProductAttributeType.SELECT,
    options: [
      { value: "Semi Husked" },
      { value: "Fully Husked" },
      { value: "Fully Dehusked" },
      {
        value: "Custom",
        isCustomTrigger: true,
        customPlaceholder: "Describe husk treatment",
      },
    ],
    defaultValue: "Semi Husked",
    placeholder: "Choose husk type",
    required: true,
  },
  {
    code: "packaging_type",
    name: "Packaging",
    groupKey: ProductAttributeGroup.PACKING,
    type: ProductAttributeType.SELECT,
    options: [
      { value: "PP Bag (25kg)" },
      { value: "PP Bag (50kg)" },
      { value: "Carton Box (10kg)" },
      { value: "Bulk Bag (1MT)" },
      {
        value: "Custom",
        isCustomTrigger: true,
        customPlaceholder: "Describe packaging (material, weight, label)",
      },
    ],
    defaultValue: "PP Bag (50kg)",
    placeholder: "Choose packaging",
    required: true,
  },
  {
    code: "moisture_content",
    name: "Moisture Content",
    groupKey: ProductAttributeGroup.SPECIFICATIONS,
    type: ProductAttributeType.NUMBER,
    unit: "%",
    defaultValue: "10",
    placeholder: "e.g. 10",
    required: false,
    options: [],
  },
  {
    code: "shelf_life",
    name: "Shelf Life",
    groupKey: ProductAttributeGroup.SPECIFICATIONS,
    type: ProductAttributeType.SELECT,
    options: [
      { value: "3 months" },
      { value: "6 months" },
      { value: "9 months" },
      { value: "12 months" },
      {
        value: "Custom",
        isCustomTrigger: true,
        customPlaceholder: "e.g. 18 months",
      },
    ],
    defaultValue: "6 months",
    placeholder: "Choose shelf life",
    required: false,
  },
  {
    code: "loading_port",
    name: "Loading Port",
    groupKey: ProductAttributeGroup.LOGISTICS,
    type: ProductAttributeType.SELECT,
    options: [
      { value: "Ho Chi Minh Port" },
      { value: "Cat Lai Port" },
      { value: "Cai Mep Port" },
      {
        value: "Custom",
        isCustomTrigger: true,
        customPlaceholder: "Specify loading port",
      },
    ],
    defaultValue: "Cat Lai Port",
    placeholder: "Choose loading port",
    required: true,
  },
];

const FROZEN_ATTRIBUTES: AttributeSeed[] = [
  {
    code: "fat_content",
    name: "Fat Content",
    groupKey: ProductAttributeGroup.SPECIFICATIONS,
    type: ProductAttributeType.SELECT,
    options: [
      { value: "12%" },
      { value: "17%" },
      { value: "22%" },
      {
        value: "Custom",
        isCustomTrigger: true,
        customPlaceholder: "Specify desired fat content (%)",
      },
    ],
    defaultValue: "17%",
    placeholder: "Choose fat content",
    required: true,
  },
  {
    code: "brix_level",
    name: "Brix Level",
    groupKey: ProductAttributeGroup.SPECIFICATIONS,
    type: ProductAttributeType.SELECT,
    options: [
      { value: "Standard (4-6°Brix)" },
      { value: "Concentrated (60-65°Brix)" },
      {
        value: "Custom",
        isCustomTrigger: true,
        customPlaceholder: "Specify target Brix range",
      },
    ],
    defaultValue: "Standard (4-6°Brix)",
    placeholder: "Choose Brix level",
    required: true,
  },
  {
    code: "frozen_packaging_type",
    name: "Packaging Type",
    groupKey: ProductAttributeGroup.PACKING,
    type: ProductAttributeType.SELECT,
    options: [
      { value: "Drum (200L)" },
      { value: "IBC Tank (1000L)" },
      {
        value: "Custom",
        isCustomTrigger: true,
        customPlaceholder:
          "Describe container (volume, food-grade, lining, etc.)",
      },
    ],
    defaultValue: "Drum (200L)",
    placeholder: "Choose container",
    required: true,
  },
];

const FROZEN_CONTAINER_CONFIGS = [
  {
    containerCode: "20FT",
    containerName: "20ft Reefer Container",
    capacityMt: "18.00",
    isDefault: false,
    notes: "Reefer required for frozen products",
  },
  {
    containerCode: "40HQ",
    containerName: "40' High Cube Reefer Container",
    capacityMt: "26.50",
    isDefault: true,
    notes: "Standard reefer for frozen coconut milk/water",
  },
];

const COCONUT_CONTAINER_CONFIGS = [
  {
    containerCode: "20FT",
    containerName: "20ft Dry Container",
    capacityMt: "12.00",
    isDefault: false,
    notes: null as string | null,
  },
  {
    containerCode: "40HQ",
    containerName: "40' High Cube Dry Container",
    capacityMt: "28.50",
    isDefault: true,
    notes: "Default coconut export container",
  },
];

type AttributeSet = "coconut" | "frozen" | "none";

function detectAttributeSet(product: Product): AttributeSet {
  const slug = (product.slug ?? "").toLowerCase();
  const name = (product.name ?? "").toLowerCase();
  if (
    slug.includes("coconut-milk") ||
    slug.includes("coconut-water") ||
    slug.includes("frozen-milk") ||
    slug.includes("frozen-water") ||
    name.includes("frozen")
  ) {
    return "frozen";
  }
  if (
    slug.includes("coconut") ||
    slug.includes("dried") ||
    slug.includes("husked")
  ) {
    return "coconut";
  }
  return "none";
}

function getContainerConfigs(set: AttributeSet) {
  if (set === "frozen") return FROZEN_CONTAINER_CONFIGS;
  return COCONUT_CONTAINER_CONFIGS;
}

function getAttributesForSet(set: AttributeSet): AttributeSeed[] {
  if (set === "frozen") return FROZEN_ATTRIBUTES;
  return COCONUT_ATTRIBUTES;
}

async function seedAttributes() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const attributeRepo = app.get<Repository<ProductAttribute>>(
    getRepositoryToken(ProductAttribute),
  );
  const optionRepo = app.get<Repository<ProductAttributeOption>>(
    getRepositoryToken(ProductAttributeOption),
  );
  const mappingRepo = app.get<Repository<ProductAttributeMapping>>(
    getRepositoryToken(ProductAttributeMapping),
  );
  const productRepo = app.get<Repository<Product>>(
    getRepositoryToken(Product),
  );
  const containerRepo = app.get<Repository<ProductContainerConfig>>(
    getRepositoryToken(ProductContainerConfig),
  );

  console.log("\n⏳ Seeding product attributes …");

  let attributeInserted = 0;
  let optionInserted = 0;

  // 1) Upsert master attributes + their options (across all sets)
  const allSeeds: AttributeSeed[] = [
    ...COCONUT_ATTRIBUTES,
    ...FROZEN_ATTRIBUTES,
  ];
  for (const seed of allSeeds) {
    let attribute = await attributeRepo.findOne({ where: { code: seed.code } });
    if (!attribute) {
      attribute = attributeRepo.create({
        code: seed.code,
        name: seed.name,
        groupKey: seed.groupKey,
        type: seed.type,
        unit: seed.unit ?? null,
        placeholder: seed.placeholder ?? null,
        defaultValue: seed.defaultValue ?? null,
        isActive: true,
      });
      attribute = await attributeRepo.save(attribute);
      attributeInserted++;
      console.log(`  + attribute: ${seed.code} (id=${attribute.id})`);
    }

    if (seed.type === ProductAttributeType.SELECT && seed.options.length) {
      const existingOptions = await optionRepo.find({
        where: { attributeId: attribute.id },
        order: { sortOrder: "ASC" },
      });

      const existingValues = new Set(
        existingOptions.map((o) => o.value.toLowerCase()),
      );
      const missing = seed.options.filter(
        (o) => !existingValues.has(o.value.toLowerCase()),
      );

      if (missing.length) {
        const startOrder = existingOptions.length;
        const newOptions = missing.map((opt, idx) =>
          optionRepo.create({
            attributeId: attribute.id,
            value: opt.value,
            sortOrder: startOrder + idx,
            isActive: true,
            isCustomTrigger: opt.isCustomTrigger ?? false,
            customPlaceholder: opt.customPlaceholder ?? null,
          }),
        );
        await optionRepo.save(newOptions);
        optionInserted += newOptions.length;
        console.log(
          `    + ${missing.length} options for ${seed.code}${
            missing.some((m) => m.isCustomTrigger)
              ? " (incl. Custom trigger)"
              : ""
          }`,
        );
      } else {
        // Existing options — sync isCustomTrigger + placeholder (idempotent)
        for (const opt of seed.options) {
          const existing = existingOptions.find(
            (o) => o.value.toLowerCase() === opt.value.toLowerCase(),
          );
          if (!existing) continue;
          const nextTrigger = opt.isCustomTrigger ?? false;
          const nextPlaceholder = opt.customPlaceholder ?? null;
          if (
            existing.isCustomTrigger !== nextTrigger ||
            existing.customPlaceholder !== nextPlaceholder
          ) {
            existing.isCustomTrigger = nextTrigger;
            existing.customPlaceholder = nextPlaceholder;
            await optionRepo.save(existing);
            console.log(`    ~ updated trigger flag on "${opt.value}"`);
          }
        }
      }
    }
  }

  // 2) For every existing Product, create mappings if none exist
  const products = await productRepo.find({
    relations: { productCategory: true },
  });
  console.log(`\n⏳ Found ${products.length} products — ensuring mappings …`);

  let mappingsInserted = 0;
  let containerInserted = 0;

  for (const product of products) {
    const set = detectAttributeSet(product);
    if (set === "none") {
      console.log(`  ↩ skipped: ${product.slug} (no matching attribute set)`);
      continue;
    }

    const seedList = getAttributesForSet(set);
    const containerList = getContainerConfigs(set);

    // Upsert mappings — but skip if mapping exists AND already references an
    // attribute in our seed list. Don't touch pre-existing mappings for
    // attributes that are no longer in the set (preserve staff overrides).
    for (let i = 0; i < seedList.length; i++) {
      const seed = seedList[i];
      const attribute = await attributeRepo.findOne({
        where: { code: seed.code },
        relations: { options: true },
      });
      if (!attribute) continue;

      const exists = await mappingRepo.findOne({
        where: { productId: product.id, attributeId: attribute.id },
      });
      if (exists) continue;

      let defaultOptionId: number | null = null;
      if (
        attribute.type === ProductAttributeType.SELECT &&
        attribute.options.length
      ) {
        const defaultValue = attribute.defaultValue?.toLowerCase();
        const match = attribute.options.find(
          (o) => o.value.toLowerCase() === defaultValue,
        );
        defaultOptionId = match?.id ?? attribute.options[0].id;
      }

      const mapping = mappingRepo.create({
        productId: product.id,
        attributeId: attribute.id,
        defaultOptionId,
        required: seed.required,
        sortOrder: i,
        metadata: null,
      });
      await mappingRepo.save(mapping);
      mappingsInserted++;
    }

    // 3) Container configs (idempotent)
    for (const cfg of containerList) {
      const exists = await containerRepo.findOne({
        where: { productId: product.id, containerCode: cfg.containerCode },
      });
      if (exists) continue;
      await containerRepo.save(
        containerRepo.create({ productId: product.id, ...cfg }),
      );
      containerInserted++;
    }

    console.log(`  ✓ mapped ${product.slug} [${set}]`);
  }

  // Backfill isInquiryField for any pre-existing attribute rows. TypeORM
  // synchronize should have already added the column with default true, but
  // make this idempotent and explicit for any rows that may have NULL.
  await attributeRepo
    .createQueryBuilder()
    .update()
    .set({ isInquiryField: true })
    .where('"isInquiryField" IS NULL')
    .execute();

  console.log("\n────────────────────────── DONE ──────────────────────────");
  console.log(`  attributes created : ${attributeInserted}`);
  console.log(`  options created    : ${optionInserted}`);
  console.log(`  mappings created   : ${mappingsInserted}`);
  console.log(`  containers created : ${containerInserted}`);
  console.log("─────────────────────────────────────────────────────────\n");

  await app.close();
}

seedAttributes().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
