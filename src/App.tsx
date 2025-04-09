import { useState } from 'react';
import DateRangePicker, { DateRange } from './components/DateRangePicker';

function App() {
  const [selectedRange, setSelectedRange] = useState<DateRange | null>(null);

  const handleRangeSelect = (range: DateRange) => {
    setSelectedRange(range);
    console.log('Selected range:', range);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-xl font-semibold text-gray-900 mb-6">
            Select a date range
          </h1>
          
          <DateRangePicker onRangeSelect={handleRangeSelect} />
          
          {selectedRange && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h2 className="text-sm font-medium text-gray-700 mb-2">
                Selected Range:
              </h2>
              <div className="text-sm text-gray-600">
                <p>Start Date: {selectedRange.startDate.toLocaleDateString()}</p>
                <p>End Date: {selectedRange.endDate.toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App; 