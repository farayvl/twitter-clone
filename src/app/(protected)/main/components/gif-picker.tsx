import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Image from "next/image";
import SearchIcon from "@/assets/main/svg/search-icon";

const GIPHY_API_KEY = "qPjXf32MzEWAuGDdVVk51n1XOWNLHYAU"; 

export default function GifPicker({ onSelect, onClose }) {
  const [query, setQuery] = useState("");
  const [gifs, setGifs] = useState([]);
  const modalRef = useRef(null);

  useEffect(() => {
    if (!query) {
      setGifs([]);
      return;
    }

    const fetchGifs = async () => {
      try {
        const { data } = await axios.get(
          `https://api.giphy.com/v1/gifs/search?q=${query}&api_key=${GIPHY_API_KEY}&limit=10`
        );
        setGifs(data.data);
      } catch (error) {
        console.error("Ошибка загрузки GIF:", error);
      }
    };

    fetchGifs();
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose(); 
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      className="absolute bottom-12 left-0 w-[400px] bg-white p-4 rounded-md shadow-lg z-50 flex flex-col"
      ref={modalRef}
      style={{ height: "400px" }} 
    >
      <div className="flex-shrink-0  bg-[#DFDFDF] h-[50px] rounded-[10px] px-4 flex items-center">
        <SearchIcon className="w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Write something..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-transparent p-2 w-full rounded-md focus:outline-none font-abeezee"
        />
      </div>
      <div className="flex-1 mt-4 overflow-y-auto">
        <div className="grid grid-cols-3 gap-2">
          {gifs.map((gif) => (
            <div key={gif.id} className="aspect-square">
              <Image
                width={120}
                height={120}
                src={gif.images.fixed_height.url}
                alt="gif"
                className="w-full h-full object-cover cursor-pointer rounded-md hover:brightness-90 transition-all"
                onClick={() => {
                  onSelect(gif.images.fixed_height.url);
                  onClose();
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
