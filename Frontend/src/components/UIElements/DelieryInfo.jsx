import React, { useState, useRef } from "react";

const DeliveryInfo = () => {
  const [pincode, setPincode] = useState("815301");
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef(null);

  const handleCheck = () => {
    setIsEditing(false);
    inputRef.current?.blur(); // removes cursor/focus
    // Add API call or validation here if needed
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleCheck();
    }
  };

  return (
    <div className="text-sm font-sans text-gray-700">
      <div className="flex items-center gap-2">
        <span className="text-gray-500">Delivery</span>

        {isEditing ? (
          <>
            <input
              type="text"
              ref={inputRef}
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="border-b border-blue-500 focus:outline-none text-black font-semibold w-20"
            />
            <button
              className="text-blue-600 text-sm font-medium hover:underline"
              onClick={handleCheck}
            >
              Check
            </button>
          </>
        ) : (
          <>
            <span className="font-semibold text-black">{pincode}</span>
            <button
              className="text-blue-600 text-sm font-medium hover:underline"
              onClick={() => setIsEditing(true)}
            >
              Change
            </button>
          </>
        )}
      </div>

      <div className="mt-1 ml-16">
        <span>Delivery by </span>
        <span className="font-medium">23 May, Friday</span>
        <span className="mx-1">|</span>
        <span className="text-green-600 font-medium">Free</span>
        <span className="line-through text-gray-500 ml-1 text-sm">₹40</span>
      </div>
    </div>
  );
};

export default DeliveryInfo;
