import express from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";
import upload from "../config/upload.js";
import { canViewProfileDetails } from "../utils/profileAccess.js";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

router.post("/", requireAuth, upload.single("image"), async (req, res) => {
    try {
        const userId = req.session.userId;
        const { caption, hashtags } = req.body;

        if (!req.file) {
            return res.status(400).json({
                error: "Please upload an image"
            });
        }

        if (typeof caption !== "string" || !caption.trim()) {
            return res.status(400).json({
                error: "Caption is required"
            });
        }

        if (!ObjectId.isValid(userId)) {
            return res.status(401).json({
                error: "Invalid session"
            });
        }

        const hashtagArray = typeof hashtags === "string"
            ? [...new Set(
                hashtags
                    .split(/[,\s]+/)
                    .map(tag => tag.trim().replace(/^#/, "").toLowerCase())
                    .filter(Boolean)
            )]
            : [];

        const db = getDB();

        const newPost = {
            userId: new ObjectId(userId),
            imageUrl: `/uploads/${req.file.filename}`,
            caption: caption.trim(),
            hashtags: hashtagArray,
            likes: [],
            createdAt: new Date()
        };

        const result = await db.collection("posts").insertOne(newPost);

        return res.status(201).json({
            message: "Post created successfully",
            post: {
                _id: result.insertedId,
                ...newPost
            }
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Failed to create post"
        });
    }
});

router.get("/me", requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!ObjectId.isValid(userId)) {
            return res.status(401).json({
                error: "Invalid session"
            });
        }

        const db = getDB();

        const posts = await db.collection("posts")
            .find({
                userId: new ObjectId(userId)
            })
            .sort({ createdAt: -1 })
            .toArray();

        return res.status(200).json(posts);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Failed to retrieve posts"
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
                error: "You must be mutual friends to view these posts"
            });
        }

        const posts = await db.collection("posts")
            .find({
                userId: profileOwner._id
            })
            .sort({ createdAt: -1 })
            .toArray();

        return res.status(200).json(posts);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Failed to retrieve user posts"
        });
    }
});

router.get("/global", requireAuth, async (req, res) => {
    try {
        const db = getDB();

        const posts = await db.collection("posts")
            .aggregate([
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "author"
                    }
                },
                {
                    $unwind: "$author"
                },
                {
                    $project: {
                        imageUrl: 1,
                        caption: 1,
                        hashtags: 1,
                        likes: 1,
                        createdAt: 1,
                        userId: 1,
                        username: "$author.username",
                        profilePicture: "$author.profilePicture"
                    }
                },
                {
                    $sort: {
                        createdAt: -1
                    }
                },
                {
                    $limit: 50
                }
            ])
            .toArray();

        return res.status(200).json(posts);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Failed to retrieve global posts"
        });
    }
});

router.get("/local", requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!ObjectId.isValid(userId)) {
            return res.status(401).json({
                error: "Invalid session"
            });
        }

        const db = getDB();

        const currentUser = await db.collection("users").findOne({
            _id: new ObjectId(userId)
        });

        if (!currentUser) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        const followers = currentUser.followers || [];
        const following = currentUser.following || [];

        const mutualIds = following.filter(followedId =>
            followers.some(followerId =>
                followerId.equals(followedId)
            )
        );

        const posts = await db.collection("posts")
            .aggregate([
                {
                    $match: {
                        userId: {
                            $in: mutualIds
                        }
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "author"
                    }
                },
                {
                    $unwind: "$author"
                },
                {
                    $project: {
                        imageUrl: 1,
                        caption: 1,
                        hashtags: 1,
                        likes: 1,
                        createdAt: 1,
                        userId: 1,
                        username: "$author.username",
                        profilePicture: "$author.profilePicture"
                    }
                },
                {
                    $sort: {
                        createdAt: -1
                    }
                },
                {
                    $limit: 50
                }
            ])
            .toArray();

        return res.status(200).json(posts);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Failed to retrieve local posts"
        });
    }
});

router.post("/:postId/like", requireAuth, async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.session.userId;

        if (!ObjectId.isValid(postId)) {
            return res.status(400).json({
                error: "Invalid post ID"
            });
        }

        if (!ObjectId.isValid(userId)) {
            return res.status(401).json({
                error: "Invalid session"
            });
        }

        const db = getDB();

        const result = await db.collection("posts").updateOne(
            {
                _id: new ObjectId(postId)
            },
            {
                $addToSet: {
                    likes: new ObjectId(userId)
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                error: "Post not found"
            });
        }

        return res.status(200).json({
            message: "Post liked successfully"
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Failed to like post"
        });
    }
});

