import React, { useState } from "react";
import { useSellerAuthStore } from "../store/sellerAuth.store";

const AddProduct = () => {
  const { authSeller, addProduct, checkAuth } = useSellerAuthStore();

  const [mainImages, setMainImages] = useState([]);
  const [descriptionBlocks, setDescriptionBlocks] = useState([]);
  const [specGroups, setSpecGroups] = useState([]);

  const [formValues, setFormValues] = useState({
    brand: "",
    title: "",
    category: "",
    price: "",
    mrp: "",
    quantity: ""
  });

  const handleImageRemove = (index) => {
    const updated = [...mainImages];
    updated.splice(index, 1);
    setMainImages(updated);
  };

  const handleDescriptionChange = (index, field, value) => {
    const updated = [...descriptionBlocks];
    updated[index][field] = value;
    setDescriptionBlocks(updated);
  };

  const handleSpecChange = (gIdx, sIdx, field, value) => {
    const updated = [...specGroups];
    updated[gIdx].specs[sIdx][field] = value;
    setSpecGroups(updated);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(formValues).forEach(([key, val]) => formData.append(key, val));

      // Main images
      mainImages.forEach((img) => formData.append("mainImages", img));

      // Description blocks
      formData.append("description", JSON.stringify(descriptionBlocks));
      descriptionBlocks.forEach((desc, index) => {
        if (desc.image) formData.append("descriptionImages", desc.image);
      });

      // Specifications
      const specs = specGroups.map((group) => ({
        heading: group.heading,
        specs: group.specs
      }));
      formData.append("specifications", JSON.stringify(specs));
     // console.log(formData.get("specifications"));
      await addProduct(formData);
      alert("Product added successfully");
    } catch (err) {
      alert("Failed to add product");
      console.error(err);
    }
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4">
    <div className="max-w-6xl mx-auto">
      <form onSubmit={handleFormSubmit} className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl border border-white/20 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-8 py-6">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
            Add New Product
          </h2>
          <p className="text-blue-100 mt-2">Create and manage your product catalog</p>
        </div>

        <div className="p-8 space-y-8">
          {/* Product Info Section */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-blue-600">ℹ️</span>
              Product Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {["brand", "title", "price", "mrp", "quantity"].map((field) => (
                <div key={field} className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                    {field === "mrp" ? "MRP" : field}
                    {["brand", "title", "price", "quantity"].includes(field) && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  <input
                    type={field === "price" || field === "mrp" || field === "quantity" ? "number" : "text"}
                    placeholder={`Enter ${field === "mrp" ? "MRP" : field}`}
                    value={formValues[field]}
                    onChange={(e) => setFormValues({ ...formValues, [field]: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                    required={["brand", "title", "price", "quantity"].includes(field)}
                  />
                  {field === "price" || field === "mrp" ? (
                    <div className="absolute right-3 top-9 text-gray-500">₹</div>
                  ) : null}
                </div>
              ))}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  value={formValues.category}
                  onChange={(e) => setFormValues({ ...formValues, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                  required
                >
                  <option value="">Select Category</option>
                  {["Electronics", "Appliances", "Mobiles", "Toys", "Books", "Food", "Furniture", "Medicines"].map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Main Images Section */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-green-600">🖼️</span>
              Product Images
            </h3>
            <div className="border-2 border-dashed border-green-300 rounded-xl p-6 bg-white/50 hover:bg-white/70 transition-colors duration-200">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setMainImages([...mainImages, ...Array.from(e.target.files)])}
                className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-600 file:text-white file:cursor-pointer hover:file:bg-green-700 transition-colors"
              />
              <p className="text-sm text-gray-600 mt-2">Upload multiple images (JPG, PNG, WEBP)</p>
            </div>
            
            {mainImages.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-700 mb-3">Uploaded Images</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {mainImages.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <div className="w-full h-32 bg-white rounded-xl overflow-hidden shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                        <img
                          src={URL.createObjectURL(img)}
                          alt={`main-${idx}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleImageRemove(idx)}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 text-sm flex items-center justify-center shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Description Section */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <span className="text-purple-600">📝</span>
                Product Descriptions
              </h3>
              <button
                type="button"
                onClick={() => setDescriptionBlocks([...descriptionBlocks, { heading: "", text: "", image: null }])}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
              >
                <span>+</span>
                Add Description
              </button>
            </div>
            
            <div className="space-y-4">
              {descriptionBlocks.map((block, index) => (
                <div key={index} className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-purple-200 relative">
                  <button
                    type="button"
                    onClick={() => setDescriptionBlocks(descriptionBlocks.filter((_, i) => i !== index))}
                    className="absolute top-4 right-4 text-red-500 hover:text-red-700 w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center transition-colors duration-200"
                  >
                    ✕
                  </button>
                  
                  <div className="space-y-4 pr-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Heading</label>
                      <input
                        type="text"
                        placeholder="Enter section heading"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/70 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        value={block.heading}
                        onChange={(e) => handleDescriptionChange(index, "heading", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        placeholder="Enter detailed description"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/70 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                        rows="4"
                        value={block.text}
                        onChange={(e) => handleDescriptionChange(index, "text", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image (Optional)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleDescriptionChange(index, "image", e.target.files[0])}
                        className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white file:cursor-pointer hover:file:bg-purple-700 transition-colors"
                      />
                    </div>
                    
                    {block.image && (
                      <div className="mt-4">
                        <img
                          src={typeof block.image === "string" ? block.image : URL.createObjectURL(block.image)}
                          alt={`desc-img-${index}`}
                          className="max-h-48 w-auto rounded-xl shadow-md border border-gray-200"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {descriptionBlocks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No descriptions added yet. Click "Add Description" to get started.</p>
                </div>
              )}
            </div>
          </div>

          {/* Specifications Section */}
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-6 border border-orange-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <span className="text-orange-600">⚙️</span>
                Product Specifications
              </h3>
              <button
                type="button"
                onClick={() => setSpecGroups([...specGroups, { heading: "", specs: [] }])}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
              >
                <span>+</span>
                Add Spec Group
              </button>
            </div>

            <div className="space-y-4">
              {specGroups.map((group, gIdx) => (
                <div key={gIdx} className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-orange-200 relative">
                  <button
                    type="button"
                    onClick={() => setSpecGroups(specGroups.filter((_, i) => i !== gIdx))}
                    className="absolute top-4 right-4 text-red-500 hover:text-red-700 w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center transition-colors duration-200"
                  >
                    ✕
                  </button>
                  
                  <div className="space-y-4 pr-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Group Heading</label>
                      <input
                        type="text"
                        placeholder="e.g., Technical Specifications, Dimensions, etc."
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/70 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                        value={group.heading}
                        onChange={(e) => {
                          const updated = [...specGroups];
                          updated[gIdx].heading = e.target.value;
                          setSpecGroups(updated);
                        }}
                      />
                    </div>
                    
                    <div className="space-y-3">
                      {group.specs.map((spec, sIdx) => (
                        <div key={sIdx} className="flex gap-3 items-center bg-white/50 p-3 rounded-lg">
                          <input
                            type="text"
                            placeholder="Specification name"
                            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                            value={spec.key}
                            onChange={(e) => handleSpecChange(gIdx, sIdx, "key", e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="Value"
                            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                            value={spec.value}
                            onChange={(e) => handleSpecChange(gIdx, sIdx, "value", e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...specGroups];
                              updated[gIdx].specs.splice(sIdx, 1);
                              setSpecGroups(updated);
                            }}
                            className="text-red-500 hover:text-red-700 w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center transition-colors duration-200"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...specGroups];
                          updated[gIdx].specs.push({ key: "", value: "" });
                          setSpecGroups(updated);
                        }}
                        className="w-full py-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors duration-200 font-medium"
                      >
                        + Add Specification
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {specGroups.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No specification groups added yet. Click "Add Spec Group" to get started.</p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <button 
              type="submit" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-3"
            >
              <span className="text-xl">🚀</span>
              Submit Product
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
);
};

export default AddProduct;
