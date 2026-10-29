import { useEffect, useState } from "react";
import PreviewPost from "./PreviewPost";

function PostsList({ userId }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        async function loadPosts() {
            setLoading(true);
            setError("");

            try {
                const endpoint = userId
                    ? `http://localhost:3000/api/posts/user/${userId}`
                    : "http://localhost:3000/api/posts/me";

                const res = await fetch(endpoint, {
                    credentials: "include",
                    signal: controller.signal
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Failed to load posts");
                }

                setPosts(data);

            } catch (error) {
                if (error.name !== "AbortError") {
                    console.error(error);
                    setError(error.message);
                }

            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        loadPosts();

        return () => controller.abort();

    }, [userId]);

    if (loading) {
        return <p className="py-6 text-gray-600">Loading posts...</p>;
    }

    if (error) {
        return <p className="my-2 text-red-600">{error}</p>;
    }

    return (
      <div className="mt-8">
          <h2>Posts</h2>

          {posts.length === 0 ? (
              <p className="text-gray-600">No posts yet.</p>
          ) : (
              <div className="flex flex-wrap justify-center gap-8">
                  {posts.map(post => (
                      <PreviewPost
                          key={post._id}
                          post={post}
                      />
                  ))}
              </div>
          )}
      </div>
  );
}

export default PostsList;