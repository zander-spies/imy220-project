import express from "express";
import cors from "cors";
import dontenv from "dotenv";
import { connectDB, getDB } from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import session from "express-session";
import MongoStore from "connect-mongo";
import path from "path";
import postRoutes from "./routes/postRoutes.js";
import albumRoutes from "./routes/albumRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";

dontenv.config();

const app = express();
const PORT = 3000;
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(session({
    name: "imy220.sid",

    secret: process.env.SESSION_SECRET,

    resave: false,

    saveUninitialized: false,

    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        dbName: "imy220",
        collectionName: "sessions"
    }),

    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24
    }
}));
app.use("/uploads", express.static(path.resolve("uploads")));

app.use(express.json());
//user Routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/search", searchRoutes);

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Failed to connect to MongoDB:", error);
    });