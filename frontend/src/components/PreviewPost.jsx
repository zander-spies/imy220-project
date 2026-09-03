function PreviewPost({post}){
    const {
    username = "jdoe123",
    image = "https://placehold.co/400x300",
    caption = "Beautiful sunset landing at JFK today ✈️",
    likes = 0,
    comments = 0,
    } = post || {};
    return(
        <div>
            <div className="preview-post">
                <div className="preview-header">
                    <span className="preview-username">{username}</span>
                </div>

                <img src={image} alt="Post" className="preview-image" />

                <div className="preview-info">
                    <p className="preview-caption">{caption}</p>
                    <div className="preview-stats">
                    <span>{likes} likes</span>
                    <span> {comments} comments</span>
                    </div>
                </div>    
            </div>
        </div>
    );

}

export default PreviewPost;