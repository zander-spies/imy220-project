import express from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";
import { canViewProfileDetails } from "../utils/profileAccess.js";

const router = express.Router();

function normalizeHashtags(hashtags) {
    if (typeof hashtags !== "string") {
        return [];
    }

    return [...new Set(
        hashtags
            .split(/[,\s]+/)
            .map(tag => tag.trim().replace(/^#/, "").toLowerCase())
            .filter(Boolean)
    )];
}

function requireAuth(req, res, next) {
    if (!req.session?.userId) {
        return res.status(401).json({
            error: "Not authenticated"
        });
    }

    next();
}

router.post("/", requireAuth, async (req, res) => {
    try {
            const {
        name,
        description = "",
        hashtags = ""
    } = req.body;

        if (
            typeof name !== "string" ||
            !name.trim() ||
            name.trim().length > 100
        ) {
            return res.status(400).json({
                error: "Album name must contain between 1 and 100 characters"
            });
        }

        if (
            typeof description !== "string" ||
            description.length > 500
        ) {
            return res.status(400).json({
                error: "Description cannot exceed 500 characters"
            });
        }
        if (typeof hashtags !== "string" || hashtags.length > 500) {
            return res.status(400).json({
                error: "Invalid hashtags"
            });
        }

        const db = getDB();

        const newAlbum = {
            userId: new ObjectId(req.session.userId),
            name: name.trim(),
            description: description.trim(),
            hashtags: normalizeHashtags(hashtags),
            postIds: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await db.collection("albums").insertOne(newAlbum);

        return res.status(201).json({
            message: "Album created successfully",
            album: {
                _id: result.insertedId,
                ...newAlbum
            }
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Failed to create album"
        });
    }
});

router.get("/me", requireAuth, async (req, res) => {
    try {
        const db = getDB();

        const albums = await db.collection("albums")
            .find({
                userId: new ObjectId(req.session.userId)
            })
            .sort({ createdAt: -1 })
            .toArray();

        return res.status(200).json(albums);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Failed to retrieve albums"
        });
    }
});

router.post("/:albumId/posts", requireAuth, async (req, res) => {
    try {
        const { albumId } = req.params;
        const { postId } = req.body;

        if (
            !ObjectId.isValid(albumId) ||
            !ObjectId.isValid(postId)
        ) {
            return res.status(400).json({
                error: "Invalid album or post ID"
            });
        }

        const db = getDB();
        const userId = new ObjectId(req.session.userId);

        const post = await db.collection("posts").findOne({
            _id: new ObjectId(postId),
            userId
        });

        if (!post) {
            return res.status(404).json({
                error: "Post not found or does not belong to you"
            });
        }

        const result = await db.collection("albums").updateOne(
            {
                _id: new ObjectId(albumId),
                userId
            },
            {
                $addToSet: {
                    postIds: new ObjectId(postId)
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                error: "Album not found"
            });
        }

        return res.status(200).json({
            message: "Post added to album"
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Failed to add post to album"
        });
    }
});

router.get("/user/:userId", requireAuth, async (req, res) => {
    try {
        const { userId } = req.params;

        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({
                error: "Invalid user ID"
            });
        }

        const db = getDB();

        const viewer = await db.collection("users").findOne({
            _id: new ObjectId(req.session.userId)
        });

        const profileOwner = await db.collection("users").findOne({
            _id: new ObjectId(userId)
        });

        if (!viewer) {
            return res.status(401).json({
                error: "Invalid session"
            });
        }

        if (!profileOwner) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        if (!canViewProfileDetails(viewer, profileOwner)) {
            return res.status(403).json({
                error: "You must be mutual friends to view these albums"
            });
        }

        const albums = await db.collection("albums")
            .find({
                userId: profileOwner._id
            })
            .sort({ createdAt: -1 })
            .toArray();

        return res.status(200).json(albums);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Failed to retrieve user albums"
        });
    }
});

router.get("/:albumId", requireAuth, async (req, res) => {
    try {
        const { albumId } = req.params;

        if (!ObjectId.isValid(albumId)) {
            return res.status(400).json({
                error: "Invalid album ID"
            });
        }

        const db = getDB();

        const album = await db.collection("albums").findOne({
            _id: new ObjectId(albumId)
        });

        if (!album) {
            return res.status(404).json({
                error: "Album not found"
            });
        }

        const posts = await db.collection("posts")
            .find({
                _id: {
                    $in: album.postIds || []
                },
                userId: album.userId
            })
            .sort({ createdAt: -1 })
            .toArray();

        return res.status(200).json({
            ...album,
            posts
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Failed to retrieve album"
        });
    }
});

router.patch("/:albumId", requireAuth, async (req, res) => {
    try {
        const { albumId } = req.params;

        const {
            name,
            description,
            hashtags
        } = req.body;

        if (!ObjectId.isValid(albumId)) {
            return res.status(400).json({
                error: "Invalid album ID"
            });
        }

        if (
            typeof name !== "string" ||
            !name.trim() ||
            name.trim().length > 100
        ) {
            return res.status(400).json({
                error: "Album name must contain between 1 and 100 characters"
            });
        }

        if (
            typeof description !== "string" ||
            description.length > 500
        ) {
            return res.status(400).json({
                error: "Description cannot exceed 500 characters"
            });
        }

        if (
            typeof hashtags !== "string" ||
            hashtags.length > 500
        ) {
            return res.status(400).json({
                error: "Invalid hashtags"
            });
        }

        const db = getDB();

        const result = await db.collection("albums").findOneAndUpdate(
            {
                _id: new ObjectId(albumId),
                userId: new ObjectId(req.session.userId)
            },
            {
                $set: {
                    name: name.trim(),
                    description: description.trim(),
                    hashtags: normalizeHashtags(hashtags),
                    updatedAt: new Date()
                }
            },
            {
                returnDocument: "after"
            }
        );

        if (!result) {
            return res.status(404).json({
                error: "Album not found or not authorized"
            });
        }

        return res.status(200).json({
            message: "Album updated successfully",
            album: result
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Failed to update album"
        });
    }
});

router.delete("/:albumId", requireAuth, async (req, res) => {
    try {
        const { albumId } = req.params;

        if (!ObjectId.isValid(albumId)) {
            return res.status(400).json({
                error: "Invalid album ID"
            });
        }

        const db = getDB();

        const result = await db.collection("albums").deleteOne({
            _id: new ObjectId(albumId),
            userId: new ObjectId(req.session.userId)
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                error: "Album not found or not authorized"
            });
        }

        return res.status(200).json({
            message: "Album deleted successfully"
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Failed to delete album"
        });
    }
});

export default router;