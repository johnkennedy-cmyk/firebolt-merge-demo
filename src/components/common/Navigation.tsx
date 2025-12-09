import { Link, useLocation } from 'react-router-dom';
import { Database, Home, Settings, Target } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/setup', label: 'Setup', icon: Settings },
    { path: '/demo/ad-performance', label: 'Ad Performance MERGE', icon: Target },
  ];

  return (
    <nav className="bg-gradient-to-r from-white to-firebolt-light-gray shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Database className="w-8 h-8 text-firebolt-red mr-3" />
            <span className="text-2xl font-bold text-firebolt-dark">
              Firebolt <span className="text-firebolt-red">MERGE</span> <span className="text-firebolt-gray">Demo</span>
            </span>
            <span className="ml-3 px-2 py-0.5 text-xs bg-gradient-to-r from-firebolt-red to-orange-500 text-white rounded-full">
              v2.0
            </span>
          </div>
          
          <div className="flex space-x-8">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center px-3 py-2 rounded-lg transition-colors duration-200 ${
                  location.pathname === path
                    ? 'bg-firebolt-red text-white'
                    : 'text-firebolt-gray hover:text-firebolt-red-bright hover:bg-firebolt-light-gray'
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
