import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Friends() {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadFriends() {
            try {
                const res = await fetch(
                    "http://localhost:3000/api/users/me/friends",
                    {
                        credentials: "include"
                    }
                );

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Failed to load friends");
                }

                setFriends(data);

            } catch (error) {
                console.error(error);
                setError(error.message);

            } finally {
                setLoading(false);
            }
        }

        loadFriends();
    }, []);

    if (loading) {
        return <p className="py-6 text-gray-600">Loading friends...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className="friends">
            <h3>Friends</h3>

            {friends.length === 0 ? (
                <p>You don't have any mutual followers yet.</p>
            ) : (
                <div className="flex flex-wrap justify-center gap-4">
                    {friends.map(friend => {
                        const image = friend.profilePicture
                            ? `http://localhost:3000${friend.profilePicture}`
                            : "https://placehold.co/120x120";

                        return (
                            <Link
                                key={friend._id}
                                to={`/users/${friend._id}`}
                                className="flex w-24 flex-col items-center rounded-lg bg-gray-50 p-2 text-sm hover:bg-gray-100"
                            >
                                <img
                                    src={image}
                                    alt={friend.username}
                                    className="rounded-full object-cover"
                                    width="60"
                                    height="60"
                                />

                                <p>{friend.username}</p>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default Friends;