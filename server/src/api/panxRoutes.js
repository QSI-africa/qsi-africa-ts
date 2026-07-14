const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const { authMiddleware } = require("../middleware/authMiddleware");

const JWT_SECRET = process.env.JWT_SECRET || "your-default-secret-change-me";

// 1. Get all feed posts (Public, optional auth context)
router.get("/posts", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let userId = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.userId;
      } catch (err) {
        // Ignore invalid token, act as guest
      }
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [posts, totalPosts] = await Promise.all([
      prisma.panxPost.findMany({
        take: limit,
        skip: skip,
        orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { 
            id: true, 
            name: true, 
            email: true, 
            role: true, 
            location: true,
            ...(userId ? {
              followers: {
                where: { followerId: userId },
                select: { followerId: true }
              }
            } : {})
          }
        },
        replies: {
          where: { parentId: null },
          orderBy: { createdAt: "asc" },
          include: {
            author: {
              select: { id: true, name: true, email: true, role: true, location: true }
            },
            children: {
              include: {
                author: { select: { id: true, name: true, email: true, role: true, location: true } },
                ...(userId ? { likes: { where: { userId }, select: { id: true } } } : {}),
                _count: { select: { likes: true } }
              }
            },
            ...(userId ? { likes: { where: { userId }, select: { id: true } } } : {}),
            _count: { select: { likes: true } }
          }
        },
        ...(userId ? {
          likes: {
            where: { userId },
            select: { id: true }
          },
          reposts: {
            where: { userId },
            select: { id: true }
          },
          bookmarks: {
            where: { userId },
            select: { id: true }
          }
        } : {}),
        _count: {
          select: { likes: true, reposts: true, replies: true, shares: true, bookmarks: true }
        }
      }
    }),
    prisma.panxPost.count()
    ]);

    const formattedPosts = posts.map(post => ({
      ...post,
      author: {
        id: post.author.id,
        name: post.author.name,
        email: post.author.email,
        role: post.author.role,
        location: post.author.location,
        isFollowing: (userId && post.author.followers) ? post.author.followers.length > 0 : false
      },
      hasLiked: (userId && post.likes) ? post.likes.length > 0 : false,
      hasReposted: (userId && post.reposts) ? post.reposts.length > 0 : false,
      hasBookmarked: (userId && post.bookmarks) ? post.bookmarks.length > 0 : false,
      likesCount: post._count.likes,
      repostsCount: post._count.reposts,
      repliesCount: post._count.replies,
      sharesCount: post._count.shares,
      bookmarksCount: post._count.bookmarks,
      likes: undefined,
      reposts: undefined,
      bookmarks: undefined,
      _count: undefined,
      replies: post.replies.map(reply => ({
        ...reply,
        hasLiked: (userId && reply.likes) ? reply.likes.length > 0 : false,
        likesCount: reply._count.likes,
        likes: undefined,
        _count: undefined,
        children: reply.children ? reply.children.map(child => ({
          ...child,
          hasLiked: (userId && child.likes) ? child.likes.length > 0 : false,
          likesCount: child._count.likes,
          likes: undefined,
          _count: undefined
        })) : []
      }))
    }));

    res.json({
      posts: formattedPosts,
      hasMore: skip + formattedPosts.length < totalPosts,
      total: totalPosts
    });
  } catch (error) {
    console.error("Failed to fetch feed posts:", error);
    res.status(500).json({ error: "Failed to fetch feed posts." });
  }
});

// Apply authentication to all subsequent feed mutations/interactions
router.use(authMiddleware);

// 2. Create a new feed post (thread)
router.post("/posts", async (req, res) => {
  const { content, imageUrl, videoUrl, mediaType, mediaFiles } = req.body;
  if ((!content || !content.trim()) && !imageUrl && !videoUrl && (!mediaFiles || mediaFiles.length === 0)) {
    return res.status(400).json({ error: "Content or media is required to post." });
  }

  try {
    const newPost = await prisma.panxPost.create({
      data: {
        content: content ? content.trim() : "",
        imageUrl: imageUrl || null,
        videoUrl: videoUrl || null,
        mediaType: mediaType || null,
        mediaFiles: mediaFiles && mediaFiles.length > 0 ? mediaFiles : null,
        authorId: req.user.id
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, role: true, location: true }
        },
        replies: true,
        _count: {
          select: { likes: true, reposts: true, replies: true }
        }
      }
    });

    res.status(201).json({
      ...newPost,
      hasLiked: false,
      hasReposted: false,
      hasBookmarked: false,
      likesCount: 0,
      repostsCount: 0,
      repliesCount: 0,
      sharesCount: 0,
      bookmarksCount: 0,
      _count: undefined
    });
  } catch (error) {
    console.error("Failed to create post:", error);
    res.status(500).json({ error: "Failed to create post." });
  }
});

