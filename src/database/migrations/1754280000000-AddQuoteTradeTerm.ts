import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Add trade-term capture to Quote requests.
 *
 * Mirrors how the product field works: a customer can either pick an entry
 * from the BE-managed `trade_terms` list (FOB, CIF, EXW, …) — in which case
 * we persist the FK — OR type a free-form label (e.g. "Not sure - need
 * advise") when they don't know which term applies. Both columns are
 * nullable since a quote may legitimately omit pricing preferences.
 *
 * This migration is idempotent (IF NOT EXISTS / IF EXISTS) so it's safe to
 * re-run against environments where `synchronize: true` may have already
 * created the columns.
 */
export class AddQuoteTradeTerm1754280000000 implements MigrationInterface {
  name = "AddQuoteTradeTerm1754280000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "tradeTermId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "tradeTermLabel" varchar(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "tradeTermSnapshot" varchar(100)`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_quotes_tradeTermId" ON "quotes" ("tradeTermId")`,
    );

    // FK constraint wrapped in DO block so re-running this migration on a
    // database that already has the constraint (added by `synchronize: true`)
    // doesn't blow up.
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'FK_quotes_tradeTermId'
        ) THEN
          ALTER TABLE "quotes"
            ADD CONSTRAINT "FK_quotes_tradeTermId"
            FOREIGN KEY ("tradeTermId")
            REFERENCES "trade_terms"("id")
            ON DELETE SET NULL
            ON UPDATE CASCADE;
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "quotes" DROP CONSTRAINT IF EXISTS "FK_quotes_tradeTermId"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_quotes_tradeTermId"`);
    await queryRunner.query(
      `ALTER TABLE "quotes" DROP COLUMN IF EXISTS "tradeTermSnapshot"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quotes" DROP COLUMN IF EXISTS "tradeTermLabel"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quotes" DROP COLUMN IF EXISTS "tradeTermId"`,
    );
  }
}
