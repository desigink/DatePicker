import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format, subDays, subWeeks, subMonths, startOfYear, startOfMonth, endOfMonth, startOfWeek, endOfWeek, previousMonday, previousFriday, getDay } from 'date-fns';

type TimeUnit = 'days' | 'weeks' | 'months';

interface DateRangePickerProps {
  onRangeChange: (range: { startDate: Date; endDate: Date }) => void;
}

interface RollingRange {
  startPoint: 'firstDayOfMonth' | 'lastDayOfMonth' | 'firstDayOfWeek' | 'lastDayOfWeek' | 'lastMonday' | 'lastFriday' | 'customDay';
  endPoint: 'today' | 'yesterday' | 'endOfPreviousWeek' | 'endOfPreviousMonth';
  customDay?: number;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ onRangeChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<string>('');
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<'fixed' | 'since' | 'last'>('fixed');
  const [sinceValue, setSinceValue] = useState(7);
  const [sinceUnit, setSinceUnit] = useState<'days' | 'weeks' | 'months'>('days');
  const [lastValue, setLastValue] = useState(7);
  const [lastUnit, setLastUnit] = useState<'days' | 'weeks' | 'months'>('days');
  const [lastEndValue] = useState(0);
  const [lastEndUnit] = useState<TimeUnit>('days');
  const [showRollingPicker, setShowRollingPicker] = useState(false);
  const [rollingRange, setRollingRange] = useState<RollingRange>({
    startPoint: 'firstDayOfMonth',
    endPoint: 'today',
    customDay: 1
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [previousMonth, setPreviousMonth] = useState(subMonths(new Date(), 1));
  const [sinceStartDate, setSinceStartDate] = useState<Date | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getDateRange = (range: string): { startDate: Date; endDate: Date } => {
    const today = new Date();
    let startDate = today;
    let endDate = today;

    switch (range) {
      case 'today':
        startDate = today;
        endDate = today;
        break;
      case 'yesterday':
        startDate = subDays(today, 1);
        endDate = subDays(today, 1);
        break;
      case 'pastWeek':
        startDate = subDays(today, 7);
        endDate = today;
        break;
      case 'monthToDate':
        startDate = startOfMonth(today);
        endDate = today;
        break;
      case 'past4Weeks':
        startDate = subDays(today, 28);
        endDate = today;
        break;
      case 'past12Weeks':
        startDate = subDays(today, 84);
        endDate = today;
        break;
      case 'yearToDate':
        startDate = startOfYear(today);
        endDate = today;
        break;
      case 'past6Months':
        startDate = subMonths(today, 6);
        endDate = today;
        break;
      case 'past12Months':
        startDate = subMonths(today, 12);
        endDate = today;
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          startDate = customStartDate;
          endDate = customEndDate;
        }
        break;
    }

    return { startDate, endDate };
  };

  const handleRangeSelect = (range: string) => {
    setSelectedRange(range);
    if (range !== 'custom') {
      const dateRange = getDateRange(range);
      onRangeChange(dateRange);
      setIsOpen(false);
    }
  };

  const handleCustomRange = () => {
    setSelectedRange('custom');
    setActiveTab('fixed');
  };

  const handleFixedTabClick = () => {
    setActiveTab('fixed');
  };

  const handleSinceTabClick = () => {
    setActiveTab('since');
  };

  const handleLastTabClick = () => {
    setActiveTab('last');
  };

  const handleSinceChange = (value: number, unit: 'days' | 'weeks' | 'months') => {
    setSinceValue(value);
    setSinceUnit(unit);
    
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
      default:
        startDate = subDays(today, 7); // Default to 7 days
    }
    
    setSinceStartDate(startDate);
    onRangeChange({ startDate, endDate: today });
  };

  const handleLastChange = (value: number, unit: 'days' | 'weeks' | 'months') => {
    setLastValue(value);
    setLastUnit(unit);
    
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
    }
    
