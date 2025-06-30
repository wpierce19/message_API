import { PrismaClient } from "@prisma/client";
import multer from "multer";
import path from "path";

const prisma = new PrismaClient();

// Configure Multer for image uploads
const storage = multer.diskStorage({
  destination: "/mnt/data/uploads",
  filename: (_, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

export const upload = multer({ storage });

export const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { participants: { some: { id: userId } } }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
          }
        },
        participants: {
          select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
          }
        },
        attachments: true,
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                avatarUrl: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const enriched = messages.map((msg) => ({
      ...msg,
      currentUserId: userId
    }));

    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: "Failed to load messages" });
  }
};

export const createMessage = async (req, res) => {
  try {
    const { content, recipientId, parentId } = req.body;

    //Validate recipientId exists
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
    });

    if (!recipient) {
      return res.status(400).json({ err: "Recipient not found" });
    }

    //Create message with both sender and recipient connected
    const message = await prisma.message.create({
      data: {
        content,
        senderId: req.user.id,
        participants: {
          connect: [
            { id: req.user.id },
            { id: recipientId },
          ],
        },
        parent: parentId ? { connect: { id: parentId } } : undefined,
      },
    });

    res.json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: "Failed to create message" });
  }
};

//For support with quill image handling from frontend
export const uploadQuillImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ err: "No file uploaded" });
  }

  const filePath = `/uploads/${req.file.filename}`;
  return res.status(200).json({ url: filePath });
};

export const getMessage = async (req, res) => {
  try {
    const userId = req.user.id;

    const message = await prisma.message.findUnique({
      where: { id: req.params.id },
      include: {
        sender: {
          select: { id: true, username: true, email: true, avatarUrl: true }
        },
        participants: {
          select: { id: true, username: true, email: true, avatarUrl: true }
        },
        comments: {
          include: {
            sender: {
              select: { id: true, username: true, email: true, avatarUrl: true }
            },
            reactions: {
              where: { userId },
              include: {
                user: {
                  select: { id: true, username: true }
                }
              }
            }
          }
        },
        attachments: true,
        reactions: {
          include: {
            user: {
              select: { id: true, username: true, email: true, avatarUrl: true }
            }
          }
        },
        replies: {
          include: {
            sender: {
              select: { id: true, username: true, email: true, avatarUrl: true }
            },
            attachments: true,
            comments: true
          },
          orderBy: { createdAt: "asc" }
        }
      }
    });

    // Normalize each comment to surface single reaction (if any)
    const normalizedComments = message.comments.map((c) => ({
      ...c,
      reaction: c.reactions[0] || null
    }));

    const cleanedMessage = {
      ...message,
      comments: normalizedComments
    };

    res.json({ message: cleanedMessage, thread: message.replies || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: "Failed to fetch message thread" });
  }
};


export const markAsRead = async (req,res) => {
    try {
        const updated = await prisma.message.update({
            where: {id: req.params.id},
            data: {
                readBy: {
                    push: req.user.id,
                },
            },
        });

        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({err: "Failed top mark message as read"});
    }
};

export const addReply = async (req, res) => {
  try {
    // Run multer manually in async/await style
    await new Promise((resolve, reject) => {
      upload.single("image")(req, res, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    const { content } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const comment = await prisma.comment.create({
      data: {
        content,
        messageId: req.params.id,
        senderId: req.user.id,
        imageUrl,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.json(comment);
  } catch (err) {
    console.error("Failed to post comment:", err);
    res.status(500).json({ err: "Failed to post comment" });
  }
};

export const reactToMessage = async (req, res) => {
  const { id: messageId, commentId } = req.params;
  const { emoji } = req.body;
  const userId = req.user.id;

  try {
    if (commentId) {
      // Fetch the comment to check the sender
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        select: { senderId: true }
      });

      if (!comment) {
        return res.status(404).json({ err: "Comment not found" });
      }

      if (comment.senderId === userId) {
        return res.status(403).json({ err: "You cannot react to your own comment" });
      }

      await prisma.reaction.deleteMany({ where: { userId, commentId } });

      const newReaction = await prisma.reaction.create({
        data: {
          emoji,
          userId,
          commentId
        },
        include: {
          user: { select: { username: true } }
        }
      });

      return res.json(newReaction);
    }

    // Reacting to the main message
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: { senderId: true }
    });

    if (!message) {
      return res.status(404).json({ err: "Message not found" });
    }

    if (message.senderId === userId) {
      return res.status(403).json({ err: "You cannot react to your own message" });
    }

    await prisma.reaction.deleteMany({ where: { userId, messageId } });

    const newReaction = await prisma.reaction.create({
      data: {
        emoji,
        userId,
        messageId
      },
      include: {
        user: { select: { username: true } }
      }
    });

    res.json(newReaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: "Failed to react" });
  }
};
