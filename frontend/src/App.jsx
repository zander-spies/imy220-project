import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Splash from "./pages/Splash";
import Profile from "./pages/Profile";
import Post from "./pages/Post";
import ProtectedRoute from "./components/ProtectedRoute";
import UserProfile from "./pages/UserProfile";
import AlbumPage from "./pages/Album";
import SearchPage from "./pages/SearchPage";

function App(){
  return(
    <div className="mx-auto max-w-5xl px-4 pb-12 text-center">
      <BrowserRouter>
        <Routes >
          <Route path="/" element={<Splash/>}/>
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<Home/>}/>
            <Route path="/profile" element={<Profile/>}/>
            <Route path="/posts/:postId" element={<Post/>}/>
            <Route path="/users/:userId" element={<UserProfile />} />
            <Route path="/albums/:albumId" element={<AlbumPage />} />
            <Route path="/search" element={<SearchPage />}/>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;