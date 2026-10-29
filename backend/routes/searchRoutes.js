import express from "express";
import { getDB } from "../config/db.js";

const router = express.Router();

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

router.get("/", async (req, res) => {
    try {
        const { q } = req.query;

        if (
            typeof q !== "string" ||
            !q.trim() ||
            q.trim().length > 100
        ) {
            return res.status(400).json({
                error: "Search query must contain between 1 and 100 characters"
            });
        }

        const db = getDB();

        const searchTerm = q.trim();
        const isHashtag = searchTerm.startsWith("#");

        const normalizedTag = searchTerm
            .replace(/^#/, "")
            .toLowerCase();

        const regex = new RegExp(
            escapeRegex(searchTerm),
            "i"
        );

        const [users, posts, albums] = await Promise.all([
            // Search users
            db.collection("users")
                .find({
                    username: regex
                })
                .project({
                    username: 1,
                    name: 1,
                    profilePicture: 1
                })
                .limit(10)
                .toArray(),

            // Search posts
            db.collection("posts")
                .find(
                    isHashtag
                        ? { hashtags: normalizedTag }
                        : {
                            $or: [
                                { caption: regex },
                                { hashtags: normalizedTag }
                            ]
                        }
                )
                .limit(10)
                .toArray(),

            // Search albums
            db.collection("albums")
                .find(
                    isHashtag
                        ? { hashtags: normalizedTag }
                        : {
                            $or: [
                                { name: regex },
                                { description: regex },
                                { hashtags: normalizedTag }
                            ]
                        }
                )
                .limit(10)
                .toArray()
        ]);

        return res.status(200).json({
            users,
            posts,
            albums
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Search failed"
        });
    }
});

export default router;