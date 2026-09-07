import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || (
  window.location.origin.includes('3000') ? 'http://localhost:5000' : window.location.origin
);

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true
});
