import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useClassification } from '../../contexts/ClassificationContext';
import { Leaf, Recycle, Zap, Droplets, TrendingUp, Award } from 'lucide-react';
import { format, subDays, eachDayOfInterval } from 'date-fns';

const ImpactTracker: React.FC = () => {
  const { user } = useAuth();
  const { getUserClassifications } = useClassification();
  const userClassifications = getUserClassifications(user?.id || '');

  // Calculate impact based on actual classifications
  const totalItems = userClassifications.length;
  const hazardousItems = userClassifications.filter(c => c.hazardousElements.length > 0).length;
  
  // Estimate environmental impact based on classifications
  const estimatedCO2Saved = totalItems * 2.3; // kg CO2 per item recycled
  const estimatedEnergySaved = totalItems * 15; // kWh per item
  const estimatedWaterSaved = totalItems * 18; // liters per item

  // Get categories breakdown
  const categoryBreakdown = userClassifications.reduce((acc, classification) => {
    acc[classification.category] = (acc[classification.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get monthly data for the last 6 months
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return date;
  }).reverse();

  const monthlyData = last6Months.map(date => {
    const monthClassifications = userClassifications.filter(c => 
      c.createdAt.getMonth() === date.getMonth() && 
      c.createdAt.getFullYear() === date.getFullYear()
    );
    return {
      month: format(date, 'MMM'),
      recycled: monthClassifications.length,
      co2: monthClassifications.length * 2.3
    };
  });

  const impactStats = [
    {
      icon: Recycle,
      title: "Items Classified",
      value: totalItems.toString(),
      unit: "items",
      change: "+100%",
      color: "green"
    },
    {
      icon: Leaf,
      title: "CO₂ Saved",
      value: estimatedCO2Saved.toFixed(1),
      unit: "kg",
      change: "+100%",
      color: "emerald"
    },
    {
      icon: Zap,
      title: "Energy Saved",
      value: estimatedEnergySaved.toString(),
      unit: "kWh",
      change: "+100%",
      color: "yellow"
    },
    {
      icon: Droplets,
      title: "Water Saved",
      value: estimatedWaterSaved.toString(),
      unit: "liters",
      change: "+100%",
      color: "blue"
    }
  ];

  const achievements = [
    { 
      title: "First Steps", 
      description: "Classified your first item", 
      earned: totalItems >= 1,
      requirement: 1
    },
    { 
      title: "Eco Warrior", 
      description: "Classified 10+ items", 
      earned: totalItems >= 10,
      requirement: 10
    },
    { 
      title: "Hazard Detective", 
      description: "Identified 5+ hazardous items", 
      earned: hazardousItems >= 5,
      requirement: 5
    },
    { 
      title: "Planet Protector", 
      description: "Saved 100kg+ CO₂", 
      earned: estimatedCO2Saved >= 100,
      requirement: 100
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Environmental Impact</h1>
        <p className="text-gray-600">Track your positive contribution to the planet through e-waste classification</p>
      </div>

      {/* Impact Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {impactStats.map((stat, index) => {
          const IconComponent = stat.icon;
          const colorClasses = {
            green: "bg-green-100 text-green-600",
            emerald: "bg-emerald-100 text-emerald-600",
            yellow: "bg-yellow-100 text-yellow-600",
            blue: "bg-blue-100 text-blue-600"
          };

          return (
            <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorClasses[stat.color]}`}>
                  <IconComponent className="h-6 w-6" />
                </div>
                <div className="flex items-center space-x-1 text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">{stat.change}</span>
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                <span className="text-sm text-gray-500">{stat.unit}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Monthly Progress Chart */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Monthly Progress</h2>
          {monthlyData.length > 0 ? (
            <div className="space-y-4">
              {monthlyData.map((data, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-12 text-sm font-medium text-gray-600">{data.month}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700">Items Classified</span>
                      <span className="text-sm font-medium text-gray-900">{data.recycled}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${Math.min((data.recycled / Math.max(...monthlyData.map(d => d.recycled), 1)) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Start classifying items to see your progress!
            </div>
          )}
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Achievements</h2>
          <div className="space-y-4">
            {achievements.map((achievement, index) => (
              <div key={index} className={`flex items-center space-x-4 p-4 rounded-lg ${
                achievement.earned ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
              }`}>
                <div className={`p-2 rounded-full ${
                  achievement.earned ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  <Award className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className={`font-medium ${
                    achievement.earned ? 'text-green-900' : 'text-gray-600'
                  }`}>
                    {achievement.title}
                  </h3>
                  <p className={`text-sm ${
                    achievement.earned ? 'text-green-700' : 'text-gray-500'
                  }`}>
                    {achievement.description}
                  </p>
                </div>
                {achievement.earned ? (
                  <div className="text-green-600 font-medium text-sm">Earned!</div>
                ) : (
                  <div className="text-gray-500 text-sm">
                    {achievement.requirement - (achievement.title.includes('CO₂') ? estimatedCO2Saved : 
                     achievement.title.includes('hazardous') ? hazardousItems : totalItems)} more
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {Object.keys(categoryBreakdown).length > 0 && (
        <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Items by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(categoryBreakdown).map(([category, count]) => (
              <div key={category} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">{count}</div>
                <div className="text-sm text-gray-600">{category}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Environmental Impact Summary */}
      <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Impact This Year</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">🌱</div>
              <div className="text-lg font-semibold text-gray-900">{Math.round(estimatedCO2Saved / 22)} Trees</div>
              <div className="text-sm text-gray-600">Equivalent CO₂ absorbed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">💧</div>
              <div className="text-lg font-semibold text-gray-900">{estimatedWaterSaved} L</div>
              <div className="text-sm text-gray-600">Water conserved</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">⚡</div>
              <div className="text-lg font-semibold text-gray-900">{estimatedEnergySaved} kWh</div>
              <div className="text-sm text-gray-600">Energy saved</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpactTracker;