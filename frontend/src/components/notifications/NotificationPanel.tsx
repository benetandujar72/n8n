import React from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const { lastMessage, systemStatus } = useWebSocket();

  return (
    <div
      className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      aria-hidden={!isOpen}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Notificacions</h2>
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
            aria-label="Tancar"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Estat del sistema */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Estat del sistema</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 rounded-md p-3">
              <p className="text-gray-500">n8n</p>
              <p className={`font-medium ${systemStatus?.n8nStatus === 'online' ? 'text-green-600' : 'text-red-600'}`}>
                {systemStatus?.n8nStatus || 'Desconegut'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-md p-3">
              <p className="text-gray-500">Base de dades</p>
              <p className={`font-medium ${systemStatus?.databaseStatus === 'online' ? 'text-green-600' : 'text-red-600'}`}>
                {systemStatus?.databaseStatus || 'Desconegut'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-md p-3">
              <p className="text-gray-500">Darrer backup</p>
              <p className="font-medium text-gray-900">
                {systemStatus?.lastBackup || '—'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-md p-3">
              <p className="text-gray-500">Workflows actius</p>
              <p className="font-medium text-gray-900">
                {systemStatus?.activeWorkflows ?? '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Llista de notificacions recents (placeholder amb darrera) */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Recents</h3>

          {lastMessage ? (
            <div className="notification-item border-b border-gray-100">
              <div className="notification-icon">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary-100">
                  <svg className="h-5 w-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
              </div>
              <div className="notification-content">
                <p className="notification-title">{lastMessage.type}</p>
                <p className="notification-message truncate">{JSON.stringify(lastMessage.data)}</p>
                <p className="notification-time">{new Date(lastMessage.timestamp).toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Encara no hi ha notificacions recents.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;
