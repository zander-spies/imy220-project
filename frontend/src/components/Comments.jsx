const dummyComments = [
  { username: "avgeek_amy", text: "Amazing shot!" },
  { username: "planespotter22", text: "What lens did you use?" },
];

function Comments() {
  return (
    <div className="comments">
      <h3>Comments</h3>
      {dummyComments.map((c, i) => (
        <p key={i}><strong>{c.username}:</strong> {c.text}</p>
      ))}
    </div>
  );
}

export default Comments;