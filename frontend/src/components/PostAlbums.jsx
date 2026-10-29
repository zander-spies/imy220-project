import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function PostAlbums({ postId }) {
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!postId) {
            setAlbums([]);
            setLoading(false);
            return;
        }

        const controller = new AbortController();

        async function loadAlbums() {
            setLoading(true);
            setError("");

            try {
                const res = await fetch(
                    `http://localhost:3000/api/posts/${postId}/albums`,
                    {
                        credentials: "include",
                        signal: controller.signal
                    }
                );

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(
                        data.error || "Failed to load albums"
                    );
                }

                if (!controller.signal.aborted) {
                    setAlbums(data);
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

        loadAlbums();

        return () => controller.abort();
    }, [postId]);

    if (loading) {
        return <p className="py-6 text-gray-600">Loading albums...</p>;
    }

    if (error) {
        return <p className="my-2 text-red-600">{error}</p>;
    }

    if (albums.length === 0) {
        return null;
    }

    return (
        <div className="w-full">
            <h3>Albums</h3>

            <div className="flex flex-wrap gap-2">
                {albums.map(album => (
                    <Link
                        key={album._id}
                        to={`/albums/${album._id}`}
                        className="rounded-full bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
                    >
                        📁 {album.name}
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default PostAlbums;