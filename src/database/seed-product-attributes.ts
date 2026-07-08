import { NestFactory } from "@nestjs/core";
import { Repository } from "typeorm";
import { getRepositoryToken } from "@nestjs/typeorm";
import { AppModule } from "../app.module";
import { Product } from "../modules/products/entities/product.entity";
import { ProductAttributeValue } from "../modules/products/entities/product-attribute-value.entity";
import {
  ProductAttribute,
  ProductAttributeGroup,
  ProductAttributeType,
} from "../modules/products/entities/product-attribute.entity";
import { ProductAttributeOption } from "../modules/products/entities/product-attribute-option.entity";
import { ProductAttributeMapping } from "../modules/products/entities/product-attribute-mapping.entity";
import { ProductContainerConfig } from "../modules/products/entities/product-container-config.entity";

// ─────────────────────────────────────────────────────────────────────────────
// Seed strategy — TWO separate concerns per product:
//   1. SPEC_DISPLAY  (isInquiryField=false)  → product_attribute_values
//      Static display specs for the landing page (origin, shelf life, etc.)
//   2. INQUIRY_FIELDS (isInquiryField=true)  → product_attribute_mappings
//      Dynamic form fields buyers fill when requesting a quote
//
// Seed rules per mapping:
//   • SPEC_DISPLAY attributes are ALWAYS mapped (isInquiryField=false).
//   • INQUIRY_FIELDS attributes are mapped with isInquiryField=true.
//   • Attributes are created once as masters; mappings are upserted per product.
//   • Seed script is idempotent — re-running is safe.
// ─────────────────────────────────────────────────────────────────────────────

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

// ── Inquiry field seeds ──────────────────────────────────────────────────────
// These become product_attribute_mappings with isInquiryField=true.

const WHOLE_DRIED_INQUIRY: AttributeSeed[] = [
  {
    code: "quantity",
    name: "Quantity",
    groupKey: ProductAttributeGroup.OTHER,
    type: ProductAttributeType.NUMBER,
    unit: "MT",
    placeholder: "Enter quantity in MT",
    required: true,
    options: [],
  },
  {
    code: "coconut_size",
    name: "Coconut Size",
    groupKey: ProductAttributeGroup.PACKING,
    type: ProductAttributeType.SELECT,
    options: [
      { value: "Small (10–12 cm)" },
      { value: "Medium (12–15 cm)" },
      { value: "Large (15–18 cm)" },
      {
        value: "Custom",
        isCustomTrigger: true,
        customPlaceholder: "Describe preferred size (e.g. 14 cm diameter)",
      },
    ],
    defaultValue: "Medium (12–15 cm)",
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
    ],
    defaultValue: "Semi Husked",
    placeholder: "Choose husk type",
    required: true,
  },
  {
    code: "packaging",
    name: "Packaging",
    groupKey: ProductAttributeGroup.PACKING,
    type: ProductAttributeType.SELECT,
    options: [
      { value: "PP Bag" },
      { value: "Bulk Loading" },
      {
        value: "Custom",
        isCustomTrigger: true,
        customPlaceholder: "Describe packaging (material, weight, label)",
      },
    ],
    defaultValue: "PP Bag",
    placeholder: "Choose packaging",
    required: false,
  },
  {
    code: "sample_required",
    name: "Sample Required",
    groupKey: ProductAttributeGroup.OTHER,
    type: ProductAttributeType.SELECT,
    options: [
      { value: "Yes" },
      { value: "No" },
    ],
    defaultValue: "No",
    placeholder: "Sample required?",
    required: false,
  },
];

