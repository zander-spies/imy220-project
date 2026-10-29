function PostImage({ image = "https://placehold.co/600x400" }) {
  return (
    <div className="mx-auto max-w-xl">
      <img src={image} alt="Post" className="w-full rounded-lg object-cover" />
    </div>
  );
}

export default PostImage;