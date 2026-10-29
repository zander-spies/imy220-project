import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CreateAlbum from "./CreateAlbum";

function Albums({ userId }) {
    const { user } = useAuth();

    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loggedInUserId = user?._id ?? user?.id;

    const isOwner =
        !userId ||
        (loggedInUserId != null &&
            String(loggedInUserId) === String(userId));

    useEffect(() => {
        const controller = new AbortController();

        async function loadAlbums() {
            setLoading(true);
            setError("");
            setAlbums([]);

            try {
                const endpoint = isOwner
                    ? "http://localhost:3000/api/albums/me"
                    : `http://localhost:3000/api/albums/user/${userId}`;

                const res = await fetch(endpoint, {
                    credentials: "include",
                    signal: controller.signal
                });

                const data = await res.json();
                console.log("Albums API response:", data);
                console.log("Albums endpoint:", endpoint);
                console.log("Is owner:", isOwner);

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

    }, [userId, isOwner]);

    function handleAlbumCreated(newAlbum) {
        setAlbums(prev => [newAlbum, ...prev]);
    }

    return (
        <div className="mt-8">
            <h2>Albums</h2>

            {isOwner && (
                <CreateAlbum
                    onAlbumCreated={handleAlbumCreated}
                />
            )}

            {loading && <p className="py-6 text-gray-600">Loading albums...</p>}

            {error && (
                <p className="my-2 text-red-600">{error}</p>
            )}

            {!loading && !error && albums.length === 0 && (
                <p>No albums yet.</p>
            )}

            {!loading && !error && albums.length > 0 && (
                <div className="flex flex-wrap justify-center gap-4">
                    {albums.map(album => (
                        <Link
                            key={album._id}
                            to={`/albums/${album._id}`}
                            className="block w-56 rounded-lg bg-white p-4 text-left shadow transition hover:shadow-md"
                        >
                            <h3>{album.name}</h3>

                            <p className="text-sm text-gray-600">{album.description}</p>

                            <small className="mt-2 block text-gray-500">
                                {album.postIds?.length || 0} posts
                            </small>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Albums;