const FROZEN_WATER_INQUIRY: AttributeSeed[] = [
  {
    code: "quantity",
    name: "Quantity",
    groupKey: ProductAttributeGroup.OTHER,
    type: ProductAttributeType.NUMBER,
    unit: "MT",
    placeholder: "Enter quantity in MT",
    required: true,
    options: [],
  },
  {
    code: "packaging_type",
    name: "Packaging Type",
    groupKey: ProductAttributeGroup.PACKING,
    type: ProductAttributeType.SELECT,
    options: [
      { value: "Drum" },
      { value: "IBC Tank" },
      {
        value: "Custom",
        isCustomTrigger: true,
        customPlaceholder: "Describe container (volume, food-grade, lining, etc.)",
      },
    ],
    defaultValue: "Drum",
    placeholder: "Choose container type",
    required: true,
  },
  {
    code: "brix_level",
    name: "Brix Level",
    groupKey: ProductAttributeGroup.SPECIFICATIONS,
    type: ProductAttributeType.SELECT,
    options: [
      { value: "Standard (4–6°Brix)" },
      {
        value: "Custom",
        isCustomTrigger: true,
        customPlaceholder: "Specify target Brix range (e.g. 20°Brix)",
      },
    ],
    defaultValue: "Standard (4–6°Brix)",
    placeholder: "Choose Brix level",
    required: true,
  },
  {
    code: "sample_required",
    name: "Sample Required",
    groupKey: ProductAttributeGroup.OTHER,
    type: ProductAttributeType.SELECT,
    options: [
      { value: "Yes" },
      { value: "No" },
    ],
    defaultValue: "No",
    placeholder: "Sample required?",
    required: false,
  },
];

const FROZEN_MILK_INQUIRY: AttributeSeed[] = [
  {
    code: "quantity",
    name: "Quantity",
    groupKey: ProductAttributeGroup.OTHER,
    type: ProductAttributeType.NUMBER,
    unit: "MT",
    placeholder: "Enter quantity in MT",
    required: true,
    options: [],
  },
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
        customPlaceholder: "Specify desired fat content (e.g. 15%)",
      },
    ],
    defaultValue: "17%",
    placeholder: "Choose fat content",
    required: true,
  },
  {
    code: "packaging_type",
    name: "Packaging Type",
    groupKey: ProductAttributeGroup.PACKING,
    type: ProductAttributeType.SELECT,
    options: [
      { value: "Drum" },
      { value: "IBC Tank" },
      {
        value: "Custom",
        isCustomTrigger: true,
        customPlaceholder: "Describe container (volume, food-grade, lining, etc.)",
      },
    ],
    defaultValue: "Drum",
    placeholder: "Choose container type",
    required: true,
  },
  {
    code: "sample_required",
    name: "Sample Required",
    groupKey: ProductAttributeGroup.OTHER,
    type: ProductAttributeType.SELECT,
    options: [
      { value: "Yes" },
      { value: "No" },
    ],
    defaultValue: "No",
    placeholder: "Sample required?",
    required: false,
  },
];

// ── Spec display seeds ────────────────────────────────────────────────────────
// These become product_attribute_values for the landing page.
// No inquiry mappings (isInquiryField=false).

