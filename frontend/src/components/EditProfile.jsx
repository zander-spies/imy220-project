import { useState } from "react";
import ProfileHeader from "./ProfileHeader";
import Bio from "./Bio";
import Socials from "./Socials";
import Friends from "./Friends";
import Profile from "../pages/Profile";

function EditProfile({ profilePic, username: initialUsername, bio: initialBio, socialLinks: initialSocialLinks, onSave }) {
    const [username, setUsername] = useState(initialUsername);
    const [bio, setBio] = useState(initialBio);
    const [image, setImage] = useState(null);
    const [socialLinks, setSocialLinks] = useState(() => initialSocialLinks.map(link => ({...link})));

    function addSocialLink() {
        setSocialLinks(previousLinks => [
            ...previousLinks,
            {
                platform: "",
                url: ""
            }
        ]);
    }

    function updateSocialLink(index, field, value) {
        setSocialLinks(previousLinks =>
            previousLinks.map((link, i) =>
                i === index
                    ? { ...link, [field]: value }
                    : link
            )
        );
    }

    function removeSocialLink(index) {
        setSocialLinks(previousLinks =>
            previousLinks.filter((link, i) => i !== index)
        );
    }

    return(
        <div className="mx-auto max-w-md text-left">
            <button onClick={() => onSave(username, bio, image, socialLinks)} className="mb-4">Save</button>
            {/* {editTab === false && <Profile  username={username} bio={bio}/>} */}
            <div className="rounded-lg bg-white p-5 shadow">
                {/* <img src={image} alt={profileInfo.username} className="profile-pic" /> */}
                <label htmlFor="image">Image</label>
                <input
                    id="image"
                    type="file"
                    onChange={(e) => setImage(e.target.files[0] || null)}
                    accept="image/*"
                    className="text-sm"
                />

                <br className="hidden"/>
                <label htmlFor="username" className="mt-3">Username</label>
                <input
                    id="username"
                    placeholder={initialUsername}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <br className="hidden"/>
                <label htmlFor="bio" className="mt-3">Bio</label>
                <input
                    id="bio"
                    placeholder={initialBio}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                />

                <div className="mt-6">
                    <h3>Social Links</h3>

                    {socialLinks.map((link, index) => (
                        <div key={index} className="mb-2 flex flex-col gap-2 sm:flex-row">
                            <input
                                type="text"
                                placeholder="Platform"
                                value={link.platform}
                                onChange={(e) =>
                                    updateSocialLink(index, "platform", e.target.value)
                                }
                            />

                            <input
                                type="url"
                                placeholder="https://example.com/profile"
                                value={link.url}
                                onChange={(e) =>
                                    updateSocialLink(index, "url", e.target.value)
                                }
                            />

                            <button type="button" onClick={() => removeSocialLink(index)} className="bg-red-600 hover:bg-red-700">
                                Remove
                            </button>
                        </div>
                    ))}

                    <button type="button" onClick={addSocialLink} className="mt-2">
                        + Add Social Link
                    </button>
                </div>

            </div>
            


        </div>
    );
}

export default EditProfile;