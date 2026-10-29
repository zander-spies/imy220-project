import { useState } from "react";

function EditPost({ post, onPostUpdated, onCancel }) {
    const [caption, setCaption] = useState(post.caption || "");

    const [hashtags, setHashtags] = useState(
        (post.hashtags || [])
            .map(tag => `#${tag}`)
            .join(" ")
    );

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();

        if (!caption.trim() || loading) {
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch(
                `http://localhost:3000/api/posts/${post._id}`,
                {
                    method: "PATCH",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        caption,
                        hashtags
                    })
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.error || "Failed to update post"
                );
            }

            onPostUpdated(data.post);

        } catch (error) {
            console.error(error);
            setError(error.message);

        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex w-full flex-wrap gap-3 text-left [&>*:not(button)]:w-full">
            <h2>Edit Post</h2>

            <div>
                <img
                    src={`http://localhost:3000${post.imageUrl}`}
                    alt="Post"
                    style={{
                        width: "200px",
                        height: "200px",
                        objectFit: "cover"
                    }}
                />

                <p>The image cannot be changed.</p>
            </div>

            <div>
                <label htmlFor="edit-caption">
                    Caption
                </label>

                <textarea
                    id="edit-caption"
                    value={caption}
                    onChange={event =>
                        setCaption(event.target.value)
                    }
                    maxLength={1000}
                    required
                />
            </div>

            <div>
                <label htmlFor="edit-hashtags">
                    Hashtags
                </label>

                <input
                    id="edit-hashtags"
                    type="text"
                    value={hashtags}
                    onChange={event =>
                        setHashtags(event.target.value)
                    }
                    placeholder="#nature #photography"
                    maxLength={500}
                />
            </div>

            {error && (
                <p className="my-2 text-red-600">{error}</p>
            )}

            <button
                type="submit"
                disabled={loading}
            >
                {loading ? "Saving..." : "Save Changes"}
            </button>

            <button
                type="button"
                onClick={onCancel}
                className="bg-gray-500 hover:bg-gray-600"
                disabled={loading}
            >
                Cancel
            </button>
        </form>
    );
}

export default EditPost;