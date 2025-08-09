import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProductTable1754544471048 implements MigrationInterface {
    name = 'CreateProductTable1754544471048'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "sku" character varying(50) NOT NULL, "name" character varying(255) NOT NULL, "brand" character varying(100) NOT NULL, "model" character varying(255), "category" character varying(100) NOT NULL, "color" character varying(50), "price" numeric(10,2) NOT NULL, "currency" character varying(10) NOT NULL DEFAULT 'USD', "stock" integer NOT NULL DEFAULT '0', "contentfulId" character varying(100) NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "contentfulCreatedAt" TIMESTAMP NOT NULL, "contentfulUpdatedAt" TIMESTAMP NOT NULL, "contentfulRevision" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "lastSyncAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_c44ac33a05b144dd0d9ddcf9327" UNIQUE ("sku"), CONSTRAINT "UQ_5df8c3341f2aeecd3ed791129ab" UNIQUE ("contentfulId"), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_5df8c3341f2aeecd3ed791129a" ON "products" ("contentfulId") `);
        await queryRunner.query(`CREATE INDEX "IDX_048a28949bb332d397edb9b7ab" ON "products" ("stock") `);
        await queryRunner.query(`CREATE INDEX "IDX_75895eeb1903f8a17816dafe0a" ON "products" ("price") `);
        await queryRunner.query(`CREATE INDEX "IDX_6b9c7a3f6604554ea28ab64bf3" ON "products" ("category", "brand") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_6b9c7a3f6604554ea28ab64bf3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_75895eeb1903f8a17816dafe0a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_048a28949bb332d397edb9b7ab"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5df8c3341f2aeecd3ed791129a"`);
        await queryRunner.query(`DROP TABLE "products"`);
    }

}
