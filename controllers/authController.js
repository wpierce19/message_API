import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

const generateToken = (user) => {
    return jwt.sign({id: user.id, email: user.email}, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
};

export const signup = async (req, res) => {
    const {username, email, password} = req.body;

    try {
        const existing = await prisma.user.findUnique({where: {email}});
        if (existing) return res.status(400).json({err: 'Email already in use'});

        const existingUsername = await prisma.user.findUnique({where: {username}});
        if (existingUsername) return res.status(400).json({err: "Username already in use"});

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {username, email, password: hashedPassword},
        });

        const token = generateToken(user);
        res.json({token});
    } catch (err) {
        console.error(err);
        res.status(500).json({err: 'Server error during signup'})
    }
};

export const login = async (req,res) => {
    const {email, password} = req.body;

    try {
        const user = await prisma.user.findUnique({where: {email}});
        if (!user) return res.status(400).json({err: 'Invalid credentials'});

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({err: 'Invalid credentials'});

        const token = generateToken(user);
        res.json({token});
    } catch (err) {
        console.error(err);
        res.status(500).json({err: 'Server error during login'});
    }
};

export const getMe = async (req,res) => {
    try {
        const user = await prisma.user.findUnique({
            where: {id: req.user.id},
            select: {
                id: true,
                email: true,
                avatarUrl: true,
                bio: true,
                interests: true,
            },
        });
        res.json(user)
    } catch (err) {
        console.error(err);
        res.status(500).json({err: 'Failed to fetch user'});
    }
};