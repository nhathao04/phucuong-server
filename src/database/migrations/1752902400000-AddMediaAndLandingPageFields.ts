import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMediaAndLandingPageFields1752902400000
  implements MigrationInterface
{
  name = "AddMediaAndLandingPageFields1752902400000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ───────────── assets ─────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "assets" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "url" varchar(500) NOT NULL,
        "thumbnailUrl" varchar(500),
        "alt" varchar(255),
        "caption" varchar(500),
        "width" integer,
        "height" integer,
        "sortOrder" integer NOT NULL DEFAULT 0,
        "mimeType" varchar(60) NOT NULL,
        "byteSize" bigint,
        "originalName" varchar(500),
        "storageKey" varchar(500),
        "ownerType" varchar(60) NOT NULL DEFAULT 'GENERAL',
        "ownerId" uuid,
        "uploadedById" uuid,
        "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
        "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
        CONSTRAINT "PK_assets" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_assets_ownerType" ON "assets" ("ownerType")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_assets_ownerId" ON "assets" ("ownerId")`,
    );

    // ───────────── blog: thumbnailAssetId, coverImageAssetId + assets link ─────────────
    await queryRunner.query(
      `ALTER TABLE "blogs" ADD COLUMN IF NOT EXISTS "thumbnailAssetId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "blogs" ADD COLUMN IF NOT EXISTS "coverImageAssetId" uuid`,
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "blog_assets" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "blogId" uuid NOT NULL,
        "assetId" uuid NOT NULL,
        "sortOrder" integer NOT NULL DEFAULT 0,
        "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
        CONSTRAINT "PK_blog_assets" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_blog_assets_blogId_assetId" ON "blog_assets" ("blogId", "assetId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_blog_assets_blogId" ON "blog_assets" ("blogId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_blog_assets_assetId" ON "blog_assets" ("assetId")`,
    );

    // ───────────── product: badges, hero, quoteConfig + images link ─────────────
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "badges" text[] DEFAULT ARRAY[]::text[]`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "hero" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "quoteConfig" jsonb`,
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "product_images" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "productId" uuid NOT NULL,
        "assetId" uuid NOT NULL,
        "sortOrder" integer NOT NULL DEFAULT 0,
        "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
        CONSTRAINT "PK_product_images" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_product_images_productId_assetId" ON "product_images" ("productId", "assetId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_product_images_productId" ON "product_images" ("productId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_product_images_assetId" ON "product_images" ("assetId")`,
    );

    // technical_specifications
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "product_technical_specifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "productId" uuid NOT NULL,
        "label" varchar(255) NOT NULL,
        "value" text NOT NULL,
        "unit" varchar(60),
        "sortOrder" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_product_technical_specifications" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_product_tech_specs_productId" ON "product_technical_specifications" ("productId")`,
    );

    // packaging_options
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "product_packaging_options" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "productId" uuid NOT NULL,
        "title" varchar(180) NOT NULL,
        "description" text,
        "details" jsonb NOT NULL DEFAULT '[]',
        "sortOrder" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_product_packaging_options" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_product_packaging_options_productId" ON "product_packaging_options" ("productId")`,
    );

    // target_buyers
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "product_target_buyers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "productId" uuid NOT NULL,
        "title" varchar(180) NOT NULL,
        "description" text,
        "sortOrder" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_product_target_buyers" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_product_target_buyers_productId" ON "product_target_buyers" ("productId")`,
    );

    // why_choose_us
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "product_why_choose_us" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "productId" uuid NOT NULL,
        "title" varchar(180) NOT NULL,
        "description" text,
        "sortOrder" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_product_why_choose_us" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_product_why_choose_us_productId" ON "product_why_choose_us" ("productId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "product_why_choose_us"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "product_target_buyers"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "product_packaging_options"`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "product_technical_specifications"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "product_images"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "quoteConfig"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "hero"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "badges"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "blog_assets"`);
    await queryRunner.query(
      `ALTER TABLE "blogs" DROP COLUMN IF EXISTS "coverImageAssetId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "blogs" DROP COLUMN IF EXISTS "thumbnailAssetId"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "assets"`);
  }
}
