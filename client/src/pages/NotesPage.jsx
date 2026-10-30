import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AppShell } from '../components/layout/AppShell.jsx';
import { NoteEditor } from '../components/notes/NoteEditor.jsx';
import { NotesView } from '../components/notes/NotesView.jsx';
import { ConfirmDialog } from '../components/common/ConfirmDialog.jsx';
import { useDebouncedValue } from '../hooks/useDebouncedValue.js';
import { noteService } from '../services/noteService.js';
import { getApiMessage } from '../services/api.js';

export function NotesPage({ archived = false }) {
  const location = useLocation();
  const [notes, setNotes] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editor, setEditor] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const queryKey = useMemo(() => `${archived}:${page}:${debouncedSearch}`, [archived, page, debouncedSearch]);
  const loadNotes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await noteService.list({ page, limit: 12, search: debouncedSearch || undefined, archived });
      setNotes(result.notes);
      setPagination(result.pagination);
    } catch (requestError) {
      setError(getApiMessage(requestError, 'Please check your connection and try again.'));
    } finally {
      setLoading(false);
    }
  }, [archived, page, debouncedSearch]);

  useEffect(() => { loadNotes(); }, [loadNotes, queryKey]);
  useEffect(() => { setPage(1); }, [debouncedSearch, archived]);
  useEffect(() => {
    if (location.state?.createNote) {
      setEditor({ mode: 'create', note: null });
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  function openCreate() { setEditor({ mode: 'create', note: null }); }
  function openEdit(note) { setEditor({ mode: 'edit', note }); }

  async function saveNote(values) {
    try {
      if (editor.mode === 'create') {
        await noteService.create(values);
        toast.success('Note saved');
      } else {
        await noteService.update(editor.note._id, values);
        toast.success('Note updated');
      }
      setEditor(null);
      setPage(1);
      await loadNotes();
    } catch (requestError) {
      throw new Error(getApiMessage(requestError, 'Could not save your note.'));
    }
  }

  async function togglePin(note) {
    try { await noteService.setPinned(note._id, !note.isPinned); await loadNotes(); toast.success(note.isPinned ? 'Unpinned' : 'Pinned for later'); }
    catch (requestError) { toast.error(getApiMessage(requestError, 'Could not update pin status.')); }
  }

  async function toggleArchive(note) {
    try { await noteService.setArchived(note._id, !note.isArchived); await loadNotes(); toast.success(note.isArchived ? 'Restored to your notes' : 'Moved to archive'); }
    catch (requestError) { toast.error(getApiMessage(requestError, 'Could not update archive status.')); }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await noteService.remove(deleteTarget._id); setDeleteTarget(null); await loadNotes(); toast.success('Note deleted'); }
    catch (requestError) { toast.error(getApiMessage(requestError, 'Could not delete this note.')); }
    finally { setDeleting(false); }
  }

  return <AppShell onCreate={openCreate}><div className="notes-page">
    <NotesView notes={notes} loading={loading} error={error} archived={archived} search={search} onSearch={(value) => { setSearch(value); setPage(1); }} onCreate={openCreate} onEdit={openEdit} onPin={togglePin} onArchive={toggleArchive} onDelete={setDeleteTarget} page={pagination.page || page} totalPages={pagination.totalPages || 0} onPage={setPage} />
    {editor && <NoteEditor key={`${editor.mode}-${editor.note?._id || 'new'}`} note={editor.note} onClose={() => setEditor(null)} onSave={saveNote} />}
    {deleteTarget && <ConfirmDialog title="Delete this note?" confirmLabel="Delete note" busy={deleting} onCancel={() => setDeleteTarget(null)} onConfirm={confirmDelete}>This note will be permanently removed. You can’t undo this action.</ConfirmDialog>}
  </div></AppShell>;
}