    onRangeChange({ startDate, endDate: today });
  };

  const handleCustomDateChange = (date: Date, isStart: boolean) => {
    if (isStart) {
      setCustomStartDate(date);
      if (customEndDate && date > customEndDate) {
        setCustomEndDate(date);
      }
    } else {
      setCustomEndDate(date);
      if (customStartDate && date < customStartDate) {
        setCustomStartDate(date);
      }
    }
    
    if (customStartDate && customEndDate) {
      onRangeChange({ startDate: customStartDate, endDate: customEndDate });
    }
  };

  const handleMonthChange = (date: Date) => {
    setCurrentMonth(date);
    setPreviousMonth(subMonths(date, 1));
  };

  const handleCalendarSelect = (date: Date | null) => {
    if (!date) return;
    
    if (activeTab === 'since') {
      const today = new Date();
      setSinceStartDate(date);
      onRangeChange({ startDate: date, endDate: today });
      
      // Calculate the difference in days
      const diffTime = Math.abs(today.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Update the since value and unit
      if (diffDays <= 31) {
        setSinceValue(diffDays);
        setSinceUnit('days');
      } else if (diffDays <= 365) {
        setSinceValue(Math.ceil(diffDays / 7));
        setSinceUnit('weeks');
      } else {
        setSinceValue(Math.ceil(diffDays / 30));
        setSinceUnit('months');
      }
    } else if (activeTab === 'fixed') {
      if (!customStartDate || (customStartDate && customEndDate)) {
        setCustomStartDate(date);
        setCustomEndDate(null);
      } else {
        setCustomEndDate(date);
        onRangeChange({ startDate: customStartDate, endDate: date });
      }
    }
  };

  const handleRollingRangeSelect = () => {
    const today = new Date();
    let startDate: Date;
    
    switch (rollingRange.startPoint) {
      case 'firstDayOfMonth':
        startDate = startOfMonth(today);
        break;
      case 'lastDayOfMonth':
        startDate = endOfMonth(today);
        break;
      case 'firstDayOfWeek':
        startDate = startOfWeek(today);
        break;
      case 'lastDayOfWeek':
        startDate = endOfWeek(today);
        break;
      case 'lastMonday':
        startDate = previousMonday(today);
        break;
      case 'lastFriday':
        startDate = previousFriday(today);
        break;
      case 'customDay':
        const currentDay = getDay(today);
        const customDay = rollingRange.customDay ?? 1; // Provide default value of 1 if undefined
        const daysToSubtract = (currentDay - customDay + 7) % 7;
        startDate = subDays(today, daysToSubtract);
        break;
    }
    
    let endDate: Date;
    switch (rollingRange.endPoint) {
      case 'today':
        endDate = today;
        break;
      case 'yesterday':
        endDate = subDays(today, 1);
        break;
      case 'endOfPreviousWeek':
        endDate = endOfWeek(subWeeks(today, 1));
        break;
      case 'endOfPreviousMonth':
        endDate = endOfMonth(subMonths(today, 1));
        break;
    }
    
    onRangeChange({ startDate, endDate });
    setShowRollingPicker(false);
  };

  const getDisplayText = () => {
    if (!selectedRange) {
      return 'Select date range';
    }

    if (selectedRange === 'custom') {
      if (customStartDate && customEndDate) {
        return `${format(customStartDate, 'MMM d, yyyy')} - ${format(customEndDate, 'MMM d, yyyy')}`;
      }
      return 'Custom Range';
    }

    return String(selectedRange).replace(/([A-Z])/g, ' $1').toLowerCase();
  };

  return (
    <div className={`relative`} ref={dropdownRef}>
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
                      onClick={handleFixedTabClick}
                      className={`${
                        activeTab === 'fixed'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-150`}
                    >
                      Fixed
                    </button>
                    <button
                      onClick={handleSinceTabClick}
                      className={`${
                        activeTab === 'since'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-150`}
                    >
                      Since
                    </button>
                    <button
                      onClick={handleLastTabClick}
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
                      onChange={(e) => handleSinceChange(parseInt(e.target.value), sinceUnit)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                    />
                    <select
                      value={sinceUnit}
                      onChange={(e) => handleSinceChange(sinceValue, e.target.value as 'days' | 'weeks' | 'months')}
                      className="px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                    >
                      <option value="days">Days</option>
                      <option value="weeks">Weeks</option>
                      <option value="months">Months</option>
                    </select>
                    {sinceStartDate && (
                      <span className="text-sm text-gray-500">
                        ({format(sinceStartDate, 'MMM d, yyyy')})
                      </span>
                    )}
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
                        onChange={(e) => handleLastChange(parseInt(e.target.value), lastUnit)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                      />
                      <select
                        value={lastUnit}
                        onChange={(e) => handleLastChange(lastValue, e.target.value as 'days' | 'weeks' | 'months')}
                        className="px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                      >
                        <option value="days">days</option>
                        <option value="weeks">weeks</option>
                        <option value="months">months</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-700">Ending</span>
                      <input
                        type="number"
                        min="0"
                        value={lastEndValue}
                        onChange={(e) => handleLastChange(parseInt(e.target.value), lastUnit)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                      />
                      <select
                        value={lastEndUnit}
                        onChange={(e) => handleLastChange(lastEndValue, e.target.value as 'days' | 'weeks' | 'months')}
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
                      </select>
                      <span className="text-sm text-gray-700">ago</span>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedRange === 'custom' && (
                <div className="flex gap-4">
                  <DatePicker
                    selected={customStartDate}
                    onChange={(dates: [Date | null, Date | null]) => {
                      if (dates[0]) handleCustomDateChange(dates[0], true);
                      if (dates[1]) handleCustomDateChange(dates[1], false);
                    }}
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
                    onSelect={handleCalendarSelect}
                  />
                  <DatePicker
                    selected={customEndDate}
                    onChange={(dates: [Date | null, Date | null]) => {
                      if (dates[0]) handleCustomDateChange(dates[0], true);
                      if (dates[1]) handleCustomDateChange(dates[1], false);
                    }}
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
                    onSelect={handleCalendarSelect}
                  />
                </div>
              )}
              
              {selectedRange === 'custom' && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setIsOpen(false)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                      (activeTab === 'fixed' && customStartDate && customEndDate) || 
                      (activeTab === 'since' && sinceStartDate) || 
                      (activeTab === 'last')
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Apply
                  </button>
                </div>
              )}
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
                onChange={(e) => setRollingRange({ ...rollingRange, startPoint: e.target.value as RollingRange['startPoint'] })}
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
                onChange={(e) => setRollingRange({ ...rollingRange, endPoint: e.target.value as RollingRange['endPoint'] })}
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