import React from 'react';
import Card from './Card'; // Assuming Card is in the same directory
import Button from './Button'; // Assuming Button is in the same directory
import { Trash2, Rewind } from 'lucide-react';

/**
 * A reusable component to display a log of past predictions.
 * @param {object} props
 * @param {string} props.title - The title of the log card.
 * @param {Array<object>} props.logData - The array of log entries.
 * @param {Array<object>} props.headers - The configuration for table headers.
 * @param {function(object): void} props.onRowClick - Function to call when a row is clicked.
 * @param {function(): void} props.onClearLog - Function to clear the log.
 */
const PredictionLog = ({ title, logData, headers, onRowClick, onClearLog }) => {
  if (!logData || logData.length === 0) {
    return (
        // This section will display the history of predictions made.
        <Card>
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-white">{title}</h3>
            {/* <Button onClick={onClearLog} className="bg-red-800/70 hover:bg-red-700/70 text-xs px-3 py-1.5" icon={Trash2}>
                Clear Log
            </Button> */}
        </div>
        <p className="text-gray-400">This section will display the history of predictions made.</p>
        <div className="text-gray-400 text-center p-4">
            No predictions made yet.
        </div>
        </Card>
    )
  }

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-white">{title}</h3>
        <Button onClick={onClearLog} className="bg-red-800/70 hover:bg-red-700/70 text-xs px-3 py-1.5" icon={Trash2}>
          Clear Log
        </Button>
      </div>
      <div className="overflow-x-auto max-h-96">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-gray-800">
            <tr>
              {headers.map((header) => (
                <th key={header.key} className="p-3 font-semibold text-gray-400 whitespace-nowrap">{header.label}</th>
              ))}
              <th className="p-3 font-semibold text-gray-400">Action</th>
            </tr>
          </thead>
          <tbody>
            {logData.map((entry, index) => (
              <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-700/30 cursor-pointer" onClick={() => onRowClick(entry.inputs)}>
                {headers.map(header => (
                  <td key={`${index}-${header.key}`} className={`p-3 font-mono ${header.className || 'text-gray-300'} whitespace-nowrap`}>
                    {entry.results[header.key] !== undefined ? entry.results[header.key] : entry.inputs[header.key]}
                  </td>
                ))}
                <td className="p-3">
                   <button className="flex items-center text-blue-400 hover:text-blue-300" title="Load this entry">
                      <Rewind size={16}/>
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default PredictionLog;
