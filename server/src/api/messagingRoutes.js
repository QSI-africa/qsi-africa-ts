const express = require("express");
const prisma = require("../config/prisma");
const router = express.Router();

// Helper to get conversation title based on type and participants
const getConversationTitle = (conversation, currentUserId) => {
  if (conversation.title) return conversation.title;
  
  if (conversation.type === 'OPERATOR') {
    const otherParticipant = conversation.participants.find(p => p.userId !== currentUserId);
    return otherParticipant ? otherParticipant.user.name : 'Operator';
  }
  
  return 'New Discussion';
};

// 1. Get all conversations for a user
router.get("/conversations", async (req, res) => {
  const { userId } = req.query; // In a real app, this would come from auth middleware (req.user.id)

  if (!userId) {
    return res.status(400).json({ error: "User ID is required." });
  }

  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    const formattedConversations = conversations.map(conv => ({
      id: conv.id,
      title: getConversationTitle(conv, userId),
      type: conv.type,
      status: conv.status,
      lastMessage: conv.messages[0]?.text || 'No messages yet',
      timestamp: conv.messages[0]?.createdAt || conv.updatedAt,
      unreadCount: 0, // Placeholder, would need a MessageReceipt model or similar
      participants: conv.participants.map(p => p.user)
    }));

    res.json(formattedConversations);
  } catch (error) {
    console.error("Fetch conversations error:", error);
    res.status(500).json({ error: "Failed to fetch conversations." });
  }
});

// 2. Get messages for a specific conversation
router.get("/conversations/:id/messages", async (req, res) => {
  const { id } = req.params;

  try {
    const messages = await prisma.message.findMany({
      where: {
        conversationId: id
      },
      orderBy: {
        createdAt: 'asc'
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.json(messages);
  } catch (error) {
    console.error("Fetch messages error:", error);
    res.status(500).json({ error: "Failed to fetch messages." });
  }
});

// 3. Send a message in a conversation
router.post("/conversations/:id/messages", async (req, res) => {
  const { id } = req.params;
  const { senderId, text, senderType } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Message text is required." });
  }

  try {
    const message = await prisma.message.create({
      data: {
        conversationId: id,
        senderId: senderId || null,
        senderType: senderType || "USER",
        text: text
      }
    });

    // Update conversation updatedAt timestamp
    await prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() }
    });

    // Optional: Emit socket event for real-time update
    const io = req.app.get("io");
    if (io) {
      io.to(id).emit("new_message", message);
    }

    res.status(201).json(message);
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ error: "Failed to send message." });
  }
});

// 4. Create a new conversation (e.g., when starting a project discussion)
router.post("/conversations", async (req, res) => {
  const { title, type, participantIds, firstMessage } = req.body;

  if (!participantIds || !Array.isArray(participantIds)) {
    return res.status(400).json({ error: "Participant IDs are required." });
  }

  try {
    const conversation = await prisma.conversation.create({
      data: {
        title,
        type: type || "GENERAL",
        participants: {
          create: participantIds.map(userId => ({
            userId: userId
          }))
        }
      }
    });

    if (firstMessage) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: firstMessage.senderId || null,
          senderType: firstMessage.senderType || "SYSTEM",
          text: firstMessage.text
        }
      });
    }

    res.status(201).json(conversation);
  } catch (error) {
    console.error("Create conversation error:", error);
    res.status(500).json({ error: "Failed to create conversation." });
  }
});

module.exports = router;
