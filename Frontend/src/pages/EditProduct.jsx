import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useSellerAuthStore } from "../store/sellerAuth.store";
import { useNavigate, useParams } from "react-router-dom";
import { axiosInstance } from "../lib/axios";

const categoryOptions = [
  "Electronics",
  "Appliances", 
  "Mobiles",
  "Toys",
  "Books",
  "Food",
  "Furniture",
  "Medicines",
];

function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { authSeller, checkAuth } = useSellerAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const [productData, setProductData] = useState({
    brand: "",
    title: "",
    category: "",
    price: 0,
    mrp: 0,
    quantity: 0,
    description: [],
    specifications: [],
  });

  const [existingMainImages, setExistingMainImages] = useState([]);
  const [newMainImages, setNewMainImages] = useState([]);
  const [existingDescriptionImages, setExistingDescriptionImages] = useState([]);
  const [newDescriptionImages, setNewDescriptionImages] = useState([]);

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const res= await axiosInstance.get(`product/getProduct/${id}`)
        const product = res.data
        
        if (product) {
          setProductData({
            brand: product.brand || "",
            title: product.title || "",
            category: product.category || "",
            price: product.price || 0,
            mrp: product.mrp || 0,
            quantity: product.quantity || 0,
            description: product.description || [],
            specifications: product.specifications?.[0]?.specs || [],
          });
          
          setExistingMainImages(product.imageUrl || []);
          
          // Extract existing description images
          const descImages = product.description?.filter(desc => desc.image).map(desc => desc.image) || [];
          setExistingDescriptionImages(descImages);
        }
      } catch (error) {
        toast.error("Failed to load product data");
        console.error("Load product error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (authSeller && id) {
      loadProduct();
    }
  }, [authSeller, id]);

  const handleNewMainImageChange = (index, file) => {
    const updated = [...newMainImages];
    updated[index] = file;
    setNewMainImages(updated);
  };

  const handleAddNewMainImage = () => {
    setNewMainImages([...newMainImages, null]);
  };

  const handleRemoveNewMainImage = (index) => {
    const updated = newMainImages.filter((_, i) => i !== index);
    setNewMainImages(updated);
  };

  const handleRemoveExistingMainImage = (index) => {
    const updated = existingMainImages.filter((_, i) => i !== index);
    setExistingMainImages(updated);
  };

  const handleSpecChange = (index, field, value) => {
    const updated = [...productData.specifications];
    if (!updated[index]) updated[index] = { key: "", value: "" };
    updated[index][field] = value;
    setProductData({ ...productData, specifications: updated });
  };

  const handleAddSpec = () => {
    setProductData({
      ...productData,
      specifications: [...productData.specifications, { key: "", value: "" }],
    });
  };

  const handleRemoveSpec = (index) => {
    const updated = productData.specifications.filter((_, i) => i !== index);
    setProductData({ ...productData, specifications: updated });
  };

  const handleDescriptionChange = (index, field, value) => {
    const updated = [...productData.description];
    if (!updated[index]) updated[index] = { heading: "", text: "", image: "" };
    updated[index][field] = value;
    setProductData({ ...productData, description: updated });
  };

  const handleAddDescription = () => {
    setProductData({
      ...productData,
      description: [...productData.description, { heading: "", text: "", image: "" }],
    });
  };

  const handleRemoveDescription = (index) => {
    const updated = productData.description.filter((_, i) => i !== index);
    setProductData({ ...productData, description: updated });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewDescriptionImageChange = (index, file) => {
    const updated = [...newDescriptionImages];
    updated[index] = file;
    setNewDescriptionImages(updated);
  };

  const handleAddNewDescriptionImage = () => {
    setNewDescriptionImages([...newDescriptionImages, null]);
  };

  const handleRemoveNewDescriptionImage = (index) => {
    const updated = newDescriptionImages.filter((_, i) => i !== index);
    setNewDescriptionImages(updated);
  };

  const handleRemoveExistingDescriptionImage = (index) => {
    const updated = existingDescriptionImages.filter((_, i) => i !== index);
    setExistingDescriptionImages(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!productData.category || !productData.price || !productData.quantity) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    
    // Add basic product data
    formData.append("category", productData.category);
    formData.append("price", productData.price);
    formData.append("mrp", productData.mrp || productData.price);
    formData.append("quantity", productData.quantity);

    // Add specifications
    const filteredSpecs = productData.specifications.filter(spec => 
      spec.key.trim() && spec.value.trim()
    );
    formData.append("specifications", JSON.stringify(filteredSpecs));

    // Add description
    const filteredDescription = productData.description.filter(desc => 
      desc.heading.trim() || desc.text.trim()
    );
    formData.append("description", JSON.stringify(filteredDescription));

    // Add new main images
    newMainImages.forEach((file) => {
      if (file) {
        formData.append("mainImages", file);
      }
    });

    // Add new description images
    newDescriptionImages.forEach((file) => {
      if (file) {
        formData.append("descriptionImages", file);
      }
    });

    try {
      await axiosInstance.post(`product/editProduct/${id}`,formData);
      toast.success("Product updated successfully! 🎉");
      navigate("/seller/store");
    } catch (error) {
      toast.error("Error updating product");
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!authSeller) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600">Please log in to edit your product.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900">Loading Product Data...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Edit Product
            </h1>
            <p className="text-gray-600 text-lg">Update Your Product Details</p> 
          </div>

          {/* Form */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              
              {/* Basic Information Section */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Basic Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center">
                      Brand <span className="text-gray-400 ml-1">(Cannot be edited)</span>
                    </label>
                    <input
                      name="brand"
                      value={productData.brand}
                      disabled
                      className="w-full p-4 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center">
                      Product Title <span className="text-gray-400 ml-1">(Cannot be edited)</span>
                    </label>
                    <input
                      name="title"
                      value={productData.title}
                      disabled
                      className="w-full p-4 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center">
                      Category <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      name="category"
                      value={productData.category}
                      onChange={handleChange}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
                      required
                    >
                      <option value="">Select Category</option>
                      {categoryOptions.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center">
                      Quantity <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      name="quantity"
                      type="number"
                      value={productData.quantity}
                      onChange={handleChange}
                      placeholder="Available quantity"
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
                      min="0"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center">
                      Price <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                      <input
                        name="price"
                        type="number"
                        value={productData.price}
                        onChange={handleChange}
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      MRP <span className="text-sm text-gray-500">(optional)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                      <input
                        name="mrp"
                        type="number"
                        value={productData.mrp}
                        onChange={handleChange}
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Images Section */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Product Images</h2>
                </div>

                {/* Existing Main Images */}
                {existingMainImages.length > 0 && (
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Main Images</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {existingMainImages.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={imageUrl} 
                            alt={`Product ${index + 1}`}
                            className="w-full h-32 object-cover rounded-xl border-2 border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingMainImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Main Images */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Main Images</h3>
                  <div className="space-y-4">
                    {newMainImages.map((file, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-white rounded-xl border-2 border-dashed border-gray-300">
                        <div className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleNewMainImageChange(index, e.target.files[0])}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all duration-200"
                          />
                          {file && (
                            <div className="mt-2">
                              <img 
                                src={URL.createObjectURL(file)} 
                                alt="Preview" 
                                className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                              />
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveNewMainImage(index)}
                          className="px-4 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddNewMainImage}
                      className="w-full p-4 border-2 border-dashed border-indigo-300 rounded-xl text-indigo-600 hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200 flex items-center justify-center space-x-2 font-medium"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Add New Main Image</span>
                    </button>
                  </div>
                </div>

                {/* Existing Description Images */}
                {existingDescriptionImages.length > 0 && (
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Description Images</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {existingDescriptionImages.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={imageUrl} 
                            alt={`Description ${index + 1}`}
                            className="w-full h-32 object-cover rounded-xl border-2 border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingDescriptionImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Description Images */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Description Images</h3>
                  <div className="space-y-4">
                    {newDescriptionImages.map((file, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-white rounded-xl border-2 border-dashed border-gray-300">
                        <div className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleNewDescriptionImageChange(index, e.target.files[0])}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 transition-all duration-200"
                          />
                          {file && (
                            <div className="mt-2">
                              <img 
                                src={URL.createObjectURL(file)} 
                                alt="Preview" 
                                className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                              />
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveNewDescriptionImage(index)}
                          className="px-4 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddNewDescriptionImage}
                      className="w-full p-4 border-2 border-dashed border-green-300 rounded-xl text-green-600 hover:border-green-500 hover:bg-green-50 transition-all duration-200 flex items-center justify-center space-x-2 font-medium"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Add New Description Image</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Product Description</h2>
                </div>

                <div className="space-y-4">
                  {productData.description.map((desc, index) => (
                    <div key={index} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                      <div className="space-y-4">
                        <input
                          placeholder="Section Heading"
                          value={desc.heading}
                          onChange={(e) => handleDescriptionChange(index, "heading", e.target.value)}
                          className="w-full p-4 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all duration-200 bg-white font-medium"
                        />
                        <textarea
                          placeholder="Detailed description text..."
                          value={desc.text}
                          onChange={(e) => handleDescriptionChange(index, "text", e.target.value)}
                          className="w-full p-4 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all duration-200 bg-white resize-none"
                          rows="4"
                        />
                        {desc.image && (
                          <div className="mt-2">
                            <img 
                              src={desc.image} 
                              alt={`Description ${index + 1}`}
                              className="w-32 h-32 object-cover rounded-lg border-2 border-purple-200"
                            />
                            <p className="text-sm text-purple-600 mt-1">Existing image</p>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveDescription(index)}
                          className="px-6 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Remove Section</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddDescription}
                    className="w-full p-6 border-2 border-dashed border-purple-300 rounded-2xl text-purple-600 hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 flex items-center justify-center space-x-2 font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Add Description Section</span>
                  </button>
                </div>
              </div>

              {/* Specifications Section */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Product Specifications</h2>
                </div>

                <div className="space-y-4">
                  {productData.specifications.map((spec, index) => (
                    <div key={index} className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          placeholder="Specification Key (e.g., Brand, Model, Color)"
                          value={spec.key}
                          onChange={(e) => handleSpecChange(index, "key", e.target.value)}
                          className="w-full p-4 border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all duration-200 bg-white font-medium"
                        />
                        <input
                          placeholder="Specification Value (e.g., Samsung, Galaxy S21, Black)"
                          value={spec.value}
                          onChange={(e) => handleSpecChange(index, "value", e.target.value)}
                          className="w-full p-4 border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all duration-200 bg-white"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(index)}
                        className="mt-4 px-6 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Remove Specification</span>
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddSpec}
                    className="w-full p-6 border-2 border-dashed border-orange-300 rounded-2xl text-orange-600 hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 flex items-center justify-center space-x-2 font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Add Specification</span>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-8">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-3 text-lg"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Updating Product...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Update Product</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditProduct;