import { useEffect, useState } from "react";
import PreviewPost from "./PreviewPost";

function GlobalPosts({ input = "" }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        async function loadPosts() {
            try {
                const res = await fetch(
                    "http://localhost:3000/api/posts/global",
                    {
                        credentials: "include",
                        signal: controller.signal
                    }
                );

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Failed to load global posts");
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
    }, []);

    const searchTerm = input.toLowerCase().trim();

    const filteredPosts = posts.filter(post => {
        if (!searchTerm) return true;

        return (
            post.caption?.toLowerCase().includes(searchTerm) ||
            post.username?.toLowerCase().includes(searchTerm) ||
            post.hashtags?.some(tag =>
                tag.toLowerCase().includes(searchTerm.replace(/^#/, ""))
            )
        );
    });

    if (loading) {
        return <p className="py-6 text-gray-600">Loading global posts...</p>;
    }

    if (error) {
        return <p className="my-2 text-red-600">{error}</p>;
    }

    return (
        <div className="flex flex-wrap justify-center gap-8">
            <h2 className="w-full">Global Feed</h2>

            {filteredPosts.length === 0 ? (
                <p className="w-full text-gray-600">No posts found.</p>
            ) : (
                filteredPosts.map(post => (
                    <PreviewPost key={post._id} post={post} />
                ))
            )}
        </div>
    );
}

export default GlobalPosts;