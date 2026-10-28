import { useState } from "react";

function AddPost(){
    const [image, setImage] = useState("");
    const [caption, setCaption] = useState("");
    const [hashtags, setHashtags] = useState("");
    const [error, setError] = useState(null);

    function handleSubmit(event){
        event.preventDefault();

        if(!image){
            setError("Please ensure you added an image");
            return;
        }
        else if(!caption){
            setError("Please ensure you added a description");
            return;
        }

        fetch("http", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, caption }),
        })
            .then((res) => {
                if (!res.ok) throw new Error();
                return res.json();
            })
            .then((newPost) => {
                onPostAdded(newPost);
                setUsername("");
                setCaption("");
                setError(null);
            })
            .catch(() => setError("Failed to add post."));
    }

    return(
        <form className="addPostForm" onSubmit={handleSubmit}>
            <h2>Add Post</h2>

            {error && <p className="message error">{error}</p>}

            <label htmlFor="image">Image</label>
            <input
                id="image"
                type="file"
                placeholder="Enter add image"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                accept="image/*"
            />

            <label htmlFor="caption">Caption</label>
            <textarea
                id="caption"
                placeholder="Enter Post Caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
            />

            <label htmlFor="hashtags">Hashtags</label>
            <textarea
                id="hashtags"
                placeholder="Enter Post Hashtags"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
            />

            <button type="submit">Add Post</button>
            
        </form>
    );
    
}

export default AddPost;