import { Link } from "react-router-dom";

function PreviewPost({ post }) {
    const postImage = `http://localhost:3000${post.imageUrl}`;

    return (
        <Link
            to={`/posts/${post._id}`}
            className="block w-64 overflow-hidden rounded-lg bg-white text-left shadow transition hover:shadow-md"
        >
            <img
                src={postImage}
                alt={post.caption}
                className="h-48 w-full object-cover"
            />

            <p className="line-clamp-2 p-3 text-sm text-gray-800">
                {post.caption}
            </p>
        </Link>
    );
}

export default PreviewPost;