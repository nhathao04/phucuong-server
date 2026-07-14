import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Consolidate trade-term capture on Quote into a single display column.
 *
 * Why this is one column, not two:
 *   - FE only ever submits one of two payloads:
 *       a) `tradeTermId: <number>` (customer picked from BE-managed list)
 *       b) `tradeTermLabel: "<text>"` (customer typed something custom)
 *   - We resolve the display name at write time:
 *       case (a) → TradeTerm.name snapshot
 *       case (b) → the typed label verbatim
 *   - Historical reads must keep showing the original wording even if a
 *     TradeTerm row is later renamed/deactivated. So we store the resolved
 *     display string itself, no FK join needed for display.
 *
 * Changes vs `AddQuoteTradeTerm1754280000000`:
 *   - DROP `tradeTermSnapshot` (the previous two-column split is overkill
 *     given there's only one writer and we resolve at insert time)
 *   - RENAME `tradeTermLabel` → `tradeTermName` to reflect that this single
 *     column is the final display value, regardless of source
 *
 * Both rename and column-add are wrapped in idempotent guards so re-running
 * on databases where `synchronize: true` already applied the new schema is a
 * no-op.
 */
export class ConsolidateQuoteTradeTermName1754290000000
  implements MigrationInterface
{
  name = "ConsolidateQuoteTradeTermName1754290000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Prefer the new column name. If the old one exists, rename it;
    // otherwise create fresh.
    const hasOldLabel = await queryRunner.hasColumn(
      "quotes",
      "tradeTermLabel",
    );
    const hasNewName = await queryRunner.hasColumn(
      "quotes",
      "tradeTermName",
    );

    if (!hasNewName && hasOldLabel) {
      await queryRunner.query(
        `ALTER TABLE "quotes" RENAME COLUMN "tradeTermLabel" TO "tradeTermName"`,
      );
    } else if (!hasNewName && !hasOldLabel) {
      await queryRunner.query(
        `ALTER TABLE "quotes" ADD COLUMN "tradeTermName" varchar(255)`,
      );
    }

    await queryRunner.query(
      `ALTER TABLE "quotes" DROP COLUMN IF EXISTS "tradeTermSnapshot"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restore the old two-column shape so this migration is reversible.
    const hasName = await queryRunner.hasColumn("quotes", "tradeTermName");
    if (hasName) {
      await queryRunner.query(
        `ALTER TABLE "quotes" RENAME COLUMN "tradeTermName" TO "tradeTermLabel"`,
      );
    }
    await queryRunner.query(
      `ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "tradeTermSnapshot" varchar(100)`,
    );
  }
}