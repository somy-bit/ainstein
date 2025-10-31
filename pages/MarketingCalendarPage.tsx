import React, { useEffect, useState } from 'react';
import { MarketingEvent, UserRole, Language } from '../types';
import * as api from "../services/backendApiService";
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslations } from '../hooks/useTranslations';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { ICON_SIZE } from '../constants';

const MarketingCalendarPage: React.FC = () => {
  const t = useTranslations();
  const { language } = useLanguage();
  const { user } = useAuth();
  const [events, setEvents] = useState<MarketingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<MarketingEvent>>({ language: language, type: 'Webinar' });
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const [displayMonth, setDisplayMonth] = useState(currentMonth);
  const [displayYear, setDisplayYear] = useState(currentYear);

  const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getMarketingEvents();
        // Filter events by current user's organizationId
        const filteredEvents = user?.organizationId 
          ? data.filter((event: MarketingEvent) => event.organizationId === user.organizationId)
          : data;
        setEvents(filteredEvents);
      } catch (err) {
        console.error("Error fetching marketing events:", err);
        setError((err as Error).message || "Failed to load marketing events.");
      }
      setLoading(false);
    };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEvent = async () => {
    if (newEvent.title && newEvent.date && newEvent.description && newEvent.type && newEvent.language && user?.organizationId) {
      setLoading(true); // Consider a different loading state for form submission
      try {
        const payload: Omit<MarketingEvent, 'id'> = {
          ...newEvent,
          organizationId: user.organizationId
        } as Omit<MarketingEvent, 'id'>;

        await api.addMarketingEvent(payload);
        setIsModalOpen(false);
        setNewEvent({ language: language, type: 'Webinar' }); // Reset form
        await fetchEvents(); // Refetch all events
      } catch (error) {
        console.error("Error saving event:", error);
        alert(t('error') + ': ' + (error as Error).message);
      }
      setLoading(false); // Reset form submission loading state
    } else {
      alert("Please fill all fields for the event.");
    }
  };
  
  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay(); 

  const renderCalendarGrid = () => {
    const numDays = daysInMonth(displayMonth, displayYear);
    const startingDay = firstDayOfMonth(displayMonth, displayYear);
    const calendarDays = [];

    for (let i = 0; i < startingDay; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="border border-slate-200 h-24 sm:h-28 md:h-32"></div>);
    }

    for (let day = 1; day <= numDays; day++) {
      const date = new Date(displayYear, displayMonth, day);
      const dayEvents = events.filter(event => 
        new Date(event.date).toDateString() === date.toDateString()
      );
      calendarDays.push(
        <div key={day} className="border border-slate-200 p-1 sm:p-2 h-24 sm:h-28 md:h-32 overflow-y-auto bg-white hover:bg-slate-50 transition-colors">
          <div className="font-semibold text-slate-700 text-sm">{day}</div>
          {dayEvents.map(event => (
            <div key={event.id} className={`mt-1 p-1 sm:p-1.5 rounded-md text-[10px] sm:text-xs leading-tight ${
              event.language === Language.EN ? 'bg-blue-100 text-blue-700' :
              event.language === Language.ES ? 'bg-red-100 text-red-700' :
              'bg-green-100 text-green-700'
            }`}>
              <span className="font-medium">{event.title}</span> ({event.type})
            </div>
          ))}
        </div>
      );
    }
    return calendarDays;
  };
  
  const changeMonth = (delta: number) => {
    let newMonth = displayMonth + delta;
    let newYear = displayYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    setDisplayMonth(newMonth);
    setDisplayYear(newYear);
  };

  const monthName = new Date(displayYear, displayMonth).toLocaleString(language, { month: 'long', year: 'numeric' });

  if (loading && events.length === 0) { 
    return <div className="flex justify-center items-center h-64"><LoadingSpinner size="lg" /></div>;
  }
  
  if (error) {
    return <div className="p-4 bg-red-100 text-red-700 rounded-md text-center">{error}</div>;
  }

  const dayAbbreviations = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-slate-100 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">{t('marketingCalendar')}</h1>
        {user?.role === UserRole.ORGANIZATION && (
          <Button onClick={() => setIsModalOpen(true)} leftIcon={
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={ICON_SIZE}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
            </svg>
          } className="w-full sm:w-auto">
            {t('newEvent')}
          </Button>
        )}
      </div>

      <div className="bg-white shadow-lg rounded-lg p-2 sm:p-4">
        <div className="flex justify-between items-center mb-4">
          <Button onClick={() => changeMonth(-1)} size="sm" variant="secondary"aria-label="Previous month">&lt;</Button>
          <h2 className="text-lg sm:text-xl font-semibold text-slate-700 text-center">{monthName}</h2>
          <Button onClick={() => changeMonth(1)} size="sm" variant="secondary" aria-label="Next month">&gt;</Button>
        </div>
        <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200">
          {dayAbbreviations.map(dayKey => {
            let displayDay: string;
            // Simplified for brevity, original logic for full day names based on language remains
            if (language === Language.EN) displayDay = dayKey.substring(0,3);
            else if (language === Language.ES) displayDay = {Sun:'Dom',Mon:'Lun',Tue:'Mar',Wed:'Mié',Thu:'Jue',Fri:'Vie',Sat:'Sáb'}[dayKey] || dayKey.substring(0,3);
            else if (language === Language.PT) displayDay = {Sun:'Dom',Mon:'Seg',Tue:'Ter',Wed:'Qua',Thu:'Qui',Fri:'Sex',Sat:'Sáb'}[dayKey] || dayKey.substring(0,3);
            else displayDay = dayKey.substring(0,3);
            
            return (
              <div key={dayKey} className="text-center font-medium text-slate-600 py-2 bg-slate-100 text-xs sm:text-sm">{displayDay}</div>
            );
          })}
          {renderCalendarGrid()}
        </div>
      </div>

      {isModalOpen && user?.role === UserRole.ORGANIZATION && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('newEvent')}>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700">{t('eventTitle')}</label>
              <input type="text" name="title" id="title" value={newEvent.title || ''} onChange={handleInputChange} className="mt-1 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md p-2"/>
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-slate-700">{t('eventDate')}</label>
              <input type="date" name="date" id="date" value={newEvent.date ? new Date(newEvent.date).toISOString().split('T')[0] : ''} onChange={handleInputChange} className="mt-1 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md p-2"/>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700">{t('eventDescription')}</label>
              <textarea name="description" id="description" value={newEvent.description || ''} onChange={handleInputChange} rows={3} className="mt-1 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md p-2"></textarea>
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-slate-700">{t('eventType')}</label>
              <select name="type" id="type" value={newEvent.type || 'Webinar'} onChange={handleInputChange} className="mt-1 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md p-2">
                <option value="Webinar">Webinar</option>
                <option value="Workshop">Workshop</option>
                <option value="Conference">Conference</option>
              </select>
            </div>
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-slate-700">{t('selectLanguage')}</label>
              <select name="language" id="language" value={newEvent.language || language} onChange={handleInputChange} className="mt-1 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md p-2">
                <option value={Language.EN}>English</option>
                <option value={Language.ES}>Español</option>
                <option value={Language.PT}>Português</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto">{t('cancel')}</Button>
            <Button onClick={handleSaveEvent} disabled={loading} className="w-full sm:w-auto">{loading ? <LoadingSpinner size="sm"/> : t('saveEvent')}</Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MarketingCalendarPage;