import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Zap, AlertTriangle, Search, ChevronRight, Upload, Clock, Calendar, BarChart2, Sparkles, Loader } from 'lucide-react';

// Mock Data - Replace with API calls
const mockDemandData = {
  morning: { value: '1850 Watts', peak: '9:30 AM', series: [{ time: '06:00', demand: 1200 }, { time: '07:00', demand: 1500 }, { time: '08:00', demand: 1800 }, { time: '09:00', demand: 1850 }, { time: '10:00', demand: 1700 }, { time: '11:00', demand: 1600 }] },
  afternoon: { value: '2450 Watts', peak: '3:00 PM', series: [{ time: '12:00', demand: 2000 }, { time: '13:00', demand: 2200 }, { time: '14:00', demand: 2400 }, { time: '15:00', demand: 2450 }, { time: '16:00', demand: 2300 }, { time: '17:00', demand: 2100 }] },
  night: { value: '950 Watts', peak: '8:00 PM', series: [{ time: '18:00', demand: 1900 }, { time: '19:00', demand: 1500 }, { time: '20:00', demand: 950 }, { time: '21:00', demand: 800 }, { time: '22:00', demand: 700 }, { time: '23:00', demand: 600 }] },
};

const mockFaultPrediction = {
  binary: { prediction: 'Fault', probability: '89.5%' },
  multiclass: { type: 'Component Failure (Capacitor)', probability: '75.2%' },
};

const mockSearchResults = [
  { timestamp: '2023-10-27 14:31:05', distance: 0.0012 },
  { timestamp: '2023-10-27 14:29:58', distance: 0.0015 },
  { timestamp: '2023-10-27 14:32:11', distance: 0.0018 },
  { timestamp: '2023-10-27 14:28:45', distance: 0.0021 },
  { timestamp: '2023-10-27 14:33:01', distance: 0.0024 },
];


// Main Application Component
export default function App2() {
  const [activeView, setActiveView] = useState('home');

  const renderContent = () => {
    switch (activeView) {
      case 'home':
        return <HomePage setActiveView={setActiveView} />;
      case 'demand':
        return <EnergyDemandPage />;
      case 'fault':
        return <FaultPredictionPage />;
      case 'search':
        return <FastSearchPage />;
      default:
        return <HomePage setActiveView={setActiveView} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-200 font-sans">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900">
          <div className="p-6 md:p-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

// Sidebar Navigation
const Sidebar = ({ activeView, setActiveView }) => {
  const navItems = [
    { id: 'home', icon: BarChart2, label: 'Platform Overview' },
    { id: 'demand', icon: Zap, label: 'Energy Demand' },
    { id: 'fault', icon: AlertTriangle, label: 'Fault Prediction' },
    { id: 'search', icon: Search, label: 'Fast Timestamp Search' },
  ];

  return (
    <nav className="w-64 bg-gray-950/50 border-r border-gray-700/50 p-5 flex flex-col">
      <div className="flex items-center space-x-3 mb-10">
        <div className="p-2 bg-blue-600 rounded-lg">
          <Zap className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-xl font-bold text-white">Smart Grid</h1>
      </div>
      <ul className="space-y-2">
        {navItems.map(item => (
          <li key={item.id}>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); setActiveView(item.id); }}
              className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
                activeView === item.id
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              <span>{item.label}</span>
            </a>
          </li>
        ))}
      </ul>
       <div className="mt-auto text-center text-gray-500 text-xs">
          <p>&copy; 2024 Smart Grid Platform</p>
          <p>Version 1.1.0 (Gemini Enhanced)</p>
        </div>
    </nav>
  );
};

// Reusable Components
const PageHeader = ({ title, subtitle }) => (
  <div className="mb-8">
    <h2 className="text-3xl font-bold text-white tracking-tight">{title}</h2>
    <p className="text-gray-400 mt-1">{subtitle}</p>
  </div>
);

