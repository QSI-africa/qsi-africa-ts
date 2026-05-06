const prisma = require("../config/prisma");

/**
 * Creates a conversation and an initial message.
 * Useful for bridging AI module submissions into the unified Inbox.
 */
async function createSystemConversation({ userId, title, type, firstMessageText, metadata = {} }) {
  if (!userId) return null;

  try {
    // 1. Create Conversation with the user as a participant
    const conversation = await prisma.conversation.create({
      data: {
        title,
        type: type || "MODULE",
        participants: {
          create: [
            { userId: userId, role: "OWNER" }
          ]
        }
      }
    });

    // 2. Create the first message from the System/AI
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderType: "AI",
        text: firstMessageText,
        metadata: metadata
      }
    });

    return conversation;
  } catch (error) {
    console.error("[MessagingHelper] Failed to create conversation:", error);
    return null;
  }
}

module.exports = {
  createSystemConversation
};