// 3. Reply to a post
router.post("/posts/:postId/reply", async (req, res) => {
  const { postId } = req.params;
  const { content, parentId } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: "Content is required to reply." });
  }

  try {
    const post = await prisma.panxPost.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    const reply = await prisma.panxReply.create({
      data: {
        content: content.trim(),
        postId,
        parentId: parentId || null,
        authorId: req.user.id
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, role: true, location: true }
        }
      }
    });

    res.status(201).json({
      ...reply,
      hasLiked: false,
      likesCount: 0,
      children: []
    });
  } catch (error) {
    console.error("Failed to create reply:", error);
    res.status(500).json({ error: "Failed to create reply." });
  }
});

// 4. Toggle like on a post
router.post("/posts/:postId/like", async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  try {
    const post = await prisma.panxPost.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    const existingLike = await prisma.panxLike.findUnique({
      where: {
        postId_userId: { postId, userId }
      }
    });

    let liked = false;
    if (existingLike) {
      await prisma.panxLike.delete({
        where: {
          postId_userId: { postId, userId }
        }
      });
    } else {
      await prisma.panxLike.create({
        data: { postId, userId }
      });
      liked = true;
    }

    const likesCount = await prisma.panxLike.count({
      where: { postId }
    });

    res.json({ liked, likesCount });
  } catch (error) {
    console.error("Failed to toggle like:", error);
    res.status(500).json({ error: "Failed to handle like request." });
  }
});

// 5. Toggle repost on a post
router.post("/posts/:postId/repost", async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  try {
    const post = await prisma.panxPost.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    const existingRepost = await prisma.panxRepost.findUnique({
      where: {
        postId_userId: { postId, userId }
      }
    });

    let reposted = false;
    if (existingRepost) {
      await prisma.panxRepost.delete({
        where: {
          postId_userId: { postId, userId }
        }
      });
    } else {
      await prisma.panxRepost.create({
        data: { postId, userId }
      });
      reposted = true;
    }

    const repostsCount = await prisma.panxRepost.count({
      where: { postId }
    });

    res.json({ reposted, repostsCount });
  } catch (error) {
    console.error("Failed to toggle repost:", error);
    res.status(500).json({ error: "Failed to handle repost request." });
  }
});

// 6. Delete a post
router.delete("/posts/:postId", async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await prisma.panxPost.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    // Verify ownership or check if is super user/admin
    if (post.authorId !== req.user.id && req.user.role !== "SUPER_USER" && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Unauthorized to delete this post." });
    }

    await prisma.panxPost.delete({
      where: { id: postId }
    });

    res.json({ message: "Post deleted successfully." });
  } catch (error) {
    console.error("Failed to delete post:", error);
    res.status(500).json({ error: "Failed to delete post." });
  }
});

// 7. Get user suggestions to follow (excluding self)
router.get("/users/suggestions", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        id: { not: req.user.id }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        location: true,
        followers: {
          where: { followerId: req.user.id },
          select: { followerId: true }
        },
        _count: {
          select: { followers: true }
        }
      },
      orderBy: { name: "asc" }
    });

    const suggestions = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      location: user.location,
      isFollowing: user.followers.length > 0,
      followersCount: user._count.followers
    }));

    res.json(suggestions);
  } catch (error) {
    console.error("Failed to fetch user suggestions:", error);
    res.status(500).json({ error: "Failed to fetch user suggestions." });
  }
});

