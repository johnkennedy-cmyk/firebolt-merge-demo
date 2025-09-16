import { Link, useLocation } from 'react-router-dom';
import { Database, Home, Settings, Users } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/setup', label: 'Setup', icon: Settings },
    { path: '/demo/customer-analytics', label: 'Customer Analytics', icon: Users },
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Database className="w-8 h-8 text-firebolt-orange mr-3" />
            <span className="text-2xl font-bold text-gray-900">
              Firebolt <span className="text-firebolt-orange">MERGE Master</span>
            </span>
          </div>
          
          <div className="flex space-x-8">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center px-3 py-2 rounded-lg transition-colors duration-200 ${
                  location.pathname === path
                    ? 'bg-firebolt-blue text-white'
                    : 'text-gray-600 hover:text-firebolt-blue hover:bg-blue-50'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
