const express = require("express");
const router = express.Router();
const prisma = require("../config/prisma");
const { authMiddleware } = require("../middleware/authMiddleware");

// Apply auth middleware to all routes
router.use(authMiddleware);

// 1. Browse all approved channels with subscriber count
router.get("/channels", async (req, res) => {
  try {
    const channels = await prisma.tvChannel.findMany({
      where: {
        status: "APPROVED"
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            subscriptions: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    res.json(channels);
  } catch (error) {
    console.error("Failed to fetch channels:", error);
    res.status(500).json({ error: "Failed to fetch channels." });
  }
});

// 2. Get current user's own channel details
router.get("/channels/my-channel", async (req, res) => {
  try {
    const userId = req.user.id;
    let channel = await prisma.tvChannel.findUnique({
      where: { userId },
      include: {
        _count: {
          select: {
            subscriptions: true
          }
        },
        contents: {
          orderBy: { createdAt: "desc" }
        }
      }
    });

    res.json(channel);
  } catch (error) {
    console.error("Failed to fetch user channel:", error);
    res.status(500).json({ error: "Failed to fetch user channel." });
  }
});

// 3. View specific channel metadata
router.get("/channels/:channelId", async (req, res) => {
  const { channelId } = req.params;
  try {
    const channel = await prisma.tvChannel.findUnique({
      where: { id: channelId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            subscriptions: true
          }
        }
      }
    });

    if (!channel) {
      return res.status(404).json({ error: "Channel not found." });
    }

    res.json(channel);
  } catch (error) {
    console.error("Failed to fetch channel:", error);
    res.status(500).json({ error: "Failed to fetch channel." });
  }
});

// 4. Manually request/create a new channel (creates with status PENDING)
router.post("/channels/request", async (req, res) => {
  const { title, description } = req.body;
  const userId = req.user.id;

  if (!title || !description) {
    return res.status(400).json({ error: "Title and description are required." });
  }

  try {
    // Check if user already has a channel
    const existing = await prisma.tvChannel.findUnique({
      where: { userId }
    });

    if (existing) {
      return res.status(200).json(existing);
    }

    const channel = await prisma.tvChannel.create({
      data: {
        userId,
        title,
        description,
        status: "PENDING"
      }
    });

    res.status(201).json(channel);
  } catch (error) {
    console.error("Failed to request channel:", error);
    res.status(500).json({ error: "Failed to request channel." });
  }
});

// 5. Edit own channel details (title, description)
router.put("/channels/my-channel", async (req, res) => {
  const { title, description } = req.body;
  const userId = req.user.id;

  if (!title || !description) {
    return res.status(400).json({ error: "Title and description are required." });
  }

  try {
    const channel = await prisma.tvChannel.findUnique({
      where: { userId }
    });

    if (!channel) {
      return res.status(404).json({ error: "Channel not found." });
    }

    const updated = await prisma.tvChannel.update({
      where: { userId },
      data: {
        title,
        description
      }
    });

    res.json(updated);
  } catch (error) {
    console.error("Failed to update channel:", error);
    res.status(500).json({ error: "Failed to update channel." });
  }
});

// Delete own channel (useful if rejected and want to start over)
router.delete("/channels/my-channel", async (req, res) => {
  const userId = req.user.id;
  try {
    const channel = await prisma.tvChannel.findUnique({
      where: { userId }
    });

    if (!channel) {
      return res.status(404).json({ error: "Channel not found." });
    }

    await prisma.tvChannel.delete({
      where: { userId }
    });

    res.status(204).send();
  } catch (error) {
    console.error("Failed to delete channel:", error);
    res.status(500).json({ error: "Failed to delete channel." });
  }
});

// 6. Subscribe to an approved channel
router.post("/channels/:channelId/subscribe", async (req, res) => {
  const { channelId } = req.params;
  const subscriberId = req.user.id;

  try {
    // Verify target channel is approved
    const channel = await prisma.tvChannel.findUnique({
      where: { id: channelId }
    });

    if (!channel) {
      return res.status(404).json({ error: "Channel not found." });
    }

    if (channel.status !== "APPROVED") {
      return res.status(403).json({ error: "Cannot subscribe to a channel that is not approved." });
    }

    if (channel.userId === subscriberId) {
      return res.status(400).json({ error: "You cannot subscribe to your own channel." });
    }

    // Create subscription (ignore if already exists due to unique constraint or upsert)
    const subscription = await prisma.tvSubscription.upsert({
      where: {
        subscriberId_channelId: {
          subscriberId,
          channelId
        }
      },
      update: {},
      create: {
        subscriberId,
        channelId
      }
    });

    res.status(201).json(subscription);
  } catch (error) {
    console.error("Failed to subscribe:", error);
    res.status(500).json({ error: "Failed to subscribe." });
  }
});

// 7. Unsubscribe from a channel
router.post("/channels/:channelId/unsubscribe", async (req, res) => {
  const { channelId } = req.params;
  const subscriberId = req.user.id;

  try {
    await prisma.tvSubscription.delete({
      where: {
        subscriberId_channelId: {
          subscriberId,
          channelId
        }
      }
    });
    res.json({ message: "Successfully unsubscribed." });
  } catch (error) {
    // If it doesn't exist, we can treat it as success or return 404
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Subscription not found." });
    }
    console.error("Failed to unsubscribe:", error);
    res.status(500).json({ error: "Failed to unsubscribe." });
  }
});

