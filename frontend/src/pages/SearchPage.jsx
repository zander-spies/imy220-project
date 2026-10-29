import { useSearchParams } from "react-router-dom";

import Navigation from "../components/Navigation";
import SearchInput from "../components/SearchInput";

function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    const query = searchParams.get("q") || "";

    function setQuery(value) {
        setSearchParams(
            value ? { q: value } : {}
        );
    }

    return (
        <div>
            <Navigation />

            <h1>Search</h1>

            <SearchInput
                query={query}
                setQuery={setQuery}
            />
        </div>
    );
}

export default SearchPage;