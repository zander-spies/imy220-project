import { useState } from "react";

function EditPost({ onCancel }) {
  const [caption, setCaption] = useState("Beautiful sunset landing at JFK today ✈️");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updated caption:", caption);
    onCancel();
  };

  return (
    <form className="edit-post-form" onSubmit={handleSubmit}>
      <label>Caption:</label>
      <textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        required
      />
      <div>
        <button type="submit">Save</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export default EditPost;