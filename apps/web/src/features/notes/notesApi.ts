import { baseApi } from '@/app/api/baseApi';
import type { CreateNoteInput, NoteDto, NotesPageDto, UpdateNoteInput } from '@/mocks/types';

interface NotesQueryArg {
  readonly cityId: string;
}

interface NotesPageArg {
  readonly cityId: string;
  readonly cursor: string | null;
}

export const notesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /**
     * Infinite list of notes per city, cursor-paginated.
     * The cache key is `cityId`; pages append into a single combined `items` array.
     */
    getNotes: build.infiniteQuery<NotesPageDto, NotesQueryArg, string | null>({
      infiniteQueryOptions: {
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
      query: ({ queryArg, pageParam }: { queryArg: NotesQueryArg; pageParam: string | null }) => {
        const params = new URLSearchParams();
        if (pageParam) params.set('cursor', pageParam);
        const qs = params.toString();
        return `/cities/${encodeURIComponent(queryArg.cityId)}/notes${qs ? `?${qs}` : ''}`;
      },
      providesTags: (_result, _err, { cityId }) => [{ type: 'Notes', id: cityId }],
    }),

    createNote: build.mutation<NoteDto, { cityId: string; input: CreateNoteInput }>({
      query: ({ cityId, input }) => ({
        url: `/cities/${encodeURIComponent(cityId)}/notes`,
        method: 'POST',
        body: input,
      }),
      invalidatesTags: (_result, _err, { cityId }) => [{ type: 'Notes', id: cityId }],
    }),

    updateNote: build.mutation<NoteDto, { cityId: string; noteId: number; input: UpdateNoteInput }>(
      {
        query: ({ cityId, noteId, input }) => ({
          url: `/cities/${encodeURIComponent(cityId)}/notes/${String(noteId)}`,
          method: 'PATCH',
          body: input,
        }),
        invalidatesTags: (_result, _err, { cityId }) => [{ type: 'Notes', id: cityId }],
      },
    ),

    deleteNote: build.mutation<void, { cityId: string; noteId: number }>({
      query: ({ cityId, noteId }) => ({
        url: `/cities/${encodeURIComponent(cityId)}/notes/${String(noteId)}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _err, { cityId }) => [{ type: 'Notes', id: cityId }],
    }),

    getNote: build.query<NoteDto, { cityId: string; noteId: number }>({
      query: ({ cityId, noteId }) =>
        `/cities/${encodeURIComponent(cityId)}/notes/${String(noteId)}`,
      providesTags: (_result, _err, { cityId, noteId }) => [
        { type: 'Notes', id: `${cityId}:${String(noteId)}` },
      ],
    }),
  }),
});

export const {
  useGetNotesInfiniteQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
  useGetNoteQuery,
} = notesApi;

export type { NotesPageArg };
