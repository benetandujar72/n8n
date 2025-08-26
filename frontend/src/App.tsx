import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import { useAuth } from '@/hooks/useAuth.tsx';
import { useWebSocket } from '@/hooks/useWebSocket';

// Layouts
import DashboardLayout from '@/components/layouts/DashboardLayout';

// Pàgines d'autenticació
import { LoginPage } from '@/pages/auth/LoginPage';

// Pàgines del dashboard
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { CentresPage } from '@/pages/centres/CentresPage';
import { CursosPage } from '@/pages/cursos/CursosPage';
import { UsuarisPage } from '@/pages/usuaris/UsuarisPage';
import { AssignaturesPage } from '@/pages/assignatures/AssignaturesPage';
import { AvaluacionsPage } from '@/pages/avaluacions/AvaluacionsPage';
import { IntegracionsPage } from '@/pages/integracions/IntegracionsPage';

// Components
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const App: React.FC = () => {
  const { isLoading, isAuthenticated } = useAuth();
  const { isConnected } = useWebSocket();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Adeptify Admin - Sistema d'Administració</title>
        <meta name="description" content="Sistema d'administració per a la plataforma educativa Adeptify" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </Helmet>

      <Routes>
        {/* Rutes públiques */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Rutes protegides */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />

          {/* Gestió de Centres */}
          <Route path="centres" element={<CentresPage />} />

          {/* Gestió de Cursos */}
          <Route path="cursos" element={<CursosPage />} />

          {/* Gestió d'Usuaris */}
          <Route path="usuaris" element={<UsuarisPage />} />

          {/* Gestió d'Assignatures */}
          <Route path="assignatures" element={<AssignaturesPage />} />

          {/* Gestió d'Avaluacions */}
          <Route path="avaluacions" element={<AvaluacionsPage />} />

          {/* Integracions */}
          <Route path="integracions" element={<IntegracionsPage />} />
        </Route>

        {/* Ruta per defecte */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Indicador de connexió WebSocket */}
      {!isConnected && isAuthenticated && (
        <div className="fixed bottom-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Reconnectant...</span>
          </div>
        </div>
      )}
    </>
  );
};

export default App;
