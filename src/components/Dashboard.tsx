import { useState, useEffect } from 'react';
import { 
  Activity, 
  Database, 
  TrendingUp, 
  Target, 
  Zap, 
  ChevronRight,
  Timer,
  BarChart3,
  Shield,
  ArrowUpDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import type { PerformanceMetric } from '../types';

const Dashboard = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  useEffect(() => {
    // Check API connection
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/health');
        const result = await response.json();
        if (result.status === 'ok' && result.config?.hasCredentials) {
          setConnectionStatus('connected');
        } else {
          setConnectionStatus('error');
        }
      } catch {
        setConnectionStatus('error');
      }
    };
    
    checkConnection();

    // Simulate real-time metrics
    const generateMetrics = () => {
      const now = new Date();
      return Array.from({ length: 10 }, (_, i) => ({
        timestamp: new Date(now.getTime() - (9 - i) * 60000).toISOString(),
        executionTime: Math.random() * 0.5 + 0.1, // Sub-second queries
        rowsProcessed: Math.floor(Math.random() * 50000) + 10000,
        operation: ['MERGE', 'Attribution', 'Fraud Detection'][Math.floor(Math.random() * 3)]
      }));
    };

    setMetrics(generateMetrics());
    const interval = setInterval(() => {
      setMetrics(prev => [
        ...prev.slice(1),
        {
          timestamp: new Date().toISOString(),
          executionTime: Math.random() * 0.5 + 0.1,
          rowsProcessed: Math.floor(Math.random() * 50000) + 10000,
          operation: ['MERGE', 'Attribution', 'Fraud Detection'][Math.floor(Math.random() * 3)]
        }
      ]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const demoCards = [
    {
      title: 'Ad Performance MERGE Demo',
      description: 'Real-time ad attribution with 50/50 insert/update workload — demonstrating first-class MERGE support',
      path: '/demo/ad-performance',
      icon: Target,
      color: 'bg-firebolt-red',
      estimated: 'Interactive Demo',
      features: ['Attribution Updates', 'Fraud Detection', 'Real-time Analytics']
    }
  ];

  const stats = [
    { label: 'Connection', value: connectionStatus === 'connected' ? 'Cloud' : 'Pending', icon: Database, color: connectionStatus === 'connected' ? 'text-green-600' : 'text-yellow-600' },
    { label: 'Avg Query Time', value: '<500ms', icon: Timer, color: 'text-blue-600' },
    { label: 'Workload Split', value: '50/50', icon: ArrowUpDown, color: 'text-orange-600' },
    { label: 'MERGE Pattern', value: 'First-Class', icon: Zap, color: 'text-firebolt-red' }
  ];

  const useCases = [
    {
      title: 'Attribution Updates',
      description: 'Late-arriving conversion data merged atomically',
      icon: ArrowUpDown,
      color: 'text-green-600'
    },
    {
      title: 'Fraud Detection',
      description: 'Remove fraudulent clicks with MERGE DELETE',
      icon: Shield,
      color: 'text-red-600'
    },
    {
      title: 'Real-Time Analytics',
      description: 'Sub-second queries on continuously updating data',
      icon: TrendingUp,
      color: 'text-blue-600'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Firebolt MERGE Performance Demo
        </h1>
        <p className="text-gray-600">
          Demonstrating how Firebolt eliminates the OLTP vs OLAP trade-off with first-class MERGE support
        </p>
      </div>

      {/* Value Prop Banner */}
      <div className="mb-8 p-6 bg-gradient-to-r from-firebolt-red/10 to-orange-100 rounded-lg border-l-4 border-firebolt-red">
        <p className="text-gray-800 text-lg font-medium">
          🔥 First-Class MERGE Operations for Real-Time Analytics
        </p>
        <p className="text-gray-600 text-sm mt-2">
          Handle 50/50 insert/update workloads with single atomic operations — no more choosing between fast analytics OR efficient updates.
        </p>
      </div>

      {/* Connection Status */}
      <div className="mb-8 p-4 bg-white rounded-lg shadow border-l-4 border-firebolt-blue">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Zap className="w-5 h-5 text-firebolt-red mr-2" />
            <span className="text-sm font-medium text-gray-900">
              Connection Status: 
              {connectionStatus === 'connected' ? (
                <span className="ml-2 text-green-600">Connected to Firebolt Cloud</span>
              ) : connectionStatus === 'error' ? (
                <span className="ml-2 text-yellow-600">API Server Not Running (start with: cd server && npm start)</span>
              ) : (
                <span className="ml-2 text-gray-500">Checking...</span>
              )}
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

      {/* Stats Grid */}
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

      {/* Use Cases */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AdTech Use Cases Demonstrated</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {useCases.map((useCase, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center mb-2">
                <useCase.icon className={`w-5 h-5 ${useCase.color} mr-2`} />
                <h4 className="font-semibold text-gray-900">{useCase.title}</h4>
              </div>
              <p className="text-sm text-gray-600">{useCase.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Sub-Second Query Performance</h3>
          <BarChart3 className="w-5 h-5 text-gray-400" />
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={metrics}>
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={(value) => new Date(value).toLocaleTimeString()}
            />
            <YAxis domain={[0, 1]} label={{ value: 'seconds', angle: -90, position: 'insideLeft' }} />
            <Line 
              type="monotone" 
              dataKey="executionTime" 
              stroke="#FF6B35" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-sm text-gray-500 mt-2 text-center">
          Simulated query times showing consistent sub-second performance
        </p>
      </div>

      {/* Demo Card */}
      <div className="grid grid-cols-1 gap-6">
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
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-firebolt-red">
                    {demo.title}
                  </h3>
                  <p className="text-sm text-gray-500">{demo.estimated}</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-firebolt-red" />
            </div>
            <p className="text-gray-600 mb-4">{demo.description}</p>
            <div className="flex flex-wrap gap-2">
              {demo.features.map((feature, i) => (
                <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {feature}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      {/* Technical Benefits */}
      <div className="mt-8 bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Why First-Class MERGE Matters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold text-firebolt-red mb-2">Traditional Approach Problems:</p>
            <ul className="space-y-1 text-gray-300">
              <li>• Multiple round trips to database</li>
              <li>• Race conditions between operations</li>
              <li>• Complex transaction management</li>
              <li>• Inconsistent data windows</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-green-400 mb-2">Firebolt MERGE Benefits:</p>
            <ul className="space-y-1 text-gray-300">
              <li>• Single atomic operation</li>
              <li>• ACID compliance</li>
              <li>• Optimized query plan</li>
              <li>• Immediate consistency</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
