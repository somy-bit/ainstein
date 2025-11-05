import React, { useState, useEffect } from 'react';

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  trialDays: number;
  features: string[];
}

interface PlansResponse {
  plans: {
    basic: Plan;
    premium: Plan;
  };
}

interface Organization {
  id: string;
  name: string;
  isActive: boolean;
}

const RegistrationWithPlans: React.FC = () => {
  const [plans, setPlans] = useState<PlansResponse | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>('basic');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyId: '',
    username: '',
    name: '',
    lastNamePaternal: '',
    lastNameMaternal: '',
    email: '',
    phone: '',
    country: '',
    password: ''
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/v1/auth/plans');
      const data = await response.json();
      setPlans(data);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/v1/auth/register-trial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userData: formData,
          selectedPlan
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        alert(`Registration successful! Your ${result.selectedPlan} trial ends on ${new Date(result.trialEndsAt).toLocaleDateString()}`);
      } else {
        alert(`Registration failed: ${result.error}`);
      }
    } catch (error) {
      alert('Registration failed: Network error');
    } finally {
      setLoading(false);
    }
  };

  if (!plans) {
    return <div>Loading plans...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Choose Your Plan</h1>
      
      {/* Plan Selection */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {Object.entries(plans.plans).map(([key, plan]) => (
          <div
            key={key}
            className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
              selectedPlan === key
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedPlan(key)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">{plan.name}</h3>
              <input
                type="radio"
                name="plan"
                value={key}
                checked={selectedPlan === key}
                onChange={() => setSelectedPlan(key)}
                className="w-4 h-4"
              />
            </div>
            
            <div className="mb-4">
              <span className="text-3xl font-bold">${plan.price}</span>
              <span className="text-gray-600">/{plan.interval}</span>
            </div>
            
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm mb-4 inline-block">
              {plan.trialDays} Days Free Trial
            </div>
            
            <ul className="space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">User Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Company ID"
              value={formData.companyId}
              onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
              className="w-full p-3 border rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full p-3 border rounded-lg"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-3 border rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="First Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 border rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="Last Name (Paternal)"
              value={formData.lastNamePaternal}
              onChange={(e) => setFormData({ ...formData, lastNamePaternal: e.target.value })}
              className="w-full p-3 border rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="Last Name (Maternal)"
              value={formData.lastNameMaternal}
              onChange={(e) => setFormData({ ...formData, lastNameMaternal: e.target.value })}
              className="w-full p-3 border rounded-lg"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full p-3 border rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="Country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full p-3 border rounded-lg"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full p-3 border rounded-lg"
              required
            />
          </div>
        </div>

        <div className="text-center">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : `Start ${(plans.plans[selectedPlan as keyof typeof plans.plans] as Plan).name} Trial`}
          </button>
          <p className="text-sm text-gray-600 mt-2">
            30 days free, then ${(plans.plans[selectedPlan as keyof typeof plans.plans] as Plan).price}/month. Cancel anytime.
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegistrationWithPlans;
