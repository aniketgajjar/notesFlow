import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, FileText, LockKeyhole } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { getApiMessage } from '../services/api.js';

function validate(values, isRegister) {
  const errors = {};
  if (isRegister && values.name.trim().length < 2) errors.name = 'Enter your name (at least 2 characters).';
  if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) errors.email = 'Enter a valid email address.';
  if (values.password.length < 8) errors.password = 'Use at least 8 characters.';
  if (new TextEncoder().encode(values.password).length > 72) errors.password = 'Password must be 72 bytes or fewer.';
  if (isRegister && values.password !== values.confirmPassword) errors.confirmPassword = 'Passwords do not match.';
  return errors;
}

export function AuthPage({ mode }) {
  const isRegister = mode === 'register';
  const { user, loading, login, register } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/app" replace />;

  function change(event) {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
    setErrors((current) => ({ ...current, [event.target.name]: undefined }));
    setFormError('');
  }

  async function submit(event) {
    event.preventDefault();
    const nextErrors = validate(values, isRegister);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSubmitting(true);
    try {
      if (isRegister) await register(values);
      else await login({ email: values.email.trim(), password: values.password });
      toast.success(isRegister ? 'Your space is ready' : 'Welcome back');
      navigate('/app', { replace: true });
    } catch (error) {
      const message = getApiMessage(error, isRegister ? 'Could not create your account.' : 'Could not sign in.');
      setFormError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return <main className="auth-page"><Link to="/" className="brand-lockup auth-brand"><span className="brand-mark"><FileText size={19} /></span><span>notesflow<span className="brand-period">.</span></span></Link><div className="auth-card"><div className="auth-heading"><span className="eyebrow">{isRegister ? 'A FRESH PAGE' : 'GOOD TO SEE YOU'}</span><h1>{isRegister ? 'Make it yours.' : 'Welcome back.'}</h1><p>{isRegister ? 'Create your account and get those thoughts out of your head.' : 'Pick up right where your thoughts left off.'}</p></div>
    <form onSubmit={submit} noValidate>
      {isRegister && <div className="form-field"><label htmlFor="name">Your name</label><input autoComplete="name" id="name" name="name" value={values.name} onChange={change} placeholder="Jamie Parker" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'name-error' : undefined} />{errors.name && <small id="name-error" className="field-error">{errors.name}</small>}</div>}
      <div className="form-field"><label htmlFor="email">Email address</label><input autoComplete="email" type="email" id="email" name="email" value={values.email} onChange={change} placeholder="you@example.com" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} />{errors.email && <small id="email-error" className="field-error">{errors.email}</small>}</div>
      <div className="form-field"><label htmlFor="password">Password</label><div className="password-wrap"><input autoComplete={isRegister ? 'new-password' : 'current-password'} type={showPassword ? 'text' : 'password'} id="password" name="password" value={values.password} onChange={change} placeholder="At least 8 characters" aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'password-error' : undefined} /><button type="button" className="password-toggle" onClick={() => setShowPassword((show) => !show)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>{errors.password && <small id="password-error" className="field-error">{errors.password}</small>}</div>
      {isRegister && <div className="form-field"><label htmlFor="confirmPassword">Confirm password</label><input autoComplete="new-password" type={showPassword ? 'text' : 'password'} id="confirmPassword" name="confirmPassword" value={values.confirmPassword} onChange={change} placeholder="Enter your password again" aria-invalid={Boolean(errors.confirmPassword)} aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined} />{errors.confirmPassword && <small id="confirm-error" className="field-error">{errors.confirmPassword}</small>}</div>}
      {formError && <p className="form-error" role="alert">{formError}</p>}
      <button type="submit" className="button button-primary auth-submit" disabled={submitting || loading}>{submitting ? 'One moment…' : isRegister ? 'Create my account' : 'Log in'}</button>
    </form>
    <p className="auth-switch">{isRegister ? 'Already have an account?' : 'New to NotesFlow?'} <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Log in' : 'Create an account'}</Link></p>
    <div className="auth-privacy"><LockKeyhole size={14} /> Your thoughts stay private and yours alone.</div></div><Link to="/" className="auth-back">← Back to NotesFlow</Link></main>;
}
