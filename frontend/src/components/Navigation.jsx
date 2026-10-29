import { useState } from "react";
import logo from "../assets/logo.png";
import nameLogo from "../assets/name.png";
import {Link} from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navigation(){
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    const { clearUser } = useAuth();

    function handleLogout(){

        fetch("http://localhost:3000/api/users/logout", {
            method: "POST",
            credentials: "include",
        })
                .then((res) => {
                    if (!res.ok) throw new Error();
                    return res.json();
                })
                .then(() => {
                    clearUser();
                    navigate("/", { replace: true });
                })
                .catch(() => setError("Failed to logout"));

    }

    return(
        <div className="mb-6 border-b border-gray-300 pb-2">
            <div className="flex flex-wrap items-center justify-center gap-4">
                <Link to="/home" className="text-3xl text-black hover:text-brand">Home</Link>
                <img src={logo} alt="Logo" id="logo" className="w-[200px] max-w-full"/>
                <img src={nameLogo} alt="NameJetFrame" id="name" className="-ml-24 w-[300px] max-w-full"/>
                <Link to="/profile" className="text-3xl text-black hover:text-brand">Profile</Link>
                <button onClick={handleLogout} >Logout</button>
            </div>
        </div>
    );
}

export default Navigation;