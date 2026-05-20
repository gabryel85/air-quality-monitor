/**
 * Integration tests for NotesPage — the note-mutation flow.
 *
 * Covers the PDF requirement: opening a new-note modal, filling the form,
 * saving, and seeing the note appear in the list (cache invalidation).
 *
 * MSW provides a stateful notes store: POST appends, the next GET returns
 * the new note included. That's the production contract the UI relies on.
 */

import { waitFor, waitForElementToBeRemoved, within } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { NotesPage } from '@/pages/NotesPage';

import { renderWithProviders } from '@/test/renderWithProviders';

function renderNotesFor(cityId: string) {
  return renderWithProviders(
    <Routes>
      <Route path="/cities/:cityId/notes" element={<NotesPage />} />
    </Routes>,
    { initialRoute: `/cities/${cityId}/notes` },
  );
}

describe('NotesPage — create note flow', () => {
  it('creates a new note and shows it in the list', async () => {
    const utils = renderNotesFor('krakow');

    // Wait until the existing seed notes load (Kraków has 2 in seed).
    // NoteCard renders the title in both an sr-only label and a visible heading,
    // so we use findAllByText to tolerate duplicates.
    await utils.findAllByText(/Smog episode confirmed/);

    // Click the "New note" CTA — labelled in the current i18n locale.
    const newButton = utils
      .getAllByRole('button')
      .find((b) => /Nowa notatka|New note/.test(b.textContent ?? ''));
    if (!newButton) throw new Error('"New note" button not found');
    await utils.user.click(newButton);

    // Modal is open — title + content inputs visible.
    const dialog = await utils.findByRole('dialog');
    const titleInput = utils.getByLabelText(/Tytuł|Title/);
    const contentTextarea = utils.getByLabelText(/Treść|Content/);

    await utils.user.type(titleInput, 'Test note from integration');
    await utils.user.type(
      contentTextarea,
      'This note proves the create → invalidate → list flow works end-to-end.',
    );

    const saveButton = within(dialog).getByRole('button', { name: /Zapisz|Save/ });
    await utils.user.click(saveButton);

    // Modal closes → the new note appears in the list.
    await waitForElementToBeRemoved(() => utils.queryByRole('dialog'), { timeout: 5000 });
    const matches = await utils.findAllByText('Test note from integration');
    expect(matches.length).toBeGreaterThan(0);
  });
});

describe('NotesPage — delete note flow', () => {
  it('deletes a note through the edit modal and removes it from the list', async () => {
    const utils = renderNotesFor('krakow');

    // Kraków has a seed note titled "Smog episode confirmed".
    await utils.findAllByText(/Smog episode confirmed/);

    // Open its edit modal (the accessible name carries the note title).
    const editButton = await utils.findByRole('button', {
      name: /(Edytuj|Edit).*Smog episode confirmed/,
    });
    await utils.user.click(editButton);

    // The modal opens in a loading state, then swaps to the edit form once the
    // note fetch resolves — findByRole waits through that transition.
    const deleteTrigger = await utils.findByRole('button', { name: /^(Usuń|Delete)$/ });
    await utils.user.click(deleteTrigger);

    // First click revealed the inline confirm; the second commits it.
    const confirmDelete = await utils.findByRole('button', { name: /^(Usuń|Delete)$/ });
    await utils.user.click(confirmDelete);

    // Modal closes and the note is gone from the list.
    await waitForElementToBeRemoved(() => utils.queryByRole('dialog'), { timeout: 5000 });
    await waitFor(() => {
      expect(utils.queryAllByText(/Smog episode confirmed/)).toHaveLength(0);
    });
  });
});

describe('NotesPage — deep-linked modal', () => {
  it('opens the modal from a ?modal=new URL and survives the filter URL sync', async () => {
    // The modal must render from the URL alone. UrlSyncProvider's Redux→URL
    // write previously rewrote the whole search string and wiped `modal`;
    // findByRole only resolves once effects (incl. that sync) have flushed.
    const utils = renderWithProviders(
      <Routes>
        <Route path="/cities/:cityId/notes" element={<NotesPage />} />
      </Routes>,
      { initialRoute: '/cities/krakow/notes?modal=new' },
    );

    const dialog = await utils.findByRole('dialog');
    expect(within(dialog).getByLabelText(/Tytuł|Title/)).toBeInTheDocument();
  });
});
