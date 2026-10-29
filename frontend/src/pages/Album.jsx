import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navigation from "../components/Navigation";
import PreviewPost from "../components/PreviewPost";
import { useNavigate } from "react-router-dom";
import EditAlbum from "../components/EditAlbum";
import { Link } from "react-router-dom";

function Album() {
    const { albumId } = useParams();
    const { user } = useAuth();

    const [album, setAlbum] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showAddPosts, setShowAddPosts] = useState(false);
    const [availablePosts, setAvailablePosts] = useState([]);
    const [addingPostId, setAddingPostId] = useState(null);

    const navigate = useNavigate();

    const [editing, setEditing] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const controller = new AbortController();

        async function loadAlbum() {
            setLoading(true);
            setError("");
            setAlbum(null);

            try {
                const res = await fetch(
                    `http://localhost:3000/api/albums/${albumId}`,
                    {
                        credentials: "include",
                        signal: controller.signal
                    }
                );

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Failed to load album");
                }

                if (!controller.signal.aborted) {
                    setAlbum(data);
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

        loadAlbum();

        return () => controller.abort();

    }, [albumId]);

    const loggedInUserId = user?._id ?? user?.id;

    const isOwner =
        album &&
        loggedInUserId != null &&
        String(loggedInUserId) === String(album.userId);

    function handleAlbumUpdated(updatedAlbum) {
        setAlbum(prev => ({
            ...prev,
            ...updatedAlbum
        }));

        setEditing(false);
    }

    async function handleDeleteAlbum() {
        const confirmed = window.confirm(
            "Are you sure you want to delete this album?"
        );

        if (!confirmed || deleting) {
            return;
        }

        setDeleting(true);
        setError("");

        try {
            const res = await fetch(
                `http://localhost:3000/api/albums/${albumId}`,
                {
                    method: "DELETE",
                    credentials: "include"
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.error || "Failed to delete album"
                );
            }

            navigate("/profile");

        } catch (error) {
            console.error(error);
            setError(error.message);
            setDeleting(false);
        }
    }

    async function handleShowAddPosts() {
        if (!isOwner) return;

        if (showAddPosts) {
            setShowAddPosts(false);
            return;
        }

        setError("");

        try {
            const res = await fetch(
                "http://localhost:3000/api/posts/me",
                {
                    credentials: "include"
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to load posts");
            }

            const existingPostIds = new Set(
                album.postIds.map(id => String(id))
            );

            const filteredPosts = data.filter(
                post => !existingPostIds.has(String(post._id))
            );

            setAvailablePosts(filteredPosts);
            setShowAddPosts(true);

        } catch (error) {
            console.error(error);
            setError(error.message);
        }
    }

    async function handleAddPost(postId) {
        if (!isOwner || addingPostId) return;

        setAddingPostId(postId);
        setError("");

        try {
            const res = await fetch(
                `http://localhost:3000/api/albums/${albumId}/posts`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ postId })
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to add post");
            }

            const selectedPost = availablePosts.find(
                post => String(post._id) === String(postId)
            );

            if (selectedPost) {
                setAlbum(prev => ({
                    ...prev,
                    postIds: [...prev.postIds, postId],
                    posts: [...prev.posts, selectedPost]
                }));
            }

            setAvailablePosts(prev =>
                prev.filter(post => String(post._id) !== String(postId))
            );

        } catch (error) {
            console.error(error);
            setError(error.message);

        } finally {
            setAddingPostId(null);
        }
    }

    if (loading) {
        return <p className="py-6 text-gray-600">Loading album...</p>;
    }

    if (error && !album) {
        return <p className="my-2 text-red-600">{error}</p>;
    }

    if (!album) {
        return <p>Album not found.</p>;
    }

    return (
        <div>
            <Navigation />

            <div className="flex flex-col items-center gap-4">

            {editing ? (
                <EditAlbum
                    album={album}
                    onAlbumUpdated={handleAlbumUpdated}
                    onCancel={() => setEditing(false)}
                />
            ) : (
                <>
                    <h1>{album.name}</h1>

                    <p>{album.description}</p>

                    <div className="flex flex-wrap justify-center gap-2 text-brand">
                        {(album.hashtags || []).map(tag => (
                            <Link
                                key={tag}
                                to={`/hashtags/${encodeURIComponent(tag)}`}
                                className="hover:underline"
                            >
                                #{tag}
                            </Link>
                        ))}
                    </div>
                </>
            )}

            {isOwner && !editing && (
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => setEditing(true)}
                    >
                        Edit Album
                    </button>

                    <button
                        type="button"
                        onClick={handleDeleteAlbum}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={deleting}
                    >
                        {deleting ? "Deleting..." : "Delete Album"}
                    </button>
                </div>
            )}

                {isOwner && (
                    <button
                        type="button"
                        onClick={handleShowAddPosts}
                    >
                        {showAddPosts ? "Cancel" : "Add Posts"}
                    </button>
                )}

                {error && (
                    <p className="my-2 text-red-600">{error}</p>
                )}

                {isOwner && showAddPosts && (
                    <div className="w-full rounded-lg bg-white p-4 shadow">
                        <h2>Select Posts to Add</h2>

                        {availablePosts.length === 0 ? (
                            <p>
                                All your posts are already in this album,
                                or you haven't created any posts yet.
                            </p>
                        ) : (
                            <div className="flex flex-wrap justify-center gap-4">
                                {availablePosts.map(post => (
                                    <div
                                        key={post._id}
                                        className="w-48 rounded-lg bg-gray-50 p-2 text-center"
                                    >
                                        <img
                                            src={`http://localhost:3000${post.imageUrl}`}
                                            className="h-32 w-full rounded object-cover"
                                            alt={post.caption}
                                        />

                                        <p className="my-2 text-sm">{post.caption}</p>

                                        <button
                                            type="button"
                                            onClick={() => handleAddPost(post._id)}
                                            disabled={addingPostId !== null}
                                        >
                                            {addingPostId === post._id
                                                ? "Adding..."
                                                : "Add to Album"}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <h2>Album Posts</h2>

                {album.posts.length === 0 ? (
                    <p>This album doesn't contain any posts yet.</p>
                ) : (
                    <div className="flex w-full flex-wrap justify-center gap-8">
                        {album.posts.map(post => (
                            <PreviewPost
                                key={post._id}
                                post={post}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Album;