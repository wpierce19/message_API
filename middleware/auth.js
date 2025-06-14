import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();

const auth = async (req,res,next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({err: "No token provided"});
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({where: {id: decoded.id}});

        if (!user) {
            return res.status(401).json({err: "Invalid token"});
        }

        req.user = user;
        next();
    } catch (err) {
        console.error("Auth error:", err);
        res.status(401).json({err: "Token verification failed"});
    }
};

export default auth;