import test from 'node:test'
import assert from 'node:assert/strict'
import { apply } from '../src/index.js'
import { computerProjection } from '../src/projection.js'

test('failed projection handoff stops activation before tools and routes', async () => {
  const error = new Error('projection handoff failed')
  let resolve!: () => void
  const gate = new Promise<void>(r => { resolve = r })
  let registrations = 0
  const ctx = {
    sessionProjections: { async register(def: unknown) {
      assert.equal(def, computerProjection)
      await gate
      throw error
    } },
    inject() { registrations++ },
    effect() { registrations++ },
    logger: {},
  }
  const pending = apply(ctx)
  assert.equal(registrations, 0)
  resolve()
  await assert.rejects(pending, e => e === error)
  assert.equal(registrations, 0)
})
