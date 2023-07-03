const APIKEY = "8f578cdecb8c15112d8837ddfb9c6838";

import { useEffect, useState } from "react";
import {
  concatenateWords,
  isEndOfScroll,
  getPosterURL,
  getYear,
  getRatingFixed,
} from "../../utilities/textTools";
import { FaSearch, FaTimes } from "react-icons/fa";

export default function SearchBar({
  setData,
  dataLoading,
  setDataLoading,
  favorites,
  blocked,
}) {
  const [text, setText] = useState("");
  const [page, setPage] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [loadMoreData, setLoadMoreData] = useState(false);
  let isEmpty = text === "";

  const handleSearchBtn = () => {
    setPage(1);
    setData([]);
  };

  const handleScroll = () => {
    if (isEndOfScroll()) {
      setLoadMoreData(true);
      //window.scroll(0, document.documentElement.scrollHeight - 200);
    }
  };

  const fetchData = (value) => {
    fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${APIKEY}&query=${value}&page=${page}&language=es-AR`
    )
      .then((resp) => resp.json())
      .then((json) => {
        console.log(json);
        const newData = json.results.map((item) => {
          const {
            id,
            title,
            overview,
            poster_path,
            release_date,
            vote_average,
          } = item;
          const newItem = {
            id,
            title,
            overview,
            poster_path: getPosterURL(poster_path),
            release_date: getYear(release_date),
            vote_average: getRatingFixed(vote_average),
            favorite: favorites.find((fav) => fav.id === item.id) !== undefined,
            blocked:
              blocked.find((block) => block.id === item.id) !== undefined,
          };
          return newItem;
        });
        setData((prev) => [...prev, ...newData]);
        setTotalPages(json.total_pages);
        setTotalResults(json.total_results);
      });
  };

  useEffect(() => {
    console.log(
      `page: ${page} loadMoreData: ${loadMoreData} totalPages: ${totalPages}`
    );
    if (page == 1 || (page > 1 && !dataLoading && loadMoreData)) {
      setDataLoading(true);
      setTimeout(() => {
        fetchData(concatenateWords(text));
        setDataLoading(false);
        setLoadMoreData(false);
        if (page < totalPages || totalPages === 0) setPage(page + 1);
        else {
          setPage(null);
          setTotalPages(0);
        }

        //if (page >= totalPages) setPage(null);
        //else setPage((page) => page + 1);
      }, 1500);
    }
  }, [page, loadMoreData]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="search-box">
      <input
        type="text"
        value={text}
        placeholder="Escriba la búsqueda..."
        onChange={(e) => setText(e.target.value)}
      />
      <div className="search-btn" disabled={isEmpty} onClick={handleSearchBtn}>
        <FaSearch />
      </div>
      <div
        className="cancel-btn"
        disabled={isEmpty}
        onClick={() => setText("")}
      >
        <FaTimes />
      </div>
      <div className="search-results">
        {totalResults > 0 && <p>{totalResults} peliculas encontradas</p>}
      </div>
    </div>
  );
}
