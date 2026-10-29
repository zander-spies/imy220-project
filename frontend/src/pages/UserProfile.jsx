import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Navigation from "../components/Navigation";
import ProfileHeader from "../components/ProfileHeader";
import Bio from "../components/Bio";
import Socials from "../components/Socials";
import FollowButton from "../components/FollowButton";
import PostsList from "../components/PostsList";
import Albums from "../components/Albums";

function UserProfile() {
    const { userId } = useParams();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function loadProfile() {
        try {
            const res = await fetch(
                `http://localhost:3000/api/users/${userId}`,
                {
                    credentials: "include"
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.error || "Failed to load profile"
                );
            }

            setProfile(data);

        } catch (error) {
            console.error(error);
            setError(error.message);

        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        setLoading(true);
        setError("");
        setProfile(null);

        loadProfile();
    }, [userId]);

    if (loading) {
        return <p className="py-6 text-gray-600">Loading profile...</p>;
    }

    if (error) {
        return <p className="my-2 text-red-600">{error}</p>;
    }

    if (!profile) {
        return <p>User not found.</p>;
    }

    const profilePic = profile.profilePicture
        ? `http://localhost:3000${profile.profilePicture}`
        : "https://placehold.co/120x120";

    return (
        <div>
            <Navigation />

            <ProfileHeader
                profilePic={profilePic}
                username={profile.username}
            />

            <FollowButton
    key={profile._id}
    targetUserId={profile._id}
    isFollowing={profile.isFollowing}
    onFollowChange={loadProfile}
/>

            {profile.canViewDetails ? (
                <>
                    <div className="mb-4 flex justify-center gap-6 text-gray-700">
                        <p>
                            Followers: {profile.followers?.length || 0}
                        </p>

                        <p>
                            Following: {profile.following?.length || 0}
                        </p>
                    </div>

                    <Bio bio={profile.bio} />

                    <Socials
                        socialLinks={profile.socialLinks || []}
                    />

                    <PostsList userId={profile._id} />

                    <Albums userId={profile._id} />
                </>
            ) : (
                <div className="mx-auto mt-6 max-w-md rounded-lg bg-white p-6 text-gray-600 shadow">
                    <p>
                        You must be mutual friends to view
                        this user's profile details.
                    </p>
                </div>
            )}
        </div>
    );
}

export default UserProfile;