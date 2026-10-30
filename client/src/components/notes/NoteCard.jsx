import { Archive, ArchiveRestore, Pin, PinOff, Trash2 } from 'lucide-react';

const formatDate = (date) => new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date));

export function NoteCard({ note, archived = false, onEdit, onPin, onArchive, onDelete }) {
  return (
    <article className={`note-card note-${note.color || 'paper'}`}>
      <div className="note-card-top">
        <div className="note-tags">{note.tags?.map((tag) => <span className="tag-chip" key={tag}>{tag}</span>)}</div>
        <button className={`icon-button pin-button${note.isPinned ? ' is-pinned' : ''}`} type="button" onClick={() => onPin(note)} aria-label={note.isPinned ? 'Unpin note' : 'Pin note'} title={note.isPinned ? 'Unpin note' : 'Pin note'}>
          {note.isPinned ? <Pin size={16} fill="currentColor" /> : <Pin size={16} />}
        </button>
      </div>
      <button type="button" className="note-content-button" onClick={() => onEdit(note)} aria-label={`Edit note: ${note.title}`}>
        <h3>{note.title}</h3><p className="note-preview">{note.content}</p>
      </button>
      <div className="note-card-footer">
        <time dateTime={note.updatedAt}>Edited {formatDate(note.updatedAt)}</time>
        <div className="note-actions">
          <button className="icon-button" type="button" onClick={() => onArchive(note)} aria-label={archived ? 'Restore note' : 'Archive note'} title={archived ? 'Restore note' : 'Archive note'}>{archived ? <ArchiveRestore size={16} /> : <Archive size={16} />}</button>
          <button className="icon-button delete-icon" type="button" onClick={() => onDelete(note)} aria-label="Delete note" title="Delete note"><Trash2 size={16} /></button>
        </div>
      </div>
    </article>
  );
}
