BEGIN;

-- 1) Seed attribute catalog
INSERT INTO "product_attributes" (
  "code",
  "name",
  "type",
  "unit",
  "isActive",
  "createdAt",
  "updatedAt"
)
VALUES
  ('quantity_mt', 'Quantity (MT)', 'number', 'MT', TRUE, NOW(), NOW()),
  ('coconut_size', 'Coconut Size', 'select', NULL, TRUE, NOW(), NOW()),
  ('husk_type', 'Husk Type', 'select', NULL, TRUE, NOW(), NOW()),
  ('packaging', 'Packaging', 'select', NULL, TRUE, NOW(), NOW()),
  ('sample_required', 'Sample Required', 'boolean', NULL, TRUE, NOW(), NOW()),
  ('packaging_type', 'Packaging Type', 'select', NULL, TRUE, NOW(), NOW()),
  ('brix_level', 'Brix Level', 'select', NULL, TRUE, NOW(), NOW()),
  ('fat_content', 'Fat Content', 'select', '%', TRUE, NOW(), NOW())
ON CONFLICT ("code") DO UPDATE
SET
  "name" = EXCLUDED."name",
  "type" = EXCLUDED."type",
  "unit" = EXCLUDED."unit",
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = NOW();

-- 2) Seed attribute options
WITH attr AS (
  SELECT "id", "code" FROM "product_attributes"
)
INSERT INTO "product_attribute_options" (
  "attributeId",
  "value",
  "sortOrder",
  "isActive",
  "createdAt",
  "updatedAt"
)
SELECT a."id", v."value", v."sortOrder", TRUE, NOW(), NOW()
FROM attr a
JOIN (
  VALUES
    ('coconut_size', 'Small', 1),
    ('coconut_size', 'Medium', 2),
    ('coconut_size', 'Large', 3),
    ('husk_type', 'Semi Husked', 1),
    ('husk_type', 'Fully Husked', 2),
    ('packaging', 'PP Bag', 1),
    ('packaging', 'Bulk Loading', 2),
    ('sample_required', 'Yes', 1),
    ('sample_required', 'No', 2),
    ('packaging_type', 'Drum', 1),
    ('packaging_type', 'IBC Tank', 2),
    ('packaging_type', 'Custom', 3),
    ('brix_level', 'Standard', 1),
    ('brix_level', 'Custom', 2),
    ('fat_content', '12%', 1),
    ('fat_content', '17%', 2),
    ('fat_content', '22%', 3),
    ('fat_content', 'Custom', 4)
) AS v("code", "value", "sortOrder") ON v."code" = a."code"
WHERE NOT EXISTS (
  SELECT 1
  FROM "product_attribute_options" o
  WHERE o."attributeId" = a."id"
    AND LOWER(o."value") = LOWER(v."value")
);

-- 3) Seed trade term catalog
INSERT INTO "trade_terms" (
  "code",
  "name",
  "isActive",
  "sortOrder",
  "createdAt",
  "updatedAt"
)
VALUES
  ('FOB', 'Free On Board', TRUE, 1, NOW(), NOW()),
  ('CNF', 'Cost and Freight', TRUE, 2, NOW(), NOW()),
  ('CIF', 'Cost, Insurance and Freight', TRUE, 3, NOW(), NOW())
ON CONFLICT ("code") DO UPDATE
SET
  "name" = EXCLUDED."name",
  "isActive" = EXCLUDED."isActive",
  "sortOrder" = EXCLUDED."sortOrder",
  "updatedAt" = NOW();

-- 4) Seed product-trade-term links
WITH product_target AS (
  SELECT "id", "slug"
  FROM "products"
  WHERE "slug" IN (
    'whole-dried-coconut',
    'frozen-coconut-water',
    'frozen-coconut-milk'
  )
), term_target AS (
  SELECT "id", "code"
  FROM "trade_terms"
  WHERE "code" IN ('FOB', 'CNF', 'CIF')
), matrix AS (
  SELECT p."id" AS "productId", t."id" AS "tradeTermId", t."code"
  FROM product_target p
  CROSS JOIN term_target t
)
INSERT INTO "product_trade_terms" (
  "productId",
  "tradeTermId",
  "isDefault",
  "sortOrder",
  "createdAt",
  "updatedAt"
)
SELECT
  m."productId",
  m."tradeTermId",
  CASE WHEN m."code" = 'FOB' THEN TRUE ELSE FALSE END AS "isDefault",
  CASE
    WHEN m."code" = 'FOB' THEN 1
    WHEN m."code" = 'CNF' THEN 2
    ELSE 3
  END AS "sortOrder",
  NOW(),
  NOW()
FROM matrix m
WHERE NOT EXISTS (
  SELECT 1
  FROM "product_trade_terms" pt
  WHERE pt."productId" = m."productId"
    AND pt."tradeTermId" = m."tradeTermId"
);

COMMIT;
