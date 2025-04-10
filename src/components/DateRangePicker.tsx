import React, { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, subDays, subWeeks, subMonths, subYears, startOfYear, startOfMonth, endOfMonth, startOfWeek, endOfWeek, previousMonday, previousFriday, getDay, differenceInDays } from 'date-fns';

interface DateRangePickerProps {
  onRangeChange: (range: { startDate: Date; endDate: Date }) => void;
  initialRange?: { startDate: Date; endDate: Date };
}

type DateRange = 'today' | 'yesterday' | 'pastWeek' | 'monthToDate' | 'past4Weeks' | 'past12Weeks' | 'yearToDate' | 'past6Months' | 'past12Months' | 'custom' | 'rolling';
type TabType = 'fixed' | 'since' | 'last';
type TimeUnit = 'days' | 'weeks' | 'months';

interface RollingRange {
  startPoint: 'firstDayOfMonth' | 'lastDayOfMonth' | 'firstDayOfWeek' | 'lastDayOfWeek' | 'lastMonday' | 'lastFriday' | 'customDay';
  endPoint: 'today' | 'yesterday' | 'endOfPreviousWeek' | 'endOfPreviousMonth';
  customDay?: number;
}

interface PresetOption {
  value: string;
  label: string;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ onRangeChange, initialRange }) => {
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
  const [activeTab, setActiveTab] = useState<TabType>('fixed');
  const [showCustomOptions, setShowCustomOptions] = useState(false);
  const [sinceValue, setSinceValue] = useState(7);
  const [sinceUnit, setSinceUnit] = useState<TimeUnit>('days');
  const [lastValue, setLastValue] = useState(7);
  const [lastUnit, setLastUnit] = useState<TimeUnit>('days');
  const [lastEndValue, setLastEndValue] = useState(0);
  const [lastEndUnit, setLastEndUnit] = useState<TimeUnit>('days');
  const [lastEnding, setLastEnding] = useState<'today' | 'yesterday' | 'custom'>('today');
  const [lastEndingDate, setLastEndingDate] = useState<Date | null>(null);
  const [showTwoMonths, setShowTwoMonths] = useState(false);
  const [isSinceMode, setIsSinceMode] = useState(false);
  const [sinceStartDate, setSinceStartDate] = useState<Date | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const customPickerRef = useRef<HTMLDivElement>(null);

  const presetOptions: PresetOption[] = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'pastWeek', label: 'Past Week' },
    { value: 'monthToDate', label: 'Month to Date' },
    { value: 'past4Weeks', label: 'Past 4 Weeks' },
    { value: 'past12Weeks', label: 'Past 12 Weeks' },
    { value: 'yearToDate', label: 'Year to Date' },
    { value: 'past6Months', label: 'Past 6 Months' },
    { value: 'past12Months', label: 'Past 12 Months' }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowRollingPicker(false);
      }
      if (customPickerRef.current && !customPickerRef.current.contains(event.target as Node)) {
        setShowCustomOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getDateRange = (range: string): { startDate: Date; endDate: Date } => {
    const today = new Date();
    switch (range) {
      case 'today':
        return { startDate: today, endDate: today };
      case 'yesterday':
        const yesterday = subDays(today, 1);
        return { startDate: yesterday, endDate: yesterday };
      case 'pastWeek':
        return { startDate: subDays(today, 7), endDate: today };
      case 'monthToDate':
        return { startDate: startOfMonth(today), endDate: today };
      case 'past4Weeks':
        return { startDate: subDays(today, 28), endDate: today };
      case 'past12Weeks':
        return { startDate: subDays(today, 84), endDate: today };
      case 'yearToDate':
        return { startDate: startOfYear(today), endDate: today };
      case 'past6Months':
        return { startDate: subMonths(today, 6), endDate: today };
      case 'past12Months':
        return { startDate: subMonths(today, 12), endDate: today };
      case 'custom':
        if (customStartDate && customEndDate) {
          return { startDate: customStartDate, endDate: customEndDate };
        }
        return { startDate: today, endDate: today };
      default:
        return { startDate: today, endDate: today };
    }
  };

  const getRollingDateRange = (range: RollingRange): { startDate: Date; endDate: Date } => {
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

  const handleRangeSelect = (range: DateRange) => {
    setSelectedRange(range);
    const today = new Date();
    let startDate = new Date();
    let endDate = new Date();

    switch (range) {
      case 'today':
        startDate = today;
        endDate = today;
        setShowTwoMonths(false);
        break;
      case 'yesterday':
        startDate = subDays(today, 1);
        endDate = subDays(today, 1);
        setShowTwoMonths(false);
        break;
      case 'pastWeek':
        startDate = subDays(today, 7);
        endDate = today;
        setShowTwoMonths(false);
        break;
      case 'monthToDate':
        startDate = startOfMonth(today);
        endDate = today;
        setShowTwoMonths(false);
        break;
      case 'past4Weeks':
        startDate = subDays(today, 28);
        endDate = today;
        setShowTwoMonths(true);
        break;
      case 'past12Weeks':
        startDate = subDays(today, 84);
        endDate = today;
        setShowTwoMonths(true);
        break;
      case 'yearToDate':
        startDate = startOfYear(today);
        endDate = today;
        setShowTwoMonths(true);
        break;
      case 'past6Months':
        startDate = subMonths(today, 6);
        endDate = today;
        setShowTwoMonths(true);
        break;
      case 'past12Months':
        startDate = subMonths(today, 12);
        endDate = today;
        setShowTwoMonths(true);
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          startDate = customStartDate;
          endDate = customEndDate;
        }
        setShowTwoMonths(true);
        break;
    }

    onRangeChange({ startDate, endDate });
  };

  const handleRollingRangeSelect = () => {
    setSelectedRange('rolling');
    setShowRollingPicker(false);
    onRangeChange(getRollingDateRange(rollingRange));
  };

  const handleCustomRange = () => {
    setSelectedRange('custom');
    setShowTwoMonths(true);
    setActiveTab('fixed');
  };

  const handleCustomDateChange = (date: Date | null, isStart: boolean) => {
    if (isStart) {
      setCustomStartDate(date);
    } else {
      setCustomEndDate(date);
      if (customStartDate && date) {
        onRangeChange({ startDate: customStartDate, endDate: date });
      }
    }
  };

  const handleSinceChange = (value: number, unit: TimeUnit) => {
    const today = new Date();
    let startDate = new Date();
    
    if (isSinceMode && sinceStartDate) {
      // If we have a selected start date, calculate the difference
      const diffTime = Math.abs(today.getTime() - sinceStartDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      switch (unit) {
        case 'days':
          setSinceValue(diffDays);
          break;
        case 'weeks':
          setSinceValue(Math.ceil(diffDays / 7));
          break;
        case 'months':
          setSinceValue(Math.ceil(diffDays / 30));
          break;
      }
    } else {
      // Normal calculation from today
      switch (unit) {
        case 'days':
          startDate.setDate(today.getDate() - value);
          break;
        case 'weeks':
          startDate.setDate(today.getDate() - (value * 7));
          break;
        case 'months':
          startDate.setMonth(today.getMonth() - value);
          break;
      }
      setSinceStartDate(startDate);
    }
    
    setSinceValue(value);
    setSinceUnit(unit);
    onRangeChange({ startDate, endDate: today });
  };

  const handleSinceTabClick = () => {
    setActiveTab('since');
    setIsSinceMode(true);
    const today = new Date();
    // Set default to 7 days ago if no date is selected
    const defaultStartDate = new Date();
    defaultStartDate.setDate(today.getDate() - 7);
    setSinceStartDate(defaultStartDate);
    setSinceValue(7);
    setSinceUnit('days');
    onRangeChange({ startDate: defaultStartDate, endDate: today });
  };

  const handleFixedTabClick = () => {
    setActiveTab('fixed');
    setIsSinceMode(false);
  };

  const handleLastTabClick = () => {
    setActiveTab('last');
    setIsSinceMode(false);
  };

  const handleCalendarSelect = (date: Date | null) => {
    if (!date) return;
    
    if (activeTab === 'since') {
      const today = new Date();
      setCustomStartDate(date);
      setCustomEndDate(today);
      setSelectedRange('custom');
      onRangeChange({ startDate: date, endDate: today });
      
      // Update the since value and unit
      const diffDays = differenceInDays(today, date);
      if (diffDays <= 31) {
        setSinceValue(diffDays);
        setSinceUnit('days');
      } else if (diffDays <= 90) {
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
      setSelectedRange('custom');
    } else if (activeTab === 'last') {
      const today = new Date();
      setCustomStartDate(date);
      setCustomEndDate(today);
      setSelectedRange('custom');
      onRangeChange({ startDate: date, endDate: today });
      
      // Update the last value and unit
      const diffDays = differenceInDays(today, date);
      if (diffDays <= 31) {
        setLastValue(diffDays);
        setLastUnit('days');
      } else if (diffDays <= 90) {
        setLastValue(Math.ceil(diffDays / 7));
        setLastUnit('weeks');
      } else {
        setLastValue(Math.ceil(diffDays / 30));
        setLastUnit('months');
      }
    }
  };

  const handleLastChange = (value: number, unit: TimeUnit) => {
    const today = new Date();
    let startDate = new Date();
    
    switch (unit) {
      case 'days':
        startDate.setDate(today.getDate() - value);
        break;
      case 'weeks':
        startDate.setDate(today.getDate() - (value * 7));
        break;
      case 'months':
        startDate.setMonth(today.getMonth() - value);
        break;
    }
    
    setLastValue(value);
    setLastUnit(unit);
    onRangeChange({ startDate, endDate: today });
  };

  const handleLastEndingChange = (ending: 'today' | 'yesterday' | 'custom') => {
    setLastEnding(ending);
    const today = new Date();
    let endDate = new Date();
    
    switch (ending) {
      case 'today':
        endDate = today;
        break;
      case 'yesterday':
        endDate = subDays(today, 1);
        break;
      case 'custom':
        if (lastEndingDate) {
          endDate = lastEndingDate;
        }
        break;
    }
    
    const startDate = new Date();
    switch (lastUnit) {
      case 'days':
        startDate.setDate(endDate.getDate() - lastValue);
        break;
      case 'weeks':
        startDate.setDate(endDate.getDate() - (lastValue * 7));
        break;
      case 'months':
        startDate.setMonth(endDate.getMonth() - lastValue);
        break;
    }
    
    onRangeChange({ startDate, endDate });
  };

  const handleLastEndingDateChange = (date: Date) => {
    setLastEndingDate(date);
    const startDate = new Date();
    
    switch (lastUnit) {
      case 'days':
        startDate.setDate(date.getDate() - lastValue);
        break;
      case 'weeks':
        startDate.setDate(date.getDate() - (lastValue * 7));
        break;
      case 'months':
        startDate.setMonth(date.getMonth() - lastValue);
        break;
    }
    
    onRangeChange({ startDate, endDate: date });
  };

  const getDisplayText = () => {
    if (selectedRange === 'rolling') {
      let startPointText = '';
      let endPointText = '';
      
      // Format start point text
      switch (rollingRange.startPoint) {
        case 'firstDayOfMonth': startPointText = 'first day of month'; break;
        case 'lastDayOfMonth': startPointText = 'last day of month'; break;
        case 'firstDayOfWeek': startPointText = 'first day of week'; break;
        case 'lastDayOfWeek': startPointText = 'last day of week'; break;
        case 'lastMonday': startPointText = 'last monday'; break;
        case 'lastFriday': startPointText = 'last friday'; break;
        case 'customDay': startPointText = 'custom day of week'; break;
      }
      
      // Format end point text
      switch (rollingRange.endPoint) {
        case 'today': endPointText = 'today'; break;
        case 'yesterday': endPointText = 'yesterday'; break;
        case 'endOfPreviousWeek': endPointText = 'end of previous week'; break;
        case 'endOfPreviousMonth': endPointText = 'end of previous month'; break;
      }
      
      return `Rolling: ${startPointText} to ${endPointText}`;
    }
    if (selectedRange) {
      const range = getDateRange(selectedRange);
      switch (selectedRange) {
        case 'today':
          return format(new Date(), 'MMMM d, yyyy');
        case 'yesterday':
          return format(subDays(new Date(), 1), 'MMMM d, yyyy');
        case 'pastWeek':
          return `${format(subDays(new Date(), 7), 'MMM d')} - ${format(new Date(), 'MMM d, yyyy')}`;
        case 'monthToDate':
          return `${format(startOfMonth(new Date()), 'MMMM d')} - ${format(new Date(), 'MMMM d, yyyy')}`;
        case 'past4Weeks':
          return `Last 4 weeks (${format(subDays(new Date(), 28), 'MMM d')} - ${format(new Date(), 'MMM d, yyyy')})`;
        case 'past12Weeks':
          return `Last 12 weeks (${format(subDays(new Date(), 84), 'MMM d')} - ${format(new Date(), 'MMM d, yyyy')})`;
        case 'yearToDate':
          return `${format(startOfYear(new Date()), 'MMMM d')} - ${format(new Date(), 'MMMM d, yyyy')}`;
        case 'past6Months':
          return `Last 6 months (${format(subMonths(new Date(), 6), 'MMM d, yyyy')} - ${format(new Date(), 'MMM d, yyyy')})`;
        case 'past12Months':
          return `Last 12 months (${format(subMonths(new Date(), 12), 'MMM d, yyyy')} - ${format(new Date(), 'MMM d, yyyy')})`;
        case 'custom':
          if (customStartDate && customEndDate) {
            if (activeTab === 'fixed') {
              return `${format(customStartDate, 'MMM d, yyyy')} - ${format(customEndDate, 'MMM d, yyyy')}`;
            } else if (activeTab === 'since') {
              const daysDiff = differenceInDays(new Date(), customStartDate);
              return `Show data since ${daysDiff} days ago (${format(customStartDate, 'MMM d, yyyy')})`;
            } else if (activeTab === 'last') {
              return `Last ${lastValue} ${lastUnit}${lastValue > 1 && !lastUnit.endsWith('s') ? 's' : ''} ending ${lastEndValue > 0 ? `${lastEndValue} ${lastEndUnit}${lastEndValue > 1 && !lastEndUnit.endsWith('s') ? 's' : ''} ago` : 'today'}`;
            }
          }
          return 'Custom Range';
        default:
          return String(selectedRange).replace(/([A-Z])/g, ' $1').toLowerCase();
      }
    }
    if (customStartDate && customEndDate) {
      if (activeTab === 'since') {
        const daysDiff = differenceInDays(new Date(), customStartDate);
        return `Show data since ${daysDiff} days ago (${format(customStartDate, 'MMM d, yyyy')})`;
      }
      return `${format(customStartDate, 'MMM d, yyyy')} - ${format(customEndDate, 'MMM d, yyyy')}`;
    }
    return 'Select date range';
  };

  const handleMonthChange = (date: Date) => {
    setCurrentMonth(date);
    setPreviousMonth(subMonths(date, 1));
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
                  {showTwoMonths ? (
                    <>
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
                    </>
                  ) : (
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
                      openToDate={currentMonth}
                      onSelect={handleCalendarSelect}
                    />
                  )}
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