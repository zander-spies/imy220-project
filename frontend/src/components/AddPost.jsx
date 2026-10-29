import { useState } from "react";

function AddPost({ onPostAdded }) {
    const [image, setImage] = useState(null);
    const [caption, setCaption] = useState("");
    const [hashtags, setHashtags] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [fileInputKey, setFileInputKey] = useState(0);

    async function handleSubmit(event) {
        event.preventDefault();

        if (loading) return;

        setError("");

        if (!image) {
            setError("Please ensure you added an image");
            return;
        }

        if (!caption.trim()) {
            setError("Please ensure you added a description");
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();

            formData.append("image", image);
            formData.append("caption", caption);
            formData.append("hashtags", hashtags);

            const res = await fetch("http://localhost:3000/api/posts", {
                method: "POST",
                credentials: "include",
                body: formData
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to create post");
            }

            if (onPostAdded) {
                onPostAdded(data.post);
            }

            setImage(null);
            setCaption("");
            setHashtags("");
            setFileInputKey(prev => prev + 1);

        } catch (error) {
            console.error(error);
            setError(error.message);

        } finally {
            setLoading(false);
        }
    }

    return (
        <form className="mx-auto flex max-w-md flex-col gap-2 rounded-lg bg-white p-5 text-left shadow" onSubmit={handleSubmit}>
            <h2>Add Post</h2>

            {error && (
                <p className="rounded-md bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p>
            )}

            <label htmlFor="image">Image</label>
            <input
                key={fileInputKey}
                id="image"
                type="file"
                className="text-sm"
                onChange={(event) =>
                    setImage(event.target.files[0] || null)
                }
                accept="image/jpeg,image/png,image/webp"
            />

            <label htmlFor="caption">Caption</label>
            <textarea
                id="caption"
                placeholder="Enter Post Caption"
                value={caption}
                onChange={(event) => setCaption(event.target.value)}
            />

            <label htmlFor="hashtags">Hashtags</label>
            <textarea
                id="hashtags"
                placeholder="e.g. #nature #photography"
                value={hashtags}
                onChange={(event) => setHashtags(event.target.value)}
            />

            <button type="submit" disabled={loading} className="mt-2">
                {loading ? "Uploading..." : "Add Post"}
            </button>
        </form>
    );
}

export default AddPost;