import { MigrationInterface, QueryRunner } from "typeorm";

export class AddContentType1754683962094 implements MigrationInterface {
    name = 'AddContentType1754683962094'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "contentType" character varying(50) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "contentType"`);
    }

}
