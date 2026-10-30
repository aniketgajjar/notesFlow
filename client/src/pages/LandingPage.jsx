import { Link } from 'react-router-dom';
import { ArrowRight, Check, FileText, LockKeyhole, Pin, Search } from 'lucide-react';

const features = [
  { icon: <FileText size={20} />, title: 'A home for every thought', copy: 'Keep notes, plans, and little reminders together in one calm space.' },
  { icon: <Search size={20} />, title: 'Find it in a moment', copy: 'Search across your notes and add tags that make sense to you.' },
  { icon: <Pin size={20} />, title: 'Keep what matters close', copy: 'Pin important notes and archive the ones you want to keep around.' },
];

export function LandingPage() {
  return <div className="landing-page">
    <header className="landing-nav"><Link to="/" className="brand-lockup"><span className="brand-mark"><FileText size={19} /></span><span>notesflow<span className="brand-period">.</span></span></Link><nav><Link to="/login" className="nav-login">Log in</Link><Link to="/register" className="button button-primary nav-cta">Get started <ArrowRight size={16} /></Link></nav></header>
    <main>
      <section className="hero-section"><div className="hero-copy"><span className="hero-kicker"><span className="kicker-dot" /> YOUR MIND, A LITTLE MORE ORGANIZED</span><h1>Make room for<br />your <em>thoughts.</em></h1><p className="hero-description">A gentle place to gather your ideas, plans, and passing thoughts — so you can focus on what comes next.</p><div className="hero-actions"><Link to="/register" className="button button-primary button-large">Start writing for free <ArrowRight size={17} /></Link><Link to="/login" className="hero-secondary">I already have an account</Link></div><div className="hero-proof"><span className="proof-avatars"><i>M</i><i>J</i><i>A</i></span><span>A quieter way to stay on top of things</span></div></div>
        <div className="hero-visual" aria-label="Illustration of organized notes" role="img"><div className="visual-orbit orbit-one" /><div className="visual-orbit orbit-two" /><div className="visual-spark spark-one">✳</div><div className="visual-spark spark-two">✦</div><div className="visual-note main-note"><div className="mini-note-head"><span className="mini-dot" /><span>today’s thoughts</span><Pin size={14} /></div><h3>Make space for the good ideas.</h3><p>Big plans start somewhere. This might be that somewhere.</p><div className="mini-lines"><i /><i /><i /></div><div className="mini-tag-row"><span>ideas</span><span>personal</span></div></div><div className="visual-note small-note"><span className="small-note-icon"><Check size={15} /></span><div><strong>Remember</strong><small>Take a real lunch break</small></div></div><div className="visual-sticker">a fresh start<br /><span>every day</span></div></div></section>
      <section className="feature-section"><div className="section-heading"><span className="eyebrow">A CLEARER HEADSPACE</span><h2>Simple by design.<br /><em>Useful every day.</em></h2></div><div className="feature-grid">{features.map(({ icon, title, copy }, index) => <article className="feature-item" key={title}><span className={`feature-icon feature-icon-${index}`}>{icon}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></section>
      <section className="landing-cta"><div><span className="eyebrow">YOUR NEXT THOUGHT IS WAITING</span><h2>Start with a blank page.</h2><p>No complicated setup. Just a little space to think.</p></div><Link to="/register" className="button button-primary button-large">Create your free account <ArrowRight size={17} /></Link></section>
    </main>
    <footer className="landing-footer"><Link to="/" className="brand-lockup"><span className="brand-mark"><FileText size={17} /></span><span>notesflow<span className="brand-period">.</span></span></Link><span>Made for everything on your mind.</span><span><LockKeyhole size={14} /> Your notes are yours alone</span></footer>
  </div>;
}
