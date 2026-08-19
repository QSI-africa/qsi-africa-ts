// server/src/services/videoSignaling.js
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
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
      // Even with invalid token, proceed as guest
      next();
    }
  });

  const activeBroadcasts = new Map();

  io.on("connection", (socket) => {
    console.log("Verified connection established:", socket.id);

    // Auto-join user room if authenticated
    if (socket.user) {
      const userId = socket.user.userId || socket.user.id;
      socket.join(`user_${userId}`);
      console.log(`[Socket.io] User ${userId} joined room user_${userId}`);
    }

    socket.on("join-user-room", (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
        console.log(`[Socket.io] Socket ${socket.id} explicitly joined user_${userId}`);
      }
    });

    // --- Broadcasting Events ---
    socket.on("start-broadcast", async (roomId, broadcastInfo) => {
      if (!socket.user) {
        socket.emit("broadcast-error", { roomId, message: "Authentication required to start a broadcast." });
        return;
      }

      const userId = socket.user.userId || socket.user.id;

      try {
        let channel = await prisma.tvChannel.findUnique({
          where: { userId }
        });

        if (!channel || channel.status !== "APPROVED") {
          socket.emit("broadcast-error", { roomId, message: "You need an approved channel to broadcast. Please request one from My Channel Studio." });
          return;
        }

        socket.join(roomId);
        activeBroadcasts.set(roomId, {
          roomId,
          broadcasterId: socket.id,
          broadcasterUserId: userId,
          broadcasterName: socket.user?.name || "Anonymous",
          title: broadcastInfo?.title || "Untitled Live",
          isPrivate: !!broadcastInfo?.isPrivate,
          startTime: new Date().toISOString()
        });

        console.log(`[Broadcast] Registered on server: ${roomId} (Private: ${!!broadcastInfo?.isPrivate}, Broadcaster: ${socket.id})`);
        io.emit("broadcast-list-updated", Array.from(activeBroadcasts.values()));
      } catch (error) {
        console.error("Error checking channel for broadcast:", error);
        socket.emit("broadcast-error", { roomId, message: "Failed to verify channel approval." });
      }
    });

    socket.on("get-active-broadcasts", () => {
      socket.emit("broadcast-list-updated", Array.from(activeBroadcasts.values()));
    });

    socket.on("stop-broadcast", (roomId) => {
      const broadcast = activeBroadcasts.get(roomId);
      if (broadcast && broadcast.broadcasterId === socket.id) {
        activeBroadcasts.delete(roomId);
        io.to(roomId).emit("broadcast-ended", { roomId }); // Notify specifically
        io.emit("broadcast-list-updated", Array.from(activeBroadcasts.values()));
        console.log(`[Broadcast] Stopped and room notified: ${roomId}`);
      }
    });

    // --- WebRTC signaling for viewers ---
    socket.on("request-join-broadcast", async (roomId) => {
      console.log(`[Viewer] Requesting join for broadcast: ${roomId} from ${socket.id}`);
      const broadcast = activeBroadcasts.get(roomId);
      
      if (broadcast) {
        // Check private broadcast permissions
        if (broadcast.isPrivate) {
          if (!socket.user) {
            console.log(`[Viewer] Denied join to private broadcast ${roomId}: Guest not authenticated`);
            socket.emit("join-error", { roomId, message: "Authentication required to join private broadcast." });
            return;
          }

          const viewerUserId = socket.user.userId || socket.user.id;
          const broadcasterUserId = broadcast.broadcasterUserId;

          // Channel owner is always allowed to join their own broadcast
          if (viewerUserId !== broadcasterUserId) {
            try {
              const channel = await prisma.tvChannel.findUnique({
                where: { userId: broadcasterUserId }
              });

              if (!channel) {
                console.log(`[Viewer] Denied join: Broadcaster channel not found for userId ${broadcasterUserId}`);
                socket.emit("join-error", { roomId, message: "Broadcaster channel not found." });
                return;
              }

              const sub = await prisma.tvSubscription.findUnique({
                where: {
                  subscriberId_channelId: {
                    subscriberId: viewerUserId,
                    channelId: channel.id
                  }
                }
              });

              if (!sub) {
                console.log(`[Viewer] Denied join: User ${viewerUserId} is not subscribed to channel ${channel.id}`);
                socket.emit("join-error", { roomId, message: "Locked. You must subscribe to this channel to watch this broadcast." });
                return;
              }
            } catch (error) {
              console.error("Error validating subscription during join:", error);
              socket.emit("join-error", { roomId, message: "Failed to verify subscription status." });
              return;
            }
          }
        }

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

    socket.on("leave-broadcast", (roomId) => {
      socket.leave(roomId);
      console.log(`[Viewer] Left broadcast: ${roomId} from ${socket.id}`);
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

    socket.on("disconnecting", () => {
      // Cleanup any broadcasts hosted by this socket
      let wasBroadcasting = false;
      for (const [roomId, broadcast] of activeBroadcasts.entries()) {
        if (broadcast.broadcasterId === socket.id) {
          activeBroadcasts.delete(roomId);
          wasBroadcasting = true;
          io.to(roomId).emit("broadcast-ended", { roomId });
          console.log(`[Broadcast] Cleanup: ${roomId} removed and room notified due to broadcaster disconnect`);
        }
      }
      if (wasBroadcasting) {
        io.emit("broadcast-list-updated", Array.from(activeBroadcasts.values()));
      }
      
      // Notify rooms participant was in
      socket.rooms.forEach(room => {
        if (room !== socket.id) {
          socket.to(room).emit("user-disconnected", { socketId: socket.id });
        }
      });
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
