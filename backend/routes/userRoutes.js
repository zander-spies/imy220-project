import express from "express";
import { getDB, getClient } from "../config/db.js";
import { ObjectId } from "mongodb";
import upload from "../config/upload.js";
import { canViewProfileDetails } from "../utils/profileAccess.js";


const router = express.Router();

//registering
router.post("/register", async (req, res) => {
    try{
        const{name, username, email, password} = req.body;
        const db = getDB();
        const existingUser = await db.collection("users").findOne({
            $or: [
                { username },
                { email }
            ]
        });
        if (existingUser) {
            return res.status(409).json({
                error: "Username or email already exists"
            });
        }
        
        const newUser = {name, username, email, password, profilePicture:"", socialLinks:[], followers:[], following:[]};
        const result = await db.collection("users").insertOne(newUser);

        req.session.regenerate((error) => {
            if (error) {
                return res.status(500).json({
                    error: "Failed to create session"
                });
            }

            req.session.userId = result.insertedId.toString();

            req.session.save((error) => {
                if (error) {
                    return res.status(500).json({
                        error: "Failed to save session"
                    });
                }

                res.status(201).json({
                    message: "User registered successfully",
                    username
                });
            });
        });
    }
    catch(error){
        console.log(error);
        res.status(500).json({error: "Failed to add user"});
    }
});

//login
router.post("/login", async (req, res) => {
    try {
        const{email, password} = req.body;
        const db = getDB();
        const existingUser = await db.collection("users").findOne({
            email
        });
        if (!existingUser) {
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        const passwordMatch = password === existingUser.password;
        if(!passwordMatch){
            return res.status(401).json({
                error: "Passwords doesn't match"
            });
        }

        req.session.regenerate((error) => {
        if (error) {
                return res.status(500).json({
                    error: "Failed to create session"
                });
            }

            req.session.userId = existingUser._id.toString();

            req.session.save((error) => {
                if (error) {
                    return res.status(500).json({
                        error: "Failed to save session"
                    });
                }

                res.status(200).json({
                    message: "Login successful",
                    username: existingUser.username
                });
            });
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Failed to login user"});
    }
});

//retrieving id for session
router.get("/me", async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({
                error: "Not authenticated"
            });
        }
        const db = getDB();
        const existingUser = await db.collection("users").findOne({
            _id: new ObjectId(userId)
        });

        if (!existingUser) {
            return res.status(401).json({
                error: "Invalid user"
            });
        }
        res.status(200).json({
            _id: existingUser._id,
            name: existingUser.name,
            username: existingUser.username,
            email: existingUser.email,
            bio: existingUser.bio || "",
            profilePicture: existingUser.profilePicture || "",
            socialLinks: existingUser.socialLinks || [],
            followers: existingUser.followers || [],
            following: existingUser.following || []
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to retrieve user"
        });
    }
});

//logging out
router.post("/logout", (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            return res.status(500).json({
                error: "Failed to log out"
            });
        }

        res.clearCookie("imy220.sid");

        res.status(200).json({
            message: "Logged out successfully"
        });
    });
});

router.patch("/me", async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({
                error: "Not authenticated"
            });
        }

        const { username, bio, socialLinks } = req.body;
        if (
            typeof username !== "string" ||
            !username.trim() ||
            typeof bio !== "string"
        ) {
            return res.status(400).json({
                error: "Invalid username or bio"
            });
        }

        if (!Array.isArray(socialLinks)) {
            return res.status(400).json({
                error: "Social links must be an array"
            });
        }

        if (socialLinks.length > 10) {
            return res.status(400).json({
                error: "Maximum of 10 social links allowed"
            });
        }

        const validatedLinks = [];

        for (const link of socialLinks) {
            if (
                !link ||
                typeof link.platform !== "string" ||
                typeof link.url !== "string"
            ) {
                return res.status(400).json({
                    error: "Invalid social link"
                });
            }

            const platform = link.platform.trim();
            const url = link.url.trim();

            if (!platform || platform.length > 50 || url.length > 2048) {
                return res.status(400).json({
                    error: "Invalid social link details"
                });
            }

            try {
                const parsedUrl = new URL(url);

                if (!["http:", "https:"].includes(parsedUrl.protocol)) {
                    return res.status(400).json({
                        error: "Social links must use HTTP or HTTPS"
                    });
                }
            } catch {
                return res.status(400).json({
                    error: "Invalid social link URL"
                });
            }

            validatedLinks.push({
                platform,
                url
            });
        }

        const db = getDB();

        const existingUser = await db.collection("users").findOne({
            username: username.trim(),
            _id: { $ne: new ObjectId(userId) }
        });

        if (existingUser) {
            return res.status(409).json({
                error: "Username already taken"
            });
        }

        const result = await db.collection("users").updateOne(
            { _id: new ObjectId(userId) },
            {
                $set: {
                    username: username.trim(),
                    bio: bio.trim(),
                    socialLinks: validatedLinks
                }
            }
        );
        if (result.matchedCount === 0) {
            return res.status(404).json({
                error: "User not found"
            });
        }
        return res.status(200).json({
            message: "Profile updated successfully"
        });

    } catch (error) {
        console.error(error);

        if (error.code === 11000) {
            return res.status(409).json({
                error: "Username already taken"
            });
        }

        return res.status(500).json({
            error: "Failed to update profile"
        });
    }
});


