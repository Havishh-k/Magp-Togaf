import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import MinistryDashboard from './MinistryDashboard';

export default function Dashboard() {
  const { user } = useAuth();
  
  if (user?.role === 'ministry') {
    return <MinistryDashboard />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-neutral-900">Vendor Dashboard</h1>
        <Link to="/submit" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          Submit New System
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow border border-neutral-200 p-8 text-center">
        <h2 className="text-lg font-medium text-neutral-900 mb-2">Welcome to Maliba AI Governance</h2>
        <p className="text-neutral-600 mb-6">Manage your AI systems and track their regulatory status.</p>
        {/* Placeholder for vendor's system list, normally would fetch and display like Ministry */}
        <Link to="/submit" className="text-primary-600 hover:underline font-medium">Start a new submission &rarr;</Link>
      </div>
    </div>
  );
}
