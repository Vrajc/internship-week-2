import React from 'react';
import { useClassification } from '../../contexts/ClassificationContext';
import { useMarketplace } from '../../contexts/MarketplaceContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Download, Users, AlertTriangle, Archive, TrendingUp, ShoppingCart, Trash2 } from 'lucide-react';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { generateAdminSystemReport, generateAdminCSVExport } from '../../services/reportGenerator';
import toast from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
  const { getAllClassifications } = useClassification();
  const { getAllItems, removeItem } = useMarketplace();
  const allClassifications = getAllClassifications();
  const allMarketplaceItems = getAllItems();

  // Prepare data for charts
  const categoryData = allClassifications.reduce((acc, classification) => {
    acc[classification.category] = (acc[classification.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryChartData = Object.entries(categoryData).map(([category, count]) => ({
    category,
    count
  }));

  const hazardousElementsData = allClassifications.reduce((acc, classification) => {
    classification.hazardousElements.forEach(element => {
      acc[element] = (acc[element] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const hazardousChartData = Object.entries(hazardousElementsData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([element, count]) => ({
      element,
      count
    }));

  // User activity data
  const userActivityData = allClassifications.reduce((acc, classification) => {
    acc[classification.userId] = (acc[classification.userId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const userActivityChartData = Object.entries(userActivityData).map(([userId, count]) => ({
    user: `User ${userId}`,
    uploads: count
  }));

  // Trend data (last 7 days)
  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date()
  });

  const trendData = last7Days.map(date => {
    const dayClassifications = allClassifications.filter(c => 
      format(c.createdAt, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
    return {
      date: format(date, 'MMM dd'),
      classifications: dayClassifications.length
    };
  });

  const COLORS = ['#10B981', '#3B82F6', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899'];

  const handleDownloadReport = (type: 'pdf' | 'csv') => {
    try {
      if (type === 'pdf') {
        generateAdminSystemReport(allClassifications, allMarketplaceItems);
        toast.success('System PDF report downloaded successfully!');
      } else {
        generateAdminCSVExport(allClassifications, allMarketplaceItems);
        toast.success('Complete system data exported successfully!');
      }
    } catch (error) {
      toast.error(`Failed to download ${type.toUpperCase()} report`);
    }
  };

  const handleDeleteMarketplaceItem = (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this marketplace item?')) {
      removeItem(itemId);
      toast.success('Marketplace item deleted successfully!');
    }
  };

  const stats = [
    {
      name: 'Total Classifications',
      value: allClassifications.length,
      icon: Archive,
      color: 'bg-blue-500',
      change: '+12% from last month'
    },
    {
      name: 'Active Users',
      value: Object.keys(userActivityData).length,
      icon: Users,
      color: 'bg-green-500',
      change: '+3 new users this week'
    },
    {
      name: 'Hazardous Items',
      value: allClassifications.filter(c => c.hazardousElements.length > 0).length,
      icon: AlertTriangle,
      color: 'bg-red-500',
      change: 'Requires monitoring'
    },
    {
      name: 'Marketplace Items',
      value: allMarketplaceItems.length,
      icon: ShoppingCart,
      color: 'bg-purple-500',
      change: 'Active listings'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">System-wide analytics and management</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => handleDownloadReport('pdf')}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>System Report PDF</span>
          </button>
          <button
            onClick={() => handleDownloadReport('csv')}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export All Data</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className={`p-2 rounded-md ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500">{stat.change}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Categories Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Classifications by Category</h3>
          {categoryChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No data available
            </div>
          )}
        </div>

        {/* User Activity Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Activity</h3>
          {userActivityChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userActivityChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="user" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="uploads" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Marketplace Management */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Marketplace Management</h3>
        {allMarketplaceItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seller
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
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
                {allMarketplaceItems.slice(0, 10).map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-10 h-10 rounded-md object-cover mr-3"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.title}</div>
                          <div className="text-sm text-gray-500">{item.condition}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.sellerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${item.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(item.createdAt, 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => handleDeleteMarketplaceItem(item.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No marketplace items yet.
          </div>
        )}
      </div>

      {/* All Classifications Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Classifications</h3>
        {allClassifications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User ID
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allClassifications.slice(0, 10).map((classification) => (
                  <tr key={classification.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      User {classification.userId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"
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
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No classifications yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;