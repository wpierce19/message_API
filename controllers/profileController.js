import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export const getProfile = async (req,res) => {
    try {
        const user = await prisma.user.findUnique({
            where: {id: req.user.id},
            select: {
                id: true,
                username: true,
                email: true,
                avatarUrl: null,
                bio: true,
                interests: true,
            },
        });

        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({err: "Failed to fetch Profile"});
    }
};

export const updateProfile = async (req, res) => {
    const {bio, interests} = req.body;

    try {
        const user = await prisma.user.update({
            where: {id: req.user.id},
            data: {
                bio,
                interests: interests.split(',').map((i) => i.trim()),
            },
        });

        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({err: "Failed to update profile"});
    }
};

export const uploadAvatar = async (req,res) => {
    if (!req.file) return res.status(400).json({err: "No file uploaded"});

    const filePath = `/uploads/${req.file.filename}`;

    try {
        const user = await prisma.user.update({
            where: {id: req.user.id},
            data: {avatarUrl: filePath},
        });

        res.json({avatarUrl: user.avatarUrl});
    } catch (err) {
        console.error(err);
        res.status(500).json({err: "Failed to upload avatar"});
    }
};

export const deleteAvatar = async (req,res) => {
    try {
        const user = await prisma.user.findUnique({where: {id: req.user.id}});
        if (user?.avatarUrl){
            const filePath = path.join("public", user.avatarUrl);
            fs.unlink(filePath, (err) => {
                if (err) console.warn("Could not delete file:", filePath);
            });
        }

        await prisma.user.update({
            where: {id: req.user.id},
            data: {avatarUrl: null},
        });

        res.json({msg: "Avatar deleted"});
    } catch (err) {
        res.status(500).json({err: "Failed to delete avatar"});
    }
};

export const getPublicProfile = async (req,res) => {
    try {
        const user = await prisma.user.findUnique({
            where: {id: req.params.id},
            select: {
                id: true,
                username: true,
                email: true,
                avatarUrl: null,
                bio: true,
                interests: true,
            },
        });

        if (!user) return res.status(404).json({err: "User not found"});
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({err: "Failed to fetch public profile"});
    }
};