const WHOLE_DRIED_SPECS: Array<{
  code: string;
  name: string;
  groupKey: ProductAttributeGroup;
  type: ProductAttributeType;
  value: string;
  unit?: string | null;
  footnote?: string | null;
  sectionLabel?: string | null;
}> = [
  {
    code: "product_type",
    name: "Product",
    groupKey: ProductAttributeGroup.SPECIFICATIONS,
    type: ProductAttributeType.TEXT,
    value: "Whole Dried Coconut",
    sectionLabel: "Product Overview",
  },
  {
    code: "origin",
    name: "Origin",
    groupKey: ProductAttributeGroup.SPECIFICATIONS,
    type: ProductAttributeType.TEXT,
    value: "Ben Tre, Vietnam",
    sectionLabel: "Product Overview",
  },
  {
    code: "composition",
    name: "Composition",
    groupKey: ProductAttributeGroup.SPECIFICATIONS,
    type: ProductAttributeType.TEXT,
    value: "100% whole dried coconut — no additives",
    sectionLabel: "Product Overview",
  },
  {
    code: "processing",
    name: "Processing",
    groupKey: ProductAttributeGroup.SPECIFICATIONS,
    type: ProductAttributeType.TEXT,
    value: "Sun-dried / kiln-dried to moisture ≤ 6%",
    sectionLabel: "Specifications",
  },
  {
    code: "shell",
    name: "Shell Condition",
    groupKey: ProductAttributeGroup.SPECIFICATIONS,
    type: ProductAttributeType.TEXT,
    value: "Natural brown, fibrous, dry surface",
    sectionLabel: "Specifications",
  },
  {
    code: "kernel",
    name: "Kernel Quality",
    groupKey: ProductAttributeGroup.SPECIFICATIONS,
    type: ProductAttributeType.TEXT,
    value: "Thick, firm, off-white",
    sectionLabel: "Specifications",
  },
  {
    code: "size",
    name: "Size Range",
    groupKey: ProductAttributeGroup.SPECIFICATIONS,
    type: ProductAttributeType.TEXT,
    value: "600–1000g per nut",
    sectionLabel: "Specifications",
  },
  {
    code: "shelf_life",
    name: "Shelf Life",
    groupKey: ProductAttributeGroup.SPECIFICATIONS,
    type: ProductAttributeType.TEXT,
    value: "Up to 12 months",
    footnote: "Shelf life depends on proper storage and handling conditions after delivery.",
    sectionLabel: "Specifications",
  },
  {
    code: "harvest_season",
    name: "Harvest Season",
    groupKey: ProductAttributeGroup.SPECIFICATIONS,
    type: ProductAttributeType.TEXT,
    value: "Year-round",
    sectionLabel: "Specifications",
  },
  {
    code: "packaging_spec",
    name: "Packaging",
    groupKey: ProductAttributeGroup.PACKING,
    type: ProductAttributeType.TEXT,
    value: "PP mesh bags, ~30kg per bag",
    sectionLabel: "Packing",
  },
  {
    code: "container_load",
    name: "Container Load",
    groupKey: ProductAttributeGroup.PACKING,
    type: ProductAttributeType.TEXT,
    value: "~28 tonnes per 40ft container",
    sectionLabel: "Packing",
  },
  {
    code: "container_type",
    name: "Container Type",
    groupKey: ProductAttributeGroup.PACKING,
    type: ProductAttributeType.TEXT,
    value: "Standard dry container",
    sectionLabel: "Packing",
  },
  {
    code: "moq",
    name: "MOQ",
    groupKey: ProductAttributeGroup.PACKING,
    type: ProductAttributeType.TEXT,
    value: "1 × 40ft container",
    sectionLabel: "Packing",
  },
];

const FROZEN_WATER_SPECS: Array<{
  code: string;
  name: string;
  groupKey: ProductAttributeGroup;
  type: ProductAttributeType;
  value: string;
  unit?: string | null;
  footnote?: string | null;
  sectionLabel?: string | null;
}> = [
  {
    code: "product_type",
    name: "Product",
    groupKey: ProductAttributeGroup.SPECIFICATIONS,
    type: ProductAttributeType.TEXT,
    value: "Frozen Coconut Water",
    sectionLabel: "Product Overview",
  },
  {
    code: "origin",
    name: "Origin",
    groupKey: ProductAttributeGroup.SPECIFICATIONS,
    type: ProductAttributeType.TEXT,
    value: "Ben Tre, Vietnam",
    sectionLabel: "Product Overview",
  },
  {
    code: "composition",
    name: "Composition",
    groupKey: ProductAttributeGroup.SPECIFICATIONS,
    type: ProductAttributeType.TEXT,
    value: "100% pure coconut water — no added water, sugar, or preservatives",
    sectionLabel: "Product Overview",
  },
  {
    code: "processing",
    name: "Processing",
    groupKey: ProductAttributeGroup.SPECIFICATIONS,
    type: ProductAttributeType.TEXT,
    value: "Fresh-frozen (raw frozen)",
    sectionLabel: "Specifications",
  },
  {
    code: "storage_conditions",
    name: "Storage Conditions",
    groupKey: ProductAttributeGroup.SPECIFICATIONS,
    type: ProductAttributeType.TEXT,
    value: "−18°C or below",
    sectionLabel: "Specifications",
  },
  {
    code: "shelf_life",
    name: "Shelf Life",
    groupKey: ProductAttributeGroup.SPECIFICATIONS,
    type: ProductAttributeType.TEXT,
    value: "24 months",
    footnote: "Shelf life of 24 months applies when the product is kept stored at −18°C or below.",
    sectionLabel: "Specifications",
  },
  {
    code: "harvest_season",
    name: "Harvest Season",
    groupKey: ProductAttributeGroup.SPECIFICATIONS,
    type: ProductAttributeType.TEXT,
    value: "Year-round",
    sectionLabel: "Specifications",
  },
  {
    code: "packaging_spec",
    name: "Packaging",
    groupKey: ProductAttributeGroup.PACKING,
    type: ProductAttributeType.TEXT,
    value: "20kg/carton",
    sectionLabel: "Packing",
  },
  {
    code: "container_load",
    name: "Container Load",
    groupKey: ProductAttributeGroup.PACKING,
    type: ProductAttributeType.TEXT,
    value: "~27 tonnes per 40ft container",
    sectionLabel: "Packing",
  },
  {
    code: "container_type",
    name: "Container Type",
    groupKey: ProductAttributeGroup.PACKING,
    type: ProductAttributeType.TEXT,
    value: "40ft refrigerated (reefer)",
    sectionLabel: "Packing",
  },
  {
    code: "moq",
    name: "MOQ",
    groupKey: ProductAttributeGroup.PACKING,
    type: ProductAttributeType.TEXT,
    value: "1 × 40ft container",
    sectionLabel: "Packing",
  },
];

