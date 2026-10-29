import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function SearchResults({ query }) {
    const [results, setResults] = useState({
        users: [],
        posts: [],
        albums: []
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        const searchTerm = query.trim();

        if (!searchTerm) {
            setResults({
                users: [],
                posts: [],
                albums: []
            });

            setLoading(false);
            setError("");
            return;
        }

        setLoading(true);
        setError("");

        // Clear previous results while searching
        setResults({
            users: [],
            posts: [],
            albums: []
        });

        // Wait 300ms after the user stops typing
        const timeout = setTimeout(async () => {
            try {
                const res = await fetch(
                    `http://localhost:3000/api/search?q=${encodeURIComponent(searchTerm)}`,
                    {
                        credentials: "include",
                        signal: controller.signal
                    }
                );

                if (!res.ok) {
                    throw new Error(
                        `Search failed (HTTP ${res.status})`
                    );
                }

                const data = await res.json();

                if (!controller.signal.aborted) {
                    setResults({
                        users: data.users || [],
                        posts: data.posts || [],
                        albums: data.albums || []
                    });
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
        }, 300);

        return () => {
            clearTimeout(timeout);
            controller.abort();
        };

    }, [query]);

    if (!query.trim()) {
        return null;
    }

    const { users, posts, albums } = results;

    const noResults =
        users.length === 0 &&
        posts.length === 0 &&
        albums.length === 0;

    return (
        <div className="mt-2 rounded-lg bg-white p-3 text-left shadow">

            {loading && <p>Searching...</p>}

            {error && (
                <p className="my-2 text-red-600">{error}</p>
            )}

            {!loading && !error && (
                <>
                    {/* Users */}
                    {users.length > 0 && (
                        <section className="mb-3">
                            <h3>Users</h3>

                            {users.map(user => (
                                <Link
                                    key={user._id}
                                    to={`/users/${user._id}`}
                                    className="flex items-center gap-3 rounded-md p-2 hover:bg-gray-100"
                                >
                                    <img
                                        src={
                                            user.profilePicture
                                                ? `http://localhost:3000${user.profilePicture}`
                                                : "https://placehold.co/40x40"
                                        }
                                        alt={user.username}
                                        className="rounded-full object-cover"
                                        width="40"
                                        height="40"
                                    />

                                    <span>{user.username}</span>
                                </Link>
                            ))}
                        </section>
                    )}

                    {/* Posts */}
                    {posts.length > 0 && (
                        <section className="mb-3">
                            <h3>Posts</h3>

                            {posts.map(post => (
                                <Link
                                    key={post._id}
                                    to={`/posts/${post._id}`}
                                    className="flex items-center gap-3 rounded-md p-2 hover:bg-gray-100"
                                >
                                    <img
                                        src={`http://localhost:3000${post.imageUrl}`}
                                        alt={post.caption}
                                        className="rounded object-cover"
                                        width="50"
                                        height="50"
                                    />

                                    <span>{post.caption}</span>
                                </Link>
                            ))}
                        </section>
                    )}

                    {/* Albums */}
                    {albums.length > 0 && (
                        <section className="mb-3">
                            <h3>Albums</h3>

                            {albums.map(album => (
                                <Link
                                    key={album._id}
                                    to={`/albums/${album._id}`}
                                    className="flex items-center gap-3 rounded-md p-2 hover:bg-gray-100"
                                >
                                    <span>📁</span>

                                    <div>
                                        <strong>{album.name}</strong>
                                        <p className="text-sm text-gray-600">{album.description}</p>
                                    </div>
                                </Link>
                            ))}
                        </section>
                    )}

                    {noResults && (
                        <p>No results found.</p>
                    )}
                </>
            )}
        </div>
    );
}

export default SearchResults;