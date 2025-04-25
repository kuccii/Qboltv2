import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TrendingUp, AlertTriangle, CheckCircle, Send, ThumbsUp, Flag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const priceSchema = z.object({
  material: z.string().min(1, 'Material is required'),
  location: z.string().min(1, 'Location is required'),
  price: z.number().min(0, 'Price must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  notes: z.string().optional()
});

type PriceSubmission = z.infer<typeof priceSchema>;

interface PriceReport {
  id: string;
  material: string;
  location: string;
  price: number;
  unit: string;
  submittedBy: string;
  timestamp: Date;
  verified: boolean;
  votes: number;
  notes?: string;
}

const PriceReporting: React.FC = () => {
  const { currentUser } = useAuth();
  const [reports, setReports] = useState<PriceReport[]>([
    {
      id: '1',
      material: 'Cement',
      location: 'Nairobi',
      price: 750,
      unit: 'per 50kg bag',
      submittedBy: 'John Doe',
      timestamp: new Date('2024-03-10T10:00:00'),
      verified: true,
      votes: 12
    },
    {
      id: '2',
      material: 'Steel Rebar',
      location: 'Mombasa',
      price: 95000,
      unit: 'per ton',
      submittedBy: 'Jane Smith',
      timestamp: new Date('2024-03-09T15:30:00'),
      verified: false,
      votes: 5,
      notes: 'Price includes delivery within city limits'
    }
  ]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PriceSubmission>({
    resolver: zodResolver(priceSchema)
  });

  const onSubmit = (data: PriceSubmission) => {
    const newReport: PriceReport = {
      id: Date.now().toString(),
      ...data,
      submittedBy: currentUser?.name || 'Anonymous',
      timestamp: new Date(),
      verified: false,
      votes: 0
    };
    setReports([newReport, ...reports]);
    reset();
  };

  const handleVote = (reportId: string) => {
    setReports(reports.map(report => 
      report.id === reportId ? { ...report, votes: report.votes + 1 } : report
    ));
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-card p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Submit Price Report</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
              <input
                type="text"
                {...register('material')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., Cement, Steel"
              />
              {errors.material && (
                <p className="mt-1 text-sm text-error-600">{errors.material.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                {...register('location')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., Nairobi, Mombasa"
              />
              {errors.location && (
                <p className="mt-1 text-sm text-error-600">{errors.location.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <input
                type="number"
                {...register('price', { valueAsNumber: true })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter price"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-error-600">{errors.price.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <input
                type="text"
                {...register('unit')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., per ton, per bag"
              />
              {errors.unit && (
                <p className="mt-1 text-sm text-error-600">{errors.unit.message}</p>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Any additional information about the price..."
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Send size={18} />
              Submit Report
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-card p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Recent Price Reports</h2>
        
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-800">{report.material}</h3>
                    {report.verified ? (
                      <span className="flex items-center text-xs text-success-600">
                        <CheckCircle size={14} className="mr-1" />
                        Verified
                      </span>
                    ) : (
                      <span className="flex items-center text-xs text-warning-600">
                        <AlertTriangle size={14} className="mr-1" />
                        Pending Verification
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{report.location}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-800">
                    {report.price.toLocaleString()} KES
                  </div>
                  <div className="text-sm text-gray-500">{report.unit}</div>
                </div>
              </div>
              
              {report.notes && (
                <p className="text-sm text-gray-600 mb-3">{report.notes}</p>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleVote(report.id)}
                    className="flex items-center gap-1 hover:text-primary-600"
                  >
                    <ThumbsUp size={16} />
                    <span>{report.votes}</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-error-600">
                    <Flag size={16} />
                    <span>Report</span>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span>by {report.submittedBy}</span>
                  <span>•</span>
                  <span>{formatTimestamp(report.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PriceReporting;