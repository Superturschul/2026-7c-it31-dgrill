import { Hono } from 'hono'
import { itemInput, itemPatch } from '../shared/schemas'
import type { Store } from './store'

// Die App wird als Funktion gebaut, damit Tests sie mit einem Test-Store starten können.
export function createApp(store: Store) {
  const app = new Hono()

  app.get('/api/health', (c) => c.json({ status: 'ok' }))

  app.get('/api/items', async (c) => c.json(await store.list()))

  app.post('/api/items', async (c) => {
    let body: unknown
    try {
      body = await c.req.json()
    } catch {
      return c.json({ error: 'Ungültige JSON-Eingabe' }, 400)
    }

    const parsed = itemInput.safeParse(body)
    if (!parsed.success) {
      return c.json({ error: 'Ungültige Eingabe', details: parsed.error.flatten() }, 400)
    }

    const item = await store.create(parsed.data)
    return c.json(item, 201)
  })

  app.patch('/api/items/:id', async (c) => {
    const id = Number(c.req.param('id'))
    if (!Number.isInteger(id) || id < 1) {
      return c.json({ error: 'Ungültige ID' }, 400)
    }

    let body: unknown
    try {
      body = await c.req.json()
    } catch {
      return c.json({ error: 'Ungültige JSON-Eingabe' }, 400)
    }

    const parsed = itemPatch.safeParse(body)
    if (!parsed.success) {
      return c.json({ error: 'Ungültige Eingabe', details: parsed.error.flatten() }, 400)
    }

    const item = await store.update(id, parsed.data)
    if (!item) {
      return c.json({ error: 'Eintrag nicht gefunden' }, 404)
    }
    return c.json(item)
  })

  app.delete('/api/items/:id', async (c) => {
    const id = Number(c.req.param('id'))
    if (!Number.isInteger(id) || id < 1) {
      return c.json({ error: 'Ungültige ID' }, 400)
    }

    const removed = await store.remove(id)
    if (!removed) {
      return c.json({ error: 'Eintrag nicht gefunden' }, 404)
    }
    return c.body(null, 204)
  })

  return app
}
