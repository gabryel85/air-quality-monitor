/**
 * Notes persistence — IndexedDB.
 *
 * Notes are the only mutable user data in the app, so they get a real
 * browser database. Countries / cities / measurements are deterministic
 * (computed from seed constants) and need no storage.
 *
 * On first visit the `notes` store is empty → it is seeded from
 * `initialNotes()`. On every later visit the user's own notes are read
 * back, so creating a note and refreshing keeps it.
 *
 * Test environments (the vitest runner) have no `indexedDB`; an in-memory
 * array transparently stands in so the same handlers work everywhere.
 *
 * If the database cannot be opened (corruption, a blocked version upgrade,
 * a browser that denies storage) a `DbUnavailableError` is thrown. The notes
 * endpoints turn that into a 503 so the UI can offer a one-click reset.
 */

import { deleteDB, openDB, type DBSchema, type IDBPDatabase } from 'idb';

import { initialNotes } from './seed';
import type { CreateNoteInput, NoteDto, UpdateNoteInput } from './types';

const DB_NAME = 'aqm-db';
const DB_VERSION = 1;
const STORE = 'notes';

interface AqmSchema extends DBSchema {
  notes: { key: number; value: NoteDto };
}

const hasIndexedDb = typeof indexedDB !== 'undefined';

/**
 * Thrown when IndexedDB cannot be opened. Carries the original failure as
 * `cause` for the technical-detail panel.
 */
export class DbUnavailableError extends Error {
  constructor(cause?: unknown) {
    super('Notes storage (IndexedDB) could not be opened.');
    this.name = 'DbUnavailableError';
    if (cause !== undefined) this.cause = cause;
  }
}

let dbPromise: Promise<IDBPDatabase<AqmSchema>> | null = null;
function getDb(): Promise<IDBPDatabase<AqmSchema>> {
  dbPromise ??= openDB<AqmSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      db.createObjectStore(STORE, { keyPath: 'id' });
    },
  }).catch((cause: unknown) => {
    // Don't cache the rejection — a later resetDb()/retry must reopen cleanly.
    dbPromise = null;
    throw new DbUnavailableError(cause);
  });
  return dbPromise;
}

/** Stand-in store for environments without IndexedDB (e.g. the test runner). */
let memory: NoteDto[] | null = null;

/** Seeds once; later calls return the same resolved promise. */
let seedPromise: Promise<void> | null = null;

export function ensureSeeded(): Promise<void> {
  seedPromise ??= seed().catch((error: unknown) => {
    // A failed seed must not be cached — let the next call retry.
    seedPromise = null;
    throw error;
  });
  return seedPromise;
}

/**
 * Wipes the IndexedDB database and re-seeds it from the original sample notes.
 * Recovery path for a corrupted store, and the action behind the header
 * "Reset data" button.
 */
export async function resetDb(): Promise<void> {
  seedPromise = null;
  if (!hasIndexedDb) {
    memory = initialNotes();
    return;
  }
  if (dbPromise) {
    try {
      (await dbPromise).close();
    } catch {
      // Connection already broken — deleteDB below still clears it.
    }
    dbPromise = null;
  }
  await deleteDB(DB_NAME);
  await ensureSeeded();
}

async function seed(): Promise<void> {
  if (!hasIndexedDb) {
    memory = initialNotes();
    return;
  }
  const db = await getDb();
  if ((await db.count(STORE)) > 0) return;
  const tx = db.transaction(STORE, 'readwrite');
  await Promise.all(initialNotes().map((note) => tx.store.add(note)));
  await tx.done;
}

async function readAll(): Promise<NoteDto[]> {
  await ensureSeeded();
  if (!hasIndexedDb) return memory ?? [];
  return (await getDb()).getAll(STORE);
}

export async function listNotes(cityId: string): Promise<NoteDto[]> {
  const all = await readAll();
  return all
    .filter((n) => n.cityId === cityId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getNote(cityId: string, noteId: number): Promise<NoteDto | undefined> {
  const all = await readAll();
  return all.find((n) => n.id === noteId && n.cityId === cityId);
}

export async function createNote(cityId: string, input: CreateNoteInput): Promise<NoteDto> {
  const all = await readAll();
  const nextId = all.reduce((max, n) => Math.max(max, n.id), 0) + 1;
  const now = new Date().toISOString();
  const note: NoteDto = {
    id: nextId,
    cityId,
    title: input.title.trim(),
    content: input.content.trim(),
    createdAt: now,
    updatedAt: now,
  };
  if (!hasIndexedDb) {
    (memory ??= []).push(note);
    return note;
  }
  await (await getDb()).add(STORE, note);
  return note;
}

export async function updateNote(
  cityId: string,
  noteId: number,
  input: UpdateNoteInput,
): Promise<NoteDto | undefined> {
  const existing = await getNote(cityId, noteId);
  if (!existing) return undefined;
  const updated: NoteDto = {
    ...existing,
    content: input.content.trim(),
    updatedAt: new Date().toISOString(),
  };
  if (!hasIndexedDb) {
    const list = memory ?? [];
    const idx = list.findIndex((n) => n.id === noteId);
    if (idx !== -1) list[idx] = updated;
    return updated;
  }
  await (await getDb()).put(STORE, updated);
  return updated;
}
