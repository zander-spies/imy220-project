import { useState } from "react";
import { BrowserRouter, Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import LocalPosts from "../components/LocalPosts";
import GlobalPosts from "../components/GlobalPosts";
import SearchInput from "../components/SearchInput";
import AddPost from "../components/AddPost";

function Home(){
    const [active, setActive] = useState("local");
    return(
        <div>
            <Navigation/>
            <div className="buttons">
                <button onClick={() => setActive("local")}>
                    Local
                </button>
                <button onClick={() => setActive("global")}>
                    Global
                </button>
                <button onClick={() => setActive("addPost")}>
                    Add Post
                </button>
            </div>
            {/* <SearchInput/> */}

            <div className="content">
                {active === "local" && <LocalPosts />}
                {active === "global" && <GlobalPosts />}
                {active === "addPost" && <AddPost/>}
            </div>
        </div>
    );
}

export default Home;