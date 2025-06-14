import passport from "passport";
import {Strategy as JWTStrategy, ExtractJwt} from "passport-jwt";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
};

passport.use(
    new JWTStrategy(opts, async (jwt_payload, done) => {
        try {
            const user = await prisma.user.findUnique({where: {id: jwt_payload.id}});
            if (user) return done(null, user);
            return done(null, false);
        } catch (err) {
            return done(err, false);
        }
    })
);

export default passport;