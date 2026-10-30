import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

const colors = [
  ['paper', 'Warm white'], ['lavender', 'Lavender'], ['mint', 'Mint'], ['peach', 'Peach'], ['blue', 'Sky blue'], ['lemon', 'Lemon'],
];

export function NoteEditor({ note, onClose, onSave }) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [color, setColor] = useState(note?.color || 'paper');
  const [tagText, setTagText] = useState(note?.tags?.join(', ') || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const titleRef = useRef(null);

  useEffect(() => {
    titleRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !saving) onClose();
      if (event.key === 'Tab') {
        const controls = [...document.querySelectorAll('.editor-dialog button:not(:disabled), .editor-dialog input:not(:disabled), .editor-dialog textarea:not(:disabled)')];
        const first = controls[0];
        const last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose, saving]);

  async function submit(event) {
    event.preventDefault();
    const cleanTitle = title.trim();
    const cleanContent = content.trim();
    const tags = [...new Set(tagText.split(',').map((tag) => tag.trim().toLowerCase()).filter(Boolean))];
    if (!cleanTitle || !cleanContent) {
      setError('Add a title and a few details before saving.');
      return;
    }
    if (tags.length > 10) {
      setError('You can add up to 10 tags.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await onSave({ title: cleanTitle, content: cleanContent, color, tags });
    } catch (saveError) {
      setError(saveError.message || 'Could not save this note.');
      setSaving(false);
    }
  }

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) onClose(); }}>
      <section className={`editor-dialog note-${color}`} role="dialog" aria-modal="true" aria-labelledby="editor-heading">
        <div className="editor-header"><div><span className="eyebrow">{note ? 'KEEP IT FRESH' : 'A NEW THOUGHT'}</span><h2 id="editor-heading">{note ? 'Edit your note' : 'Create a note'}</h2></div><button className="icon-button" type="button" onClick={onClose} aria-label="Close editor" disabled={saving}><X size={20} /></button></div>
        <form onSubmit={submit} noValidate>
          <label className="field-label" htmlFor="note-title">Title</label>
          <input id="note-title" ref={titleRef} value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} placeholder="Give this note a name" />
          <label className="field-label" htmlFor="note-content">Your thoughts</label>
          <textarea id="note-content" value={content} onChange={(event) => setContent(event.target.value)} maxLength={20000} rows={8} placeholder="Start writing…" />
          <label className="field-label" htmlFor="note-tags">Tags <span className="field-hint">optional · comma separated</span></label>
          <input id="note-tags" value={tagText} onChange={(event) => setTagText(event.target.value)} placeholder="work, ideas, personal" />
          <fieldset className="color-fieldset"><legend className="field-label">Card color</legend><div className="color-options">{colors.map(([value, label]) => <button key={value} type="button" className={`color-dot note-${value}${color === value ? ' selected' : ''}`} onClick={() => setColor(value)} aria-label={label} aria-pressed={color === value} />)}</div></fieldset>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="editor-actions"><button type="button" className="button button-secondary" onClick={onClose} disabled={saving}>Cancel</button><button type="submit" className="button button-primary" disabled={saving}>{saving ? 'Saving…' : note ? 'Save changes' : 'Save note'}</button></div>
        </form>
      </section>
    </div>
  );
}
