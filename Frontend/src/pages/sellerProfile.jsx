import React, { useEffect, useRef, useState, useMemo } from 'react';
import { axiosInstance } from '../lib/axios';
import LoadingSpinner from '../components/UIElements/LoadingSpinner';
import { useSellerAuthStore } from '../store/sellerAuth.store';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const SellerProfile = () => {
  const { updateProfile } = useSellerAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [sellerData, setSellerData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [allowEdit, setAllowEdit] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchSellerProfile = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get('seller/sellerInfo');
        setSellerData(response.data);
        setOriginalData(response.data);
      } catch (error) {
        console.error('Error fetching seller profile:', error);
        toast.error('Failed to load profile.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSellerProfile();
  }, []);

  const isChanged = useMemo(() => {
    if (!sellerData || !originalData) return false;
    return (
      sellerData.username !== originalData.username ||
      sellerData.address !== originalData.address ||
      selectedFile !== null
    );
  }, [sellerData, originalData, selectedFile]);

  const changeHandler = (e) => {
    const { name, value } = e.target;
    setSellerData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSellerData((prev) => ({
          ...prev,
          profilePic: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!sellerData.username.trim() || !sellerData.address.trim()) {
      toast.error('Username and address cannot be empty.');
      return;
    }

    if (!isChanged) {
      toast('No changes to update.');
      setAllowEdit(false);
      return;
    }

    const formData = new FormData();
    if (sellerData.username !== originalData.username) {
      formData.append('username', sellerData.username);
    }
    if (sellerData.address !== originalData.address) {
      formData.append('address', sellerData.address);
    }
    if (selectedFile) {
      formData.append('profilePic', selectedFile);
    }

    try {
      await updateProfile(formData);
      setAllowEdit(false);
      setOriginalData({ ...sellerData });
      setSelectedFile(null);
    } catch (err) {
      console.error('Failed to update profile:', err);
      toast.error('Update failed.');
    }
  };

  if (isLoading || !sellerData) return <LoadingSpinner asOverlay/>;

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 p-6">
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        disabled={!allowEdit}
        onChange={handleImageChange}
      />

      <img
        src={sellerData.profilePic}
        alt="Profile"
        className="w-32 h-32 rounded-full border-4 border-blue-500 object-cover mb-4 cursor-pointer"
        onClick={() => allowEdit && fileInputRef.current.click()}
        title={allowEdit ? 'Click to change photo' : ''}
      />

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white shadow-md rounded-lg p-6"
      >
        {/* Email (read-only) */}
        <div className="mb-4">
          <label className="block text-gray-600 font-semibold mb-1">Email</label>
          <input
            type="email"
            value={sellerData.email}
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
            value={sellerData.username || ''}
            onChange={changeHandler}
            disabled={!allowEdit}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-400"
          />
        </div>

        {/* Address */}
        <div className="mb-4">
          <label className="block text-gray-600 font-semibold mb-1">Address</label>
          <input
            type="text"
            name="address"
            value={sellerData.address || ''}
            disabled={!allowEdit}
            onChange={changeHandler}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-400"
          />
        </div>

        {/* Submit Button */}
        {allowEdit && (
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition cursor-pointer"
          >
            Submit Changes
          </button>
        )}

        {!allowEdit && (
          <div
            className="text-blue-500 mt-4 cursor-pointer w-fit"
            onClick={() => setAllowEdit(true)}
          >
            Edit Profile
          </div>
        )}
      </form>

      {/* Navigation */}
      <div className="mt-6 flex gap-6 text-blue-600 font-medium">
        <Link to="/seller/store" className="hover:underline">
          My Products
        </Link>
      </div>
    </div>
  );
};

export default SellerProfile;