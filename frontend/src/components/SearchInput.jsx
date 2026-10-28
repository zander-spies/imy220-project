import { useState } from "react";
import LocalPosts from "./LocalPosts";

function SearchInput() {
  const [query, setQuery] = useState("");

  // return (
  //   <form className="search-form">
  //     <input
  //       type="text"
  //       placeholder="Search posts, users..."
  //       value={query}
  //       onChange={(e) => setQuery(e.target.value)}
  //       className="search-input"
  //     />
  //     <button type="submit" className="search-button">
  //       Search
  //     </button>
  //   </form>
  // );

  return(
    <div className="searchForm">
      <input 
        id="search"
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search"
      />
      <LocalPosts input={query}/>
    </div>
    
  );






}

export default SearchInput;