// 8. Toggle follow user
router.post("/users/:userId/follow", async (req, res) => {
  const { userId } = req.params;
  const followerId = req.user.id;

  if (userId === followerId) {
    return res.status(400).json({ error: "You cannot follow yourself." });
  }

  try {
    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!targetUser) {
      return res.status(404).json({ error: "User not found." });
    }

    const existingFollow = await prisma.userFollows.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: userId
        }
      }
    });

    let following = false;
    if (existingFollow) {
      await prisma.userFollows.delete({
        where: {
          followerId_followingId: {
            followerId,
            followingId: userId
          }
        }
      });
    } else {
      await prisma.userFollows.create({
        data: {
          followerId,
          followingId: userId
        }
      });
      following = true;
    }

    res.json({ following });
  } catch (error) {
    console.error("Failed to toggle follow status:", error);
    res.status(500).json({ error: "Failed to update follow status." });
  }
});

// 9. Toggle bookmark on a post
router.post("/posts/:postId/bookmark", async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  try {
    const post = await prisma.panxPost.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ error: "Post not found." });

    const existingBookmark = await prisma.panxBookmark.findUnique({
      where: { postId_userId: { postId, userId } }
    });

    let bookmarked = false;
    if (existingBookmark) {
      await prisma.panxBookmark.delete({
        where: { postId_userId: { postId, userId } }
      });
    } else {
      await prisma.panxBookmark.create({
        data: { postId, userId }
      });
      bookmarked = true;
    }

    const bookmarksCount = await prisma.panxBookmark.count({ where: { postId } });
    res.json({ bookmarked, bookmarksCount });
  } catch (error) {
    console.error("Failed to toggle bookmark:", error);
    res.status(500).json({ error: "Failed to handle bookmark request." });
  }
});

// 10. Record a share on a post
router.post("/posts/:postId/share", async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  try {
    const post = await prisma.panxPost.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ error: "Post not found." });

    await prisma.panxShare.create({
      data: { postId, userId }
    });

    const sharesCount = await prisma.panxShare.count({ where: { postId } });
    res.json({ shared: true, sharesCount });
  } catch (error) {
    console.error("Failed to record share:", error);
    res.status(500).json({ error: "Failed to record share." });
  }
});

// 11. Toggle like on a reply
router.post("/replies/:replyId/like", async (req, res) => {
  const { replyId } = req.params;
  const userId = req.user.id;

  try {
    const reply = await prisma.panxReply.findUnique({ where: { id: replyId } });
    if (!reply) return res.status(404).json({ error: "Reply not found." });

    const existingLike = await prisma.panxReplyLike.findUnique({
      where: { replyId_userId: { replyId, userId } }
    });

    let liked = false;
    if (existingLike) {
      await prisma.panxReplyLike.delete({
        where: { replyId_userId: { replyId, userId } }
      });
    } else {
      await prisma.panxReplyLike.create({
        data: { replyId, userId }
      });
      liked = true;
    }

    const likesCount = await prisma.panxReplyLike.count({ where: { replyId } });
    res.json({ liked, likesCount });
  } catch (error) {
    console.error("Failed to toggle reply like:", error);
    res.status(500).json({ error: "Failed to handle reply like." });
  }
});

// 12. Delete a reply
router.delete("/replies/:replyId", async (req, res) => {
  const { replyId } = req.params;

  try {
    const reply = await prisma.panxReply.findUnique({ where: { id: replyId } });
    if (!reply) return res.status(404).json({ error: "Reply not found." });

    if (reply.authorId !== req.user.id && req.user.role !== "SUPER_USER" && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Unauthorized to delete this reply." });
    }

    await prisma.panxReply.delete({ where: { id: replyId } });
    res.json({ message: "Reply deleted successfully." });
  } catch (error) {
    console.error("Failed to delete reply:", error);
    res.status(500).json({ error: "Failed to delete reply." });
  }
});

