import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext.jsx';
import { AuthPage } from '../pages/AuthPage.jsx';
import { ProtectedRoute } from '../routes/ProtectedRoute.jsx';
import { NoteCard } from '../components/notes/NoteCard.jsx';
import { NoteEditor } from '../components/notes/NoteEditor.jsx';
import { NotesView } from '../components/notes/NotesView.jsx';
import { authService } from '../services/authService.js';

vi.mock('../services/authService.js', () => ({
  authService: { me: vi.fn(), login: vi.fn(), register: vi.fn(), logout: vi.fn() },
}));

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe('authentication forms and route protection', () => {
  it('validates login email and password before submitting', async () => {
    authService.me.mockRejectedValue(new Error('no session'));
    const user = userEvent.setup();
    render(<MemoryRouter><AuthProvider><AuthPage mode="login" /></AuthProvider></MemoryRouter>);
    await user.type(screen.getByLabelText('Email address'), 'not-an-email');
    await user.type(screen.getByLabelText('Password'), 'short');
    await user.click(screen.getByRole('button', { name: 'Log in' }));
    expect(await screen.findByText('Enter a valid email address.')).toBeInTheDocument();
    expect(screen.getByText('Use at least 8 characters.')).toBeInTheDocument();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('validates registration confirmation and shows API errors', async () => {
    authService.me.mockRejectedValue(new Error('no session'));
    const user = userEvent.setup();
    render(<MemoryRouter><AuthProvider><AuthPage mode="register" /></AuthProvider></MemoryRouter>);
    await user.type(screen.getByLabelText('Your name'), 'Jamie Parker');
    await user.type(screen.getByLabelText('Email address'), 'jamie@example.com');
    await user.type(screen.getByLabelText('Password'), 'a-strong-password');
    await user.type(screen.getByLabelText('Confirm password'), 'a-different-password');
    await user.click(screen.getByRole('button', { name: 'Create my account' }));
    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument();

    await user.clear(screen.getByLabelText('Confirm password'));
    await user.type(screen.getByLabelText('Confirm password'), 'a-strong-password');
    authService.register.mockRejectedValue({ response: { data: { message: 'Email is already registered' } } });
    await user.click(screen.getByRole('button', { name: 'Create my account' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Email is already registered');
  });

  it('redirects unauthenticated visitors away from protected pages', async () => {
    authService.me.mockRejectedValue(new Error('no session'));
    render(<MemoryRouter initialEntries={['/app']}><AuthProvider><Routes><Route element={<ProtectedRoute />}><Route path="/app" element={<div>Private notes</div>} /></Route><Route path="/login" element={<div>Login screen</div>} /></Routes></AuthProvider></MemoryRouter>);
    expect(await screen.findByText('Login screen')).toBeInTheDocument();
    expect(screen.queryByText('Private notes')).not.toBeInTheDocument();
  });
});

describe('note components', () => {
  const note = { _id: 'one', title: 'Plan a garden', content: 'Mint, basil, and tomatoes', color: 'mint', tags: ['home'], isPinned: true, updatedAt: '2026-01-02T00:00:00.000Z' };

  it('renders note content and actions', () => {
    render(<NoteCard note={note} onEdit={vi.fn()} onPin={vi.fn()} onArchive={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Plan a garden' })).toBeInTheDocument();
    expect(screen.getByText('Mint, basil, and tomatoes')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Unpin note' })).toBeInTheDocument();
  });

  it('submits a new note with normalized tags', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<NoteEditor onClose={vi.fn()} onSave={onSave} />);
    await user.type(screen.getByLabelText('Title'), '  A small idea ');
    await user.type(screen.getByLabelText('Your thoughts'), '  Keep a notebook by the door ');
    await user.type(screen.getByLabelText(/Tags/), ' Ideas, home, ideas ');
    await user.click(screen.getByRole('button', { name: 'Save note' }));
    expect(onSave).toHaveBeenCalledWith({ title: 'A small idea', content: 'Keep a notebook by the door', color: 'paper', tags: ['ideas', 'home'] });
  });

  it('shows loading and empty states clearly', () => {
    const props = { notes: [], loading: true, error: '', archived: false, search: '', onSearch: vi.fn(), onCreate: vi.fn(), onEdit: vi.fn(), onPin: vi.fn(), onArchive: vi.fn(), onDelete: vi.fn(), page: 1, totalPages: 0, onPage: vi.fn() };
    const { rerender } = render(<NotesView {...props} />);
    expect(screen.getByRole('status')).toHaveTextContent('Gathering your notes');
    rerender(<NotesView {...props} loading={false} />);
    expect(screen.getByRole('heading', { name: 'Start with a fresh page' })).toBeInTheDocument();
  });
});