router.delete("/:postId/like", requireAuth, async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.session.userId;

        if (!ObjectId.isValid(postId)) {
            return res.status(400).json({
                error: "Invalid post ID"
            });
        }

        if (!ObjectId.isValid(userId)) {
            return res.status(401).json({
                error: "Invalid session"
            });
        }

        const db = getDB();

        const result = await db.collection("posts").updateOne(
            {
                _id: new ObjectId(postId)
            },
            {
                $pull: {
                    likes: new ObjectId(userId)
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                error: "Post not found"
            });
        }

        return res.status(200).json({
            message: "Post unliked successfully"
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Failed to unlike post"
        });
    }
});

router.post("/:postId/comments", requireAuth, async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.session.userId;
        const { text } = req.body;

        if (!ObjectId.isValid(postId)) {
            return res.status(400).json({
                error: "Invalid post ID"
            });
        }

        if (!ObjectId.isValid(userId)) {
            return res.status(401).json({
                error: "Invalid session"
            });
        }

        if (
            typeof text !== "string" ||
            !text.trim() ||
            text.trim().length > 1000
        ) {
            return res.status(400).json({
                error: "Comment must contain between 1 and 1000 characters"
            });
        }

        const db = getDB();

        const post = await db.collection("posts").findOne({
            _id: new ObjectId(postId)
        });

        if (!post) {
            return res.status(404).json({
                error: "Post not found"
            });
        }

        const newComment = {
            postId: new ObjectId(postId),
            userId: new ObjectId(userId),
            text: text.trim(),
            createdAt: new Date()
        };

        const result = await db.collection("comments").insertOne(newComment);

        return res.status(201).json({
            message: "Comment added successfully",
            comment: {
                _id: result.insertedId,
                ...newComment
            }
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Failed to add comment"
        });
    }
});

router.get("/:postId/comments", requireAuth, async (req, res) => {
    try {
        const { postId } = req.params;

        if (!ObjectId.isValid(postId)) {
            return res.status(400).json({
                error: "Invalid post ID"
            });
        }

        const db = getDB();

        const post = await db.collection("posts").findOne({
            _id: new ObjectId(postId)
        });

        if (!post) {
            return res.status(404).json({
                error: "Post not found"
            });
        }

        const comments = await db.collection("comments")
            .aggregate([
                {
                    $match: {
                        postId: new ObjectId(postId)
                    }
                },
                {
                    $sort: {
                        createdAt: 1
                    }
                },
                {
                    $limit: 100
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "author"
                    }
                },
                {
                    $unwind: "$author"
                },
                {
                    $project: {
                        postId: 1,
                        userId: 1,
                        text: 1,
                        createdAt: 1,
                        username: "$author.username",
                        profilePicture: "$author.profilePicture"
                    }
                }
            ])
            .toArray();

        return res.status(200).json(comments);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Failed to retrieve comments"
        });
    }
});

router.delete("/:postId/comments/:commentId", requireAuth, async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const userId = req.session.userId;

        if (
            !ObjectId.isValid(postId) ||
            !ObjectId.isValid(commentId)
        ) {
            return res.status(400).json({
                error: "Invalid post or comment ID"
            });
        }

        if (!ObjectId.isValid(userId)) {
            return res.status(401).json({
                error: "Invalid session"
            });
        }

        const db = getDB();

        const result = await db.collection("comments").deleteOne({
            _id: new ObjectId(commentId),
            postId: new ObjectId(postId),
            userId: new ObjectId(userId)
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                error: "Comment not found or not authorized"
            });
        }

        return res.status(200).json({
            message: "Comment deleted successfully"
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Failed to delete comment"
        });
    }
});

