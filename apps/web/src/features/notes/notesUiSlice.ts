import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type NoteModalKind = 'new' | 'details' | 'edit' | null;

export interface NotesUiState {
  /** Which modal (if any) is open. Mirrors URL `?modal=`. */
  modal: NoteModalKind;
  /** Selected note id for details/edit. Mirrors URL `?noteId=`. */
  noteId: number | null;
}

const initialState: NotesUiState = {
  modal: null,
  noteId: null,
};

const notesUiSlice = createSlice({
  name: 'notesUi',
  initialState,
  reducers: {
    setModal(state, action: PayloadAction<{ modal: NoteModalKind; noteId: number | null }>) {
      state.modal = action.payload.modal;
      state.noteId = action.payload.noteId;
    },
    closeModal() {
      return initialState;
    },
  },
});

export const { setModal, closeModal } = notesUiSlice.actions;
export const notesUiReducer = notesUiSlice.reducer;