// 8. Check current subscription status
router.get("/channels/:channelId/subscription-status", async (req, res) => {
  const { channelId } = req.params;
  const subscriberId = req.user.id;

  try {
    const sub = await prisma.tvSubscription.findUnique({
      where: {
        subscriberId_channelId: {
          subscriberId,
          channelId
        }
      }
    });
    res.json({ subscribed: !!sub });
  } catch (error) {
    console.error("Failed to check subscription status:", error);
    res.status(500).json({ error: "Failed to check subscription status." });
  }
});

// 9. List shared content for a channel (Gated: checks subscriber status or ownership)
router.get("/channels/:channelId/content", async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user.id;

  try {
    const channel = await prisma.tvChannel.findUnique({
      where: { id: channelId }
    });

    if (!channel) {
      return res.status(404).json({ error: "Channel not found." });
    }

    // Gated entry check: must be owner OR subscribed
    const isOwner = channel.userId === userId;
    let isSubscribed = false;

    if (!isOwner) {
      const sub = await prisma.tvSubscription.findUnique({
        where: {
          subscriberId_channelId: {
            subscriberId: userId,
            channelId
          }
        }
      });
      isSubscribed = !!sub;
    }

    if (!isOwner && !isSubscribed) {
      return res.status(403).json({ error: "Locked. You must subscribe to this channel to view its content." });
    }

    const contents = await prisma.tvContent.findMany({
      where: { channelId },
      orderBy: { createdAt: "desc" }
    });

    res.json(contents);
  } catch (error) {
    console.error("Failed to fetch channel content:", error);
    res.status(500).json({ error: "Failed to fetch channel content." });
  }
});

// 10. Publish a content item to own channel (allowed only if channel is APPROVED)
router.post("/channels/my-channel/content", async (req, res) => {
  const { title, description, mediaUrl, mimeType } = req.body;
  const userId = req.user.id;

  if (!title) {
    return res.status(400).json({ error: "Title is required." });
  }

  try {
    const channel = await prisma.tvChannel.findUnique({
      where: { userId }
    });

    if (!channel) {
      return res.status(404).json({ error: "You do not have a channel." });
    }

    if (channel.status !== "APPROVED") {
      return res.status(403).json({ error: "Cannot publish content to an unapproved channel." });
    }

    const content = await prisma.tvContent.create({
      data: {
        channelId: channel.id,
        title,
        description,
        mediaUrl,
        mimeType
      }
    });

    res.status(201).json(content);
  } catch (error) {
    console.error("Failed to publish content:", error);
    res.status(500).json({ error: "Failed to publish content." });
  }
});

// 10.5. Publish a text content item to own channel (with optional PanX cross-posting)
router.post("/channels/my-channel/text-content", async (req, res) => {
  const { title, textContent, crossPostToPanx } = req.body;
  const userId = req.user.id;

  if (!title || !textContent) {
    return res.status(400).json({ error: "Title and textContent are required." });
  }

  try {
    const channel = await prisma.tvChannel.findUnique({
      where: { userId }
    });

    if (!channel) {
      return res.status(404).json({ error: "You do not have a channel." });
    }

    if (channel.status !== "APPROVED") {
      return res.status(403).json({ error: "Cannot publish content to an unapproved channel." });
    }

    // Create the TV content
    const content = await prisma.tvContent.create({
      data: {
        channelId: channel.id,
        title,
        textContent,
        mimeType: "TEXT"
      }
    });

    // Cross-post to PanX if requested
    if (crossPostToPanx) {
      await prisma.panxPost.create({
        data: {
          content: textContent,
          authorId: userId,
          tvContentId: content.id
        }
      });
    }

    res.status(201).json(content);
  } catch (error) {
    console.error("Failed to publish text content:", error);
    res.status(500).json({ error: "Failed to publish text content." });
  }
});

// 10.6. Get a single content item
router.get("/channels/my-channel/content/:contentId", async (req, res) => {
  const { contentId } = req.params;
  const userId = req.user.id;

  try {
    const channel = await prisma.tvChannel.findUnique({
      where: { userId }
    });

    if (!channel) {
      return res.status(404).json({ error: "Channel not found." });
    }

    const content = await prisma.tvContent.findFirst({
      where: {
        id: contentId,
        channelId: channel.id
      }
    });

    if (!content) {
      return res.status(404).json({ error: "Content not found." });
    }

    res.json(content);
  } catch (error) {
    console.error("Failed to fetch content item:", error);
    res.status(500).json({ error: "Failed to fetch content item." });
  }
});

// 11. Delete a content item from own channel
router.delete("/channels/my-channel/content/:contentId", async (req, res) => {
  const { contentId } = req.params;
  const userId = req.user.id;

  try {
    const channel = await prisma.tvChannel.findUnique({
      where: { userId }
    });

    if (!channel) {
      return res.status(404).json({ error: "Channel not found." });
    }

    const content = await prisma.tvContent.findFirst({
      where: {
        id: contentId,
        channelId: channel.id
      }
    });

    if (!content) {
      return res.status(404).json({ error: "Content not found or not authorized to delete." });
    }

    await prisma.tvContent.delete({
      where: { id: contentId }
    });

    res.json({ message: "Content deleted successfully." });
  } catch (error) {
    console.error("Failed to delete content:", error);
    res.status(500).json({ error: "Failed to delete content." });
  }
});

module.exports = router;
