import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useMarketplace } from '../../contexts/MarketplaceContext';
import { Search, Filter, Star, MapPin, Clock, DollarSign, Heart, MessageCircle, ShoppingCart, Package, Upload as UploadIcon, X, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

// Specific e-waste images for different categories
const categoryImages = {
  'Smartphones': [
    'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?w=400&h=300&fit=crop',
    'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?w=400&h=300&fit=crop',
    'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?w=400&h=300&fit=crop'
  ],
  'Laptops': [
    'https://images.pexels.com/photos/442559/pexels-photo-442559.jpeg?w=400&h=300&fit=crop',
    'https://images.pexels.com/photos/18105/pexels-photo.jpg?w=400&h=300&fit=crop',
    'https://images.pexels.com/photos/1229861/pexels-photo-1229861.jpeg?w=400&h=300&fit=crop'
  ],
  'Tablets': [
    'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?w=400&h=300&fit=crop',
    'https://images.pexels.com/photos/1334598/pexels-photo-1334598.jpeg?w=400&h=300&fit=crop'
  ],
  'Desktop PCs': [
    'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?w=400&h=300&fit=crop',
    'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?w=400&h=300&fit=crop'
  ],
  'Gaming Consoles': [
    'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?w=400&h=300&fit=crop',
    'https://images.pexels.com/photos/1298601/pexels-photo-1298601.jpeg?w=400&h=300&fit=crop'
  ],
  'Audio Equipment': [
    'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?w=400&h=300&fit=crop',
    'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?w=400&h=300&fit=crop'
  ],
  'Cameras': [
    'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?w=400&h=300&fit=crop',
    'https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg?w=400&h=300&fit=crop'
  ],
  'Smart Home': [
    'https://images.pexels.com/photos/4790268/pexels-photo-4790268.jpeg?w=400&h=300&fit=crop',
    'https://images.pexels.com/photos/4790267/pexels-photo-4790267.jpeg?w=400&h=300&fit=crop'
  ],
  'Accessories': [
    'https://images.pexels.com/photos/163117/keyboard-hardware-computer-keyboard-pc-163117.jpeg?w=400&h=300&fit=crop',
    'https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg?w=400&h=300&fit=crop'
  ]
};

const Marketplace: React.FC = () => {
  const { user } = useAuth();
  const { getAllItems, getUserItems, addItem, removeItem } = useMarketplace();
  const [activeTab, setActiveTab] = useState<'browse' | 'sell' | 'my-listings'>('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high'>('newest');
  
  // Form state for selling
  const [sellForm, setSellForm] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: 'excellent' as 'excellent' | 'good' | 'fair' | 'parts'
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allItems = getAllItems();
  const userItems = getUserItems(user?.id || '');
  const categories = ['Smartphones', 'Laptops', 'Tablets', 'Desktop PCs', 'Gaming Consoles', 'Audio Equipment', 'Cameras', 'Smart Home', 'Accessories'];

  const filteredItems = allItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesCondition = selectedCondition === 'all' || item.condition === selectedCondition;
    return matchesSearch && matchesCategory && matchesCondition;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const handleImageSelect = (files: FileList) => {
    const newFiles = Array.from(files).slice(0, 5 - selectedImages.length);
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    
    setSelectedImages(prev => [...prev, ...newFiles]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const getRandomCategoryImage = (category: string): string => {
    const images = categoryImages[category] || categoryImages['Accessories'];
    return images[Math.floor(Math.random() * images.length)];
  };

  const handleSellSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sellForm.title || !sellForm.description || !sellForm.price || !sellForm.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (selectedImages.length === 0) {
      toast.error('Please add at least one image');
      return;
    }

    try {
      // Use uploaded images if available, otherwise use category-specific images
      let imageUrls: string[];
      
      if (selectedImages.length > 0) {
        // In a real app, you would upload these to cloud storage
        // For demo, we'll use the preview URLs (which are blob URLs)
        imageUrls = imagePreviews;
      } else {
        // Fallback to category images
        imageUrls = [getRandomCategoryImage(sellForm.category)];
      }

      addItem({
        sellerId: user!.id,
        sellerName: user!.name,
        title: sellForm.title,
        description: sellForm.description,
        price: parseFloat(sellForm.price),
        condition: sellForm.condition,
        category: sellForm.category,
        images: imageUrls,
        isActive: true
      });

      // Reset form
      setSellForm({
        title: '',
        description: '',
        price: '',
        category: '',
        condition: 'excellent'
      });
      setSelectedImages([]);
      setImagePreviews([]);

      toast.success('Item listed successfully!');
      setActiveTab('my-listings');
    } catch (error) {
      toast.error('Failed to list item. Please try again.');
    }
  };

  const handleDeleteItem = (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      removeItem(itemId);
      toast.success('Item deleted successfully!');
    }
  };

  const handleContactSeller = (itemId: string) => {
    toast.success('Message sent to seller!');
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'parts': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Marketplace</h1>
        <p className="text-lg text-gray-600">
          Buy, sell, and trade electronics sustainably
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1">
        <div className="flex space-x-1">
          {[
            { id: 'browse', label: 'Browse Items', icon: Search },
            { id: 'sell', label: 'Sell Item', icon: Package },
            { id: 'my-listings', label: 'My Listings', icon: ShoppingCart }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Browse Items */}
      {activeTab === 'browse' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                <select
                  value={selectedCondition}
                  onChange={(e) => setSelectedCondition(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Conditions</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="parts">Parts Only</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative">
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      // Fallback to category image if user image fails
                      e.currentTarget.src = getRandomCategoryImage(item.category);
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      For Sale
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(item.condition)}`}>
                      {item.condition}
                    </span>
                    <span className="text-lg font-bold text-green-600">${item.price}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                  
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-sm text-gray-700">{item.sellerName}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>{item.category}</span>
                    <span>{format(item.createdAt, 'MMM dd')}</span>
                  </div>

                  <button
                    onClick={() => handleContactSeller(item.id)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Contact Seller</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-500">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      )}

      {/* Sell Item Form */}
      {activeTab === 'sell' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">List Your Item</h2>
          <form onSubmit={handleSellSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  required
                  value={sellForm.title}
                  onChange={(e) => setSellForm({...sellForm, title: e.target.value})}
                  placeholder="e.g., iPhone 12 Pro - Excellent Condition"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)  *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={sellForm.price}
                  onChange={(e) => setSellForm({...sellForm, price: e.target.value})}
                  placeholder="0"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  required
                  value={sellForm.category}
                  onChange={(e) => setSellForm({...sellForm, category: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Condition *</label>
                <select
                  value={sellForm.condition}
                  onChange={(e) => setSellForm({...sellForm, condition: e.target.value as any})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="parts">Parts Only</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                required
                rows={4}
                value={sellForm.description}
                onChange={(e) => setSellForm({...sellForm, description: e.target.value})}
                placeholder="Describe your item in detail..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Photos * (Max 5)</label>
              <div className="space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-green-400 transition-colors"
                >
                  <UploadIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">Click to upload photos or drag and drop</p>
                  <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 10MB each</p>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => e.target.files && handleImageSelect(e.target.files)}
                  className="hidden"
                />
                
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setSellForm({
                    title: '',
                    description: '',
                    price: '',
                    category: '',
                    condition: 'excellent'
                  });
                  setSelectedImages([]);
                  setImagePreviews([]);
                }}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                List Item
              </button>
            </div>
          </form>
        </div>
      )}

      {/* My Listings */}
      {activeTab === 'my-listings' && (
        <div className="space-y-6">
          {userItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userItems.map(item => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="relative">
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = getRandomCategoryImage(item.category);
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(item.condition)}`}>
                        {item.condition}
                      </span>
                      <span className="text-lg font-bold text-green-600">${item.price}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>{item.category}</span>
                      <span>{format(item.createdAt, 'MMM dd, yyyy')}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Listing</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No listings yet</h3>
              <p className="text-gray-500 mb-4">Start selling your electronics to help reduce e-waste!</p>
              <button
                onClick={() => setActiveTab('sell')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Create Your First Listing
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Marketplace;