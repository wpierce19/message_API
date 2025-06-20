import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
    const file = req.file;

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
        attachments: file
          ? {
              create: {
                filename: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
                path: file.path,
              },
            }
          : undefined,
      },
    });

    res.json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: "Failed to create message" });
  }
};

export const getMessage = async (req, res) => {
  try {
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

    res.json({ message, thread: message.replies || [] });
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

export const addReply = async (req,res) => {
    try {
        const {content} = req.body;

        const comment = await prisma.comment.create({
            data: {
                content,
                messageId: req.params.id,
                senderId: req.user.id,
            },
        });

        res.json(comment);
    } catch (err) {
        console.error(err);
        res.status(500).json({err: "Failed to post comment"});
    }
};

export const reactToMessage = async (req, res) => {
  const { id: messageId } = req.params;
  const { emoji } = req.body;
  const userId = req.user.id;

  try {
    // Delete existing reaction from user on this message
    await prisma.reaction.deleteMany({
      where: { userId, messageId },
    });

    // Add new reaction
    const newReaction = await prisma.reaction.create({
      data: {
        emoji,
        userId,
        messageId,
      },
      include: {
        user: { select: { username: true } },
      },
    });

    res.json(newReaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: "Failed to react to message" });
  }
};
