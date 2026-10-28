// import "./ProfileHeader.css";

function ProfileHeader(profileHeader) {
  return (
    <div className="profile-header">
      <img src={profileHeader.profilePic} alt={profileHeader.username} className="profile-pic" />
      <h2 className="profile-username">{profileHeader.username}</h2>
    </div>
  );
}

export default ProfileHeader;