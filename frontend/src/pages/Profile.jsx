import { useState } from "react";
import Navigation from "../components/Navigation";
import ProfileHeader from "../components/ProfileHeader";
import Bio from "../components/Bio";
import Socials from "../components/Socials";
import Friends from "../components/Friends";
import PostsList from "../components/PostsList";
import Albums from "../components/Albums";
import AddPost from "../components/AddPost";
import EditProfile from "../components/EditProfile";
import { useAuth } from "../context/AuthContext";


function Profile(){
    const [infoTab, setInfoTab] = useState("bio");
    const [editTab, setEditTab] = useState(false);
    const [contentTab, setContentTab] = useState("posts");
    const { user, refreshUser } = useAuth();
    const username = user?.username || "";
    const bio = user?.bio || "";
    const profilePic = user?.profilePicture
    ? `http://localhost:3000${user.profilePicture}`
    : "https://placehold.co/120x120";

    function handlePostAdded(newPost) {
        setContentTab("posts");
    }

    async function handleSave(updatedUsername, updatedBio, image, socialLinks) {
        try {
            //Update username and bio
            const res = await fetch("http://localhost:3000/api/users/me", {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: updatedUsername,
                    bio: updatedBio,
                    socialLinks
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to update profile");
            }

            //Upload image if selected
            if (image) {
                const formData = new FormData();

                formData.append("avatar", image);

                const imageRes = await fetch(
                    "http://localhost:3000/api/users/me/avatar",
                    {
                        method: "POST",
                        credentials: "include",
                        body: formData
                    }
                );

                const imageData = await imageRes.json();

                if (!imageRes.ok) {
                    throw new Error(
                        imageData.error || "Failed to upload profile picture"
                    );
                }
            }

            //Refresh user information
            const refreshed = await refreshUser();

            if (!refreshed) {
                throw new Error("Failed to refresh profile");
            }

            //Close editing form
            setEditTab(false);

        } catch (error) {
            console.error("Failed to save profile:", error);
        }
    }

    return(
        
        <div>
            <Navigation />

            {editTab === false && <button onClick={() => setEditTab(true)} className="mb-4">Edit Profile</button>}
            
            {editTab === true && <EditProfile profilePic={profilePic} username={username} bio={bio} socialLinks={user?.socialLinks || []} onSave={handleSave}/>}
            
            
            {editTab === false && 
            <div>
            
            <ProfileHeader profilePic={profilePic} username={username}/>

            <div className="mb-4 flex justify-center gap-3">
                <button onClick={() => setInfoTab("bio")}>Bio</button>
                <button onClick={() => setInfoTab("socials")}>Socials</button>
                <button onClick={() => setInfoTab("friends")}>Friends</button>
            </div>

            <div className="mx-auto mb-8 max-w-xl rounded-lg bg-white p-4 shadow">
                {infoTab === "bio" && <Bio bio={bio}/>}
                {infoTab === "socials" && (<Socials socialLinks={user?.socialLinks || []} />)}
                {infoTab === "friends" && <Friends />}
            </div>

            <div className="mb-4 flex justify-center gap-3">
                <button onClick={() => setContentTab("posts")}>Posts</button>
                <button onClick={() => setContentTab("albums")}>Albums</button>
                <button onClick={() => setContentTab("addPost")}>Add Post</button>
            </div>

            <div className="mt-2">
                {contentTab === "posts" && <PostsList />}
                {contentTab === "albums" && <Albums />}
                {contentTab === "addPost" && (<AddPost onPostAdded={handlePostAdded} />)}
            </div>
        </div>}
        </div>
            
    );
}

export default Profile;