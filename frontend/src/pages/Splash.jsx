import logo from "../assets/logo.png";
import nameLogo from "../assets/name.png";
import { useState } from "react";
import SignUp from "../components/SignUp";
import Login from "../components/Login";

function Splash(){
    const [active, setActive] = useState('signup');
    return(
        <div>
            <div className="flex flex-col items-center pt-6">
                <img src={logo} alt="Logo" id="logoSplash" className="w-[400px] max-w-full" />
                <img src={nameLogo} alt="NameJetFrame" id="nameSplash" className="-mt-[50px] w-[600px] max-w-full"/>
            </div>
            <h1>
                Share the Skies.
                <br/>
                Discover the world.
            </h1>

            <h3 className="mb-8 text-lg font-normal text-gray-600">
                Join a community of pilots, aviation photographers, <br/>
                and enthusiasts from around the world.
            </h3>



            <div className="mx-auto max-w-md">
                <div className="mb-4 flex justify-center gap-3">
                    <button type="button" onClick={() => setActive('signup')}>
                    SIGN UP
                    </button>
                    <button type="button" onClick={() => setActive('login')}>
                    LOGIN
                    </button>
                </div>
                <div className="rounded-lg bg-white p-6 shadow">
                    {active === "signup" && <SignUp />}
                    {active === "login" && <Login />}
                </div>
            </div>

        </div>
    );
}

export default Splash;