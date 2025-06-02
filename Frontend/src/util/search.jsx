import React, { useState, useEffect, useRef, useCallback } from 'react';
import { axiosInstance } from '../lib/axios';
import { Link } from 'react-router-dom';
import HorizontalLine from '../components/UIElements/HorizontalLine';
import LoadingSpinner from '../components/UIElements/LoadingSpinner';
import { useSearchParams } from 'react-router-dom';
import ProductShow from '../components/UIElements/ProductShow';
const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || "";
  const LIMIT = 10;

  const [results, setResults] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const observerRef = useRef();

  //── STEP 1: Whenever `query` changes, immediately clear everything ──//
  useEffect(() => {
    setOffset(0);
    setResults([]);
    setHasMore(true);
    // (We do NOT call fetchResults here; we just clear. Next effect will do the fetch.)
  }, [query]);

  //── STEP 2: As soon as `offset === 0` *and* `query.trim()` is nonempty, do the first fetch ──//
  useEffect(() => {
    // If there's no query, or we've already scrolled past the very first page, do nothing here.
    if (!query.trim() || offset !== 0) {
      return;
    }

    // Now that query is nonempty and offset is reset to 0, do the fetch.
    fetchResults(0);
    // We deliberately do NOT change offset inside this effect—fetchResults will bump offset by however many items come back.
  }, [query, offset]);

  const fetchResults = async (currentOffset) => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await axiosInstance.get('/product/search', {
        params: {
          q: query,
          offset: currentOffset,
          limit: LIMIT,
        },
      });

      const data = response.data;
      if (data.length < LIMIT) {
        setHasMore(false);
      }

      if (data.length > 0) {
        setResults(prev => [...prev, ...data]);
        setOffset(prev => prev + data.length);
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setLoading(false);
    }
  };

  const lastResultRef = useCallback(
    node => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          fetchResults(offset);
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore, offset] 
  );

  return (
    <div className="p-4">
      {results.map((product, idx) => (
        <ProductShow
        key={product._id}
        ref={idx === results.length - 1 ? lastResultRef : null}
        product={product} />
      ))}

      {loading && <LoadingSpinner centered />}

      {!hasMore && <HorizontalLine />}
    </div>
  );
};

export default Search;
