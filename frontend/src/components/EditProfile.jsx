import { useState } from "react";
import ProfileHeader from "./ProfileHeader";
import Bio from "./Bio";
import Socials from "./Socials";
import Friends from "./Friends";
import Profile from "../pages/Profile";

function EditProfile(profileInfo){
    const [image, setImage] = useState("");
    const [username, setUsername] = useState(profileInfo.username);
    const [bio, setBio] = useState(profileInfo.bio);


    return(
        <div>
            <button onClick={() => profileInfo.onSave(username, bio)} >Save</button>
            {/* {editTab === false && <Profile  username={username} bio={bio}/>} */}
            <div className="profile-header">
                {/* <img src={image} alt={profileInfo.username} className="profile-pic" /> */}
                <label htmlFor="image">Image</label>
                <input
                    id="image"
                    type="file"
                    onChange={(e) => setImage(e.target.image)}
                    accept="image/*"
                />

                <br/>
                <label htmlFor="username">Username</label>
                <input
                    id="username"
                    placeholder={profileInfo.username}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <br/>
                <label htmlFor="bio">Bio</label>
                <input
                    id="bio"
                    placeholder={profileInfo.bio}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                />

            </div>
            


        </div>
    );
}

export default EditProfile;