import logo from "../assets/logo.png";
import nameLogo from "../assets/name.png";
import "./Navigation.css"
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

function Navigation(){
    return(
        <div>
            <div className="images">
                <Link to="">Home</Link> |{" "}
                <Link to="">About</Link> |{" "}
                <img src={logo} alt="Logo" id="logo"/>
                <img src={nameLogo} alt="NameJetFrame" id="name"/>
                <Link to="">Contact</Link>
            </div>
        </div>
    );
}

export default Navigation;