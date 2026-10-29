import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

function FollowButton({
    targetUserId,
    isFollowing: initialIsFollowing = false,
    onFollowChange
}) {
    const { user, refreshUser } = useAuth();

    const [isFollowing, setIsFollowing] = useState(
        Boolean(initialIsFollowing)
    );

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Keep button synchronized with the profile data
    useEffect(() => {
        setIsFollowing(Boolean(initialIsFollowing));
    }, [initialIsFollowing, targetUserId]);

    async function handleFollow() {
        if (!user || loading) return;

        setLoading(true);
        setError("");

        try {
            const method = isFollowing ? "DELETE" : "POST";

            const res = await fetch(
                `http://localhost:3000/api/users/${targetUserId}/follow`,
                {
                    method,
                    credentials: "include"
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.error || "Failed to update follow status"
                );
            }

            const newStatus = method === "POST";

            // Update the button immediately
            setIsFollowing(newStatus);

            // Refresh the logged-in user's information
            await refreshUser();

            // Refresh the viewed profile
            if (onFollowChange) {
                await onFollowChange(newStatus);
            }

        } catch (error) {
            console.error(error);
            setError(error.message);

        } finally {
            setLoading(false);
        }
    }

    if (!user || String(user._id) === String(targetUserId)) {
        return null;
    }

    return (
        <div className="mb-4">
            <button
                type="button"
                onClick={handleFollow}
                disabled={loading}
            >
                {loading
                    ? "Loading..."
                    : isFollowing
                        ? "Unfollow"
                        : "Follow"}
            </button>

            {error && (
                <p className="my-2 text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}

export default FollowButton;