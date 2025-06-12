import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getFriends = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: {id: req.user.id},
            include: {friends: true},
        });
        res.json(user.friends);
    } catch (err) {
        console.error(err);
        res.status(500).json({err: "Failed to fetch friends"});
    }
};

export const requestFriend = async (req,res) => {
    try {
        const request = await prisma.friendRequest.create({
            data: {
                fromId: req.user.id,
                toId: req.params.id,
            },
        });
        res.json(request);
    } catch (err) {
        console.error(err);
        res.status(500).json({err: "Failed to send friend request"});
    }
};

export const getRequest = async (req,res) => {
    try {
        const requests = await prisma.friendRequest.findMany({
            where: {toId: req.user.id},
            include: {from: true},
        });
        res.json(requests.map(r => ({id: r.from.id, name: r.from.name, email: r.from.email})));
    } catch (err) {
        console.error(err);
        res.status(500).json({err: "Failed to fetch friend requests"});
    }
};

export const acceptFriend = async (req,res) => {
    try {
        const {id} = req.params;
        await prisma.user.update({
            where: {id: req.user.id},
            data: {
                friends: {connect: {id}},
            },
        });

        await prisma.user.update({
            where: {id},
            data: {
                friends: {connect: {id: req.user.id}},
            },
        });

        await prisma.friendRequest.deleteMany({
            where: {
                fromId: id,
                toId: req.user.id,
            },
        });

        res.json({msg: "Friend request accepted"});
    } catch (err) {
        console.error(err);
        res.status(500).json({err: "Failed to accept friend request"});
    }
};

export const denyFriend = async (req,res) => {
    try {
        await prisma.friendRequest.deleteMany({
            where: {
                fromId: req.params.id,
                toId: req.user.id,
            },
        });
        
        res.json({msg: "Friend request denied"});
    } catch (err) {
        console.error(err);
        res.status(500).json({err: "Failed to deny friend request"});
    }
};

export const removeFriend = async (req,res) => {
    try {
        const {id} = req.params;

        await prisma.user.update({
            where: {id: req.user.id},
            data: {
                friends: {disconnect: {id}},
            },
        });

        await prisma.user.update({
            where: {id},
            data: {
                friends: {disconnect: {id: req.params.id}},
            },
        });

        res.json({msg: "Friend removed"});
    } catch (err) {
        console.error(err);
        res.status(500).json({err: "Failed to remove friend"});
    }
};