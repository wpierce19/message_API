import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const searchUsers = async (req,res) => {
    const {q} = req.query;
    if (!q) return res.json([]);
    
    try {
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    {email: {contains: q, mode: "insensitive"}},
                    {name: {contains: q, mode: "insensitive"}},
                ],
                NOT: {id: req.params.id},
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
            },
            take: 10,
        });

        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({err: "User search failed"});
    }
};