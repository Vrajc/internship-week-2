import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useClassification } from '../../contexts/ClassificationContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Download, TrendingUp, AlertTriangle, Archive, Calendar } from 'lucide-react';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { generateUserPDFReport, generateUserCSVReport } from '../../services/reportGenerator';
import toast from 'react-hot-toast';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const { getUserClassifications } = useClassification();
  const userClassifications = getUserClassifications(user?.id || '');

  // Prepare data for charts
  const categoryData = userClassifications.reduce((acc, classification) => {
    acc[classification.category] = (acc[classification.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryChartData = Object.entries(categoryData).map(([category, count]) => ({
    category,
    count
  }));

  const hazardousElementsData = userClassifications.reduce((acc, classification) => {
    classification.hazardousElements.forEach(element => {
      acc[element] = (acc[element] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const hazardousChartData = Object.entries(hazardousElementsData).map(([element, count]) => ({
    element,
    count
  }));

  // Trend data (last 7 days)
  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date()
  });

  const trendData = last7Days.map(date => {
    const dayClassifications = userClassifications.filter(c => 
      format(c.createdAt, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
    return {
      date: format(date, 'MMM dd'),
      classifications: dayClassifications.length
    };
  });

  const COLORS = ['#10B981', '#3B82F6', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899'];

  const handleDownloadReport = (type: 'pdf' | 'csv') => {
    if (!user) return;
    
    try {
      if (type === 'pdf') {
        generateUserPDFReport(userClassifications, user.name);
        toast.success('PDF report downloaded successfully!');
      } else {
        generateUserCSVReport(userClassifications, user.name);
        toast.success('CSV report downloaded successfully!');
      }
    } catch (error) {
      toast.error(`Failed to download ${type.toUpperCase()} report`);
    }
  };

  const stats = [
    {
      name: 'Total Classifications',
      value: userClassifications.length,
      icon: Archive,
      color: 'bg-blue-500',
      change: '+12% from last month'
    },
    {
      name: 'Most Common Category',
      value: categoryChartData.length > 0 ? categoryChartData.sort((a, b) => b.count - a.count)[0].category : 'N/A',
      icon: TrendingUp,
      color: 'bg-green-500',
      change: `${categoryChartData.length > 0 ? categoryChartData[0].count : 0} items`
    },
    {
      name: 'Hazardous Items',
      value: userClassifications.filter(c => c.hazardousElements.length > 0).length,
      icon: AlertTriangle,
      color: 'bg-red-500',
      change: 'Requires proper disposal'
    },
    {
      name: 'This Month',
      value: userClassifications.filter(c => 
        c.createdAt >= subDays(new Date(), 30)
      ).length,
      icon: Calendar,
      color: 'bg-purple-500',
      change: 'Recent activity'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back, {user?.name}!</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => handleDownloadReport('pdf')}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Download PDF</span>
          </button>
          <button
            onClick={() => handleDownloadReport('csv')}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
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

        {/* Hazardous Elements Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hazardous Elements</h3>
          {hazardousChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={hazardousChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ element, percent }) => `${element} ${(percent * 100).toFixed(0)}%`}
                >
                  {hazardousChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Trend Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Classification Trend (Last 7 Days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="classifications" stroke="#10B981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Classifications */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Classifications</h3>
        {userClassifications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
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
                {userClassifications.slice(0, 5).map((classification) => (
                  <tr key={classification.id}>
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
                      {classification.confidence}%
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
            No classifications yet. Start by uploading your first image!
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;