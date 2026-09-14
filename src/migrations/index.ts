import * as migration_20260912_030254_shopco_schema from './20260912_030254_shopco_schema'
import * as migration_20260914_023428_checkout_idempotency from './20260914_023428_checkout_idempotency'

export const migrations = [
  {
    up: migration_20260912_030254_shopco_schema.up,
    down: migration_20260912_030254_shopco_schema.down,
    name: '20260912_030254_shopco_schema',
  },
  {
    up: migration_20260914_023428_checkout_idempotency.up,
    down: migration_20260914_023428_checkout_idempotency.down,
    name: '20260914_023428_checkout_idempotency',
  },
]
