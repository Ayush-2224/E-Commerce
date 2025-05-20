import React from 'react'
import { useState,useEffect } from 'react';
import { axiosInstance } from '../../lib/axios';
function search() {
   const [query,setQuery] = useState("");
    const [results,setResults] = useState([]);
    
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if(query)(
                fetchResults()
            )
        },500)
        return () => clearTimeout(delayDebounce);
    },[query]);


const fetchResults = async()=>{
    try {
        const response = await axiosInstance.get(`product/search?q=${encodeURIComponent(query)}`); 
       if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
}
  return (
    <div>
      // product page code;
    </div>
  )
}

export default search
