import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let currentToken: string | null = null;

const getBackendUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:4000";
  return url.replace(/\/+$/, "");
};

export const getSocket = (token: string) => {
  if (!socket || currentToken !== token) {
    if (socket) {
      socket.disconnect();
    }

    currentToken = token;
    socket = io(`${getBackendUrl()}/chat`, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      auth: { token },
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  currentToken = null;
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
