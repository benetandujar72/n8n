import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';

import { useAuth } from './useAuth';

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

interface NotificationMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  userId?: string;
  centreId?: string;
  cursId?: string;
  createdAt: string;
}

interface SystemStatusMessage {
  n8nStatus: 'online' | 'offline' | 'error';
  databaseStatus: 'online' | 'offline' | 'error';
  lastBackup: string;
  activeWorkflows: number;
  pendingEvaluations: number;
}

export const useWebSocket = () => {
  const { isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatusMessage | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!isAuthenticated || socketRef.current?.connected) return;

    setIsConnecting(true);

    const socket = io(import.meta.env.VITE_WS_URL || 'ws://localhost:3001', {
      auth: {
        token: localStorage.getItem('accessToken'),
      },
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: false, // Gestionem la reconnexió manualment
    });

    socket.on('connect', () => {
      console.log('WebSocket connectat');
      setIsConnected(true);
      setIsConnecting(false);
      reconnectAttemptsRef.current = 0;

      // Sol·licitar estat del sistema
      socket.emit('get-system-status');
    });

    socket.on('disconnect', (reason) => {
      console.log('WebSocket desconnectat:', reason);
      setIsConnected(false);
      setIsConnecting(false);

      if (reason === 'io server disconnect') {
        // El servidor ha tancat la connexió
        toast.error('Connexió amb el servidor perduda');
      }

      // Intentar reconnexió automàtica
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connect();
        }, delay);
      } else {
        toast.error('No s\'ha pogut reconectar amb el servidor');
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Error de connexió WebSocket:', error);
      setIsConnecting(false);
      toast.error('Error de connexió amb el servidor');
    });

    socket.on('notification', (notification: NotificationMessage) => {
      console.log('Nova notificació rebuda:', notification);

      // Mostrar notificació toast
      switch (notification.type) {
        case 'success':
          toast.success(notification.message, { id: notification.id });
          break;
        case 'error':
          toast.error(notification.message, { id: notification.id });
          break;
        case 'warning':
          toast(notification.message, {
            icon: '⚠️',
            id: notification.id
          });
          break;
        default:
          toast(notification.message, { id: notification.id });
      }

      setLastMessage({
        type: 'notification',
        data: notification,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('system-status', (status: SystemStatusMessage) => {
      console.log('Estat del sistema actualitzat:', status);
      setSystemStatus(status);

      setLastMessage({
        type: 'system-status',
        data: status,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('workflow-update', (data) => {
      console.log('Actualització de workflow:', data);
      setLastMessage({
        type: 'workflow-update',
        data,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('evaluation-complete', (data) => {
      console.log('Avaluació completada:', data);
      toast.success(`Avaluació completada per ${data.studentName}`);
      setLastMessage({
        type: 'evaluation-complete',
        data,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('backup-complete', (data) => {
      console.log('Backup completat:', data);
      toast.success('Backup completat correctament');
      setLastMessage({
        type: 'backup-complete',
        data,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('error', (error) => {
      console.error('Error WebSocket:', error);
      toast.error('Error de comunicació amb el servidor');
    });

    socketRef.current = socket;
  }, [isAuthenticated]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    reconnectAttemptsRef.current = 0;
  }, []);

  const sendMessage = useCallback((event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('WebSocket no connectat, no es pot enviar missatge');
    }
  }, []);

  const joinRoom = useCallback((room: string) => {
    sendMessage('join-room', { room });
  }, [sendMessage]);

  const leaveRoom = useCallback((room: string) => {
    sendMessage('leave-room', { room });
  }, [sendMessage]);

  // Efectes
  useEffect(() => {
    if (isAuthenticated) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, connect, disconnect]);

  // Cleanup al desmuntar
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    isConnecting,
    lastMessage,
    systemStatus,
    connect,
    disconnect,
    sendMessage,
    joinRoom,
    leaveRoom,
  };
};
