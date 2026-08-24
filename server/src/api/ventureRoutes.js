// server/src/api/ventureRoutes.js
const express = require("express");
const prisma = require("../config/prisma");
const { authMiddleware } = require("../middleware/authMiddleware");
const { uploadFields } = require("../middleware/uploadMiddleware");

const router = express.Router();

// Helper: slugify a string
const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");

// Middleware: Admin/SuperUser only
const isAdminOrSuper = (req, res, next) => {
  if (req.user.role !== "ADMIN" && req.user.role !== "SUPER_USER") {
    return res.status(403).json({ error: "Forbidden: Admin privileges required." });
  }
  next();
};

// =========================================================================
// PUBLIC ENDPOINTS
// =========================================================================

// GET /api/ventures — List all active ventures (for sidebar)
router.get("/", async (req, res) => {
  try {
    const ventures = await prisma.venture.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        shortDescription: true,
        logoUrl: true,
        bannerUrl: true,
        isActive: true,
      },
    });
    res.json(ventures);
  } catch (error) {
    console.error("Failed to fetch ventures:", error);
    res.status(500).json({ error: "Failed to fetch ventures." });
  }
});

// GET /api/ventures/:idOrSlug — Get venture profile with posts & engagement types
router.get("/:idOrSlug", async (req, res) => {
  const { idOrSlug } = req.params;

  try {
    // Try to find by slug first, then by id
    let venture = await prisma.venture.findUnique({
      where: { slug: idOrSlug },
      include: {
        engagementTypes: {
          where: { isActive: true },
          orderBy: { order: "asc" },
        },
        panxPosts: {
          orderBy: { createdAt: "desc" },
          include: {
            author: { select: { id: true, name: true, role: true } },
            likes: true,
            reposts: true,
            bookmarks: true,
            replies: {
              include: { author: { select: { id: true, name: true } } },
              orderBy: { createdAt: 'desc' }
            }
          }
        },
        _count: {
          select: { engagements: true },
        },
      },
    });

    if (!venture) {
      venture = await prisma.venture.findUnique({
        where: { id: idOrSlug },
        include: {
          engagementTypes: {
            where: { isActive: true },
            orderBy: { order: "asc" },
          },
          panxPosts: {
            orderBy: { createdAt: "desc" },
            include: {
              author: { select: { id: true, name: true, role: true } },
              likes: true,
              reposts: true,
              bookmarks: true,
              replies: {
                include: { author: { select: { id: true, name: true } } },
                orderBy: { createdAt: 'desc' }
              }
            }
          },
          _count: {
            select: { engagements: true },
          },
        },
      });
    }

    if (!venture) {
      return res.status(404).json({ error: "Venture not found." });
    }

    const responseVenture = {
      ...venture,
      posts: venture.panxPosts || [],
    };
    delete responseVenture.panxPosts;

    res.json(responseVenture);
  } catch (error) {
    console.error("Failed to fetch venture:", error);
    res.status(500).json({ error: "Failed to fetch venture." });
  }
});

// =========================================================================
// AUTHENTICATED USER ENDPOINTS
// =========================================================================

// POST /api/ventures/:id/engage — Submit an engagement
router.post("/:id/engage", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { engagementType, contactName, contactEmail, contactPhone, message } = req.body;

  if (!engagementType || !contactName || !contactEmail) {
    return res.status(400).json({ error: "Engagement type, name, and email are required." });
  }

  try {
    const venture = await prisma.venture.findUnique({ where: { id } });
    if (!venture) {
      return res.status(404).json({ error: "Venture not found." });
    }

    const engagement = await prisma.ventureEngagement.create({
      data: {
        ventureId: id,
        engagementType,
        contactName,
        contactEmail,
        contactPhone,
        message,
        userId: req.user?.id || null,
      },
    });

    res.status(201).json(engagement);
  } catch (error) {
    console.error("Failed to create engagement:", error);
    res.status(500).json({ error: "Failed to submit engagement." });
  }
});

// =========================================================================
// ADMIN ENDPOINTS
// =========================================================================

// GET /api/ventures/admin/all — List ALL ventures including hidden ones
router.get("/admin/all", authMiddleware, isAdminOrSuper, async (req, res) => {
  try {
    const ventures = await prisma.venture.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        shortDescription: true,
        logoUrl: true,
        bannerUrl: true,
        isActive: true,
      },
    });
    res.json(ventures);
  } catch (error) {
    console.error("Failed to fetch all ventures for admin:", error);
    res.status(500).json({ error: "Failed to fetch ventures." });
  }
});

