import { FileText, Search, Sparkles } from 'lucide-react';
import { NoteCard } from './NoteCard.jsx';
import { LoadingSpinner } from '../common/LoadingSpinner.jsx';

export function NotesView({ notes, loading, error, archived, search, onSearch, onCreate, onEdit, onPin, onArchive, onDelete, page, totalPages, onPage }) {
  return (
    <>
      <div className="workspace-toolbar"><label className="search-box"><Search size={18} /><span className="sr-only">Search notes</span><input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search your notes" /></label><button className="button button-primary desktop-create" type="button" onClick={onCreate}><span className="plus-mark">+</span> New note</button></div>
      <div className="page-intro"><div><span className="eyebrow">YOUR PERSONAL SPACE</span><h1>{archived ? 'The archive' : 'Your notes'}</h1><p>{archived ? 'Old thoughts, saved for later.' : 'Capture the little things before they slip away.'}</p></div><span className="intro-art"><Sparkles size={25} /></span></div>
      {loading ? <div className="notes-loading"><LoadingSpinner label="Gathering your notes…" /><div className="skeleton-grid"><i /><i /><i /></div></div> : error ? <div className="state-card error-state"><FileText size={26} /><h2>We couldn’t load your notes</h2><p>{error}</p></div> : notes.length === 0 ? (
        <div className="empty-state"><span className="empty-icon"><FileText size={25} /></span><h2>{search ? 'No notes found' : archived ? 'Your archive is empty' : 'Start with a fresh page'}</h2><p>{search ? 'Try another word or a shorter search.' : archived ? 'Notes you archive will find a home here.' : 'Write down an idea, a reminder, or anything you want to remember.'}</p>{!archived && !search && <button className="button button-primary" onClick={onCreate}><span className="plus-mark">+</span> Create your first note</button>}</div>
      ) : <>
        <div className="notes-grid">{notes.map((note) => <NoteCard key={note._id} note={note} archived={archived} onEdit={onEdit} onPin={onPin} onArchive={onArchive} onDelete={onDelete} />)}</div>
        {totalPages > 1 && <nav className="pagination" aria-label="Notes pages"><button className="button button-secondary" onClick={() => onPage(page - 1)} disabled={page <= 1}>Previous</button><span>Page {page} of {totalPages}</span><button className="button button-secondary" onClick={() => onPage(page + 1)} disabled={page >= totalPages}>Next</button></nav>}
      </>}
    </>
  );
}
