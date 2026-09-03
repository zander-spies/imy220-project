import logo from "../assets/logo.png";
import nameLogo from "../assets/name.png";
import "./Navigation.css"
import {Link} from 'react-router-dom';

function Navigation(){
    return(
        <div>
            <div className="navBar">
                <Link to="/home">Home</Link>
                <img src={logo} alt="Logo" id="logo"/>
                <img src={nameLogo} alt="NameJetFrame" id="name"/>
                <Link to="/profile">Profile</Link>
            </div>
        </div>
    );
}

export default Navigation;