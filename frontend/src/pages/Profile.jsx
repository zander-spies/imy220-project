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

function Profile(updatedProfile){
    const [infoTab, setInfoTab] = useState("bio");
    const [editTab, setEditTab] = useState(false);
    const [contentTab, setContentTab] = useState("posts");
    const [profilePic, setProfilePic] = useState("https://placehold.co/120x120")
    const [username, setUsername] = useState(updatedProfile.username || "joe");
    const [bio, setBio] = useState(updatedProfile.bio || "indie");

    function handleSave(user, bio){
        setEditTab(false);
        setUsername(user);
        setBio(bio)
    }

    return(
        
        <div>
            <Navigation />

            {editTab === false && <button onClick={() => setEditTab(true)}>Edit Profile</button>}
            
            {editTab === true && <EditProfile profilePic={profilePic} username={username} bio={bio} onSave={handleSave}/>}
            
            
            {editTab === false && 
            <div>
            
            <ProfileHeader profilePic={profilePic} username={username}/>

            <div className="tab-buttons">
                <button onClick={() => setInfoTab("bio")}>Bio</button>
                <button onClick={() => setInfoTab("socials")}>Socials</button>
                <button onClick={() => setInfoTab("friends")}>Friends</button>
            </div>

            <div className="info-panel">
                {infoTab === "bio" && <Bio bio={bio}/>}
                {infoTab === "socials" && <Socials />}
                {infoTab === "friends" && <Friends />}
            </div>

            <div className="tab-buttons">
                <button onClick={() => setContentTab("posts")}>Posts</button>
                <button onClick={() => setContentTab("albums")}>Albums</button>
                <button onClick={() => setContentTab("addPost")}>Add Post</button>
            </div>

            <div className="content-panel">
                {contentTab === "posts" && <PostsList />}
                {contentTab === "albums" && <Albums />}
                {contentTab === "addPost" && <AddPost />}
            </div>
        </div>}
        </div>
            
    );
}

export default Profile;