import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './screens/Dashboard';
import Requirements from './screens/Requirements';
import Upload from './screens/Upload';
import MatchResults from './screens/MatchResults';
import CandidateDetails from './screens/CandidateDetails';
import TalentPool from './screens/TalentPool';
import Pipeline from './screens/Pipeline';
import Reports from './screens/Reports';
import Settings from './screens/Settings';
import Login from './screens/Login';
import { AppProvider, useAppContext } from './context/AppContext';

function AppRoutes() {
  const { user } = useAppContext();

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/requirements" element={<Requirements />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/match-results" element={<MatchResults />} />
        <Route path="/candidate-details/:id" element={<CandidateDetails />} />
        <Route path="/candidate-details" element={<CandidateDetails />} />
        <Route path="/talent-pool" element={<TalentPool />} />
        <Route path="/pipeline" element={<Pipeline />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
