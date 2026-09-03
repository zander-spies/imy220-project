import PreviewPost from "./PreviewPost";
import "./LocalPosts.css";

const dummyPosts = [
  { username: "jdoe123", caption: "Sunset over the Rockies", likes: 12, comments: 3 },
  { username: "avgeek_amy", caption: "Boeing 747 takeoff", likes: 45, comments: 8 },
  { username: "jdoe123", caption: "Sunset over the Rockies", likes: 12, comments: 3 },
  { username: "avgeek_amy", caption: "Boeing 747 takeoff", likes: 45, comments: 8 },
];

function LocalPosts(){
    return(
        <div className="posts">
            {dummyPosts.map((post, i) => (
                <PreviewPost key={i} post={post} />
            ))}
        </div>
    );
}

export default LocalPosts;