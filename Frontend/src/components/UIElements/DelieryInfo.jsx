import React, { useState, useRef } from "react";

const DeliveryInfo = () => {
  const [pincode, setPincode] = useState("815301");
  const [isEditing, setIsEditing] = useState(false);
  const [pincodeError, setPincodeError] = useState(false);
  const inputRef = useRef(null);

  const handleCheck = () => {

    if (!/^\d{6}$/.test(pincode)) {
      setPincodeError(true);
      return;
    }
    setPincodeError(false);
    setIsEditing(false);
    // Add API call or validation here if needed
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleCheck();
    }
  };

  return (
    <div className="text-sm font-sans text-gray-700  mb-5">
      <div className="flex items-center">
        <span className="font-medium text-gray-500 w-20">Delivery</span>

        {isEditing ? (
          <>
            <input
              type="number"
              ref={inputRef}
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="border-b border-blue-500 focus:outline-none text-black font-semibold w-20"
            />
            <button
              className="text-blue-600 text-sm font-medium hover:underline ml-2"
              onClick={handleCheck}
            >
              Check
            </button>
          </>
        ) : (
          <>
            <span className="font-semibold text-black">{pincode}</span>
            <button
              className="text-blue-600 text-sm font-medium hover:underline ml-3.5"
              onClick={() => setIsEditing(true)}
            >
              Change
            </button>
          </>
        )}
      </div>
        {pincodeError && (
        <div className="ml-20 mt-1 text-red-500 text-xs">Invalid Pincode</div>
      )}
      <div className="mt-1 ml-20">
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
