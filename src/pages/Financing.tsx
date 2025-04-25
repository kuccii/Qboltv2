import React, { useState } from 'react';
import { 
  Wallet, 
  CreditCard, 
  ChevronRight, 
  DollarSign, 
  Calendar, 
  Percent, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Calculator,
  TrendingUp,
  FileText
} from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import StatusBadge from '../components/StatusBadge';
import { financingOffers } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';

const Financing: React.FC = () => {
  const { currentUser } = useAuth();
  const industry = currentUser?.industry || 'construction';
  
  const [financeAmount, setFinanceAmount] = useState(10000);
  const [financeTerm, setFinanceTerm] = useState(6);
  
  // Calculate simulated eligibility score based on user
  const eligibilityScore = 82;
  
  // Filter financing offers based on industry
  const availableOffers = financingOffers.filter(
    offer => offer.industry === 'both' || offer.industry === industry
  );
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Calculate monthly payment (simplified)
  const calculateMonthlyPayment = (amount: number, interestRate: string, months: number) => {
    const rate = parseFloat(interestRate) / 100 / 12;
    const payment = (amount * rate) / (1 - Math.pow(1 + rate, -months));
    return payment;
  };
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Financing Options</h1>
          <p className="text-gray-500 mt-1">
            Working capital solutions based on your trade activity
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-white shadow-sm border rounded-lg p-2 flex items-center">
            <div className="px-3">
              <div className="text-xs text-gray-500">Your Score</div>
              <div className="font-bold text-lg text-gray-800">{eligibilityScore}</div>
            </div>
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                eligibilityScore >= 80 ? 'bg-success-600' : eligibilityScore >= 60 ? 'bg-warning-500' : 'bg-error-600'
              }`}
            >
              {eligibilityScore >= 80 ? 'A' : eligibilityScore >= 60 ? 'B' : 'C'}
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
          <DashboardCard 
            title="Financing Calculator" 
            icon={<Calculator size={20} />}
          >
            <div className="mt-4 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount ({formatCurrency(financeAmount)})
                </label>
                <input
                  type="range"
                  min="5000"
                  max="50000"
                  step="1000"
                  value={financeAmount}
                  onChange={(e) => setFinanceAmount(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>$5,000</span>
                  <span>$50,000</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Term ({financeTerm} months)
                </label>
                <input
                  type="range"
                  min="3"
                  max="24"
                  step="3"
                  value={financeTerm}
                  onChange={(e) => setFinanceTerm(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>3 months</span>
                  <span>24 months</span>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-3">Estimated Monthly Payment</h3>
                <div className="text-3xl font-bold text-primary-800">
                  {formatCurrency(calculateMonthlyPayment(financeAmount, '12.5', financeTerm))}
                </div>
                <div className="text-xs text-gray-500 mt-1">Based on 12.5% interest rate</div>
                <div className="mt-3 text-sm text-gray-600">
                  Total repayment: {formatCurrency(calculateMonthlyPayment(financeAmount, '12.5', financeTerm) * financeTerm)}
                </div>
              </div>
              
              <div className="flex justify-center">
                <button className="px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2">
                  Apply Now <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </DashboardCard>
          
          <DashboardCard 
            title="Credit Profile" 
            icon={<CreditCard size={20} />}
            className="mt-6"
          >
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">Trade Score</div>
                <div className="font-medium">{eligibilityScore}/100</div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    eligibilityScore >= 80 ? 'bg-success-500' : eligibilityScore >= 60 ? 'bg-warning-500' : 'bg-error-500'
                  }`}
                  style={{ width: `${eligibilityScore}%` }}
                ></div>
              </div>
              
              <div className="pt-2">
                <h4 className="text-sm font-medium text-gray-800 mb-2">Score Factors</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <CheckCircle size={16} className="text-success-500 mr-2" />
                        Payment History
                      </div>
                      <div className="font-medium">Excellent</div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div className="bg-success-500 h-1.5 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <CheckCircle size={16} className="text-success-500 mr-2" />
                        Trade Volume
                      </div>
                      <div className="font-medium">Good</div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div className="bg-success-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <AlertCircle size={16} className="text-warning-500 mr-2" />
                        Supplier Diversity
                      </div>
                      <div className="font-medium">Fair</div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div className="bg-warning-500 h-1.5 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-3 text-sm text-center">
                <a href="#" className="text-primary-600 hover:text-primary-800 font-medium">
                  View Full Credit Report
                </a>
              </div>
            </div>
          </DashboardCard>
        </div>
        
        <div className="lg:col-span-2">
          <DashboardCard 
            title="Available Financing Options" 
            icon={<Wallet size={20} />}
          >
            <div className="mt-4 space-y-4">
              {availableOffers.map(offer => {
                const isEligible = eligibilityScore >= offer.eligibilityScore;
                const monthlyPayment = calculateMonthlyPayment(
                  offer.amount, 
                  offer.interestRate.replace('%', ''), 
                  parseInt(offer.term.replace(' months', ''))
                );
                
                return (
                  <div 
                    key={offer.id} 
                    className={`border rounded-lg p-4 ${
                      isEligible ? 'hover:border-primary-200 hover:bg-primary-50' : 'opacity-70'
                    } transition-colors`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-md ${
                            isEligible ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            <DollarSign size={20} />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-800">{offer.title}</h3>
                            <p className="text-sm text-gray-600">
                              From {offer.provider}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          {offer.description}
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3 md:min-w-[220px] w-full md:w-auto">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <div className="text-gray-500 flex items-center">
                              <DollarSign size={14} className="mr-1" />
                              Amount
                            </div>
                            <div className="font-medium text-gray-800">{formatCurrency(offer.amount)}</div>
                          </div>
                          <div>
                            <div className="text-gray-500 flex items-center">
                              <Calendar size={14} className="mr-1" />
                              Term
                            </div>
                            <div className="font-medium text-gray-800">{offer.term}</div>
                          </div>
                          <div>
                            <div className="text-gray-500 flex items-center">
                              <Percent size={14} className="mr-1" />
                              Rate
                            </div>
                            <div className="font-medium text-gray-800">{offer.interestRate}</div>
                          </div>
                          <div>
                            <div className="text-gray-500 flex items-center">
                              <TrendingUp size={14} className="mr-1" />
                              Monthly
                            </div>
                            <div className="font-medium text-gray-800">{formatCurrency(monthlyPayment)}</div>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <StatusBadge 
                            type={isEligible ? 'success' : 'error'} 
                            text={isEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'} 
                          />
                          <button 
                            className={`px-3 py-1 rounded text-sm font-medium ${
                              isEligible 
                                ? 'bg-primary-600 text-white hover:bg-primary-700' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            } transition-colors`}
                            disabled={!isEligible}
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </DashboardCard>
          
          <DashboardCard 
            title="Financing Guidelines" 
            icon={<FileText size={20} />}
            className="mt-6"
          >
            <div className="mt-3 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={18} className="text-success-500" />
                    <h3 className="font-medium text-gray-800">Eligibility Criteria</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-primary-500 mt-1">•</span>
                      <span>Minimum 6 months trading history</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary-500 mt-1">•</span>
                      <span>Verified supplier relationships</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary-500 mt-1">•</span>
                      <span>Regular transaction activity</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary-500 mt-1">•</span>
                      <span>Trade score above 60</span>
                    </li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle size={18} className="text-warning-500" />
                    <h3 className="font-medium text-gray-800">Required Documents</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-primary-500 mt-1">•</span>
                      <span>Business registration documents</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary-500 mt-1">•</span>
                      <span>6 months bank statements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary-500 mt-1">•</span>
                      <span>Tax compliance certificate</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary-500 mt-1">•</span>
                      <span>Director/owner identification</span>
                    </li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle size={18} className="text-error-500" />
                    <h3 className="font-medium text-gray-800">Exclusions</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-primary-500 mt-1">•</span>
                      <span>Businesses less than 6 months old</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary-500 mt-1">•</span>
                      <span>Unverified suppliers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary-500 mt-1">•</span>
                      <span>Late payment history</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary-500 mt-1">•</span>
                      <span>Existing loan defaults</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="p-4 bg-primary-50 border border-primary-100 rounded-lg">
                <h3 className="font-medium text-primary-800 mb-2">How Financing Decisions Are Made</h3>
                <p className="text-sm text-gray-700">
                  Qivook's financing options are based on your verified trade activity and patterns. Our system analyzes your transaction history, supplier relationships, payment behavior, and industry metrics to determine your eligibility for various financing products. This data-driven approach allows us to offer working capital solutions tailored to your business needs without traditional collateral requirements.
                </p>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};

export default Financing;