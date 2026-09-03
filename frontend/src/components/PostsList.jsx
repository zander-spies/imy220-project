import PreviewPost from "./PreviewPost";
const dummyPosts = [{ username: "jdoe123", caption: "My post", likes: 5, comments: 1 }];
function PostsList() {
  return dummyPosts.map((p, i) => <PreviewPost key={i} post={p} />);
}
export default PostsList;