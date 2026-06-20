import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

export default function VendorSubmission() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    system_name: '',
    system_version: '',
    intended_use_case: '',
    target_population: '',
    risk_classification: 'LOW',
    developer_organization: '',
    override_mechanism_documented: false,
    deployment_timeline: '',
    training_data_documentation: '',
    local_validation_evidence: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const draftRes = await api.post('/submission/draft', formData);
      const sysId = draftRes.data.id;
      await api.post(`/submission/${sysId}/submit`);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Submission failed');
    }
  };

  return (
    <Card className="max-w-3xl mx-auto mb-10">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">New AI System Submission</CardTitle>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">System Name</label>
              <Input name="system_name" required value={formData.system_name} onChange={handleChange} className="min-h-[44px]" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Version</label>
              <Input name="system_version" required value={formData.system_version} onChange={handleChange} className="min-h-[44px]" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Developer Organization</label>
            <Input name="developer_organization" required value={formData.developer_organization} onChange={handleChange} className="min-h-[44px]" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Risk Classification</label>
            <select 
              name="risk_classification" 
              value={formData.risk_classification} 
              onChange={handleChange} 
              className="flex min-h-[44px] w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Intended Use Case</label>
            <textarea 
              name="intended_use_case" 
              required 
              value={formData.intended_use_case} 
              onChange={handleChange} 
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
              rows="3" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Target Population</label>
            <textarea 
              name="target_population" 
              required 
              value={formData.target_population} 
              onChange={handleChange} 
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
              rows="3" 
            />
          </div>

          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              name="override_mechanism_documented" 
              checked={formData.override_mechanism_documented} 
              onChange={handleChange} 
              className="w-6 h-6 md:w-4 md:h-4 rounded border-slate-300 text-primary focus:ring-primary focus:ring-offset-2 focus:outline-none" 
            />
            <label className="text-sm font-medium text-slate-700">Override Mechanism Documented</label>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end pt-4 border-t border-slate-200">
          <Button type="submit" className="w-full md:w-auto min-h-[44px]">
            Submit for Review
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
