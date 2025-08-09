import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1754675803481 implements MigrationInterface {
    name = 'InitialSchema1754675803481'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_5df8c3341f2aeecd3ed791129a"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "lastSyncAt"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "lastSyncAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_5df8c3341f2aeecd3ed791129a" ON "products" ("contentfulId") `);
    }

}
