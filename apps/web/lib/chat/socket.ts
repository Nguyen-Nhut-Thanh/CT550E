import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let currentToken: string | null = null;

export const getSocket = (token: string) => {
  if(!socket || currentToken !== token) {
    if(socket) {
      socket.disconnect();
    }

    currentToken = token;
    socket = io("/chat", {
      path: "/api/socket.io",
      addTrailingSlash: false,
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  currentToken = null;
  if(socket) {
    socket.disconnect();
    socket = null;
  }
};