// 13. Get user's saved (bookmarked) posts
router.get("/saved", async (req, res) => {
  const userId = req.user.id;

  try {
    const bookmarks = await prisma.panxBookmark.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        post: {
          include: {
            author: {
              select: { id: true, name: true, email: true, role: true, location: true }
            },
            replies: {
              where: { parentId: null },
              orderBy: { createdAt: "asc" },
              include: {
                author: { select: { id: true, name: true, email: true, role: true, location: true } },
                children: {
                  include: {
                    author: { select: { id: true, name: true, email: true, role: true, location: true } },
                    likes: { where: { userId }, select: { id: true } },
                    _count: { select: { likes: true } }
                  }
                },
                likes: { where: { userId }, select: { id: true } },
                _count: { select: { likes: true } }
              }
            },
            likes: { where: { userId }, select: { id: true } },
            reposts: { where: { userId }, select: { id: true } },
            bookmarks: { where: { userId }, select: { id: true } },
            _count: {
              select: { likes: true, reposts: true, replies: true, shares: true, bookmarks: true }
            }
          }
        }
      }
    });

    const formattedPosts = bookmarks.map(b => b.post).map(post => ({
      ...post,
      author: {
        id: post.author.id,
        name: post.author.name,
        email: post.author.email,
        role: post.author.role,
        location: post.author.location,
        isFollowing: false // Fetch followers conditionally if needed
      },
      hasLiked: post.likes.length > 0,
      hasReposted: post.reposts.length > 0,
      hasBookmarked: post.bookmarks.length > 0,
      likesCount: post._count.likes,
      repostsCount: post._count.reposts,
      repliesCount: post._count.replies,
      sharesCount: post._count.shares,
      bookmarksCount: post._count.bookmarks,
      likes: undefined,
      reposts: undefined,
      bookmarks: undefined,
      _count: undefined,
      replies: post.replies.map(reply => ({
        ...reply,
        hasLiked: reply.likes.length > 0,
        likesCount: reply._count.likes,
        likes: undefined,
        _count: undefined,
        children: reply.children ? reply.children.map(child => ({
          ...child,
          hasLiked: child.likes.length > 0,
          likesCount: child._count.likes,
          likes: undefined,
          _count: undefined
        })) : []
      }))
    }));

    res.json(formattedPosts);
  } catch (error) {
    console.error("Failed to fetch saved posts:", error);
    res.status(500).json({ error: "Failed to fetch saved posts." });
  }
});

// 14. Get single post detail (must be after /saved to avoid route conflict)
router.get("/posts/:postId", async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id; // from authMiddleware

  try {
    const post = await prisma.panxPost.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: { id: true, name: true, email: true, role: true, location: true, followers: { where: { followerId: userId }, select: { followerId: true } } }
        },
        replies: {
          where: { parentId: null },
          orderBy: { createdAt: "asc" },
          include: {
            author: { select: { id: true, name: true, email: true, role: true, location: true } },
            children: {
              include: {
                author: { select: { id: true, name: true, email: true, role: true, location: true } },
                likes: { where: { userId }, select: { id: true } },
                _count: { select: { likes: true } }
              }
            },
            likes: { where: { userId }, select: { id: true } },
            _count: { select: { likes: true } }
          }
        },
        likes: { where: { userId }, select: { id: true } },
        reposts: { where: { userId }, select: { id: true } },
        bookmarks: { where: { userId }, select: { id: true } },
        _count: {
          select: { likes: true, reposts: true, replies: true, shares: true, bookmarks: true }
        }
      }
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    const formattedPost = {
      ...post,
      author: {
        id: post.author.id,
        name: post.author.name,
        email: post.author.email,
        role: post.author.role,
        location: post.author.location,
        isFollowing: post.author.followers.length > 0
      },
      hasLiked: post.likes.length > 0,
      hasReposted: post.reposts.length > 0,
      hasBookmarked: post.bookmarks.length > 0,
      likesCount: post._count.likes,
      repostsCount: post._count.reposts,
      repliesCount: post._count.replies,
      sharesCount: post._count.shares,
      bookmarksCount: post._count.bookmarks,
      likes: undefined,
      reposts: undefined,
      bookmarks: undefined,
      _count: undefined,
      replies: post.replies.map(reply => ({
        ...reply,
        hasLiked: reply.likes.length > 0,
        likesCount: reply._count.likes,
        likes: undefined,
        _count: undefined,
        children: reply.children ? reply.children.map(child => ({
          ...child,
          hasLiked: child.likes.length > 0,
          likesCount: child._count.likes,
          likes: undefined,
          _count: undefined
        })) : []
      }))
    };

    res.json(formattedPost);
  } catch (error) {
    console.error("Failed to fetch post detail:", error);
    res.status(500).json({ error: "Failed to fetch post detail." });
  }
});

module.exports = router;
