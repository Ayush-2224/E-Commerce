import React, { useState, useEffect, useRef, useCallback } from 'react';
import { axiosInstance } from '../lib/axios';
import { Link } from 'react-router-dom';
import HorizontalLine from '../components/UIElements/HorizontalLine';
import LoadingSpinner from '../components/UIElements/LoadingSpinner';
import { useSearchParams } from 'react-router-dom';

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
        <div
          key={product._id}
          ref={idx === results.length - 1 ? lastResultRef : null}
          className="bg-white rounded-xl shadow-sm p-4 mb-6 grid grid-cols-[auto_1fr] gap-4"
        >
          {/* Left: Image */}
          <div>
            <Link to={`/product/${product._id}`}>
              <img
                src={product.imageUrl[0]}
                alt={product.title}
                className="w-24 h-24 object-contain"
              />
            </Link>
          </div>

          {/* Right: Details */}
          <div className="space-y-2">
            <Link to={`/product/${product._id}`}>
              <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                {product.title}
              </h3>
            </Link>
            <p className="text-sm text-gray-500">
              Seller:{' '}
              <span className="font-medium">{product.seller?.username}</span>{' '}
              <span className="text-green-600">✔️ Assured</span>
            </p>
            <div className="inline-flex text-xs items-center font-medium bg-green-600 text-white px-2 py-1 rounded">
                        {product.rating.toFixed(1)}
                        <span className="ml-1">☆</span>
                    </div>
            <div className="flex items-baseline space-x-2">
              <div className="text-2xl font-bold text-gray-900">₹{product.price}</div>
              <div className="text-sm line-through text-gray-400">₹{product.mrp}</div>
            </div>
          </div>
        </div>
      ))}

      {loading && <LoadingSpinner centered />}

      {!hasMore && <HorizontalLine />}
    </div>
  );
};

export default Search;