// POST /api/ventures — Create a new venture
router.post("/", authMiddleware, isAdminOrSuper, uploadFields([{ name: 'logo', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), async (req, res) => {
  let { name, shortDescription, fullDescription, isActive } = req.body;
  
  if (name) {
    name = name.charAt(0).toUpperCase() + name.slice(1);
  }
  let { bannerUrl, logoUrl } = req.body; // In case they are passed as strings

  if (req.files?.logo?.[0]) logoUrl = `/uploads/${req.files.logo[0].filename}`;
  if (req.files?.banner?.[0]) bannerUrl = `/uploads/${req.files.banner[0].filename}`;

  if (!name || !shortDescription) {
    return res.status(400).json({ error: "Name and short description are required." });
  }

  try {
    let slug = slugify(name);
    // Ensure uniqueness
    const existing = await prisma.venture.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const venture = await prisma.venture.create({
      data: {
        name,
        slug,
        shortDescription,
        fullDescription,
        bannerUrl: bannerUrl || null,
        logoUrl: logoUrl || null,
        isActive: isActive !== undefined ? String(isActive) === 'true' : true,
      },
    });

    res.status(201).json(venture);
  } catch (error) {
    console.error("Failed to create venture:", error);
    res.status(500).json({ error: "Failed to create venture." });
  }
});

// PUT /api/ventures/:id — Update venture details
router.put("/:id", authMiddleware, isAdminOrSuper, uploadFields([{ name: 'logo', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), async (req, res) => {
  const { id } = req.params;
  let { name, shortDescription, fullDescription, isActive } = req.body;
  let { bannerUrl, logoUrl } = req.body;

  if (name) {
    name = name.charAt(0).toUpperCase() + name.slice(1);
  }

  if (req.files?.logo?.[0]) logoUrl = `/uploads/${req.files.logo[0].filename}`;
  if (req.files?.banner?.[0]) bannerUrl = `/uploads/${req.files.banner[0].filename}`;

  try {
    const dataToUpdate = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (shortDescription !== undefined) dataToUpdate.shortDescription = shortDescription;
    if (fullDescription !== undefined) dataToUpdate.fullDescription = fullDescription;
    if (bannerUrl !== undefined) dataToUpdate.bannerUrl = bannerUrl;
    if (logoUrl !== undefined) dataToUpdate.logoUrl = logoUrl;
    if (isActive !== undefined) dataToUpdate.isActive = String(isActive) === 'true';

    // If name changed, update slug too
    if (name) {
      let slug = slugify(name);
      const existing = await prisma.venture.findFirst({ where: { slug, NOT: { id } } });
      if (existing) slug = `${slug}-${Date.now().toString(36)}`;
      dataToUpdate.slug = slug;
    }

    const venture = await prisma.venture.update({
      where: { id },
      data: dataToUpdate,
    });

    res.json(venture);
  } catch (error) {
    if (error.code === "P2025") return res.status(404).json({ error: "Venture not found." });
    console.error("Failed to update venture:", error);
    res.status(500).json({ error: "Failed to update venture." });
  }
});

// DELETE /api/ventures/:id — Delete a venture
router.delete("/:id", authMiddleware, isAdminOrSuper, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.venture.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") return res.status(404).json({ error: "Venture not found." });
    console.error("Failed to delete venture:", error);
    res.status(500).json({ error: "Failed to delete venture." });
  }
});

// =========================================================================
// VENTURE POSTS (Admin)
// =========================================================================

// POST /api/ventures/:id/posts — Post content for a venture
router.post("/:id/posts", authMiddleware, isAdminOrSuper, uploadFields([{ name: 'images', maxCount: 10 }, { name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  let { imageUrl, videoUrl } = req.body;

  let mediaFiles = [];
  if (req.files?.images?.length) {
    mediaFiles = req.files.images.map(f => ({ url: `/uploads/${f.filename}`, type: 'IMAGE' }));
  } else if (req.files?.image?.[0]) {
    mediaFiles = [{ url: `/uploads/${req.files.image[0].filename}`, type: 'IMAGE' }];
  }

  if (req.files?.video?.[0]) {
    const vUrl = `/uploads/${req.files.video[0].filename}`;
    videoUrl = vUrl;
    mediaFiles.push({ url: vUrl, type: 'VIDEO' });
  }

  if (!imageUrl && mediaFiles.length > 0) {
    const firstImg = mediaFiles.find(m => m.type === 'IMAGE');
    if (firstImg) imageUrl = firstImg.url;
  }

  if (!content && mediaFiles.length === 0) {
    return res.status(400).json({ error: "Content or media is required." });
  }

  try {
    const post = await prisma.panxPost.create({
      data: {
        ventureId: id,
        authorId: req.user.id,
        content: content || '',
        imageUrl: imageUrl || null,
        videoUrl: videoUrl || null,
        mediaFiles: mediaFiles.length ? mediaFiles : null,
      },
    });
    res.status(201).json(post);
  } catch (error) {
    console.error("Failed to create venture post:", error);
    res.status(500).json({ error: "Failed to create post." });
  }
});

// DELETE /api/ventures/:id/posts/:postId — Delete a venture post
router.delete("/:id/posts/:postId", authMiddleware, isAdminOrSuper, async (req, res) => {
  const { postId } = req.params;
  try {
    await prisma.panxPost.delete({ where: { id: postId } });
    res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") return res.status(404).json({ error: "Post not found." });
    console.error("Failed to delete venture post:", error);
    res.status(500).json({ error: "Failed to delete post." });
  }
});

// =========================================================================
// ENGAGEMENT TYPES (Admin)
// =========================================================================

// POST /api/ventures/:id/engagement-types — Add an engagement type
router.post("/:id/engagement-types", authMiddleware, isAdminOrSuper, async (req, res) => {
  const { id } = req.params;
  const { label, icon, order, isActive } = req.body;

  if (!label) {
    return res.status(400).json({ error: "Label is required." });
  }

  try {
    const engType = await prisma.ventureEngagementType.create({
      data: {
        ventureId: id,
        label,
        icon,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });
    res.status(201).json(engType);
  } catch (error) {
    console.error("Failed to create engagement type:", error);
    res.status(500).json({ error: "Failed to create engagement type." });
  }
});

// PUT /api/ventures/:id/engagement-types/:typeId — Update an engagement type
router.put("/:id/engagement-types/:typeId", authMiddleware, isAdminOrSuper, async (req, res) => {
  const { typeId } = req.params;
  const { label, icon, order, isActive } = req.body;

  try {
    const updated = await prisma.ventureEngagementType.update({
      where: { id: typeId },
      data: { label, icon, order, isActive },
    });
    res.json(updated);
  } catch (error) {
    if (error.code === "P2025") return res.status(404).json({ error: "Engagement type not found." });
    console.error("Failed to update engagement type:", error);
    res.status(500).json({ error: "Failed to update engagement type." });
  }
});

// DELETE /api/ventures/:id/engagement-types/:typeId — Delete an engagement type
router.delete("/:id/engagement-types/:typeId", authMiddleware, isAdminOrSuper, async (req, res) => {
  const { typeId } = req.params;
  try {
    await prisma.ventureEngagementType.delete({ where: { id: typeId } });
    res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") return res.status(404).json({ error: "Engagement type not found." });
    console.error("Failed to delete engagement type:", error);
    res.status(500).json({ error: "Failed to delete engagement type." });
  }
});

// =========================================================================
// ENGAGEMENTS INBOX (Admin)
// =========================================================================

// GET /api/ventures/:id/engagements — List all engagements for a venture
router.get("/:id/engagements", authMiddleware, isAdminOrSuper, async (req, res) => {
  const { id } = req.params;
  const { status } = req.query;

  try {
    const where = { ventureId: id };
    if (status) where.status = status;

    const engagements = await prisma.ventureEngagement.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    res.json(engagements);
  } catch (error) {
    console.error("Failed to fetch engagements:", error);
    res.status(500).json({ error: "Failed to fetch engagements." });
  }
});

// PATCH /api/ventures/:id/engagements/:engId — Update engagement status
router.patch("/:id/engagements/:engId", authMiddleware, isAdminOrSuper, async (req, res) => {
  const { engId } = req.params;
  const { status } = req.body;

  if (!["PENDING", "REVIEWED", "ARCHIVED"].includes(status)) {
    return res.status(400).json({ error: "Invalid status. Must be PENDING, REVIEWED, or ARCHIVED." });
  }

  try {
    const updated = await prisma.ventureEngagement.update({
      where: { id: engId },
      data: { status },
    });
    res.json(updated);
  } catch (error) {
    if (error.code === "P2025") return res.status(404).json({ error: "Engagement not found." });
    console.error("Failed to update engagement status:", error);
    res.status(500).json({ error: "Failed to update engagement." });
  }
});

module.exports = router;
