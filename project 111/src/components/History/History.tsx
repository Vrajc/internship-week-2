import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useClassification } from '../../contexts/ClassificationContext';
import { format } from 'date-fns';
import { Download, Eye, AlertTriangle, Calendar, Filter, Search, Grid, List } from 'lucide-react';
import toast from 'react-hot-toast';

const History: React.FC = () => {
  const { user } = useAuth();
  const { getUserClassifications } = useClassification();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'confidence' | 'name'>('date');

  const userClassifications = getUserClassifications(user?.id || '');

  // Get unique categories for filter
  const categories = [...new Set(userClassifications.map(c => c.category))];

  // Filter and sort classifications
  const filteredClassifications = userClassifications
    .filter(classification => {
      const matchesSearch = classification.objectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           classification.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || classification.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'confidence':
          return b.confidence - a.confidence;
        case 'name':
          return a.objectName.localeCompare(b.objectName);
        default:
          return 0;
      }
    });

  const handleDownloadReport = (classificationId: string) => {
    toast.success('Individual report downloaded successfully!');
    // Implement actual download logic here
  };

  const getHazardColor = (element: string) => {
    const colors: { [key: string]: string } = {
      'Lead': 'bg-red-100 text-red-800',
      'Mercury': 'bg-orange-100 text-orange-800',
      'Cadmium': 'bg-yellow-100 text-yellow-800',
      'Chromium': 'bg-purple-100 text-purple-800',
      'Lithium': 'bg-blue-100 text-blue-800',
      'Cobalt': 'bg-indigo-100 text-indigo-800',
      'Rare Earth Elements': 'bg-pink-100 text-pink-800',
      'Brominated Flame Retardants': 'bg-red-100 text-red-800',
      'Phosphor': 'bg-green-100 text-green-800'
    };
    return colors[element] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Classification History</h1>
          <p className="mt-2 text-gray-600">
            View and manage your past e-waste classifications
          </p>
        </div>
        <div className="mt-4 sm:mt-0 text-sm text-gray-500">
          Total: {userClassifications.length} items
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by object name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'confidence' | 'name')}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            >
              <option value="date">Sort by Date</option>
              <option value="confidence">Sort by Confidence</option>
              <option value="name">Sort by Name</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-md p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {filteredClassifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No classifications found</h3>
          <p className="text-gray-500">
            {searchTerm || filterCategory !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Start by uploading your first e-waste image'
            }
          </p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClassifications.map((classification) => (
                <div key={classification.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="relative">
                    <img
                      src={classification.imageUrl}
                      alt={classification.objectName}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {classification.confidence}%
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {classification.objectName}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">{classification.category}</p>
                    
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-700 mb-1">Hazardous Elements:</p>
                      <div className="flex flex-wrap gap-1">
                        {classification.hazardousElements.slice(0, 3).map((element, index) => (
                          <span
                            key={index}
                            className={`px-2 py-0.5 rounded text-xs font-medium ${getHazardColor(element)}`}
                          >
                            {element}
                          </span>
                        ))}
                        {classification.hazardousElements.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{classification.hazardousElements.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(classification.createdAt, 'MMM dd, yyyy')}
                      </div>
                      <button
                        onClick={() => handleDownloadReport(classification.id)}
                        className="flex items-center space-x-1 px-2 py-1 text-xs text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                      >
                        <Download className="h-3 w-3" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Image
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Object
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hazardous Elements
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Confidence
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredClassifications.map((classification) => (
                      <tr key={classification.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <img
                            src={classification.imageUrl}
                            alt={classification.objectName}
                            className="w-12 h-12 object-cover rounded-md"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {classification.objectName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {classification.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex flex-wrap gap-1">
                            {classification.hazardousElements.slice(0, 2).map((element, index) => (
                              <span
                                key={index}
                                className={`px-2 py-0.5 rounded text-xs font-medium ${getHazardColor(element)}`}
                              >
                                {element}
                              </span>
                            ))}
                            {classification.hazardousElements.length > 2 && (
                              <span className="text-xs text-gray-500">
                                +{classification.hazardousElements.length - 2} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2 w-16">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${classification.confidence}%` }}
                              ></div>
                            </div>
                            <span className="text-xs">{classification.confidence}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(classification.createdAt, 'MMM dd, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleDownloadReport(classification.id)}
                              className="flex items-center space-x-1 px-2 py-1 text-xs text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                            >
                              <Download className="h-3 w-3" />
                              <span>Download</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default History;