const Card = ({ children, className = '' }) => (
  <div className={`bg-gray-800/50 rounded-xl shadow-lg p-6 border border-gray-700/50 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, className = '', icon: Icon, disabled = false }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-transform transform active:scale-95 duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed ${className}`}
    >
        {Icon && <Icon className="h-5 w-5 mr-2" />}
        {children}
    </button>
);

const GeminiAPIButton = ({ children, onClick, className = '', disabled = false }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center justify-center w-full px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-all transform active:scale-95 duration-200 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed ${className}`}
    >
        <Sparkles className="h-5 w-5 mr-2" />
        {children}
    </button>
);


const FileInput = ({ onFileSelect, fileName }) => (
  <div className="w-full">
    <label htmlFor="file-upload" className="cursor-pointer flex items-center justify-center w-full px-6 py-10 border-2 border-dashed border-gray-600 rounded-lg hover:border-blue-500 transition-colors duration-200 bg-gray-800/30">
        <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-500" />
            <p className="mt-2 text-sm text-gray-400">
              <span className="font-semibold text-blue-500">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">CSV file up to 10MB</p>
            {fileName && (
                <p className="text-sm font-medium text-green-400 mt-3">
                    Selected: {fileName}
                </p>
            )}
        </div>
    </label>
    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={onFileSelect} accept=".csv" />
  </div>
);


const SelectInput = ({ label, options, value, onChange }) => (
  <div className="w-full">
    <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
    <select
        value={value}
        onChange={onChange}
        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
    >
        {options.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
        ))}
    </select>
  </div>
);

const TextInput = ({ label, placeholder, value, onChange, type = "text", icon: Icon }) => (
    <div className="w-full">
        <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
        <div className="relative">
            {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />}
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className={`w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white ${Icon ? 'pl-10' : ''}`}
            />
        </div>
    </div>
);

const GeminiResponseCard = ({ content, isLoading }) => (
    <Card>
        <h3 className="flex items-center font-bold text-lg text-white mb-4">
            <Sparkles className="h-5 w-5 mr-2 text-purple-400" />
            Gemini AI Analysis
        </h3>
        {isLoading ? (
            <div className="flex items-center justify-center h-24">
                <Loader className="animate-spin h-8 w-8 text-purple-400" />
                <p className="ml-3 text-gray-400">Generating insights...</p>
            </div>
        ) : (
            <div className="text-gray-300 prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }}></div>
        )}
    </Card>
);

// --- Gemini API Call Function ---
async function callGeminiAPI(prompt) {
  // IMPORTANT: This is a placeholder for your actual API key.
  // In a real application, this should be handled securely and not hardcoded.
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY; // Replace with your actual API key
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
        return result.candidates[0].content.parts[0].text;
    } else {
        console.error("Unexpected response structure:", result);
        return "Error: Could not parse Gemini's response.";
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return `Error: Could not retrieve insights. ${error.message}`;
  }
}


// Pages
const HomePage = ({ setActiveView }) => {
  const models = [
    { id: 'demand', icon: Zap, title: 'Energy Demand Forecasting', description: 'Predict future energy consumption based on historical data. Upload a CSV or use our sample dataset to generate forecasts for different periods of the day.' },
    { id: 'fault', icon: AlertTriangle, title: 'Fault Prediction Analysis', description: 'Identify potential equipment failures before they happen. Input system parameters to get a binary (Fault/No Fault) and multiclass prediction.' },
    { id: 'search', icon: Search, title: 'Fast Timestamp Search', description: 'Quickly find the most similar data points in a large time-series dataset. Upload your data and search for the nearest timestamps to a given point.' },
  ];

  return (
    <div>
      <PageHeader title="Welcome to the Smart Grid AI Platform" subtitle="A technical tool for energy system monitoring, forecasting, and analysis." />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {models.map(model => (
          <Card key={model.id} className="flex flex-col hover:border-blue-500/80 transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-gray-700 rounded-lg mr-4">
                  <model.icon className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white">{model.title}</h3>
            </div>
            <p className="text-gray-400 flex-grow">{model.description}</p>
            <div className="mt-6">
               <button
                  onClick={() => setActiveView(model.id)}
                  className="w-full flex items-center justify-center text-blue-400 font-semibold hover:text-white group"
                >
                  Go to Model
                  <ChevronRight className="h-5 w-5 ml-1 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};


const EnergyDemandPage = () => {
    const [fileName, setFileName] = useState('');
    const [period, setPeriod] = useState('afternoon');
    const [prediction, setPrediction] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [geminiInsights, setGeminiInsights] = useState('');
    const [isGeminiLoading, setIsGeminiLoading] = useState(false);

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setFileName(e.target.files[0].name);
        }
    };

    const handlePredict = () => {
        setIsLoading(true);
        setPrediction(null);
        setGeminiInsights('');
        setTimeout(() => {
            setPrediction(mockDemandData[period]);
            setIsLoading(false);
        }, 1500);
    };

    const handleGenerateInsights = async () => {
        if (!prediction) return;
        setIsGeminiLoading(true);
        const prompt = `As a smart grid operator, I've received an energy demand forecast. The predicted need for tomorrow ${period} is ${prediction.value}, with an expected peak at ${prediction.peak}. Based on this, provide a concise, actionable plan. Include 3 bullet points covering: 1. Proactive measures to ensure grid stability. 2. Potential for demand-response program activation. 3. Recommendations for scheduling maintenance or non-critical tasks.`;
        const insights = await callGeminiAPI(prompt);
        setGeminiInsights(insights);
        setIsGeminiLoading(false);
    };

    return (
        <div>
            <PageHeader title="Energy Demand Forecasting" subtitle="Upload a dataset and select a period to predict energy needs." />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                       <h3 className="font-bold text-lg mb-4 text-white">1. Upload Data</h3>
                       <FileInput onFileSelect={handleFileChange} fileName={fileName} />
                    </Card>
                    <Card>
                       <h3 className="font-bold text-lg mb-4 text-white">2. Set Parameters</h3>
                        <SelectInput
                            label="Forecast Period"
                            options={[
                                { value: 'morning', label: 'Morning (6am - 11am)' },
                                { value: 'afternoon', label: 'Afternoon (12pm - 5pm)' },
                                { value: 'night', label: 'Night (6pm - 11pm)' },
                            ]}
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                        />
                    </Card>
                    <Button onClick={handlePredict} disabled={isLoading} className="w-full">
                        {isLoading ? 'Generating Prediction...' : 'Predict Demand'}
                    </Button>
                </div>
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <h3 className="font-bold text-lg text-white mb-4">Prediction Result</h3>
                        {isLoading && <div className="flex justify-center items-center h-96"><Loader className="animate-spin h-8 w-8 text-blue-400" /><p className="ml-3">Loading results...</p></div>}
                        {!isLoading && !prediction && <div className="flex justify-center items-center h-96 text-gray-500"><p>Prediction will be shown here.</p></div>}
                        {!isLoading && prediction && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                     <div className="bg-gray-700/50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-400">Predicted Energy Need</p>
                                        <p className="text-2xl font-bold text-amber-400">{prediction.value}</p>
                                     </div>
                                      <div className="bg-gray-700/50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-400">Predicted Peak Time</p>
                                        <p className="text-2xl font-bold text-white">{prediction.peak}</p>
                                     </div>
                                </div>
                                <div style={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <LineChart data={prediction.series} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                                            <XAxis dataKey="time" stroke="#a0aec0" />
                                            <YAxis stroke="#a0aec0" />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #4a5568' }}
                                                labelStyle={{ color: '#e2e8f0' }}
                                            />
                                            <Legend />
                                            <Line type="monotone" dataKey="demand" stroke="#FFC107" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} name="Demand (Watts)" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                                <GeminiAPIButton onClick={handleGenerateInsights} disabled={isGeminiLoading}>
                                    {isGeminiLoading ? "Generating..." : "✨ Generate Actionable Insights"}
                                </GeminiAPIButton>
                            </div>
                        )}
                    </Card>
                    {geminiInsights && <GeminiResponseCard content={geminiInsights} isLoading={isGeminiLoading} />}
                </div>
            </div>
        </div>
    );
};

