import { PrismaClient } from "@prisma/client";
import Fuse from "fuse.js";

const prisma = new PrismaClient();

export const searchUsers = async (req,res) => {
    const { q } = req.query;
    if (!q) return res.json([]);

    try {
        const allUsers = await prisma.user.findMany({
            where: {
                NOT: {id: req.user.id},
            },
            select: {
                id: true,
                username: true,
                email: true,
                avatarUrl: true,
            },
        });
        //Allows for fuzzy matching users search query
        const fuse = new Fuse(allUsers, {
            keys: ['username', 'email'],
            threshold: 0.3,
        });

        const results = fuse.search(q);
        res.json(results.map(r => r.item));
    } catch (err) {
        console.error(err);
        res.status(500).json({err: "User search failed"});
    }
};