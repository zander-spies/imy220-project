function PostImage({ image = "https://placehold.co/600x400" }) {
  return (
    <div className="post-image-wrapper">
      <img src={image} alt="Post" className="post-image" />
    </div>
  );
}

export default PostImage;