import React, { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, subDays, subWeeks, subMonths, subYears, startOfYear, startOfMonth, endOfMonth, startOfWeek, endOfWeek, previousMonday, previousFriday, getDay } from 'date-fns';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface RollingRange {
  startPoint: string;
  endPoint: string;
  customDay?: number;
}

interface DateRangePickerProps {
  onRangeSelect: (range: DateRange) => void;
  className?: string;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ 
  onRangeSelect, 
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<string>('');
  const [showRollingPicker, setShowRollingPicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
  const [rollingRange, setRollingRange] = useState<RollingRange>({
    startPoint: 'firstDayOfMonth',
    endPoint: 'today'
  });
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [previousMonth, setPreviousMonth] = useState<Date>(subMonths(new Date(), 1));
  const [activeTab, setActiveTab] = useState<'fixed' | 'since' | 'last'>('fixed');
  const [sinceValue, setSinceValue] = useState<number>(1);
  const [sinceUnit, setSinceUnit] = useState<'days' | 'weeks' | 'months' | 'years'>('days');
  const [lastValue, setLastValue] = useState<number>(1);
  const [lastUnit, setLastUnit] = useState<'days' | 'weeks' | 'months' | 'years'>('days');
  const [lastEndValue, setLastEndValue] = useState<number>(0);
  const [lastEndUnit, setLastEndUnit] = useState<'days' | 'weeks' | 'months' | 'years'>('days');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showTwoCalendars, setShowTwoCalendars] = useState<boolean>(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowRollingPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDateRange = (range: string): DateRange => {
    const today = new Date();
    const yesterday = subDays(today, 1);

    switch (range) {
      case 'today':
        return { startDate: today, endDate: today };
      case 'yesterday':
        return { startDate: yesterday, endDate: yesterday };
      case 'pastWeek':
        return { startDate: subWeeks(today, 1), endDate: today };
      case 'monthToDate':
        return { startDate: new Date(today.getFullYear(), today.getMonth(), 1), endDate: today };
      case 'past4Weeks':
        return { startDate: subWeeks(today, 4), endDate: today };
      case 'past12Weeks':
        return { startDate: subWeeks(today, 12), endDate: today };
      case 'yearToDate':
        return { startDate: startOfYear(today), endDate: today };
      case 'past6Months':
        return { startDate: subMonths(today, 6), endDate: today };
      case 'past12Months':
        return { startDate: subMonths(today, 12), endDate: today };
      default:
        return { startDate: today, endDate: today };
    }
  };

  const getRollingDateRange = (range: RollingRange): DateRange => {
    const today = new Date();
    const yesterday = subDays(today, 1);
    let startDate: Date;
    let endDate: Date;

    // Set start date based on startPoint
    switch (range.startPoint) {
      case 'firstDayOfMonth':
        startDate = startOfMonth(today);
        break;
      case 'lastDayOfMonth':
        startDate = endOfMonth(subMonths(today, 1));
        break;
      case 'firstDayOfWeek':
        startDate = startOfWeek(today);
        break;
      case 'lastDayOfWeek':
        startDate = endOfWeek(subWeeks(today, 1));
        break;
      case 'lastMonday':
        startDate = previousMonday(today);
        break;
      case 'lastFriday':
        startDate = previousFriday(today);
        break;
      case 'customDay':
        if (range.customDay !== undefined) {
          const currentDay = getDay(today);
          const daysToSubtract = (currentDay - range.customDay + 7) % 7;
          startDate = subDays(today, daysToSubtract);
        } else {
          startDate = today;
        }
        break;
      default:
        startDate = today;
    }

    // Set end date based on endPoint
    switch (range.endPoint) {
      case 'today':
        endDate = today;
        break;
      case 'yesterday':
        endDate = yesterday;
        break;
      case 'endOfPreviousWeek':
        endDate = endOfWeek(subWeeks(today, 1));
        break;
      case 'endOfPreviousMonth':
        endDate = endOfMonth(subMonths(today, 1));
        break;
      default:
        endDate = today;
    }

    return { startDate, endDate };
  };

  const handleRangeSelect = (range: string) => {
    setSelectedRange(range);
    const today = new Date();
    let start: Date | null = null;
    let end: Date | null = null;

    switch (range) {
      case 'today':
        start = today;
        end = today;
        setShowTwoCalendars(false);
        break;
      case 'yesterday':
        start = subDays(today, 1);
        end = subDays(today, 1);
        setShowTwoCalendars(false);
        break;
      case 'pastWeek':
        start = subDays(today, 7);
        end = today;
        setShowTwoCalendars(false);
        break;
      case 'monthToDate':
        start = startOfMonth(today);
        end = today;
        setShowTwoCalendars(false);
        break;
      case 'past4Weeks':
        start = subDays(today, 28);
        end = today;
        setShowTwoCalendars(true);
        break;
      case 'past12Weeks':
        start = subDays(today, 84);
        end = today;
        setShowTwoCalendars(true);
        break;
      case 'yearToDate':
        start = startOfYear(today);
        end = today;
        setShowTwoCalendars(true);
        break;
      case 'past6Months':
        start = subMonths(today, 6);
        end = today;
        setShowTwoCalendars(true);
        break;
      case 'past12Months':
        start = subMonths(today, 12);
        end = today;
        setShowTwoCalendars(true);
        break;
    }

    if (start && end) {
      setCustomStartDate(start);
      setCustomEndDate(end);
    }
  };

  const handleRollingRangeSelect = () => {
    setSelectedRange('rolling');
    setShowRollingPicker(false);
    onRangeSelect(getRollingDateRange(rollingRange));
  };

  const handleCustomRange = () => {
    setSelectedRange('custom');
    setShowTwoCalendars(true);
  };

  const handleCustomDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setCustomStartDate(start);
    setCustomEndDate(end);
  };

