import React, { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import { useParams } from "react-router-dom";
const validCategories = [
  "Electronics", "Appliances", "Mobiles", "Toys",
  "Books", "Food", "Furniture", "Medicines"
];

function EditProduct() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [brand, setBrand] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [mrp, setMrp] = useState("");
  const [quantity, setQuantity] = useState("");
  
  // Main images: Array of { url: string, file?: File, toRemove: bool }
  const [mainImages, setMainImages] = useState([]);

  // Description: array of { heading, text, imageUrl, newImageFile?, toRemove? }
  const [description, setDescription] = useState([]);

  // Specifications: array of { heading, specs: [{key, value}] }
  const [specifications, setSpecifications] = useState([]);

  // Files for new main images upload
  const [newMainImagesFiles, setNewMainImagesFiles] = useState([]);

  // Files for new description images (matching description items that have new images)
  // We'll link them directly in description state as newImageFile.

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await axiosInstance.get(`product/getProduct/${id}`);
        const p = res.data;

        setBrand(p.brand);
        setTitle(p.title);
        setCategory(p.category);
        setPrice(p.price);
        setMrp(p.mrp);
        setQuantity(p.quantity);

        // Initialize mainImages array with existing URLs
        setMainImages(p.imageUrl.map(url => ({ url, toRemove: false })));

        // Description init
        setDescription(p.description.map(d => ({
          heading: d.heading || "",
          text: d.text || "",
          imageUrl: d.image || "",
          newImageFile: null,
          toRemove: false
        })));

        // Specifications init
        setSpecifications(p.specifications || []);

        setLoading(false);
      } catch (error) {
        alert("Failed to load product");
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  function handleMainImageRemove(index) {
    setMainImages(prev => {
      const copy = [...prev];
      copy[index].toRemove = true;
      return copy;
    });
  }

  function handleAddMainImages(e) {
    // Append new files to upload list & show previews
    const files = Array.from(e.target.files);
    setNewMainImagesFiles(prev => [...prev, ...files]);
  }

  function handleRemoveNewMainImage(index) {
    setNewMainImagesFiles(prev => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
  }

  // Description handlers
  function updateDescriptionField(index, field, value) {
    setDescription(prev => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  }

  function handleDescriptionImageChange(index, e) {
    const file = e.target.files[0];
    if (!file) return;
    setDescription(prev => {
      const copy = [...prev];
      copy[index].newImageFile = file;
      // Clear old imageUrl if new image selected
      copy[index].imageUrl = "";
      return copy;
    });
  }

  function handleRemoveDescription(index) {
    setDescription(prev => {
      const copy = [...prev];
      copy[index].toRemove = true;
      return copy;
    });
  }

  function handleAddDescription() {
    setDescription(prev => [...prev, { heading: "", text: "", imageUrl: "", newImageFile: null, toRemove: false }]);
  }

  // Specifications handlers
  function updateSpecHeading(index, value) {
    setSpecifications(prev => {
      const copy = [...prev];
      copy[index].heading = value;
      return copy;
    });
  }

  function updateSpecKey(specGroupIndex, specIndex, value) {
    setSpecifications(prev => {
      const copy = [...prev];
      copy[specGroupIndex].specs[specIndex].key = value;
      return copy;
    });
  }

  function updateSpecValue(specGroupIndex, specIndex, value) {
    setSpecifications(prev => {
      const copy = [...prev];
      copy[specGroupIndex].specs[specIndex].value = value;
      return copy;
    });
  }

  function addSpecGroup() {
    setSpecifications(prev => [...prev, { heading: "", specs: [{ key: "", value: "" }] }]);
  }

  function removeSpecGroup(index) {
    setSpecifications(prev => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
  }

  function addSpecInGroup(groupIndex) {
    setSpecifications(prev => {
      const copy = [...prev];
      copy[groupIndex].specs.push({ key: "", value: "" });
      return copy;
    });
  }

  function removeSpecInGroup(groupIndex, specIndex) {
    setSpecifications(prev => {
      const copy = [...prev];
      copy[groupIndex].specs.splice(specIndex, 1);
      return copy;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData();

    formData.append("category", category);
    formData.append("price", price);
    formData.append("mrp", mrp || price);
    formData.append("quantity", quantity);

    // Brand and Title not editable as per your request, so no need to send those again

    // Handle main images
    // Send only images that are not marked for removal
    const keptImageUrls = mainImages.filter(img => !img.toRemove).map(img => img.url);

    // Append kept images URLs as JSON string (if your backend accepts it)
    formData.append("existingMainImages", JSON.stringify(keptImageUrls));

    // Append newly added main image files
    newMainImagesFiles.forEach((file, i) => {
      formData.append("mainImages", file);
    });

    // Handle description: send only items not marked toRemove
    const filteredDescription = description.filter(d => !d.toRemove);

    // For description images: we send new images as files, old ones as URLs in JSON
    // We'll append description as JSON but for new images, backend expects files named descriptionImages[]
    const descriptionForBackend = filteredDescription.map(d => ({
      heading: d.heading,
      text: d.text,
      image: d.imageUrl,  // old image url if any
      needsNewImage: d.newImageFile ? true : false
    }));

    formData.append("description", JSON.stringify(descriptionForBackend));
    filteredDescription.forEach(d => {
      if (d.newImageFile) {
        formData.append("descriptionImages", d.newImageFile);
      }
    });

    // Handle specifications - just send them as JSON string
    formData.append("specifications", JSON.stringify(specifications));

    try {
     
      const res = await axiosInstance.post(`product/editProduct/${id}`, formData);

      alert("Product updated successfully");
      // Redirect or update UI accordingly
    } catch (error) {
      console.log(error);
      alert("Failed to update product");
      console.error(error);
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4">
    <div className="max-w-6xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl border border-white/20 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-8 py-6">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">✏️</span>
            </div>
            Edit Product
          </h2>
          <p className="text-blue-100 mt-2">Update your product information and details</p>
        </div>

        <div className="p-8 space-y-8">
          {/* Product Info Section */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-blue-600">ℹ️</span>
              Product Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Brand - Readonly */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand (Read Only)
                </label>
                <input
                  type="text"
                  value={brand}
                  readOnly
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed"
                />
                <div className="absolute right-3 top-9 text-gray-400">🔒</div>
              </div>

              {/* Title - Readonly */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title (Read Only)
                </label>
                <input
                  type="text"
                  value={title}
                  readOnly
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed"
                />
                <div className="absolute right-3 top-9 text-gray-400">🔒</div>
              </div>

              {/* Category */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                >
                  <option value="">Select Category</option>
                  {validCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  required
                  min={0}
                  step="0.01"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                />
                <div className="absolute right-3 top-9 text-gray-500">₹</div>
              </div>

              {/* MRP */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  MRP
                </label>
                <input
                  type="number"
                  value={mrp}
                  onChange={e => setMrp(e.target.value)}
                  min={0}
                  step="0.01"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                />
                <div className="absolute right-3 top-9 text-gray-500">₹</div>
              </div>

              {/* Quantity */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  required
                  min={0}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                />
              </div>
            </div>
          </div>

          {/* Main Images Section */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-green-600">🖼️</span>
              Main Product Images
            </h3>
            
            {/* Existing Images */}
            {mainImages.some(img => !img.toRemove) && (
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-700 mb-3">Current Images</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {mainImages.map((img, i) => !img.toRemove && (
                    <div key={i} className="relative group">
                      <div className="w-full h-32 bg-white rounded-xl overflow-hidden shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                        <img
                          src={img.url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleMainImageRemove(i)}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 text-sm flex items-center justify-center shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Images */}
            <div className="border-2 border-dashed border-green-300 rounded-xl p-6 bg-white/50 hover:bg-white/70 transition-colors duration-200">
              <label className="block text-lg font-medium text-gray-700 mb-3">Add New Images</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleAddMainImages}
                className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-600 file:text-white file:cursor-pointer hover:file:bg-green-700 transition-colors"
              />
              <p className="text-sm text-gray-600 mt-2">Upload multiple images (JPG, PNG, WEBP)</p>
            </div>

            {/* New Images Preview */}
            {newMainImagesFiles.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-700 mb-3">New Images to Add</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {newMainImagesFiles.map((file, i) => (
                    <div key={i} className="relative group">
                      <div className="w-full h-32 bg-white rounded-xl overflow-hidden shadow-md border border-green-200 hover:shadow-lg transition-shadow duration-200">
                        <img
                          src={URL.createObjectURL(file)}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveNewMainImage(i)}
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
                onClick={handleAddDescription}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
              >
                <span>+</span>
                Add Description
              </button>
            </div>
            
            <div className="space-y-4">
              {description.filter(d => !d.toRemove).map((desc, i) => (
                <div key={i} className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-purple-200 relative">
                  <button
                    type="button"
                    onClick={() => handleRemoveDescription(i)}
                    className="absolute top-4 right-4 text-red-500 hover:text-red-700 w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center transition-colors duration-200"
                  >
                    ✕
                  </button>
                  
                  <div className="space-y-4 pr-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Heading</label>
                      <input
                        type="text"
                        value={desc.heading}
                        onChange={e => updateDescriptionField(i, "heading", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/70 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter section heading"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={desc.text}
                        onChange={e => updateDescriptionField(i, "text", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/70 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                        rows="4"
                        placeholder="Enter detailed description"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                      
                      {/* Current Image */}
                      {desc.imageUrl && !desc.newImageFile && (
                        <div className="mb-3">
                          <div className="relative inline-block">
                            <img
                              src={desc.imageUrl}
                              alt=""
                              className="w-32 h-32 object-cover rounded-xl shadow-md border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => updateDescriptionField(i, "imageUrl", "")}
                              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 text-sm flex items-center justify-center shadow-lg transition-all duration-200"
                            >
                              ✕
                            </button>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">Current image</p>
                        </div>
                      )}

                      {/* New Image Preview */}
                      {desc.newImageFile && (
                        <div className="mb-3">
                          <img
                            src={URL.createObjectURL(desc.newImageFile)}
                            alt=""
                            className="w-32 h-32 object-cover rounded-xl shadow-md border border-purple-200"
                          />
                          <p className="text-sm text-gray-600 mt-1">New image to upload</p>
                        </div>
                      )}

                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleDescriptionImageChange(i, e)}
                        className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white file:cursor-pointer hover:file:bg-purple-700 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {description.filter(d => !d.toRemove).length === 0 && (
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
                onClick={addSpecGroup}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
              >
                <span>+</span>
                Add Spec Group
              </button>
            </div>

            <div className="space-y-4">
              {specifications.map((group, gi) => (
                <div key={gi} className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-orange-200 relative">
                  <button
                    type="button"
                    onClick={() => removeSpecGroup(gi)}
                    className="absolute top-4 right-4 text-red-500 hover:text-red-700 w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center transition-colors duration-200"
                  >
                    ✕
                  </button>
                  
                  <div className="space-y-4 pr-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Group Heading</label>
                      <input
                        type="text"
                        value={group.heading}
                        onChange={e => updateSpecHeading(gi, e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/70 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                        placeholder="e.g., Technical Specifications, Dimensions, etc."
                      />
                    </div>
                    
                    <div className="space-y-3">
                      {group.specs.map((spec, si) => (
                        <div key={si} className="flex gap-3 items-center bg-white/50 p-3 rounded-lg">
                          <input
                            type="text"
                            placeholder="Specification name"
                            value={spec.key}
                            onChange={e => updateSpecKey(gi, si, e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                          />
                          <input
                            type="text"
                            placeholder="Value"
                            value={spec.value}
                            onChange={e => updateSpecValue(gi, si, e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeSpecInGroup(gi, si)}
                            className="text-red-500 hover:text-red-700 w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center transition-colors duration-200"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      
                      <button
                        type="button"
                        onClick={() => addSpecInGroup(gi)}
                        className="w-full py-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors duration-200 font-medium"
                      >
                        + Add Specification
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {specifications.length === 0 && (
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
              <span className="text-xl">💾</span>
              Update Product
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
);
}

export default EditProduct;
