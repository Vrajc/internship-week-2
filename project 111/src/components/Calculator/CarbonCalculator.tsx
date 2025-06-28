import React, { useState, useEffect } from 'react';
import { Calculator, Leaf, Car, Home, Plane, ShoppingBag, RotateCcw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const CarbonCalculator = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('transport');
  const [results, setResults] = useState(null);

  const [transportData, setTransportData] = useState({
    carMiles: '',
    publicTransport: '',
    flights: ''
  });

  const [homeData, setHomeData] = useState({
    electricity: '',
    gas: '',
    heating: ''
  });

  const [lifestyleData, setLifestyleData] = useState({
    diet: 'mixed',
    shopping: '',
    waste: ''
  });

  // Reset calculator data when user changes (user-specific reset)
  useEffect(() => {
    if (user) {
      // Load user-specific data from localStorage if available
      const savedData = localStorage.getItem(`carbonCalculator_${user.id}`);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setTransportData(parsed.transportData || { carMiles: '', publicTransport: '', flights: '' });
        setHomeData(parsed.homeData || { electricity: '', gas: '', heating: '' });
        setLifestyleData(parsed.lifestyleData || { diet: 'mixed', shopping: '', waste: '' });
        setResults(parsed.results || null);
      } else {
        // Reset to default values for new user
        resetCalculator();
      }
    }
  }, [user]);

  // Save data to localStorage whenever data changes
  useEffect(() => {
    if (user) {
      const dataToSave = {
        transportData,
        homeData,
        lifestyleData,
        results
      };
      localStorage.setItem(`carbonCalculator_${user.id}`, JSON.stringify(dataToSave));
    }
  }, [transportData, homeData, lifestyleData, results, user]);

  const resetCalculator = () => {
    setTransportData({ carMiles: '', publicTransport: '', flights: '' });
    setHomeData({ electricity: '', gas: '', heating: '' });
    setLifestyleData({ diet: 'mixed', shopping: '', waste: '' });
    setResults(null);
    setActiveTab('transport');
  };

  const calculateCarbon = () => {
    // Simplified carbon calculation (kg CO2 per year)
    const carEmissions = parseFloat(transportData.carMiles || 0) * 0.404; // kg CO2 per mile
    const publicTransportEmissions = parseFloat(transportData.publicTransport || 0) * 0.089;
    const flightEmissions = parseFloat(transportData.flights || 0) * 0.255;
    
    const electricityEmissions = parseFloat(homeData.electricity || 0) * 0.92; // kg CO2 per kWh
    const gasEmissions = parseFloat(homeData.gas || 0) * 2.04;
    
    const dietMultiplier = {
      vegan: 1.5,
      vegetarian: 2.5,
      mixed: 3.3,
      meat: 4.2
    };
    const dietEmissions = dietMultiplier[lifestyleData.diet] * 365;
    
    const shoppingEmissions = parseFloat(lifestyleData.shopping || 0) * 0.5;
    const wasteEmissions = parseFloat(lifestyleData.waste || 0) * 0.3;

    const totalEmissions = carEmissions + publicTransportEmissions + flightEmissions + 
                          electricityEmissions + gasEmissions + dietEmissions + 
                          shoppingEmissions + wasteEmissions;

    const calculatedResults = {
      total: totalEmissions.toFixed(1),
      breakdown: {
        transport: (carEmissions + publicTransportEmissions + flightEmissions).toFixed(1),
        home: (electricityEmissions + gasEmissions).toFixed(1),
        lifestyle: (dietEmissions + shoppingEmissions + wasteEmissions).toFixed(1)
      }
    };

    setResults(calculatedResults);
  };

  const tabs = [
    { id: 'transport', label: 'Transport', icon: Car },
    { id: 'home', label: 'Home Energy', icon: Home },
    { id: 'lifestyle', label: 'Lifestyle', icon: ShoppingBag }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Calculator className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900">Carbon Footprint Calculator</h1>
        </div>
        <p className="text-gray-600">Calculate your annual carbon emissions and discover ways to reduce them</p>
        <p className="text-sm text-gray-500 mt-2">Personal calculator for {user?.name}</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-green-50 text-green-600 border-b-2 border-green-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'transport' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Transportation</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Car Miles per Year
                  </label>
                  <input
                    type="number"
                    value={transportData.carMiles}
                    onChange={(e) => setTransportData({...transportData, carMiles: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., 12000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Public Transport Miles per Year
                  </label>
                  <input
                    type="number"
                    value={transportData.publicTransport}
                    onChange={(e) => setTransportData({...transportData, publicTransport: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., 2000"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Flight Miles per Year
                  </label>
                  <input
                    type="number"
                    value={transportData.flights}
                    onChange={(e) => setTransportData({...transportData, flights: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., 5000"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'home' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Home Energy</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Electricity (kWh)
                  </label>
                  <input
                    type="number"
                    value={homeData.electricity}
                    onChange={(e) => setHomeData({...homeData, electricity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., 800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Natural Gas (therms)
                  </label>
                  <input
                    type="number"
                    value={homeData.gas}
                    onChange={(e) => setHomeData({...homeData, gas: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., 50"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'lifestyle' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Lifestyle</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diet Type
                  </label>
                  <select
                    value={lifestyleData.diet}
                    onChange={(e) => setLifestyleData({...lifestyleData, diet: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="vegan">Vegan</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="mixed">Mixed Diet</option>
                    <option value="meat">High Meat Consumption</option>
                  </select>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monthly Shopping ($)
                    </label>
                    <input
                      type="number"
                      value={lifestyleData.shopping}
                      onChange={(e) => setLifestyleData({...lifestyleData, shopping: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., 500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weekly Waste (lbs)
                    </label>
                    <input
                      type="number"
                      value={lifestyleData.waste}
                      onChange={(e) => setLifestyleData({...lifestyleData, waste: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., 20"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-6 flex space-x-4">
          <button
            onClick={calculateCarbon}
            className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium flex items-center justify-center space-x-2"
          >
            <Calculator className="h-5 w-5" />
            <span>Calculate My Carbon Footprint</span>
          </button>
          <button
            onClick={resetCalculator}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium flex items-center justify-center space-x-2"
          >
            <RotateCcw className="h-5 w-5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Leaf className="h-6 w-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Your Carbon Footprint</h2>
            </div>
            <div className="text-4xl font-bold text-green-600 mb-2">{results.total} kg CO₂</div>
            <p className="text-gray-600">per year</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Car className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-blue-600">{results.breakdown.transport} kg</div>
              <div className="text-sm text-gray-600">Transport</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Home className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-orange-600">{results.breakdown.home} kg</div>
              <div className="text-sm text-gray-600">Home Energy</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <ShoppingBag className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-purple-600">{results.breakdown.lifestyle} kg</div>
              <div className="text-sm text-gray-600">Lifestyle</div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-3">Recommendations to Reduce Your Footprint</h3>
            <ul className="space-y-2 text-green-800">
              <li>• Use public transportation or bike more often</li>
              <li>• Switch to renewable energy sources</li>
              <li>• Reduce meat consumption</li>
              <li>• Buy local and seasonal products</li>
              <li>• Improve home insulation and use energy-efficient appliances</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarbonCalculator;