import { useState } from "react";

function CreateAlbum({ onAlbumCreated }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [hashtags, setHashtags] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();

        if (!name.trim() || loading) return;

        setLoading(true);
        setError("");

        try {
            const res = await fetch(
                "http://localhost:3000/api/albums",
                {
                    method: "POST",
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
                throw new Error(data.error || "Failed to create album");
            }

            setName("");
            setDescription("");
            setHashtags("");

            onAlbumCreated?.(data.album);

        } catch (error) {
            console.error(error);
            setError(error.message);

        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="mx-auto mb-6 flex max-w-md flex-wrap gap-3 rounded-lg bg-white p-4 text-left shadow [&>*:not(button)]:w-full">
            <h3>Create Album</h3>

            <input
                type="text"
                placeholder="Album name"
                value={name}
                onChange={event => setName(event.target.value)}
                maxLength={100}
                required
            />

            <textarea
                placeholder="Album description (optional)"
                value={description}
                onChange={event => setDescription(event.target.value)}
                maxLength={500}
            />

            <input
                type="text"
                placeholder="Hashtags (e.g. #holiday #summer)"
                value={hashtags}
                onChange={event => setHashtags(event.target.value)}
                maxLength={500}
            />

            <button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Album"}
            </button>

            {error && (
                <p className="my-2 text-red-600">{error}</p>
            )}
        </form>
    );
}

export default CreateAlbum;