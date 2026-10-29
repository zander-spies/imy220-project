import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Comments({ postId }) {
    const { user } = useAuth();

    const [comments, setComments] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState("");

    async function loadComments(signal) {
        const res = await fetch(
            `http://localhost:3000/api/posts/${postId}/comments`,
            {
                credentials: "include",
                signal
            }
        );

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || "Failed to load comments");
        }

        return data;
    }

    useEffect(() => {
        const controller = new AbortController();

        setLoading(true);
        setError("");
        setComments([]);

        loadComments(controller.signal)
            .then(data => {
                if (!controller.signal.aborted) {
                    setComments(data);
                }
            })
            .catch(error => {
                if (error.name !== "AbortError") {
                    console.error(error);
                    setError(error.message);
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            });

        return () => controller.abort();
    }, [postId]);

    async function handleSubmit(event) {
        event.preventDefault();

        if (!text.trim() || submitting) return;

        setSubmitting(true);
        setError("");

        try {
            const res = await fetch(
                `http://localhost:3000/api/posts/${postId}/comments`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        text: text.trim()
                    })
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to add comment");
            }

            setText("");

            const updatedComments = await loadComments();
            setComments(updatedComments);

        } catch (error) {
            console.error(error);
            setError(error.message);

        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(commentId) {
        if (deletingId) return;

        setDeletingId(commentId);
        setError("");

        try {
            const res = await fetch(
                `http://localhost:3000/api/posts/${postId}/comments/${commentId}`,
                {
                    method: "DELETE",
                    credentials: "include"
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to delete comment");
            }

            setComments(prev =>
                prev.filter(comment => comment._id !== commentId)
            );

        } catch (error) {
            console.error(error);
            setError(error.message);

        } finally {
            setDeletingId(null);
        }
    }

    return (
        <div className="w-full border-t border-gray-200 pt-4">
            <h3>Comments</h3>

            {loading && <p className="py-6 text-gray-600">Loading comments...</p>}

            {error && (
                <p className="my-2 text-red-600">{error}</p>
            )}

            {!loading && comments.length === 0 && (
                <p>No comments yet.</p>
            )}

            {!loading && comments.map(comment => {
                const profilePic = comment.profilePicture
                    ? `http://localhost:3000${comment.profilePicture}`
                    : "https://placehold.co/40x40";

                const isOwner =
                    String(user?._id) === String(comment.userId);

                return (
                    <div key={comment._id} className="mb-3 rounded-md bg-gray-50 p-3">
                        <Link to={`/users/${comment.userId}`} className="flex items-center gap-2 hover:text-brand">
                            <img
                                src={profilePic}
                                alt={comment.username}
                                className="rounded-full object-cover"
                                width="35"
                                height="35"
                            />

                            <strong>{comment.username}</strong>
                        </Link>

                        <p className="my-1">{comment.text}</p>

                        <small className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleString()}
                        </small>

                        {isOwner && (
                            <button
                                type="button"
                                onClick={() => handleDelete(comment._id)}
                                className="mt-2 bg-red-600 px-3 py-1 text-sm hover:bg-red-700"
                                disabled={deletingId !== null}
                            >
                                {deletingId === comment._id
                                    ? "Deleting..."
                                    : "Delete"}
                            </button>
                        )}
                    </div>
                );
            })}

            <form onSubmit={handleSubmit} className="mt-4 flex flex-col items-start gap-2">
                <textarea
                    placeholder="Write a comment..."
                    value={text}
                    onChange={event => setText(event.target.value)}
                    maxLength={1000}
                    required
                />

                <button
                    type="submit"
                    disabled={submitting || !text.trim()}
                >
                    {submitting ? "Posting..." : "Post Comment"}
                </button>
            </form>
        </div>
    );
}

export default Comments;