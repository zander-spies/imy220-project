import SearchResults from "./SearchResults";

function SearchInput({ query, setQuery }) {
    return (
        <div className="mx-auto mb-4 w-full max-w-xl text-left">
            <input
                id="search"
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search users, posts, albums, hashtags..."
                autoComplete="off"
            />

            <SearchResults query={query} />
        </div>
    );
}

export default SearchInput;