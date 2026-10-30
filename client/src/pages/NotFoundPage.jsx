import { Link } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';

export function NotFoundPage() {
  return <main className="not-found-page"><span className="not-found-icon"><FileQuestion size={30} /></span><span className="eyebrow">404 · PAGE NOT FOUND</span><h1>This page wandered off.</h1><p>Let’s get you back to a place where your thoughts can settle.</p><Link className="button button-primary" to="/">Back to NotesFlow</Link></main>;
}
