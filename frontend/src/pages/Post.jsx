import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Navigation from "../components/Navigation";
import Comments from "../components/Comments";
import EditPost from "../components/EditPost";
import PostAlbums from "../components/PostAlbums";


function PostPage() {
    const { postId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [post, setPost] = useState(null);
    const [likes, setLikes] = useState([]);

    const [loading, setLoading] = useState(true);
    const [likeLoading, setLikeLoading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [error, setError] = useState("");

    // Load the post
    useEffect(() => {
        const controller = new AbortController();

        async function loadPost() {
            setLoading(true);
            setError("");
            setPost(null);
            setEditing(false);

            try {
                const res = await fetch(
                    `http://localhost:3000/api/posts/${postId}`,
                    {
                        credentials: "include",
                        signal: controller.signal
                    }
                );

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(
                        data.error || "Failed to load post"
                    );
                }

                if (!controller.signal.aborted) {
                    setPost(data);
                    setLikes(data.likes || []);
                }

            } catch (error) {
                if (error.name !== "AbortError") {
                    console.error(error);
                    setError(error.message);
                }

            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        loadPost();

        return () => controller.abort();
    }, [postId]);

    // Check whether the logged-in user owns this post
    const loggedInUserId = user?._id ?? user?.id;

    const isOwner =
        post &&
        loggedInUserId != null &&
        String(loggedInUserId) === String(post.userId);

    // Check whether the logged-in user liked this post
    const isLiked = likes.some(
        id => String(id) === String(loggedInUserId)
    );

    // Update post after editing
    function handlePostUpdated(updatedPost) {
        setPost(prev => ({
            ...prev,
            ...updatedPost
        }));

        setEditing(false);
    }

    // Delete post
    async function handleDeletePost() {
        if (deleting || !post) {
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to delete this post? This cannot be undone."
        );

        if (!confirmed) {
            return;
        }

        setDeleting(true);
        setError("");

        try {
            const res = await fetch(
                `http://localhost:3000/api/posts/${post._id}`,
                {
                    method: "DELETE",
                    credentials: "include"
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.error || "Failed to delete post"
                );
            }

            navigate("/profile");

        } catch (error) {
            console.error(error);
            setError(error.message);
            setDeleting(false);
        }
    }

    // Like or unlike post
    async function handleLike() {
        if (!user || likeLoading) {
            return;
        }

        setLikeLoading(true);
        setError("");

        try {
            const method = isLiked ? "DELETE" : "POST";

            const res = await fetch(
                `http://localhost:3000/api/posts/${postId}/like`,
                {
                    method,
                    credentials: "include"
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.error || "Failed to update like"
                );
            }

            if (isLiked) {
                setLikes(prev =>
                    prev.filter(
                        id => String(id) !== String(loggedInUserId)
                    )
                );
            } else {
                setLikes(prev => [
                    ...prev,
                    loggedInUserId
                ]);
            }

        } catch (error) {
            console.error(error);
            setError(error.message);

        } finally {
            setLikeLoading(false);
        }
    }

    // Loading state
    if (loading) {
        return <p className="py-6 text-gray-600">Loading post...</p>;
    }

    // Error state
    if (error && !post) {
        return <p className="my-2 text-red-600">{error}</p>;
    }

    // Post not found
    if (!post) {
        return <p>Post not found.</p>;
    }

    const postImage = `http://localhost:3000${post.imageUrl}`;

    const profilePic = post.profilePicture
        ? `http://localhost:3000${post.profilePicture}`
        : "https://placehold.co/50x50";

    return (
        <div>
            <Navigation />

            <div className="flex flex-col gap-6 md:flex-row md:items-start">

                {/* Post image */}
                <div className="md:w-1/2">
                    <img
                        src={postImage}
                        alt={post.caption}
                        className="w-full rounded-lg object-cover shadow"
                    />
                </div>

                <div className="flex flex-col items-start gap-3 rounded-lg bg-white p-5 text-left shadow md:w-1/2">

                    {/* Post author */}
                    <Link to={`/users/${post.userId}`} className="flex items-center gap-2 hover:text-brand">
                        <img
                            src={profilePic}
                            alt={post.username}
                            className="rounded-full object-cover"
                            width="40"
                            height="40"
                        />

                        <strong>{post.username}</strong>
                    </Link>

                    {/* Edit form or post details */}
                    {editing ? (
                        <EditPost
                            post={post}
                            onPostUpdated={handlePostUpdated}
                            onCancel={() => setEditing(false)}
                        />
                    ) : (
                        <>
                            {/* Caption */}
                            <p>{post.caption}</p>

                            {/* Hashtags */}
                            <div className="flex flex-wrap gap-2 text-brand">
                                {(post.hashtags || []).map(tag => (
                                    <Link
                                        key={tag}
                                        to={`/search?q=${encodeURIComponent(`#${tag}`)}`}
                                        className="hover:underline"
                                    >
                                        #{tag}{" "}
                                    </Link>
                                ))}
                            </div>

                            {/* Edit/Delete buttons */}
                            {isOwner && (
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setEditing(true)}
                                    >
                                        Edit Post
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleDeletePost}
                                        className="bg-red-600 hover:bg-red-700"
                                        disabled={deleting}
                                    >
                                        {deleting
                                            ? "Deleting..."
                                            : "Delete Post"}
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                    {/* Albums containing this post */}
                    <PostAlbums postId={post._id} />

                    {/* Likes */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleLike}
                            disabled={likeLoading}
                            aria-pressed={isLiked}
                            className="aria-pressed:bg-gray-500"
                        >
                            {isLiked ? "Unlike" : "Like"}
                        </button>

                        <span>{likes.length} likes</span>
                    </div>

                    {/* Errors */}
                    {error && (
                        <p className="my-2 text-red-600">
                            {error}
                        </p>
                    )}

                    {/* Date */}
                    <small className="text-gray-500">
                        {new Date(post.createdAt).toLocaleString()}
                    </small>

                    {/* Comments */}
                    <Comments postId={post._id} />

                </div>
            </div>
        </div>
    );
}

export default PostPage;