function requireAuth(req, res, next) {
    if (!req.session?.userId) {
        return res.status(401).json({
            error: "Not authenticated"
        });
    }

    next();
}

//profile picture upload
router.post(
    "/me/avatar",
    requireAuth,
    upload.single("avatar"),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    error: "No image uploaded"
                });
            }

            const imageUrl = `/uploads/${req.file.filename}`;

            const db = getDB();

            const result = await db.collection("users").updateOne(
                { _id: new ObjectId(req.session.userId) },
                {
                    $set: {
                        profilePicture: imageUrl
                    }
                }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({
                    error: "User not found"
                });
            }

            return res.status(200).json({
                message: "Profile picture updated successfully",
                profilePicture: imageUrl
            });

        } catch (error) {
            console.error(error);

            return res.status(500).json({
                error: "Failed to upload profile picture"
            });
        }
    }
);


//search users
router.get("/search", requireAuth, async (req, res) => {
    try {
        const query = req.query.q;

        if (typeof query !== "string") {
            return res.status(400).json({
                error: "Invalid search query"
            });
        }

        const searchTerm = query.trim();

        if (!searchTerm) {
            return res.status(200).json([]);
        }

        if (searchTerm.length > 50) {
            return res.status(400).json({
                error: "Search query is too long"
            });
        }

        const db = getDB();

        // Escape special regex characters
        const escapedQuery = searchTerm.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );

        const users = await db.collection("users")
            .find({
                username: {
                    $regex: escapedQuery,
                    $options: "i"
                }
            })
            .project({
                name: 1,
                username: 1,
                profilePicture: 1
            })
            .limit(20)
            .toArray();

        return res.status(200).json(users);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Failed to search users"
        });
    }
});


//folllow
router.post("/:userId/follow", requireAuth, async (req, res) => {
    const db = getDB();

    const currentUserId = req.session.userId;
    const targetUserId = req.params.userId;

    if (!ObjectId.isValid(currentUserId) || !ObjectId.isValid(targetUserId)) {
        return res.status(400).json({
            error: "Invalid user ID"
        });
    }

    const currentId = new ObjectId(currentUserId);
    const targetId = new ObjectId(targetUserId);

    if (currentId.equals(targetId)) {
        return res.status(400).json({
            error: "You cannot follow yourself"
        });
    }
    const session = getClient().startSession();

    try {
        await session.withTransaction(async () => {
            const users = db.collection("users");

            const currentUser = await users.findOne(
                { _id: currentId },
                { session }
            );

            const targetUser = await users.findOne(
                { _id: targetId },
                { session }
            );

            if (!currentUser || !targetUser) {
                const error = new Error("User not found");
                error.status = 404;
                throw error;
            }

            await users.updateOne(
                { _id: currentId },
                {
                    $addToSet: {
                        following: targetId
                    }
                },
                { session }
            );

            await users.updateOne(
                { _id: targetId },
                {
                    $addToSet: {
                        followers: currentId
                    }
                },
                { session }
            );
        });

        return res.status(200).json({
            message: "User followed successfully"
        });

    } catch (error) {
        console.error(error);

        return res.status(error.status || 500).json({
            error: error.status ? error.message : "Failed to follow user"
        });

    } finally {
        await session.endSession();
    }
});


