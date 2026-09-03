import { useState } from "react";
import { BrowserRouter, Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import LocalPosts from "../components/LocalPosts";
import GlobalPosts from "../components/GlobalPosts";
import SearchInput from "../components/SearchInput";

function Home(){
    const [active, setActive] = useState("local");
    return(
        <div>
            <Navigation/>
            <SearchInput/>
            <div className="buttons">
                <button onClick={() => setActive("local")}>
                    Local
                </button>
                <button onClick={() => setActive("global")}>
                    Global
                </button>
            </div>

            <div className="content">
                {active === "local" && <LocalPosts />}
                {active === "global" && <GlobalPosts />}
            </div>
        </div>
    );
}

export default Home;