import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function UserSearchResults({ query }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const searchTerm = query.trim();

        if (!searchTerm) {
            setUsers([]);
            setError("");
            setLoading(false);
            return;
        }

        const controller = new AbortController();

        const timer = setTimeout(async () => {
            setLoading(true);
            setError("");

            try {
                const res = await fetch(
                    `http://localhost:3000/api/users/search?q=${encodeURIComponent(searchTerm)}`,
                    {
                        credentials: "include",
                        signal: controller.signal
                    }
                );

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Failed to search users");
                }

                setUsers(data);

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
            clearTimeout(timer);
            controller.abort();
        };

    }, [query]);

    if (!query.trim()) {
        return null;
    }

    return (
        <div className="rounded-lg bg-white p-3 text-left shadow">
            <h3>Users</h3>

            {loading && <p>Searching...</p>}

            {error && <p className="my-2 text-red-600">{error}</p>}

            {!loading && !error && users.length === 0 && (
                <p>No users found.</p>
            )}

            {!loading && !error && users.map(user => {
                const image = user.profilePicture
                    ? `http://localhost:3000${user.profilePicture}`
                    : "https://placehold.co/60x60";

                return (
                    <Link
                        key={user._id}
                        to={`/users/${user._id}`}
                        className="flex items-center gap-3 rounded-md p-2 hover:bg-gray-100"
                    >
                        <img
                            src={image}
                            alt={user.username}
                            className="rounded-full object-cover"
                            width="50"
                            height="50"
                        />

                        <div>
                            <strong>{user.username}</strong>
                            <p className="text-sm text-gray-600">{user.name}</p>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}

export default UserSearchResults;