//unfollow
router.delete("/:userId/follow", requireAuth, async (req, res) => {
    const db = getDB();

    const currentUserId = req.session.userId;
    const targetUserId = req.params.userId;

    if (!ObjectId.isValid(currentUserId) || !ObjectId.isValid(targetUserId)) {
        return res.status(400).json({
            error: "Invalid user ID"
        });
    }

    const currentId = new ObjectId(currentUserId);
    const targetId = new ObjectId(targetUserId);

    if (currentId.equals(targetId)) {
        return res.status(400).json({
            error: "You cannot unfollow yourself"
        });
    }

    const session = getClient().startSession();

    try {
        await session.withTransaction(async () => {
            const users = db.collection("users");

            const currentUser = await users.findOne(
                { _id: currentId },
                { session }
            );

            const targetUser = await users.findOne(
                { _id: targetId },
                { session }
            );

            if (!currentUser || !targetUser) {
                const error = new Error("User not found");
                error.status = 404;
                throw error;
            }

            await users.updateOne(
                { _id: currentId },
                {
                    $pull: {
                        following: targetId
                    }
                },
                { session }
            );

            await users.updateOne(
                { _id: targetId },
                {
                    $pull: {
                        followers: currentId
                    }
                },
                { session }
            );
        });

        return res.status(200).json({
            message: "User unfollowed successfully"
        });

    } catch (error) {
        console.error(error);

        return res.status(error.status || 500).json({
            error: error.status ? error.message : "Failed to unfollow user"
        });

    } finally {
        await session.endSession();
    }
});

//get profile

router.get("/:userId", requireAuth, async (req, res) => {
    try {
        const { userId } = req.params;

        if (
            !ObjectId.isValid(userId) ||
            !ObjectId.isValid(req.session.userId)
        ) {
            return res.status(400).json({
                error: "Invalid user ID"
            });
        }

        const db = getDB();

        const profileOwner = await db.collection("users").findOne({
            _id: new ObjectId(userId)
        });

        if (!profileOwner) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        const viewer = await db.collection("users").findOne({
            _id: new ObjectId(req.session.userId)
        });

        if (!viewer) {
            return res.status(401).json({
                error: "Invalid session"
            });
        }

        const canViewDetails = canViewProfileDetails(
            viewer,
            profileOwner
        );

        const publicProfile = {
            _id: profileOwner._id,
            username: profileOwner.username,
            profilePicture: profileOwner.profilePicture || "",
            canViewDetails,

            // Needed for the existing FollowButton
            isFollowing: (viewer.following || []).some(
                id => String(id) === String(profileOwner._id)
            )
        };

        if (!canViewDetails) {
            return res.status(200).json(publicProfile);
        }

        return res.status(200).json({
            ...publicProfile,
            name: profileOwner.name,
            bio: profileOwner.bio || "",
            socialLinks: profileOwner.socialLinks || [],
            followers: profileOwner.followers || [],
            following: profileOwner.following || []
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Failed to retrieve user"
        });
    }
});

//get followers

router.get("/:userId/followers", requireAuth, async (req, res) => {
    try {
        const { userId } = req.params;

        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({
                error: "Invalid user ID"
            });
        }

        const db = getDB();

        const user = await db.collection("users").findOne({
            _id: new ObjectId(userId)
        });

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        const followers = await db.collection("users")
            .find({
                _id: {
                    $in: user.followers || []
                }
            })
            .project({
                name: 1,
                username: 1,
                profilePicture: 1
            })
            .toArray();

        return res.status(200).json(followers);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Failed to retrieve followers"
        });
    }
});


//get following
router.get("/:userId/following", requireAuth, async (req, res) => {
    try {
        const { userId } = req.params;

        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({
                error: "Invalid user ID"
            });
        }

        const db = getDB();

        const user = await db.collection("users").findOne({
            _id: new ObjectId(userId)
        });

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        const following = await db.collection("users")
            .find({
                _id: {
                    $in: user.following || []
                }
            })
            .project({
                name: 1,
                username: 1,
                profilePicture: 1
            })
            .toArray();

        return res.status(200).json(following);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Failed to retrieve following"
        });
    }
});

//mutual friends
router.get("/me/friends", requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({
                error: "Invalid user ID"
            });
        }

        const db = getDB();

        const user = await db.collection("users").findOne({
            _id: new ObjectId(userId)
        });

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        const followers = user.followers || [];
        const following = user.following || [];

        const mutualIds = following.filter(followedId =>
            followers.some(followerId =>
                followerId.equals(followedId)
            )
        );

        const friends = await db.collection("users")
            .find({
                _id: {
                    $in: mutualIds
                }
            })
            .project({
                name: 1,
                username: 1,
                profilePicture: 1
            })
            .toArray();

        return res.status(200).json(friends);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Failed to retrieve friends"
        });
    }
});






export default router;