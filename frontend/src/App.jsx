import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Splash from "./pages/Splash";
import Profile from "./pages/Profile";
import Post from "./pages/Post";

function App(){
  return(
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Splash/>}/>
          <Route path="/home" element={<Home/>}/>
          <Route path="/profile" element={<Profile/>}/>
          <Route path="/post/:id" element={<Post/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;