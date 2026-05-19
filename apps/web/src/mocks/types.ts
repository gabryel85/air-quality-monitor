/**
 * API DTOs — mirror what real backend would return.
 * Names match `INFORMATION_ARCHITECTURE.md` Naming Conventions.
 */

export interface CountryDto {
  id: string; // ISO 3166-1 alpha-2
  name: string;
}

export interface CityStatsDto {
  cityId: string;
  city: string;
  /** Stringified decimal (per PDF contract). Null when sensor failure. */
  maxNO2: string | null;
  maxCO: string | null;
  maxPM10: string | null;
}

export interface CityDto {
  cityId: string;
  city: string;
  countryId: string;
}

export interface NoteDto {
  id: number;
  cityId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotesPageDto {
  items: NoteDto[];
  /** Opaque cursor for the next page. `null` when there are no more. */
  nextCursor: string | null;
}

export interface CreateNoteInput {
  title: string;
  content: string;
}

export interface UpdateNoteInput {
  content: string;
}