  const handleApply = () => {
    if (customStartDate && customEndDate) {
      onRangeSelect({ startDate: customStartDate, endDate: customEndDate });
      setIsOpen(false);
    }
  };

  const handleSinceValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setSinceValue(value);
    handleSinceChange(value, sinceUnit);
  };

  const handleSinceUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const unit = e.target.value as 'days' | 'weeks' | 'months' | 'years';
    setSinceUnit(unit);
    handleSinceChange(sinceValue, unit);
  };

  const handleSinceChange = (value: number, unit: 'days' | 'weeks' | 'months' | 'years') => {
    const today = new Date();
    let startDate: Date;

    switch (unit) {
      case 'days':
        startDate = subDays(today, value);
        break;
      case 'weeks':
        startDate = subWeeks(today, value);
        break;
      case 'months':
        startDate = subMonths(today, value);
        break;
      case 'years':
        startDate = subYears(today, value);
        break;
      default:
        startDate = subDays(today, value);
    }

    setCustomStartDate(startDate);
    setCustomEndDate(today);
    
    // Determine if we need two calendars based on the date range
    const monthDiff = (today.getFullYear() - startDate.getFullYear()) * 12 + 
                      (today.getMonth() - startDate.getMonth());
    setShowTwoCalendars(monthDiff > 0 || 
                        (monthDiff === 0 && today.getDate() - startDate.getDate() > 15));
  };

  const handleLastValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setLastValue(value);
    handleLastChange(value, lastUnit, lastEndValue, lastEndUnit);
  };

  const handleLastUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const unit = e.target.value as 'days' | 'weeks' | 'months' | 'years';
    setLastUnit(unit);
    
    // Reset the end unit to match the selected unit if it's not compatible
    if (unit === 'days' && lastEndUnit !== 'days') {
      setLastEndUnit('days');
    } else if (unit === 'weeks' && lastEndUnit !== 'days' && lastEndUnit !== 'weeks') {
      setLastEndUnit('weeks');
    } else if (unit === 'months' && lastEndUnit !== 'days' && lastEndUnit !== 'weeks' && lastEndUnit !== 'months') {
      setLastEndUnit('months');
    }
    
    handleLastChange(lastValue, unit, lastEndValue, lastEndUnit);
  };

  const handleLastEndValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setLastEndValue(value);
    handleLastChange(lastValue, lastUnit, value, lastEndUnit);
  };

  const handleLastEndUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const unit = e.target.value as 'days' | 'weeks' | 'months' | 'years';
    setLastEndUnit(unit);
    handleLastChange(lastValue, lastUnit, lastEndValue, unit);
  };

  const handleLastChange = (value: number, unit: 'days' | 'weeks' | 'months' | 'years', endValue: number = 0, endUnit: 'days' | 'weeks' | 'months' | 'years' = 'days') => {
    const today = new Date();
    let endDate = today;
    let startDate: Date;

    // Calculate end date if specified
    if (endValue > 0) {
      switch (endUnit) {
        case 'days':
          endDate = subDays(today, endValue);
          break;
        case 'weeks':
          endDate = subWeeks(today, endValue);
          break;
        case 'months':
          endDate = subMonths(today, endValue);
          break;
        case 'years':
          endDate = subYears(today, endValue);
          break;
      }
    }

    // Calculate start date based on the end date
    switch (unit) {
      case 'days':
        startDate = subDays(endDate, value);
        break;
      case 'weeks':
        startDate = subWeeks(endDate, value);
        break;
      case 'months':
        startDate = subMonths(endDate, value);
        break;
      case 'years':
        startDate = subYears(endDate, value);
        break;
      default:
        startDate = subDays(endDate, value);
    }

    setCustomStartDate(startDate);
    setCustomEndDate(endDate);
    
    // Determine if we need two calendars based on the date range
    const monthDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                      (endDate.getMonth() - startDate.getMonth());
    setShowTwoCalendars(monthDiff > 0 || 
                        (monthDiff === 0 && endDate.getDate() - startDate.getDate() > 15));
  };

  const getDisplayText = () => {
    if (selectedRange === 'rolling') {
      return `Rolling: ${rollingRange.startPoint.replace(/([A-Z])/g, ' $1').toLowerCase()} to ${rollingRange.endPoint.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
    }
    if (selectedRange) {
      const range = getDateRange(selectedRange);
      switch (selectedRange) {
        case 'today':
          return format(range.startDate, 'MMMM d, yyyy');
        case 'yesterday':
          return format(range.startDate, 'MMMM d, yyyy');
        case 'pastWeek':
          return `${format(range.startDate, 'MMM d')} - ${format(range.endDate, 'MMM d, yyyy')}`;
        case 'monthToDate':
          return `${format(range.startDate, 'MMMM d')} - ${format(range.endDate, 'MMMM d, yyyy')}`;
        case 'past4Weeks':
          return `Last 4 weeks (${format(range.startDate, 'MMM d')} - ${format(range.endDate, 'MMM d, yyyy')})`;
        case 'past12Weeks':
          return `Last 12 weeks (${format(range.startDate, 'MMM d')} - ${format(range.endDate, 'MMM d, yyyy')})`;
        case 'yearToDate':
          return `${format(range.startDate, 'MMMM d')} - ${format(range.endDate, 'MMMM d, yyyy')}`;
        case 'past6Months':
          return `Last 6 months (${format(range.startDate, 'MMM d, yyyy')} - ${format(range.endDate, 'MMM d, yyyy')})`;
        case 'past12Months':
          return `Last 12 months (${format(range.startDate, 'MMM d, yyyy')} - ${format(range.endDate, 'MMM d, yyyy')})`;
        case 'custom':
          if (customStartDate && customEndDate) {
            if (activeTab === 'fixed') {
              return `${format(customStartDate, 'MMM d, yyyy')} - ${format(customEndDate, 'MMM d, yyyy')}`;
            } else if (activeTab === 'since') {
              return `Since ${format(customStartDate, 'MMM d, yyyy')}`;
            } else if (activeTab === 'last') {
              return `Last ${lastValue} ${lastUnit}${lastValue > 1 && !lastUnit.endsWith('s') ? 's' : ''} ending ${lastEndValue > 0 ? `${lastEndValue} ${lastEndUnit}${lastEndValue > 1 && !lastEndUnit.endsWith('s') ? 's' : ''} ago` : 'today'}`;
            }
          }
          return 'Custom Range';
        default:
          return selectedRange.replace(/([A-Z])/g, ' $1').toLowerCase();
      }
    }
    if (customStartDate && customEndDate) {
      return `${format(customStartDate, 'MMM d, yyyy')} - ${format(customEndDate, 'MMM d, yyyy')}`;
    }
    return 'Select date range';
  };

  const handleMonthChange = (date: Date) => {
    setCurrentMonth(date);
    setPreviousMonth(subMonths(date, 1));
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{getDisplayText()}</span>
        <svg 
          className={`ml-2 -mr-1 h-5 w-5 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute z-10 mt-2 w-[1000px] rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 overflow-hidden">
          <div className="flex">
            {/* Left column - Presets */}
            <div className="w-1/3 border-r border-gray-200 bg-gray-50">
              <div className="p-4">
                <div className="space-y-1">
                  <button 
                    onClick={() => handleRangeSelect('today')}
                    className={`block w-full text-left px-4 py-2 text-sm rounded-md transition-colors duration-150 ${
                      selectedRange === 'today' 
                        ? 'bg-blue-50 text-blue-700 font-medium' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    role="menuitem"
                  >
                    Today
                  </button>
                  <button 
                    onClick={() => handleRangeSelect('yesterday')}
                    className={`block w-full text-left px-4 py-2 text-sm rounded-md transition-colors duration-150 ${
                      selectedRange === 'yesterday' 
                        ? 'bg-blue-50 text-blue-700 font-medium' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    role="menuitem"
                  >
                    Yesterday
                  </button>
                  <button 
                    onClick={() => handleRangeSelect('pastWeek')}
                    className={`block w-full text-left px-4 py-2 text-sm rounded-md transition-colors duration-150 ${
                      selectedRange === 'pastWeek' 
                        ? 'bg-blue-50 text-blue-700 font-medium' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    role="menuitem"
                  >
                    Past Week
                  </button>
                  <button 
                    onClick={() => handleRangeSelect('monthToDate')}
                    className={`block w-full text-left px-4 py-2 text-sm rounded-md transition-colors duration-150 ${
                      selectedRange === 'monthToDate' 
                        ? 'bg-blue-50 text-blue-700 font-medium' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    role="menuitem"
                  >
                    Month to Date
                  </button>
                  <button 
                    onClick={() => handleRangeSelect('past4Weeks')}
                    className={`block w-full text-left px-4 py-2 text-sm rounded-md transition-colors duration-150 ${
                      selectedRange === 'past4Weeks' 
                        ? 'bg-blue-50 text-blue-700 font-medium' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    role="menuitem"
                  >
                    Past 4 Weeks
                  </button>
                  <button 
                    onClick={() => handleRangeSelect('past12Weeks')}
                    className={`block w-full text-left px-4 py-2 text-sm rounded-md transition-colors duration-150 ${
                      selectedRange === 'past12Weeks' 
                        ? 'bg-blue-50 text-blue-700 font-medium' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    role="menuitem"
                  >
                    Past 12 Weeks
                  </button>
                  <button 
                    onClick={() => handleRangeSelect('yearToDate')}
                    className={`block w-full text-left px-4 py-2 text-sm rounded-md transition-colors duration-150 ${
                      selectedRange === 'yearToDate' 
                        ? 'bg-blue-50 text-blue-700 font-medium' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    role="menuitem"
                  >
                    Year to Date
                  </button>
                  <button 
                    onClick={() => handleRangeSelect('past6Months')}
                    className={`block w-full text-left px-4 py-2 text-sm rounded-md transition-colors duration-150 ${
                      selectedRange === 'past6Months' 
                        ? 'bg-blue-50 text-blue-700 font-medium' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    role="menuitem"
                  >
                    Past 6 Months
                  </button>
                  <button 
                    onClick={() => handleRangeSelect('past12Months')}
                    className={`block w-full text-left px-4 py-2 text-sm rounded-md transition-colors duration-150 ${
                      selectedRange === 'past12Months' 
                        ? 'bg-blue-50 text-blue-700 font-medium' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    role="menuitem"
                  >
                    Past 12 Months
                  </button>
                  <div className="border-t border-gray-200 my-2" />
                  <button 
                    onClick={handleCustomRange}
                    className={`block w-full text-left px-4 py-2 text-sm rounded-md transition-colors duration-150 ${
                      selectedRange === 'custom' 
                        ? 'bg-blue-50 text-blue-700 font-medium' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    role="menuitem"
                  >
                    Custom Range
                  </button>
                </div>
              </div>
            </div>

            {/* Right column - Calendar */}
            <div className="w-2/3 p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-gray-900"></h3>
              </div>
              
              {selectedRange === 'custom' && (
                <div className="mb-4 border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                      onClick={() => setActiveTab('fixed')}
                      className={`${
                        activeTab === 'fixed'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-150`}
                    >
                      Fixed
                    </button>
                    <button
                      onClick={() => setActiveTab('since')}
                      className={`${
                        activeTab === 'since'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-150`}
                    >
                      Since
                    </button>
                    <button
                      onClick={() => setActiveTab('last')}
                      className={`${
                        activeTab === 'last'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-150`}
                    >
                      Last
                    </button>
                  </nav>
                </div>
              )}
              
              {selectedRange === 'custom' && activeTab === 'since' && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg shadow-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">Show data since</span>
                    <input
                      type="number"
                      min="1"
                      value={sinceValue}
                      onChange={handleSinceValueChange}
                      className="w-20 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                    />
                    <select
                      value={sinceUnit}
                      onChange={handleSinceUnitChange}
                      className="px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                    >
                      <option value="days">days</option>
                      <option value="weeks">weeks</option>
                      <option value="months">months</option>
                      <option value="years">years</option>
                    </select>
                    <span className="text-sm text-gray-700">ago</span>
                  </div>
                </div>
              )}
              
              {selectedRange === 'custom' && activeTab === 'last' && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg shadow-sm">
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-700">Show data for the last</span>
                      <input
                        type="number"
                        min="1"
                        value={lastValue}
                        onChange={handleLastValueChange}
                        className="w-20 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                      />
                      <select
                        value={lastUnit}
                        onChange={handleLastUnitChange}
                        className="px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                      >
                        <option value="days">days</option>
                        <option value="weeks">weeks</option>
                        <option value="months">months</option>
                        <option value="years">years</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-700">Ending</span>
                      <input
                        type="number"
                        min="0"
                        value={lastEndValue}
                        onChange={handleLastEndValueChange}
                        className="w-20 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                      />
                      <select
                        value={lastEndUnit}
                        onChange={handleLastEndUnitChange}
                        className="px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                      >
                        {lastUnit === 'days' && (
                          <option value="days">days</option>
                        )}
                        {lastUnit === 'weeks' && (
                          <>
                            <option value="days">days</option>
                            <option value="weeks">weeks</option>
                          </>
                        )}
                        {lastUnit === 'months' && (
                          <>
                            <option value="days">days</option>
                            <option value="weeks">weeks</option>
                            <option value="months">months</option>
                          </>
                        )}
                        {lastUnit === 'years' && (
                          <>
                            <option value="days">days</option>
                            <option value="weeks">weeks</option>
                            <option value="months">months</option>
                            <option value="years">years</option>
                          </>
                        )}
                      </select>
                      <span className="text-sm text-gray-700">ago</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex gap-4">
                {showTwoCalendars ? (
                  <>
                    <DatePicker
                      selected={customStartDate}
                      onChange={handleCustomDateChange}
                      startDate={customStartDate}
                      endDate={customEndDate}
                      selectsRange
                      inline
                      maxDate={new Date()}
                      monthsShown={1}
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                      className="w-full"
                      dateFormat="MMMM yyyy"
                      onMonthChange={handleMonthChange}
                      openToDate={previousMonth}
                    />
                    <DatePicker
                      selected={customStartDate}
                      onChange={handleCustomDateChange}
                      startDate={customStartDate}
                      endDate={customEndDate}
                      selectsRange
                      inline
                      maxDate={new Date()}
                      monthsShown={1}
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                      className="w-full"
                      dateFormat="MMMM yyyy"
                      onMonthChange={handleMonthChange}
                      openToDate={currentMonth}
                    />
                  </>
                ) : (
                  <DatePicker
                    selected={customStartDate}
                    onChange={handleCustomDateChange}
                    startDate={customStartDate}
                    endDate={customEndDate}
                    selectsRange
                    inline
                    maxDate={new Date()}
                    monthsShown={1}
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    className="w-full"
                    dateFormat="MMMM yyyy"
                    onMonthChange={handleMonthChange}
                    openToDate={currentMonth}
                  />
                )}
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleApply}
                  disabled={!customStartDate || !customEndDate}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                    customStartDate && customEndDate
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRollingPicker && (
        <div className="absolute z-10 mt-2 w-[400px] rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Point
              </label>
              <select
                value={rollingRange.startPoint}
                onChange={(e) => setRollingRange({ ...rollingRange, startPoint: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150"
              >
                <option value="firstDayOfMonth">First Day of Month</option>
                <option value="lastDayOfMonth">Last Day of Month</option>
                <option value="firstDayOfWeek">First Day of Week</option>
                <option value="lastDayOfWeek">Last Day of Week</option>
                <option value="lastMonday">Last Monday</option>
                <option value="lastFriday">Last Friday</option>
                <option value="customDay">Custom Day of Week</option>
              </select>
            </div>

            {rollingRange.startPoint === 'customDay' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Day of Week
                </label>
                <select
                  value={rollingRange.customDay}
                  onChange={(e) => setRollingRange({ ...rollingRange, customDay: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150"
                >
                  <option value={0}>Sunday</option>
                  <option value={1}>Monday</option>
                  <option value={2}>Tuesday</option>
                  <option value={3}>Wednesday</option>
                  <option value={4}>Thursday</option>
                  <option value={5}>Friday</option>
                  <option value={6}>Saturday</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Point
              </label>
              <select
                value={rollingRange.endPoint}
                onChange={(e) => setRollingRange({ ...rollingRange, endPoint: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="endOfPreviousWeek">End of Previous Week</option>
                <option value="endOfPreviousMonth">End of Previous Month</option>
              </select>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowRollingPicker(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                onClick={handleRollingRangeSelect}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker; 