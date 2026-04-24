// server/src/services/videoSignaling.js
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "your-default-secret-change-me";

const setupVideoSignaling = (server) => {
  const io = new Server(server, {
    path: "/api/socket.io",
    cors: {
      origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "https://qsi.africa",
        "https://www.qsi.africa",
        "https://admin.qsi.africa",
      ],
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // --- Authentication Middleware ---
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    // If no token, allow connection but marked as guest (socket.user will be undefined)
    if (!token) {
      console.log(`[Socket.io] Guest connection established: ${socket.id}`);
      return next();
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = decoded; // Attach decoded user info to the socket
      console.log(`[Socket.io] User ${decoded.userId || decoded.id} authenticated: ${socket.id}`);
      next();
    } catch (err) {
      console.error(`[Socket.io] Invalid token attempt from ${socket.id}:`, err.message);
      // Even with invalid token, we might want to allow them as a guest instead of rejecting?
      // For now, let's just let them in as a guest if the token is invalid but provided.
      // But it's safer to just proceed without setting socket.user.
      next();
    }
  });

  const activeBroadcasts = new Map();

  io.on("connection", (socket) => {
    console.log("Verified connection established:", socket.id);

    // --- Broadcasting Events ---
    socket.on("start-broadcast", (roomId, broadcastInfo) => {
      socket.join(roomId);
      activeBroadcasts.set(roomId, {
        broadcasterId: socket.id,
        broadcasterName: socket.user?.name || "Anonymous",
        title: broadcastInfo?.title || "Untitled Live",
        startTime: new Date().toISOString()
      });
      io.emit("broadcast-list-updated", Array.from(activeBroadcasts.values()));
      console.log(`[Broadcast] Started: ${roomId} by ${socket.id}`);
    });

    socket.on("get-active-broadcasts", () => {
      socket.emit("broadcast-list-updated", Array.from(activeBroadcasts.values()));
    });

    socket.on("stop-broadcast", (roomId) => {
      const broadcast = activeBroadcasts.get(roomId);
      if (broadcast && broadcast.broadcasterId === socket.id) {
        activeBroadcasts.delete(roomId);
        io.emit("broadcast-list-updated", Array.from(activeBroadcasts.values()));
        console.log(`[Broadcast] Stopped: ${roomId}`);
      }
    });

    // --- WebRTC signaling for viewers ---
    socket.on("request-join-broadcast", (roomId) => {
      console.log(`[Viewer] Requesting join for broadcast: ${roomId} from ${socket.id}`);
      const broadcast = activeBroadcasts.get(roomId);
      if (broadcast) {
        console.log(`[Viewer] Found broadcast. Notifying broadcaster: ${broadcast.broadcasterId}`);
        socket.join(roomId);
        io.to(broadcast.broadcasterId).emit("viewer-joined", { 
          viewerId: socket.id, 
          viewerName: socket.user?.name || "Guest",
          roomId 
        });
      } else {
        console.log(`[Viewer] Broadcast not found: ${roomId}. Active IDs:`, Array.from(activeBroadcasts.keys()));
      }
    });

    // --- Chat Messaging ---
    socket.on("send-chat-message", (payload) => {
      const { roomId, message } = payload;
      const timestamp = new Date().toISOString();
      
      // Inject server-verified identity
      io.to(roomId).emit("receive-chat-message", {
        message,
        senderName: socket.user?.name || "Participant",
        senderId: socket.id,
        timestamp
      });
    });

    socket.on("disconnect", () => {
      // Cleanup any broadcasts hosted by this socket
      let wasBroadcasting = false;
      for (const [roomId, broadcast] of activeBroadcasts.entries()) {
        if (broadcast.broadcasterId === socket.id) {
          activeBroadcasts.delete(roomId);
          wasBroadcasting = true;
          console.log(`[Broadcast] Cleanup: ${roomId} removed due to broadcaster disconnect`);
        }
      }
      if (wasBroadcasting) {
        io.emit("broadcast-list-updated", Array.from(activeBroadcasts.values()));
      }
    });

    // --- Standard Room Joining ---
    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      console.log(`[Room] User ${socket.id} joined: ${roomId}`);
      
      // Notify others in the room
      socket.to(roomId).emit("user-connected", { 
        userId: socket.user?.userId || socket.user?.id, 
        socketId: socket.id 
      });
    });

    // --- Secure WebRTC Signaling Relay ---
    // We always override senderUserId with the actual socket.id for security
    socket.on("offer", (payload) => {
      if (payload.targetUserId) {
        io.to(payload.targetUserId).emit("offer", { ...payload, senderUserId: socket.id });
      } else if (payload.targetRoomId) {
        socket.to(payload.targetRoomId).emit("offer", { ...payload, senderUserId: socket.id });
      }
    });

    socket.on("answer", (payload) => {
      if (payload.targetUserId) {
        io.to(payload.targetUserId).emit("answer", { ...payload, senderUserId: socket.id });
      } else if (payload.targetRoomId) {
        socket.to(payload.targetRoomId).emit("answer", { ...payload, senderUserId: socket.id });
      }
    });

    socket.on("ice-candidate", (payload) => {
      let targetId = payload.targetUserId;
      
      // Resolve 'broadcaster' shorthand
      if (targetId === "broadcaster" && payload.roomId) {
        const broadcast = activeBroadcasts.get(payload.roomId);
        if (broadcast) targetId = broadcast.broadcasterId;
      }

      if (targetId) {
        io.to(targetId).emit("ice-candidate", { ...payload, senderUserId: socket.id });
      } else if (payload.targetRoomId) {
        socket.to(payload.targetRoomId).emit("ice-candidate", { ...payload, senderUserId: socket.id });
      }
    });
  });

  return io;
};

module.exports = setupVideoSignaling;
