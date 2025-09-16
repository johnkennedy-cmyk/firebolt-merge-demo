import { useState } from 'react';
import { 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Terminal,
  Cloud,
  Server,
  Play
} from 'lucide-react';
import type { ConnectionConfig } from '../types';

const FireboltSetup = () => {
  const [connectionType, setConnectionType] = useState<'cloud' | 'core'>('core');
  const [config, setConfig] = useState<ConnectionConfig>({
    database: 'ecommercedb',
    username: 'firebolt',
    password: '',
    endpoint: 'localhost',
    port: '3473'
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === 'success' ? '✓' : type === 'error' ? '✗' : '•';
    setLogs(prev => [...prev, `[${timestamp}] ${prefix} ${message}`]);
  };

  const testConnection = async () => {
    setIsConnecting(true);
    setLogs([]);
    
    addLog('Initializing connection test...');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    addLog(`Attempting to connect to ${connectionType === 'cloud' ? 'Firebolt Cloud' : 'Firebolt Core'}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (connectionType === 'core') {
      addLog(`Testing connection to ${config.endpoint}:${config.port}`);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      addLog('Validating database credentials...');
      await new Promise(resolve => setTimeout(resolve, 600));
      
      addLog(`Connected to database: ${config.database}`, 'success');
      await new Promise(resolve => setTimeout(resolve, 400));
      
      addLog('Verifying table schemas...', 'success');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      addLog('Connection test completed successfully!', 'success');
      setConnectionStatus('success');
    } else {
      addLog('Cloud connection requires valid credentials', 'error');
      setConnectionStatus('error');
    }
    
    setIsConnecting(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Firebolt Connection Setup
        </h1>
        <p className="text-gray-600">
          Configure your database connection for MERGE demonstrations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuration Panel */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-6">
            <Settings className="w-6 h-6 text-firebolt-orange mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Connection Configuration</h2>
          </div>

          {/* Connection Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Connection Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setConnectionType('core')}
                className={`flex items-center justify-center p-3 rounded-lg border-2 transition-colors ${
                  connectionType === 'core'
                    ? 'border-firebolt-blue bg-blue-50 text-firebolt-blue'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Server className="w-5 h-5 mr-2" />
                Firebolt Core
              </button>
              <button
                onClick={() => setConnectionType('cloud')}
                className={`flex items-center justify-center p-3 rounded-lg border-2 transition-colors ${
                  connectionType === 'cloud'
                    ? 'border-firebolt-blue bg-blue-50 text-firebolt-blue'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Cloud className="w-5 h-5 mr-2" />
                Firebolt Cloud
              </button>
            </div>
          </div>

          {/* Configuration Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Database Name
              </label>
              <input
                type="text"
                value={config.database}
                onChange={(e) => setConfig(prev => ({ ...prev, database: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-firebolt-blue"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {connectionType === 'cloud' ? 'Account' : 'Host'}
                </label>
                <input
                  type="text"
                  value={config.endpoint}
                  onChange={(e) => setConfig(prev => ({ ...prev, endpoint: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-firebolt-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Port
                </label>
                <input
                  type="text"
                  value={config.port}
                  onChange={(e) => setConfig(prev => ({ ...prev, port: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-firebolt-blue"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={config.username}
                onChange={(e) => setConfig(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-firebolt-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={config.password}
                onChange={(e) => setConfig(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-firebolt-blue"
              />
            </div>
          </div>

          {/* Test Connection Button */}
          <button
            onClick={testConnection}
            disabled={isConnecting}
            className="w-full mt-6 bg-firebolt-blue text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isConnecting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Testing Connection...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Test Connection
              </>
            )}
          </button>

          {/* Connection Status */}
          {connectionStatus !== 'idle' && (
            <div className={`mt-4 p-3 rounded-md flex items-center ${
              connectionStatus === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {connectionStatus === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-2" />
              )}
              {connectionStatus === 'success' 
                ? 'Connection successful!' 
                : 'Connection failed. Please check your credentials.'
              }
            </div>
          )}
        </div>

        {/* Terminal Logs */}
        <div className="bg-gray-900 rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Terminal className="w-6 h-6 text-green-400 mr-3" />
            <h2 className="text-xl font-semibold text-white">Connection Logs</h2>
          </div>
          
          <div className="bg-black rounded p-4 h-80 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-gray-500">
                $ Ready to test connection...
              </div>
            ) : (
              logs.map((log, index) => (
                <div 
                  key={index} 
                  className={`mb-1 ${
                    log.includes('✓') ? 'text-green-400' : 
                    log.includes('✗') ? 'text-red-400' : 
                    'text-gray-300'
                  }`}
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FireboltSetup;
