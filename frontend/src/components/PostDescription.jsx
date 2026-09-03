function PostDescription({
  username = "jdoe123",
  caption = "Beautiful sunset landing at JFK today",
  onEdit,
}) {
  return (
    <div className="post-description">
      <p><strong>{username}</strong>: {caption}</p>
      <button onClick={onEdit}>Edit Post</button>
    </div>
  );
}

export default PostDescription;