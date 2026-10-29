// import "./ProfileHeader.css";

function ProfileHeader(profileHeader) {
  return (
    <div className="mb-4 flex flex-col items-center gap-2">
      <img src={profileHeader.profilePic} alt={profileHeader.username} className="h-28 w-28 rounded-full object-cover shadow" />
      <h2 className="mb-0 text-2xl font-semibold">{profileHeader.username}</h2>
    </div>
  );
}

export default ProfileHeader;