const FROZEN_MILK_SPECS: Array<{
  code: string;
  name: string;
  groupKey: ProductAttributeGroup;
  type: ProductAttributeType;
  value: string;
  unit?: string | null;
  footnote?: string | null;
  sectionLabel?: string | null;
}> = [
  {
    code: "product_type",
    name: "Product",
    groupKey: ProductAttributeGroup.SPECIFICATIONS,
    type: ProductAttributeType.TEXT,
    value: "Frozen Coconut Milk",
    sectionLabel: "Product Overview",
  },
  {
    code: "origin",
    name: "Origin",
    groupKey: ProductAttributeGroup.SPECIFICATIONS,
    type: ProductAttributeType.TEXT,
    value: "Ben Tre, Vietnam",
    sectionLabel: "Product Overview",
  },
  {
    code: "composition",
    name: "Composition",
    groupKey: ProductAttributeGroup.SPECIFICATIONS,
    type: ProductAttributeType.TEXT,
    value: "100% pure coconut milk — no additives",
    sectionLabel: "Product Overview",
  },
  {
    code: "processing",
    name: "Processing",
    groupKey: ProductAttributeGroup.SPECIFICATIONS,
    type: ProductAttributeType.TEXT,
    value: "Cold-pressed, UHT treated, frozen",
    sectionLabel: "Specifications",
  },
  {
    code: "storage_conditions",
    name: "Storage Conditions",
    groupKey: ProductAttributeGroup.SPECIFICATIONS,
    type: ProductAttributeType.TEXT,
    value: "−18°C or below",
    sectionLabel: "Specifications",
  },
  {
    code: "fat_content_display",
    name: "Fat Content",
    groupKey: ProductAttributeGroup.SPECIFICATIONS,
    type: ProductAttributeType.TEXT,
    value: "12% / 17% / 22% (selectable per order)",
    sectionLabel: "Specifications",
  },
  {
    code: "shelf_life",
    name: "Shelf Life",
    groupKey: ProductAttributeGroup.SPECIFICATIONS,
    type: ProductAttributeType.TEXT,
    value: "18 months",
    footnote: "Shelf life applies when the product is kept stored at −18°C or below.",
    sectionLabel: "Specifications",
  },
  {
    code: "harvest_season",
    name: "Harvest Season",
    groupKey: ProductAttributeGroup.SPECIFICATIONS,
    type: ProductAttributeType.TEXT,
    value: "Year-round",
    sectionLabel: "Specifications",
  },
  {
    code: "packaging_spec",
    name: "Packaging",
    groupKey: ProductAttributeGroup.PACKING,
    type: ProductAttributeType.TEXT,
    value: "Drum (200L) / IBC Tank (1000L)",
    sectionLabel: "Packing",
  },
  {
    code: "container_load",
    name: "Container Load",
    groupKey: ProductAttributeGroup.PACKING,
    type: ProductAttributeType.TEXT,
    value: "~26 tonnes per 40ft container",
    sectionLabel: "Packing",
  },
  {
    code: "container_type",
    name: "Container Type",
    groupKey: ProductAttributeGroup.PACKING,
    type: ProductAttributeType.TEXT,
    value: "40ft refrigerated (reefer)",
    sectionLabel: "Packing",
  },
  {
    code: "moq",
    name: "MOQ",
    groupKey: ProductAttributeGroup.PACKING,
    type: ProductAttributeType.TEXT,
    value: "1 × 40ft container",
    sectionLabel: "Packing",
  },
];