router.patch("/:postId", requireAuth, async (req, res) => {
    try {
        const { postId } = req.params;
        const { caption, hashtags = "" } = req.body;

        if (!ObjectId.isValid(postId)) {
            return res.status(400).json({
                error: "Invalid post ID"
            });
        }

        if (
            typeof caption !== "string" ||
            !caption.trim() ||
            caption.trim().length > 1000
        ) {
            return res.status(400).json({
                error: "Caption must contain between 1 and 1000 characters"
            });
        }

        if (typeof hashtags !== "string" || hashtags.length > 500) {
            return res.status(400).json({
                error: "Invalid hashtags"
            });
        }

        const normalizedHashtags = [...new Set(
            hashtags
                .split(/[,\s]+/)
                .map(tag => tag.trim().replace(/^#/, "").toLowerCase())
                .filter(Boolean)
        )];

        const db = getDB();

        const result = await db.collection("posts").findOneAndUpdate(
            {
                _id: new ObjectId(postId),
                userId: new ObjectId(req.session.userId)
            },
            {
                $set: {
                    caption: caption.trim(),
                    hashtags: normalizedHashtags,
                    updatedAt: new Date()
                }
            },
            {
                returnDocument: "after"
            }
        );

        if (!result) {
            return res.status(404).json({
                error: "Post not found or not authorized"
            });
        }

        return res.status(200).json({
            message: "Post updated successfully",
            post: result
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Failed to update post"
        });
    }
});

router.delete("/:postId", requireAuth, async (req, res) => {
    try {
        const { postId } = req.params;

        if (!ObjectId.isValid(postId)) {
            return res.status(400).json({
                error: "Invalid post ID"
            });
        }

        const db = getDB();

        const postObjectId = new ObjectId(postId);
        const userObjectId = new ObjectId(req.session.userId);

        // Step 1: Find the post and verify ownership
        const post = await db.collection("posts").findOne({
            _id: postObjectId,
            userId: userObjectId
        });

        if (!post) {
            return res.status(404).json({
                error: "Post not found or not authorized"
            });
        }

        // Step 2: Find albums containing this post
        const albums = await db.collection("albums")
            .find({
                postIds: postObjectId
            })
            .toArray();

        // Step 3: Remove the post from its albums
        await db.collection("albums").updateMany(
            {
                postIds: postObjectId
            },
            {
                $pull: {
                    postIds: postObjectId
                }
            }
        );

        // Step 4: Delete albums that became empty
        const albumIdsToDelete = albums
            .filter(album => album.postIds.length === 1)
            .map(album => album._id);

        if (albumIdsToDelete.length > 0) {
            await db.collection("albums").deleteMany({
                _id: {
                    $in: albumIdsToDelete
                },
                postIds: {
                    $size: 0
                }
            });
        }

        // Step 5: Delete comments
        await db.collection("comments").deleteMany({
            postId: postObjectId
        });

        // Step 6: Delete the post
        await db.collection("posts").deleteOne({
            _id: postObjectId,
            userId: userObjectId
        });

        // Step 7: Delete the uploaded image
        if (post.imageUrl?.startsWith("/uploads/")) {
            const filename = path.basename(post.imageUrl);

            const currentFile = fileURLToPath(import.meta.url);
            const currentDirectory = path.dirname(currentFile);

            // Assumes backend/routes/postRoutes.js
            // and backend/uploads/filename
            const imagePath = path.join(
                currentDirectory,
                "../uploads",
                filename
            );

            try {
                await fs.unlink(imagePath);
            } catch (fileError) {
                console.error(
                    "Could not delete uploaded image:",
                    fileError
                );
            }
        }

        return res.status(200).json({
            message: "Post deleted successfully",
            deletedAlbums: albumIdsToDelete.length
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Failed to delete post"
        });
    }
});

router.get("/:postId/albums", requireAuth, async (req, res) => {
    try {
        const { postId } = req.params;

        if (!ObjectId.isValid(postId)) {
            return res.status(400).json({
                error: "Invalid post ID"
            });
        }

        const db = getDB();

        const post = await db.collection("posts").findOne({
            _id: new ObjectId(postId)
        });

        if (!post) {
            return res.status(404).json({
                error: "Post not found"
            });
        }

        const albums = await db.collection("albums")
            .find({
                userId: post.userId,
                postIds: new ObjectId(postId)
            })
            .project({
                name: 1,
                description: 1,
                hashtags: 1
            })
            .toArray();

        return res.status(200).json(albums);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Failed to retrieve post albums"
        });
    }
});

router.get("/:postId", requireAuth, async (req, res) => {
    try {
        const { postId } = req.params;

        if (!ObjectId.isValid(postId)) {
            return res.status(400).json({
                error: "Invalid post ID"
            });
        }

        const db = getDB();

        const posts = await db.collection("posts")
            .aggregate([
                {
                    $match: {
                        _id: new ObjectId(postId)
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "author"
                    }
                },
                {
                    $unwind: "$author"
                },
                {
                    $project: {
                        userId: 1,
                        imageUrl: 1,
                        caption: 1,
                        hashtags: 1,
                        likes: 1,
                        createdAt: 1,
                        username: "$author.username",
                        profilePicture: "$author.profilePicture"
                    }
                }
            ])
            .toArray();

        if (posts.length === 0) {
            return res.status(404).json({
                error: "Post not found"
            });
        }

        return res.status(200).json(posts[0]);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Failed to retrieve post"
        });
    }
});



export default router;