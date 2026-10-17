import { MigrationInterface, QueryRunner } from "typeorm";

export class BonusFeatures1792220000000 implements MigrationInterface {
    name = 'BonusFeatures1792220000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "todo" ADD COLUMN IF NOT EXISTS "starred" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "todo" ADD COLUMN IF NOT EXISTS "order" integer NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "todo" DROP COLUMN IF EXISTS "order"`);
        await queryRunner.query(`ALTER TABLE "todo" DROP COLUMN IF EXISTS "starred"`);
    }
}
