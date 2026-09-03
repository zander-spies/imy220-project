// import "./ProfileHeader.css";

function ProfileHeader({ profilePic = "https://placehold.co/120x120", username = "jdoe123" }) {
  return (
    <div className="profile-header">
      <img src={profilePic} alt={username} className="profile-pic" />
      <h2 className="profile-username">{username}</h2>
    </div>
  );
}

export default ProfileHeader;