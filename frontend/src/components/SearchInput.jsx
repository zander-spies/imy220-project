import { useState } from "react";

function SearchInput() {
  const [query, setQuery] = useState("");

  return (
    <form className="search-form">
      <input
        type="text"
        placeholder="Search posts, users..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="search-input"
      />
      <button type="submit" className="search-button">
        Search
      </button>
    </form>
  );
}

export default SearchInput;