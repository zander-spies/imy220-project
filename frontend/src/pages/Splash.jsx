import logo from "../assets/logo.png";
import nameLogo from "../assets/name.png";
import { useState } from "react";
import "./Splash.css"
import SignUp from "../components/SignUp";
import Login from "../components/Login";

function Splash(){
    const [active, setActive] = useState('signup');
    return(
        <div>
            <div className="images">
                <img src={logo} alt="Logo" id="logoSplash" />
                <img src={nameLogo} alt="NameJetFrame" id="nameSplash"/>
            </div>
            <h1>
                Share the Skies.
                <br/>
                Discover the world.
            </h1>

            <h3 className="subtitle">
                Join a community of pilots, aviation photographers, <br/>
                and enthusiasts from around the world.
            </h3>



            <div className="form">
                <div className="formButtons">
                    <button type="button" onClick={() => setActive('signup')}>
                    SIGN UP
                    </button>
                    <button type="button" onClick={() => setActive('login')}>
                    LOGIN
                    </button>
                </div>
                <div className="content">
                    {active === "signup" && <SignUp />}
                    {active === "login" && <Login />}
                </div>
            </div>

        </div>
    );
}

export default Splash;