const FaultPredictionPage = () => {
    const [formState, setFormState] = useState({ bulbNumber: '101', timestamp: new Date().toISOString().slice(0, 16) });
    const [prediction, setPrediction] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [geminiSteps, setGeminiSteps] = useState('');
    const [isGeminiLoading, setIsGeminiLoading] = useState(false);

    const handleInputChange = (e) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handlePredict = () => {
        setIsLoading(true);
        setPrediction(null);
        setGeminiSteps('');
        setTimeout(() => {
            setPrediction(mockFaultPrediction);
            setIsLoading(false);
        }, 1500);
    };
    
    const handleSuggestSteps = async () => {
        if (!prediction || prediction.binary.prediction !== 'Fault') return;
        setIsGeminiLoading(true);
        const prompt = `A smart grid sensor has predicted a fault. The fault type is: "${prediction.multiclass.type}". As a senior maintenance engineer, provide a clear, step-by-step diagnostic plan for a field technician. Use a numbered list. Include steps for safety precautions, verification of the fault, and initial remediation actions.`;
        const steps = await callGeminiAPI(prompt);
        setGeminiSteps(steps);
        setIsGeminiLoading(false);
    };

    return (
      <div>
            <PageHeader title="Fault Prediction" subtitle="Input system parameters to predict potential equipment faults." />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                       <h3 className="font-bold text-lg mb-4 text-white">Input Parameters</h3>
                        <div className="space-y-4">
                            <TextInput label="Bulb Number" name="bulbNumber" placeholder="e.g., 101" value={formState.bulbNumber} onChange={handleInputChange} icon={Zap} />
                            <TextInput label="Timestamp" name="timestamp" type="datetime-local" value={formState.timestamp} onChange={handleInputChange} icon={Calendar} />
                        </div>
                    </Card>
                     <Button onClick={handlePredict} disabled={isLoading} className="w-full">
                        {isLoading ? 'Analyzing...' : 'Predict Fault'}
                    </Button>
                </div>
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <h3 className="font-bold text-lg text-white mb-4">Prediction Result</h3>
                        {isLoading && <div className="flex justify-center items-center h-64"><Loader className="animate-spin h-8 w-8 text-blue-400" /><p className="ml-3">Loading results...</p></div>}
                        {!isLoading && !prediction && <div className="flex justify-center items-center h-64 text-gray-500"><p>Prediction will be shown here.</p></div>}
                        {!isLoading && prediction && (
                             <div className="space-y-6">
                                <div className={`p-6 rounded-lg border-2 ${prediction.binary.prediction === 'Fault' ? 'border-red-500 bg-red-900/20' : 'border-green-500 bg-green-900/20'}`}>
                                    <p className="text-sm text-gray-400">Binary Prediction</p>
                                    <p className={`text-3xl font-bold ${prediction.binary.prediction === 'Fault' ? 'text-red-400' : 'text-green-400'}`}>{prediction.binary.prediction}</p>
                                    <p className="text-gray-300">Probability: <span className="font-semibold">{prediction.binary.probability}</span></p>
                                </div>
                                <div className="p-6 rounded-lg bg-gray-700/50">
                                    <p className="text-sm text-gray-400">Multiclass Prediction (Fault Type)</p>
                                    <p className="text-2xl font-bold text-white">{prediction.multiclass.type}</p>
                                    <p className="text-gray-300">Probability: <span className="font-semibold">{prediction.multiclass.probability}</span></p>
                                </div>
                                {prediction.binary.prediction === 'Fault' && (
                                    <GeminiAPIButton onClick={handleSuggestSteps} disabled={isGeminiLoading}>
                                        {isGeminiLoading ? "Generating..." : "✨ Suggest Diagnostic Steps"}
                                    </GeminiAPIButton>
                                )}
                            </div>
                        )}
                    </Card>
                    {geminiSteps && <GeminiResponseCard content={geminiSteps} isLoading={isGeminiLoading} />}
                </div>
            </div>
        </div>
    );
};

