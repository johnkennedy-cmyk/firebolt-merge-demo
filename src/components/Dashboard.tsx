import { useState, useEffect } from 'react';
import { 
  Activity, 
  Database, 
  TrendingUp, 
  Users, 
  Zap, 
  ChevronRight,
  Timer,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import type { PerformanceMetric } from '../types';

const Dashboard = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);

  useEffect(() => {
    // Simulate real-time metrics
    const generateMetrics = () => {
      const now = new Date();
      return Array.from({ length: 10 }, (_, i) => ({
        timestamp: new Date(now.getTime() - (9 - i) * 60000).toISOString(),
        executionTime: Math.random() * 100 + 20,
        rowsProcessed: Math.floor(Math.random() * 10000) + 1000,
        operation: ['MERGE', 'INSERT', 'UPDATE'][Math.floor(Math.random() * 3)]
      }));
    };

    setMetrics(generateMetrics());
    const interval = setInterval(() => {
      setMetrics(prev => [
        ...prev.slice(1),
        {
          timestamp: new Date().toISOString(),
          executionTime: Math.random() * 100 + 20,
          rowsProcessed: Math.floor(Math.random() * 10000) + 1000,
          operation: ['MERGE', 'INSERT', 'UPDATE'][Math.floor(Math.random() * 3)]
        }
      ]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const demoCards = [
    {
      title: 'Customer Analytics MERGE',
      description: 'Real-time customer segmentation with MERGE operations',
      path: '/demo/customer-analytics',
      icon: Users,
      color: 'bg-blue-500',
      estimated: '~45 seconds'
    }
  ];

  const stats = [
    { label: 'Active Connections', value: '1', icon: Database, color: 'text-green-600' },
    { label: 'Avg Execution Time', value: '67ms', icon: Timer, color: 'text-blue-600' },
    { label: 'Rows Processed/min', value: '28.4K', icon: TrendingUp, color: 'text-orange-600' },
    { label: 'Success Rate', value: '99.8%', icon: Activity, color: 'text-green-600' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Firebolt MERGE Demo Dashboard
        </h1>
        <p className="text-gray-600">
          Interactive demonstrations of high-performance MERGE operations
        </p>
      </div>

      {/* Connection Status */}
      <div className="mb-8 p-4 bg-white rounded-lg shadow border-l-4 border-firebolt-red">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Zap className="w-5 h-5 text-firebolt-red mr-2" />
            <span className="text-sm font-medium text-gray-900">
              Connection Status: 
              <span className="ml-2 text-green-600">Connected to Firebolt Core (localhost:3473)</span>
            </span>
          </div>
          <Link 
            to="/setup" 
            className="text-firebolt-accent hover:text-firebolt-red-bright text-sm font-medium"
          >
            Configure →
          </Link>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Performance Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Execution Time (Last 10 operations)</h3>
          <BarChart3 className="w-5 h-5 text-gray-400" />
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={metrics}>
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={(value) => new Date(value).toLocaleTimeString()}
            />
            <YAxis />
            <Line 
              type="monotone" 
              dataKey="executionTime" 
              stroke="#FF6B35" 
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Demo Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {demoCards.map((demo, index) => (
          <Link
            key={index}
            to={demo.path}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center mb-4">
                <div className={`${demo.color} p-3 rounded-lg mr-4`}>
                  <demo.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-firebolt-accent">
                    {demo.title}
                  </h3>
                  <p className="text-sm text-gray-500">{demo.estimated}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-firebolt-red-bright" />
            </div>
            <p className="text-gray-600">{demo.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
