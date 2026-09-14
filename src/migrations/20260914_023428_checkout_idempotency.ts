import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "idempotency_key" varchar;
  CREATE UNIQUE INDEX IF NOT EXISTS "orders_idempotency_key_idx" ON "orders" USING btree ("idempotency_key");`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX IF EXISTS "orders_idempotency_key_idx";
  ALTER TABLE "orders" DROP COLUMN IF EXISTS "idempotency_key";`)
}