const FastSearchPage = () => {
    const [fileName, setFileName] = useState('');
    const [timestamp, setTimestamp] = useState(new Date().toISOString().slice(0, 19).replace('T', ' '));
    const [results, setResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [geminiAnalysis, setGeminiAnalysis] = useState('');
    const [isGeminiLoading, setIsGeminiLoading] = useState(false);
    
    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setFileName(e.target.files[0].name);
        }
    };

    const handleSearch = () => {
        setIsLoading(true);
        setResults(null);
        setGeminiAnalysis('');
        setTimeout(() => {
            setResults(mockSearchResults);
            setIsLoading(false);
        }, 1500);
    };

    const handleAnalyzeCluster = async () => {
        if (!results) return;
        setIsGeminiLoading(true);
        const resultsString = results.map(r => `Timestamp: ${r.timestamp}, Distance: ${r.distance}`).join('; ');
        const prompt = `I have performed a nearest-neighbor search on a time-series dataset from a smart grid. My query timestamp was ${timestamp}. The top 5 closest results are: ${resultsString}. As a data analyst, what could this clustering of timestamps signify? Provide a brief analysis. Consider possibilities like a single event, a recurring pattern, or a data anomaly. Keep it concise.`;
        const analysis = await callGeminiAPI(prompt);
        setGeminiAnalysis(analysis);
        setIsGeminiLoading(false);
    };

    return (
        <div>
            <PageHeader title="Fast Timestamp Search" subtitle="Find the nearest timestamps in your dataset." />
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-1 space-y-6">
                    <Card>
                       <h3 className="font-bold text-lg mb-4 text-white">1. Upload Data</h3>
                       <FileInput onFileSelect={handleFileChange} fileName={fileName} />
                    </Card>
                    <Card>
                       <h3 className="font-bold text-lg mb-4 text-white">2. Search Query</h3>
                        <TextInput label="Timestamp to Search" placeholder="YYYY-MM-DD HH:MM:SS" value={timestamp} onChange={e => setTimestamp(e.target.value)} icon={Clock}/>
                    </Card>
                    <Button onClick={handleSearch} disabled={isLoading} className="w-full" icon={Search}>
                        {isLoading ? 'Searching...' : 'Search'}
                    </Button>
                </div>
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <h3 className="font-bold text-lg text-white mb-4">Search Results</h3>
                         {isLoading && <div className="flex justify-center items-center h-80"><Loader className="animate-spin h-8 w-8 text-blue-400" /><p className="ml-3">Loading results...</p></div>}
                        {!isLoading && !results && <div className="flex justify-center items-center h-80 text-gray-500"><p>Search results will be shown here.</p></div>}
                        {!isLoading && results && (
                            <div className="space-y-6">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="border-b border-gray-600">
                                            <tr>
                                                <th className="p-3 text-sm font-semibold text-gray-400">Rank</th>
                                                <th className="p-3 text-sm font-semibold text-gray-400">Nearest Timestamp</th>
                                                <th className="p-3 text-sm font-semibold text-gray-400">Distance</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {results.map((result, index) => (
                                                <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                                    <td className="p-3 font-mono text-gray-400">#{index + 1}</td>
                                                    <td className="p-3 font-mono text-white">{result.timestamp}</td>
                                                    <td className="p-3 font-mono text-blue-400">{result.distance}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <GeminiAPIButton onClick={handleAnalyzeCluster} disabled={isGeminiLoading}>
                                    {isGeminiLoading ? "Analyzing..." : "✨ Analyze Timestamp Cluster"}
                                </GeminiAPIButton>
                            </div>
                        )}
                    </Card>
                    {geminiAnalysis && <GeminiResponseCard content={geminiAnalysis} isLoading={isGeminiLoading} />}
                </div>
             </div>
        </div>
    );
};
