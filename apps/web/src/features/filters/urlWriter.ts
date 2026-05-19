/**
 * Singleton URL writer set by UrlSyncProvider and consumed by the listener
 * middleware. Decouples the middleware from react-router.
 */

interface UrlSyncWriter {
  (search: string): void;
}

let urlWriter: UrlSyncWriter | null = null;

export function setUrlWriter(writer: UrlSyncWriter | null): void {
  urlWriter = writer;
}

export function writeUrl(search: string): void {
  urlWriter?.(search);
}
