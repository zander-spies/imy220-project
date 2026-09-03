import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import PostImage from "../components/PostImage";
import PostDescription from "../components/PostDescription";
import Comments from "../components/Comments";
import EditPost from "../components/EditPost";

function Post() {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);

  return (
    <div>
      <Navigation />

      <button className="back-button" onClick={() => navigate(-1)}>
        BACK
      </button>

      {editing ? (
        <EditPost onCancel={() => setEditing(false)} />
      ) : (
        <>
          <PostImage />
          <PostDescription onEdit={() => setEditing(true)} />
          <Comments />
        </>
      )}
    </div>
  );
}

export default Post;