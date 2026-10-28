import PreviewPost from "./PreviewPost";
import "./LocalPosts.css";
import SearchInput from "./SearchInput";
import ProfileHeader from "./ProfileHeader";

const dummyPosts = [
  { username: "jdoe123", caption: "Sunset over the Rockies", likes: 12, comments: 3 },
  { username: "avgeek_amy", caption: "Boeing 747 takeoff", likes: 45, comments: 8 },
  { username: "jdoe123", caption: "Sunset over the Rockies", likes: 12, comments: 3 },
  { username: "avgeek_amy", caption: "Boeing 747 takeoff", likes: 45, comments: 8 },
];

function LocalPosts(props){

    const filteredPosts = dummyPosts.filter((el)=>{
        if(props.input === ''){
            return el;
        }
        else{
            return el.caption.toLowerCase().includes(props.input) || el.username.toLowerCase().includes(props.input)
        }
    })

    return(
        

        <div className="posts">
            <ProfileHeader/>
            
            {filteredPosts.map((post, i) => (
                <PreviewPost key={i} post={post} />
            ))}

            
        </div>
    );
}

export default LocalPosts;