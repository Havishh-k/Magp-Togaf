import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import MinistryDashboard from './MinistryDashboard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';

export default function Dashboard() {
  const { user } = useAuth();
  
  if (user?.role === 'ministry') {
    return <MinistryDashboard />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-slate-900">Vendor Dashboard</h1>
        <Button asChild>
          <Link to="/submit">Submit New System</Link>
        </Button>
      </div>
      
      <Card className="text-center p-8">
        <CardHeader>
          <CardTitle>Welcome to Maliba AI Governance</CardTitle>
          <CardDescription>Manage your AI systems and track their regulatory status.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="link" asChild>
            <Link to="/submit">Start a new submission &rarr;</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
