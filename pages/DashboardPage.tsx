import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useTranslations } from '../hooks/useTranslations';
import { Partner, Lead } from '../types';
import * as api from "../services/backendApiService";
import { generateText } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const TrendIndicator: React.FC<{ value: number }> = ({ value }) => {
    const isPositive = value >= 0;
    const color = isPositive ? 'text-green-500' : 'text-red-500';
    const icon = isPositive ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
    ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
    );
    return (
        <span className={`flex items-center text-sm font-semibold ${color}`}>
            {icon}
            <span className="ml-1">{Math.abs(value)}%</span>
        </span>
    );
};

const DashboardPage: React.FC = () => {
  const t = useTranslations();
  const { language } = useLanguage();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  // Mock data for trend indicators
  const [trends] = useState({
      partners: 5,
      leads: 12,
      conversion: -1.5,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [partnersData, leadsData] = await Promise.all([api.getPartners(), api.getLeads()]);
        setPartners(partnersData);
        setLeads(leadsData);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try refreshing the page.");
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const fetchAiInsight = async () => {
    setLoadingInsight(true);
    try {
      const prompt = `Analyze the following PRM data summary and provide a concise, actionable insight for a Partner Manager (max 2 sentences): 
      Total Partners: ${partners.length}, 
      Total Leads: ${leads.length}, 
      Average Partner Performance Score: ${partners.length > 0 ? (partners.reduce((sum, p) => sum + p.performanceScore, 0) / partners.length).toFixed(0) : 'N/A'},
      Lead Conversion Rate (simplified): ${leads.length > 0 ? ((leads.filter(l => l.status === 'Converted').length / leads.length) * 100).toFixed(0) + '%' : 'N/A'}. 
      Focus on a potential opportunity or risk.`;
      const { text: insight } = await generateText(prompt, language);
      setAiInsight(insight);
    } catch (error) {
      console.error("Error fetching AI insight:", error);
      setAiInsight("Could not load AI insight at this time.");
    }
    setLoadingInsight(false);
  };
  
  useEffect(() => {
    if (partners.length > 0 && leads.length > 0) {
        fetchAiInsight();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partners, leads, language]); 

  if (loading) {
    return <div className="flex justify-center items-center h-64"><LoadingSpinner size="lg" /></div>;
  }
  
  if(error) {
    return <div className="p-4 bg-red-100 text-red-700 rounded-md text-center">{error}</div>;
  }

  const partnerPerformanceData = partners.map(p => ({ name: p.name, performance: p.performanceScore }));
  const leadStatusData = Object.entries(
    leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name: t(`leadStatus${name}`) || name, value })); // Translate status names for chart

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">{t('dashboard')}</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 opacity-0 animate-fadeInUp flex flex-col">
          <h3 className="text-slate-500 text-sm font-medium">{t('totalPartners')}</h3>
          <div className="flex items-end justify-between mt-1 flex-grow">
            <p className="text-3xl font-bold text-primary">{partners.length}</p>
            <TrendIndicator value={trends.partners} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 opacity-0 animate-fadeInUp flex flex-col" style={{animationDelay: '100ms'}}>
          <h3 className="text-slate-500 text-sm font-medium">{t('totalLeads')}</h3>
           <div className="flex items-end justify-between mt-1 flex-grow">
            <p className="text-3xl font-bold text-primary">{leads.length}</p>
            <TrendIndicator value={trends.leads} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 opacity-0 animate-fadeInUp flex flex-col" style={{animationDelay: '200ms'}}>
          <h3 className="text-slate-500 text-sm font-medium">{t('leadConversionRate')}</h3>
           <div className="flex items-end justify-between mt-1 flex-grow">
            <p className="text-3xl font-bold text-primary">
              {leads.length > 0 ? ((leads.filter(l => l.status === 'Converted').length / leads.length) * 100).toFixed(1) : '0'}%
            </p>
            <TrendIndicator value={trends.conversion} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 opacity-0 animate-fadeInUp flex flex-col" style={{animationDelay: '300ms'}}>
          <h3 className="text-slate-500 text-sm font-medium">{t('aiSuggestion')}</h3>
          <div className="mt-2 flex-grow flex items-center">
            {loadingInsight ? (
              <div className="w-full flex justify-center">
                <LoadingSpinner size="sm"/>
              </div>
            ) : (
              <p className="text-sm text-accent">
                {aiInsight || "No insight available."}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg opacity-0 animate-fadeInUp" style={{animationDelay: '400ms'}}>
          <h3 className="text-xl font-semibold text-slate-700 mb-4">{t('partnerPerformance')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={partnerPerformanceData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-30} textAnchor="end" height={70}/>
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip wrapperClassName="rounded-md shadow-lg" contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0' }} labelStyle={{ color: '#334155', fontWeight: 'bold' }} itemStyle={{fontSize: '12px'}}/>
              <Legend wrapperStyle={{ fontSize: 12, color: '#475569' }}/>
              <Bar dataKey="performance" fill="#3b82f6" barSize={20} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg opacity-0 animate-fadeInUp" style={{animationDelay: '500ms'}}>
          <h3 className="text-xl font-semibold text-slate-700 mb-4">{t('leads')} by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={leadStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent! * 100).toFixed(0)}%`}
                outerRadius={window.innerWidth < 640 ? 60 : 100} // Smaller radius for small screens
                innerRadius={window.innerWidth < 640 ? 30 : 50} // Donut chart
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
                
              >
                {leadStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip wrapperClassName="rounded-md shadow-lg" contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0' }} itemStyle={{fontSize: '12px'}}/>
              <Legend wrapperStyle={{ fontSize: 12, color: '#475569' }}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-lg opacity-0 animate-fadeInUp" style={{animationDelay: '600ms'}}>
        <h3 className="text-xl font-semibold text-slate-700 mb-4">{t('recentActivity')}</h3>
        <p className="text-slate-500 text-sm">{t('featureComingSoon')}</p>
      </div>
    </div>
  );
};

export default DashboardPage;
