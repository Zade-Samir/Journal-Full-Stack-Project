import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Archive } from './pages/Archive';
import { Analytics } from './pages/Analytics';
import { Completion } from './pages/Completion';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Landing } from './pages/Landing';
import { AppSettingsProvider } from './context/AppSettingsContext';
import { GlobalThemeToggle } from './components/GlobalThemeToggle';
import { ProtectedRoute } from './components/ProtectedRoute';
import { OAuthSuccess } from './pages/OAuthSuccess';

export default function App() {
  return (
    <AppSettingsProvider>
      <BrowserRouter>
        <GlobalThemeToggle />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/create" element={<Home />} />
              <Route path="/archive" element={<Archive />} />
              <Route path="/analytics" element={<Analytics />} />
            </Route>
            <Route path="/complete" element={<Completion />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />
        </Routes>
      </BrowserRouter>
    </AppSettingsProvider>
  );
}
