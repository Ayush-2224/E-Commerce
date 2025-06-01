import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUserAuthStore } from '../store/userAuth.store';


function Profile() {
  const { authUser , checkAuth,updateProfile} = useUserAuthStore();

  const fileInputRef = useRef(null);

  const originalData = useMemo(() => ({
    username: authUser?.username || '',
    profilePic: authUser?.profilePic || 'https://static.vecteezy.com/system/resources/previews/026/619/142/original/default-avatar-profile-icon-of-social-media-user-photo-image-vector.jpg',
    address: authUser?.address || ''
  }), [authUser]);

  const [updatedData, setUpdatedData] = useState(originalData);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
  checkAuth();
}, [checkAuth]);

useEffect(() => {
  if (authUser) {
    setUpdatedData({
      username: authUser.username || '',
      profilePic: authUser.profilePic || 'https://static.vecteezy.com/system/resources/previews/026/619/142/original/default-avatar-profile-icon-of-social-media-user-photo-image-vector.jpg',
      address: authUser.address || ''
    });
  }
}, [authUser]);


  const changeHandler = (e) => {
    const { name, value } = e.target;
    setUpdatedData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
  if (file) {
    setSelectedFile(file); 
    const reader = new FileReader();
    reader.onloadend = () => {
      setUpdatedData((prev) => ({
        ...prev,
        profilePic: reader.result 
      }));
    };
    reader.readAsDataURL(file);
  }
};

  const isChanged = useMemo(() => {
    return (
      updatedData.username !== originalData.username ||
      updatedData.address !== originalData.address ||
      updatedData.profilePic !== originalData.profilePic
    );
  }, [updatedData, originalData]);

 const handleSubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append('username', updatedData.username);
  formData.append('address', updatedData.address);
  if(selectedFile){
    formData.append('profilePic', selectedFile); 
  }

  try {
  const {updatedUser}= await updateProfile(formData);
   await checkAuth();
    setSelectedFile(null);
    setUpdatedData({
      username: updatedUser.username || '',
      profilePic: updatedUser.profilePic || 'https://static.vecteezy.com/system/resources/previews/026/619/142/original/default-avatar-profile-icon-of-social-media-user-photo-image-vector.jpg',
      address: updatedUser.address || ''
    });
    alert('Profile updated successfully!');
  } catch (err) {
    console.error('Error submitting form:', err);
  }
};

  if (!authUser) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">Please log in to view your profile</h1>
        <Link to="/user/login" className="text-blue-500 hover:underline">Go to Login</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 p-6">
      
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleImageChange}
      />
      <img
        src={updatedData.profilePic}
        alt="Profile"
        className="w-32 h-32 rounded-full border-4 border-blue-500 object-cover mb-4 cursor-pointer"
        onClick={() => fileInputRef.current.click()}
        title="Click to change photo"
      />

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white shadow-md rounded-lg p-6"
      >
        {/* Email (read-only) */}
        <div className="mb-4">
          <label className="block text-gray-600 font-semibold mb-1">Email</label>
          <input
            type="email"
            value={authUser.email}
            disabled
            className="w-full px-3 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* Username */}
        <div className="mb-4">
          <label className="block text-gray-600 font-semibold mb-1">Username</label>
          <input
            type="text"
            name="username"
            value={updatedData.username || ''}
            onChange={changeHandler}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-400"
          />
        </div>

        {/* Address */}
        <div className="mb-4">
          <label className="block text-gray-600 font-semibold mb-1">Address</label>
          <input
            type="text"
            name="address"
            value={updatedData.address || ''}
            onChange={changeHandler}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-400"
          />
        </div>

        {/* Submit if changed */}
        {isChanged && (
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition"
          >
            Submit Changes
          </button>
        )}
      </form>

      {/* Navigation Links */}
      <div className="mt-6 flex gap-6 text-blue-600 font-medium">
        <Link to="/order" className="hover:underline">My Orders</Link>
        <Link to="/cart" className="hover:underline">My Cart</Link>
        <Link to="/forgot-password" className="hover:underline">Forgot Pasword</Link>
      </div>
    </div>
  );
}

export default Profile;
