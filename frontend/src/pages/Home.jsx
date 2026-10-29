import { useState } from "react";

import Navigation from "../components/Navigation";
import SearchInput from "../components/SearchInput";
import LocalPosts from "../components/LocalPosts";
import GlobalPosts from "../components/GlobalPosts";
import AddPost from "../components/AddPost";

function Home() {
    const [activeTab, setActiveTab] = useState("local");
    const [query, setQuery] = useState("");

    return (
        <div className="home">
            <Navigation />

            <div className="mb-4 flex justify-center gap-3">
                <button onClick={() => setActiveTab("local")}>
                    Local
                </button>

                <button onClick={() => setActiveTab("global")}>
                    Global
                </button>

                <button onClick={() => setActiveTab("addPost")}>
                    Add Post
                </button>
            </div>

            {activeTab !== "addPost" && (
                <SearchInput
                    query={query}
                    setQuery={setQuery}
                />
            )}

            <div className="mt-4">
                {activeTab === "local" && (
                    <LocalPosts input={query} />
                )}

                {activeTab === "global" && (
                    <GlobalPosts input={query} />
                )}

                {activeTab === "addPost" && (
                    <AddPost
                        onPostAdded={() => setActiveTab("local")}
                    />
                )}
            </div>
        </div>
    );
}

export default Home;