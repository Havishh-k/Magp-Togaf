import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

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
      // Create Draft
      const draftRes = await api.post('/submission/draft', formData);
      const sysId = draftRes.data.id;
      // Submit for review
      await api.post(`/submission/${sysId}/submit`);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Submission failed');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow border border-neutral-200 p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">New AI System Submission</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">System Name</label>
            <input name="system_name" required value={formData.system_name} onChange={handleChange} className="w-full px-3 py-2 border border-neutral-300 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Version</label>
            <input name="system_version" required value={formData.system_version} onChange={handleChange} className="w-full px-3 py-2 border border-neutral-300 rounded" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Developer Organization</label>
          <input name="developer_organization" required value={formData.developer_organization} onChange={handleChange} className="w-full px-3 py-2 border border-neutral-300 rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Risk Classification</label>
          <select name="risk_classification" value={formData.risk_classification} onChange={handleChange} className="w-full px-3 py-2 border border-neutral-300 rounded">
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Intended Use Case</label>
          <textarea name="intended_use_case" required value={formData.intended_use_case} onChange={handleChange} className="w-full px-3 py-2 border border-neutral-300 rounded" rows="3" />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Target Population</label>
          <textarea name="target_population" required value={formData.target_population} onChange={handleChange} className="w-full px-3 py-2 border border-neutral-300 rounded" rows="3" />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" name="override_mechanism_documented" checked={formData.override_mechanism_documented} onChange={handleChange} className="w-4 h-4 text-primary-600" />
          <label className="text-sm font-medium text-neutral-700">Override Mechanism Documented</label>
        </div>

        <div className="flex justify-end pt-4 border-t border-neutral-200">
          <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
            Submit for Review
          </button>
        </div>
      </form>
    </div>
  );
}
