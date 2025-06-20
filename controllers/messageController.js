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
          select: { id: true, username: true, email: true }
        },
        participants: {
          select: { id: true, username: true, email: true }
        },
        attachments: true,
      },
      orderBy: { createdAt: "desc" }
    });

    const enrichedMessages = messages.map((msg) => ({
      ...msg,
      currentUserId: userId,
    }));

    console.log("Enriched Messages:", enrichedMessages);
    res.json(enrichedMessages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: "Failed to load messages" });
  }
};

export const createMessage = async (req, res) => {
  try {
    const { content, recipientId } = req.body;
    const file = req.file;

    const participantIds = [req.user.id, recipientId].filter(Boolean);

    const message = await prisma.message.create({
      data: {
        content,
        senderId: req.user.id,
        participants: {
          connect: participantIds.map((id) => ({ id })),
        },
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
        sender: true,
        participants: true,
        comments: { include: { sender: true } },
        attachments: true,
        replies: {
          include: {
            sender: true,
            attachments: true,
            comments: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    res.json(message);
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

export const reactToMessage = async (req,res) => {
    try {
        const {emoji} = req.body;

        const reaction = await prisma.reaction.create({
            data: {
                emoji,
                userId: req.user.id,
                messageId: req.params.id,
            },
        });

        res.json(reaction);
    } catch (err) {
        console.error(err);
        res.status(500).json({err: "Failed to post reaction"});
    }
};