import { useState } from "react";
import Navigation from "../components/Navigation";
import ProfileHeader from "../components/ProfileHeader";
import Bio from "../components/Bio";
import Socials from "../components/Socials";
import Friends from "../components/Friends";
import PostsList from "../components/PostsList";
import Albums from "../components/Albums";

function Profile(){
    const [infoTab, setInfoTab] = useState("bio");
    const [contentTab, setContentTab] = useState("posts");
    return(
        
        <div>
            <Navigation />

            <ProfileHeader />

            <div className="tab-buttons">
                <button onClick={() => setInfoTab("bio")}>Bio</button>
                <button onClick={() => setInfoTab("socials")}>Socials</button>
                <button onClick={() => setInfoTab("friends")}>Friends</button>
            </div>

            <div className="info-panel">
                {infoTab === "bio" && <Bio />}
                {infoTab === "socials" && <Socials />}
                {infoTab === "friends" && <Friends />}
            </div>

            <div className="tab-buttons">
                <button onClick={() => setContentTab("posts")}>Posts</button>
                <button onClick={() => setContentTab("albums")}>Albums</button>
            </div>

            <div className="content-panel">
                {contentTab === "posts" && <PostsList />}
                {contentTab === "albums" && <Albums />}
            </div>
        </div>
    );
}

export default Profile;