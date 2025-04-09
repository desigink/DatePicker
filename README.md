# React DateRangePicker Component

A flexible and customizable date range picker component for React applications.

## Features

- **Multiple Selection Modes**:
  - Preset ranges (Today, Yesterday, Past Week, etc.)
  - Custom date range selection
  - Rolling date ranges
  - "Since" option for relative date ranges
  - "Last" option for period-based ranges

- **UI Features**:
  - Clean, modern interface
  - Responsive design
  - Two-month calendar view when needed
  - Natural language interface for date selection

## Installation

```bash
npm install react-daterangepicker
# or
yarn add react-daterangepicker
```

## Usage

```jsx
import React, { useState } from 'react';
import DateRangePicker from 'react-daterangepicker';

function App() {
  const [selectedRange, setSelectedRange] = useState(null);

  const handleRangeSelect = (range) => {
    setSelectedRange(range);
    console.log('Selected range:', range);
  };

  return (
    <div>
      <DateRangePicker onRangeSelect={handleRangeSelect} />
      
      {selectedRange && (
        <div>
          <p>Start Date: {selectedRange.startDate.toLocaleDateString()}</p>
          <p>End Date: {selectedRange.endDate.toLocaleDateString()}</p>
        </div>
      )}
    </div>
  );
}
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `onRangeSelect` | Function | Callback function that receives the selected date range |
| `className` | String | Optional CSS class name for styling |

## License

MIT 