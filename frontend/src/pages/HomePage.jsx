

import { Zap, AlertTriangle, Search, ChevronRight } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import { Link, useLocation } from 'react-router-dom'; 



export default function HomePage () {
  const models = [
    { path: '/demand', icon: Zap, title: 'Energy Demand Forecasting', description: 'Predict future energy consumption based on historical data. Upload a CSV or use our sample dataset to generate forecasts for different periods of the day.' },
    { path: '/fault', icon: AlertTriangle, title: 'Fault Prediction Analysis', description: 'Identify potential equipment failures before they happen. Input system parameters to get a binary (Fault/No Fault) and multiclass prediction.' },
    { path: '/search', icon: Search, title: 'Fast Timestamp Search', description: 'Quickly find the most similar data points in a large time-series dataset. Upload your data and search for the nearest timestamps to a given point.' },
  ];

  return (
    <div>
      <PageHeader title="Welcome to the Smart Grid AI Platform" subtitle="A technical tool for energy system monitoring, forecasting, and analysis." />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {models.map(model => (
          <Card key={model.path} className="flex flex-col hover:border-blue-500/80 transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-gray-700 rounded-lg mr-4">
                  <model.icon className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white">{model.title}</h3>
            </div>
            <p className="text-gray-400 flex-grow">{model.description}</p>
            <div className="mt-6">
               {/* <button
                  onClick={() => setActiveView(model.id)}
                  className="w-full flex items-center justify-center text-blue-400 font-semibold hover:text-white group"
                >
                  Go to Model
                  <ChevronRight className="h-5 w-5 ml-1 transition-transform duration-200 group-hover:translate-x-1" />
                </button> */}
                <Link
                  to={model.path}
                  className="w-full flex items-center justify-center text-blue-400 font-semibold hover:text-white mt-2"
                  >
                  Explore {model.title}
                  <ChevronRight className="h-5 w-5 mr-1" />
                </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