// ── Container configs ────────────────────────────────────────────────────────

const WHOLE_DRIED_CONTAINERS = [
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

const FROZEN_CONTAINERS = [
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

// ── Helpers ─────────────────────────────────────────────────────────────────

type ProductSet = "whole_dried" | "frozen_water" | "frozen_milk" | "none";

function detectProductSet(product: Product): ProductSet {
  const slug = (product.slug ?? "").toLowerCase();
  const name = (product.name ?? "").toLowerCase();

  if (slug.includes("coconut-water") || name.includes("coconut water")) {
    return "frozen_water";
  }
  if (slug.includes("coconut-milk") || name.includes("coconut milk")) {
    return "frozen_milk";
  }
  if (
    slug.includes("dried") ||
    slug.includes("husked") ||
    slug.includes("coconut") ||
    name.includes("dried") ||
    name.includes("husked") ||
    name.includes("coconut")
  ) {
    return "whole_dried";
  }
  return "none";
}

function getInquiryAttributes(set: ProductSet): AttributeSeed[] {
  if (set === "frozen_water") return FROZEN_WATER_INQUIRY;
  if (set === "frozen_milk") return FROZEN_MILK_INQUIRY;
  if (set === "whole_dried") return WHOLE_DRIED_INQUIRY;
  return [];
}

function getSpecValues(set: ProductSet) {
  if (set === "frozen_water") return FROZEN_WATER_SPECS;
  if (set === "frozen_milk") return FROZEN_MILK_SPECS;
  if (set === "whole_dried") return WHOLE_DRIED_SPECS;
  return [];
}

function getContainers(set: ProductSet) {
  if (set === "whole_dried") return WHOLE_DRIED_CONTAINERS;
  if (set !== "none") return FROZEN_CONTAINERS;
  return [];
}

// ── Main seed function ───────────────────────────────────────────────────────

async function seedAttributes() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const attrRepo = app.get<Repository<ProductAttribute>>(
    getRepositoryToken(ProductAttribute),
  );
  const optRepo = app.get<Repository<ProductAttributeOption>>(
    getRepositoryToken(ProductAttributeOption),
  );
  const mappingRepo = app.get<Repository<ProductAttributeMapping>>(
    getRepositoryToken(ProductAttributeMapping),
  );
  const valueRepo = app.get<Repository<ProductAttributeValue>>(
    getRepositoryToken(ProductAttributeValue),
  );
  const productRepo = app.get<Repository<Product>>(
    getRepositoryToken(Product),
  );
  const containerRepo = app.get<Repository<ProductContainerConfig>>(
    getRepositoryToken(ProductContainerConfig),
  );

  console.log("\n=== Seed: Inquiry + Spec Config ===\n");

  const allInquirySeeds = [
    ...WHOLE_DRIED_INQUIRY,
    ...FROZEN_WATER_INQUIRY,
    ...FROZEN_MILK_INQUIRY,
  ];
  const allSpecSeeds = [
    ...WHOLE_DRIED_SPECS,
    ...FROZEN_WATER_SPECS,
    ...FROZEN_MILK_SPECS,
  ];

  // ── Step 1a: Upsert all master attributes (inquiry + spec) ───────────────
  let attrsCreated = 0;

  for (const seed of allInquirySeeds) {
    let attr = await attrRepo.findOne({ where: { code: seed.code } });
    if (!attr) {
      attr = attrRepo.create({
        code: seed.code,
        name: seed.name,
        groupKey: seed.groupKey,
        type: seed.type,
        unit: seed.unit ?? null,
        placeholder: seed.placeholder ?? null,
        defaultValue: seed.defaultValue ?? null,
        isActive: true,
      });
      attr = await attrRepo.save(attr);
      attrsCreated++;
      console.log(`  + attr: ${seed.code} (id=${attr.id})`);
    }
  }

  for (const seed of allSpecSeeds) {
    let attr = await attrRepo.findOne({ where: { code: seed.code } });
    if (!attr) {
      attr = attrRepo.create({
        code: seed.code,
        name: seed.name,
        groupKey: seed.groupKey,
        type: seed.type,
        unit: seed.unit ?? null,
        isActive: true,
      });
      attr = await attrRepo.save(attr);
      attrsCreated++;
      console.log(`  + spec attr: ${seed.code} (id=${attr.id})`);
    }
  }

  // ── Step 1b: Sync options for inquiry attributes ──────────────────────────
  let optsCreated = 0;
  for (const seed of allInquirySeeds) {
    const attr = await attrRepo.findOne({ where: { code: seed.code } });
    if (!attr) continue;

    if (seed.type === ProductAttributeType.SELECT && seed.options.length) {
      const existing = await optRepo.find({
        where: { attributeId: attr.id },
        order: { sortOrder: "ASC" },
      });
      const existingVals = new Set(existing.map((o) => o.value.toLowerCase()));
      const missing = seed.options.filter(
        (o) => !existingVals.has(o.value.toLowerCase()),
      );
      if (missing.length) {
        const start = existing.length;
        const newOpts = missing.map((o, idx) =>
          optRepo.create({
            attributeId: attr.id,
            value: o.value,
            sortOrder: start + idx,
            isActive: true,
            isCustomTrigger: o.isCustomTrigger ?? false,
            customPlaceholder: o.customPlaceholder ?? null,
          }),
        );
        await optRepo.save(newOpts);
        optsCreated += newOpts.length;
      }
      // Sync trigger flags
      for (const o of seed.options) {
        const ex = existing.find(
          (e) => e.value.toLowerCase() === o.value.toLowerCase(),
        );
        if (!ex) continue;
        if (
          ex.isCustomTrigger !== (o.isCustomTrigger ?? false) ||
          ex.customPlaceholder !== (o.customPlaceholder ?? null)
        ) {
          ex.isCustomTrigger = o.isCustomTrigger ?? false;
          ex.customPlaceholder = o.customPlaceholder ?? null;
          await optRepo.save(ex);
        }
      }
    }
  }

  // ── Step 2: Upsert mappings + spec values per product ────────────────────
  const products = await productRepo.find();
  console.log(`\n⏳ Processing ${products.length} products …`);

  let mappingsCreated = 0;
  let valuesCreated = 0;
  let containersCreated = 0;

  for (const product of products) {
    const set = detectProductSet(product);
    if (set === "none") {
      console.log(`  ↩ ${product.slug} — no matching set`);
      continue;
    }

    console.log(`\n  ▶ ${product.slug} [${set}]`);

    // ── Inquiry mappings (isInquiryField=true) ────────────────────────────
    const inquirySeeds = getInquiryAttributes(set);
    for (let i = 0; i < inquirySeeds.length; i++) {
      const seed = inquirySeeds[i];
      const attr = await attrRepo.findOne({ where: { code: seed.code } });
      if (!attr) {
        console.log(`    ⚠ attr not found: ${seed.code}`);
        continue;
      }

      let defaultOptionId: number | null = null;
      if (attr.type === ProductAttributeType.SELECT && attr.options?.length) {
        const dv = seed.defaultValue?.toLowerCase();
        const match = attr.options.find(
          (o) => o.value.toLowerCase() === dv,
        );
        defaultOptionId = match?.id ?? attr.options[0].id;
      }

      let mapping = await mappingRepo.findOne({
        where: { productId: product.id, attributeId: attr.id },
      });

      if (!mapping) {
        mapping = mappingRepo.create({
          productId: product.id,
          attributeId: attr.id,
          defaultOptionId,
          required: seed.required,
          isInquiryField: true,
          sortOrder: i,
          metadata: null,
        });
        await mappingRepo.save(mapping);
        mappingsCreated++;
        console.log(`    + inquiry mapping: ${seed.code} (isInquiryField=true)`);
      } else {
        // Ensure isInquiryField=true on existing mapping
        if (!mapping.isInquiryField) {
          mapping.isInquiryField = true;
          mapping.required = seed.required;
          mapping.sortOrder = i;
          if (defaultOptionId) mapping.defaultOptionId = defaultOptionId;
          await mappingRepo.save(mapping);
          console.log(`    ~ updated: ${seed.code} → isInquiryField=true`);
        }
      }
    }

    // ── Spec display values (isInquiryField=false) ──────────────────────
    const specSeeds = getSpecValues(set);
    for (let i = 0; i < specSeeds.length; i++) {
      const seed = specSeeds[i];
      const attr = await attrRepo.findOne({ where: { code: seed.code } });
      if (!attr) {
        console.log(`    ⚠ spec attr not found: ${seed.code}`);
        continue;
      }

      let value = await valueRepo.findOne({
        where: { productId: product.id, attributeId: attr.id },
      });

      if (!value) {
        value = valueRepo.create({
          productId: product.id,
          attributeId: attr.id,
          value: seed.value,
          unit: seed.unit ?? null,
          footnote: seed.footnote ?? null,
          sectionLabel: seed.sectionLabel ?? null,
          required: false,
          sortOrder: i,
          metadata: null,
        });
        await valueRepo.save(value);
        valuesCreated++;
        console.log(`    + spec value: ${seed.code}`);
      } else {
        // Update spec value if changed
        let updated = false;
        if (value.value !== seed.value) { value.value = seed.value; updated = true; }
        if (value.footnote !== (seed.footnote ?? null)) { value.footnote = seed.footnote ?? null; updated = true; }
        if (value.sectionLabel !== (seed.sectionLabel ?? null)) { value.sectionLabel = seed.sectionLabel ?? null; updated = true; }
        if (updated) {
          await valueRepo.save(value);
          console.log(`    ~ updated spec value: ${seed.code}`);
        }
      }
    }

    // ── Container configs ───────────────────────────────────────────────
    const containerSeeds = getContainers(set);
    for (const cfg of containerSeeds) {
      const exists = await containerRepo.findOne({
        where: { productId: product.id, containerCode: cfg.containerCode },
      });
      if (!exists) {
        await containerRepo.save(
          containerRepo.create({ productId: product.id, ...cfg }),
        );
        containersCreated++;
        console.log(`    + container: ${cfg.containerCode}`);
      }
    }
  }

  // ── Backfill isInquiryField=false for spec-only mappings ───────────────
  // Any mapping where the attribute code appears only in spec seeds (not inquiry seeds)
  const specOnlyCodes = allSpecSeeds
    .map((s) => s.code)
    .filter((c) => !allInquirySeeds.find((s) => s.code === c));

  if (specOnlyCodes.length) {
    const result = await mappingRepo
      .createQueryBuilder()
      .update()
      .set({ isInquiryField: false })
      .where(`"attributeId" IN (
        SELECT id FROM product_attributes WHERE code IN (:...codes)
      )`)
      .andWhere(`"isInquiryField" IS DISTINCT FROM false`)
      .setParameter("codes", specOnlyCodes)
      .execute();
    if (result.affected && result.affected > 0) {
      console.log(`\n  ~ backfilled isInquiryField=false for ${result.affected} spec-only mappings`);
    }
  }

  console.log("\n────────────────────────── DONE ──────────────────────────");
  console.log(`  attributes created : ${attrsCreated}`);
  console.log(`  options created   : ${optsCreated}`);
  console.log(`  mappings created   : ${mappingsCreated}`);
  console.log(`  spec values created: ${valuesCreated}`);
  console.log(`  containers created : ${containersCreated}`);
  console.log("─────────────────────────────────────────────────────────\n");

  await app.close();
}

seedAttributes().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
