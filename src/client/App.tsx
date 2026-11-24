import { useEffect, useState } from 'preact/hooks'
import type { Item } from '../shared/schemas'
import { api } from './api'

export function App() {
  const [items, setItems] = useState<Item[]>([])
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')

  function showError(reason: unknown) {
    setError(reason instanceof Error ? reason.message : 'Ein unerwarteter Fehler ist aufgetreten.')
  }

  useEffect(() => {
    api
      .list()
      .then(setItems)
      .catch(showError)
  }, [])

  async function createItem(event: Event) {
    event.preventDefault()
    setError('')
    try {
      const item = await api.create({ title, category, note: '', dueDate: '' })
      setItems((current) => [...current, item])
      setTitle('')
      setCategory('')
    } catch (reason) {
      showError(reason)
    }
  }

  async function toggleDone(item: Item) {
    setError('')
    try {
      const updated = await api.update(item.id, { done: !item.done })
      setItems((current) => current.map((entry) => (entry.id === updated.id ? updated : entry)))
    } catch (reason) {
      showError(reason)
    }
  }

  async function deleteItem(id: number) {
    setError('')
    try {
      await api.remove(id)
      setItems((current) => current.filter((item) => item.id !== id))
    } catch (reason) {
      showError(reason)
    }
  }

  return (
    <main class="mx-auto max-w-2xl space-y-6 p-6">
      <header class="space-y-2">
        <p class="text-sm font-semibold uppercase tracking-wide text-indigo-700">Schulalltag im Griff</p>
        <h1 class="text-3xl font-bold text-slate-900">Meine HÜ-Checkliste</h1>
        <p class="text-slate-600">Sammle deine Hausübungen, ordne sie einem Fach zu und hake Erledigtes ab.</p>
      </header>

      {error && (
        <p role="alert" class="rounded-lg border border-red-300 bg-red-50 p-3 text-red-800">
          Fehler: {error}
        </p>
      )}

      <form onSubmit={createItem} class="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 class="text-xl font-semibold text-slate-900">Neue Hausübung eintragen</h2>
        <div class="grid gap-4 sm:grid-cols-2">
          <label class="space-y-1 text-sm font-medium text-slate-700">
            Titel
            <input
              required
              maxLength={80}
              value={title}
              onInput={(event) => setTitle(event.currentTarget.value)}
              placeholder="z. B. Mathematik, Seite 42"
              class="w-full rounded-md border border-slate-300 px-3 py-2 text-base font-normal text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </label>
          <label class="space-y-1 text-sm font-medium text-slate-700">
            Kategorie / Fach
            <input
              required
              maxLength={40}
              value={category}
              onInput={(event) => setCategory(event.currentTarget.value)}
              placeholder="z. B. Mathematik"
              class="w-full rounded-md border border-slate-300 px-3 py-2 text-base font-normal text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </label>
        </div>
        <button
          type="submit"
          class="rounded-md bg-indigo-700 px-4 py-2 font-semibold text-white hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
        >
          Hausübung hinzufügen
        </button>
      </form>

      <ul class="space-y-3">
        {items.map((item) => (
          <li key={item.id} class="flex items-start justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div class="space-y-1">
              <span class="text-xs font-semibold uppercase tracking-wide text-indigo-700">{item.category}</span>
              <h2 class={`font-semibold ${item.done ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{item.title}</h2>
              {item.note && <p class="text-sm text-slate-600">{item.note}</p>}
              <label class="flex items-center gap-2 pt-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => void toggleDone(item)}
                  class="size-4 rounded border-slate-300 accent-indigo-700 focus:ring-indigo-500"
                />
                Erledigt
              </label>
            </div>
            <button
              type="button"
              onClick={() => void deleteItem(item.id)}
              aria-label={`Hausübung "${item.title}" löschen`}
              class="shrink-0 rounded-md border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
            >
              Löschen
            </button>
          </li>
        ))}
      </ul>

      {items.length === 0 && <p class="rounded-lg bg-slate-100 p-4 text-slate-600">Noch keine Hausübungen eingetragen.</p>}
    </main>
  )
}
