import { Navigate, Route, Routes } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage.jsx';
import { AuthPage } from './pages/AuthPage.jsx';
import { NotesPage } from './pages/NotesPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';
import { ProtectedRoute } from './routes/ProtectedRoute.jsx';

export default function App() {
  return <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<AuthPage mode="login" />} />
    <Route path="/register" element={<AuthPage mode="register" />} />
    <Route element={<ProtectedRoute />}>
      <Route path="/app" element={<NotesPage />} />
      <Route path="/app/archive" element={<NotesPage archived />} />
    </Route>
    <Route path="/dashboard" element={<Navigate to="/app" replace />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>;
}
