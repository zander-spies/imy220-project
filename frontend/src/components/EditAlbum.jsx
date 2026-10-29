import { useState } from "react";

function EditAlbum({ album, onAlbumUpdated, onCancel }) {
    const [name, setName] = useState(album.name);
    const [description, setDescription] = useState(
        album.description || ""
    );

    const [hashtags, setHashtags] = useState(
        (album.hashtags || []).map(tag => `#${tag}`).join(" ")
    );

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();

        if (!name.trim() || loading) {
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch(
                `http://localhost:3000/api/albums/${album._id}`,
                {
                    method: "PATCH",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name,
                        description,
                        hashtags
                    })
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.error || "Failed to update album"
                );
            }

            onAlbumUpdated(data.album);

        } catch (error) {
            console.error(error);
            setError(error.message);

        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-wrap gap-3 text-left [&>*:not(button)]:w-full">
            <h2>Edit Album</h2>

            <input
                type="text"
                value={name}
                onChange={event => setName(event.target.value)}
                maxLength={100}
                required
            />

            <textarea
                value={description}
                onChange={event => setDescription(event.target.value)}
                maxLength={500}
            />

            <input
                type="text"
                value={hashtags}
                onChange={event => setHashtags(event.target.value)}
                maxLength={500}
                placeholder="Hashtags"
            />

            <button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
            </button>

            <button type="button" onClick={onCancel} className="bg-gray-500 hover:bg-gray-600">
                Cancel
            </button>

            {error && <p className="my-2 text-red-600">{error}</p>}
        </form>
    );
}

export default EditAlbum;