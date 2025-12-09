import { useState, useEffect } from 'react';
import { 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Terminal,
  Cloud,
  Server,
  Play,
  Database,
  Zap
} from 'lucide-react';

interface ConnectionConfig {
  account: string;
  database: string;
  engine: string;
}

const FireboltSetup = () => {
  const [config, setConfig] = useState<ConnectionConfig>({
    account: 'se-demo-account',
    database: 'experimental_john',
    engine: 'ecommerceengine'
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [serverStatus, setServerStatus] = useState<'checking' | 'running' | 'stopped'>('checking');
  const [serverConfig, setServerConfig] = useState<{ account?: string; database?: string; engine?: string; hasCredentials?: boolean } | null>(null);

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === 'success' ? '✓' : type === 'error' ? '✗' : '•';
    setLogs(prev => [...prev, `[${timestamp}] ${prefix} ${message}`]);
  };

  // Check server status on mount
  useEffect(() => {
    const checkServer = async () => {
      try {
        const response = await fetch('/api/health');
        const result = await response.json();
        
        if (result.status === 'ok') {
          setServerStatus('running');
          setServerConfig(result.config);
          if (result.config?.hasCredentials) {
            setConfig({
              account: result.config.account || config.account,
              database: result.config.database || config.database,
              engine: result.config.engine || config.engine
            });
          }
        } else {
          setServerStatus('stopped');
        }
      } catch {
        setServerStatus('stopped');
      }
    };

    checkServer();
  }, []);

  const testConnection = async () => {
    setIsConnecting(true);
    setLogs([]);
    
    addLog('Initializing connection test to Firebolt Cloud...');
    
    try {
      // Test health endpoint
      addLog('Checking API server status...');
      const healthResponse = await fetch('/api/health');
      const healthResult = await healthResponse.json();
      
      if (healthResult.status !== 'ok') {
        throw new Error('API server not responding correctly');
      }
      
      addLog('API server is running', 'success');
      addLog(`Account: ${healthResult.config?.account || 'Not configured'}`, 'info');
      addLog(`Database: ${healthResult.config?.database || 'Not configured'}`, 'info');
      addLog(`Engine: ${healthResult.config?.engine || 'Not configured'}`, 'info');
      
      if (!healthResult.config?.hasCredentials) {
        throw new Error('Service account credentials not configured in server/.env');
      }
      
      addLog('Credentials detected', 'success');
      
      // Test actual connection
      addLog('Testing database connection...');
      const connectResponse = await fetch('/api/connect', { method: 'POST' });
      const connectResult = await connectResponse.json();
      
      if (!connectResult.success) {
        throw new Error(connectResult.error || 'Connection failed');
      }
      
      addLog(`Connected to engine: ${connectResult.engine}`, 'success');
      addLog(`Engine URL: ${connectResult.engineUrl}`, 'success');
      
      // Test a simple query
      addLog('Executing test query...');
      const queryResponse = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: 'SELECT 1 as test, CURRENT_TIMESTAMP() as time' })
      });
      const queryResult = await queryResponse.json();
      
      if (!queryResult.success) {
        throw new Error(queryResult.error || 'Query failed');
      }
      
      addLog('Test query executed successfully', 'success');
      addLog(`Execution time: ${queryResult.statistics?.execution_time_ms || 'N/A'}ms`, 'success');
      
      setConnectionStatus('success');
      addLog('🎉 Connection test completed successfully!', 'success');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`Connection failed: ${errorMessage}`, 'error');
      setConnectionStatus('error');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Firebolt Cloud Connection Setup
        </h1>
        <p className="text-gray-600">
          Configure your Firebolt Cloud connection for the MERGE demo
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuration Panel */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-6">
            <Settings className="w-6 h-6 text-firebolt-red mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Connection Configuration</h2>
          </div>

          {/* Server Status */}
          <div className="mb-6 p-4 rounded-lg border-2 border-dashed border-gray-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Server className="w-5 h-5 text-gray-600 mr-2" />
                <span className="font-medium text-gray-700">Backend API Server</span>
              </div>
              {serverStatus === 'running' ? (
                <span className="flex items-center text-green-600 text-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  Running on port 3001
                </span>
              ) : serverStatus === 'stopped' ? (
                <span className="flex items-center text-red-600 text-sm">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Not Running
                </span>
              ) : (
                <span className="text-gray-500 text-sm">Checking...</span>
              )}
            </div>
            
            {serverStatus === 'stopped' && (
              <div className="mt-3 p-3 bg-yellow-50 rounded text-sm">
                <p className="font-medium text-yellow-800 mb-2">Start the API server:</p>
                <code className="block bg-gray-900 text-green-400 p-2 rounded text-xs">
                  cd server && npm install && npm start
                </code>
              </div>
            )}
          </div>

          {/* Connection Type */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-3">
              <button
                className="flex items-center justify-center p-3 rounded-lg border-2 border-firebolt-red bg-red-50 text-firebolt-red cursor-default"
              >
                <Cloud className="w-5 h-5 mr-2" />
                Firebolt Cloud
                <CheckCircle className="w-4 h-4 ml-2" />
              </button>
              <button
                disabled
                className="flex items-center justify-center p-3 rounded-lg border-2 bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50"
              >
                <Server className="w-5 h-5 mr-2" />
                Firebolt Core
              </button>
            </div>
          </div>

          {/* Current Configuration */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account
              </label>
              <div className="flex items-center">
                <Database className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-gray-900 font-mono">
                  {serverConfig?.account || config.account}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Database
              </label>
              <div className="flex items-center">
                <Database className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-gray-900 font-mono">
                  {serverConfig?.database || config.database}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Engine
              </label>
              <div className="flex items-center">
                <Zap className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-gray-900 font-mono">
                  {serverConfig?.engine || config.engine}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Credentials
              </label>
              <div className="flex items-center">
                {serverConfig?.hasCredentials ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-green-600">Configured in server/.env</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-yellow-500 mr-2" />
                    <span className="text-yellow-600">Not configured</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Environment Setup Instructions */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Configure Credentials</h4>
            <p className="text-sm text-gray-600 mb-2">
              Create a <code className="bg-gray-200 px-1 rounded">server/.env</code> file:
            </p>
            <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
{`FIREBOLT_ACCOUNT=se-demo-account
FIREBOLT_CLIENT_ID=your-client-id
FIREBOLT_CLIENT_SECRET=your-client-secret
FIREBOLT_DATABASE=experimental_john
FIREBOLT_ENGINE=ecommerceengine`}
            </pre>
          </div>

          {/* Test Connection Button */}
          <button
            onClick={testConnection}
            disabled={isConnecting || serverStatus !== 'running'}
            className="w-full mt-6 bg-firebolt-red text-white py-3 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
                ? 'Connected to Firebolt Cloud!' 
                : 'Connection failed. Check logs for details.'
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
          
          <div className="bg-black rounded p-4 h-96 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-gray-500">
                $ Ready to test Firebolt Cloud connection...
                <br />
                $ Make sure the API server is running on port 3001
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
