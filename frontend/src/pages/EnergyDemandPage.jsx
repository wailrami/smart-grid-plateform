import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Thermometer, Wind, Droplets, Compass, Zap, Calendar, Sparkles, Loader } from 'lucide-react';

// Reusable components (assuming they are in ../components/common/)
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import GeminiAPIButton from '../components/common/GeminiAPIButton';
import TextInput from '../components/common/TextInput';
import PageHeader from '../components/common/PageHeader';
import GeminiResponseCard from '../components/common/GeminiResponseCard';
import PredictionLog from '../components/common/PredictionLog';
// Custom hook for persistent state (assuming it's in ../hooks/usePersistentState.js)
import usePersistentState from '../hooks/usePersistentState';

// API call functions (assuming they are in ../api/)
import { predictEnergyDemand } from '../api/backendAPI'; 
import { callGeminiAPI } from '../api/geminiAPI';


// --- Mock Data & Functions ---

// Sample data to pre-fill the form
const sampleData = {
  timestamp: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  lag_24h: 22.5,
  Temp: 22.5,
  RH: 55,
  FF: 15,
  P: 1012,
};

// Mock API response structure
const mockApiResponse = {
  timestamp: "2025-06-06 14:30",
  predictions: {
    "random_forest": 27,
    "xgboost": 27,
    "lightgbm": 28,
    "gradient_boosting": 28,
    "lstm": 36
  }
};


const EnergyDemandPage = () => {
    // State for the form inputs
    const [formData, setFormData] = useState({
        timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
        lag_24h: 135.5,
        Temp: 22.5,
        RH: 55,
        FF: 15,
        P: 1012,
        });
    // State for the API response
    const [prediction, setPrediction] = useState(null);
    // Loading state for the prediction
    const [isLoading, setIsLoading] = useState(false);
    // State for Gemini AI analysis
    const [geminiInsights, setGeminiInsights] = useState('');
    // Loading state for Gemini
    const [isGeminiLoading, setIsGeminiLoading] = useState(false);

    const [predictionLog, setPredictionLog] = usePersistentState('energyPredictionLog', []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleUseSampleData = () => {
        setFormData(sampleData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setPrediction(null);
        setGeminiInsights('');

        // --- REAL API CALL (commented out for demo) ---
        try {
            const result = await predictEnergyDemand(formData);
            setPrediction(result);
            // Add to log
            const avgPrediction = (Object.values(result.predictions).reduce((a, b) => a + b, 0) / Object.values(result.predictions).length).toFixed(2);
            setPredictionLog(prevLog => [{
                inputs: formData,
                results: { ...result, avgPrediction }
            }, ...prevLog].slice(0, 10)); // Keep only the last 10 predictions
        } catch (error) {
          console.error("Prediction failed:", error);
          // You should show an error message to the user here
          // --- MOCK API CALL (for demonstration) ---
          console.log("Submitting form data:", formData);
            setTimeout(() => {
                setPrediction(mockApiResponse);
                setIsLoading(false);
            }, 1500);
        } finally {
          setIsLoading(false);
        }

        
        
    };

    const handleGenerateInsights = async () => {
        if (!prediction) return;
        setIsGeminiLoading(true);

        const avgPrediction = (Object.values(prediction.predictions).reduce((a, b) => a + b, 0) / Object.values(prediction.predictions).length).toFixed(2);
        const modelPredictionsString = Object.entries(prediction.predictions).map(([model, value]) => `${model}: ${value}W`).join(', ');

        const prompt = `As a smart grid operator, I've received an energy demand forecast for the timestamp ${prediction.timestamp}.
        The forecast is based on these weather conditions: Temperature: ${formData.Temp}°C, Humidity: ${formData.RH}%, Wind Speed: ${formData.FF} km/h, Pressure: ${formData.P} hPa.
        Multiple ML models provided predictions: ${modelPredictionsString}.
        The average predicted demand is approximately ${avgPrediction}W.
        Provide a concise, actionable plan based on this average prediction. Include 3 bullet points covering: 1. Proactive measures to ensure grid stability. 2. Potential for demand-response program activation. 3. Recommendations for scheduling maintenance or non-critical tasks.`;

        const insights = await callGeminiAPI(prompt);
        setGeminiInsights(insights);
        setIsGeminiLoading(false);
    };

    const handleLogClick = (logEntryInputs) => {
        setFormData(logEntryInputs);
    };

    const handleClearLog = () => {
        setPredictionLog([]);
    };
    
    // Format data for the chart
    const chartData = prediction ? Object.entries(prediction.predictions).map(([model, value]) => ({
        model: model.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        watts: value,
    })) : [];

    const averagePrediction = prediction ? (Object.values(prediction.predictions).reduce((a, b) => a + b, 0) / Object.values(prediction.predictions).length).toFixed(2) : 0;

    const logHeaders = [
        { key: 'timestamp', label: 'Timestamp' },
        { key: 'lag_24h', label: 'Lag 24h Consumption (W)' },
        { key: 'Temp', label: 'Temp (°C)' },
        { key: 'RH', label: 'Humidity (%)' },
        { key: 'FF', label: 'Wind Speed (km/h)' },
        { key: 'P', label: 'Pressure (hPa)' },
        { key: 'avgPrediction', label: 'Avg. Pred. (W)', className: 'text-amber-400 font-bold' }
    ];

    return (
        <div className="container mx-auto space-y-8">
            <PageHeader title="Energy Demand Forecast" subtitle="Input weather and system data to get multi-model energy predictions." />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* --- INPUT FORM COLUMN --- */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-white">Input Parameters</h3>
                            <button onClick={handleUseSampleData} className="text-xs text-blue-400 hover:text-blue-300 font-semibold">Use Sample</button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <TextInput label="Date & Time" name="timestamp" type="datetime-local" showSeconds={false} value={formData.timestamp} onChange={handleInputChange} icon={Calendar} />
                            <TextInput label="Lag 24h Consumption (W)" name="lag_24h" type="number" min={0} step="0.5" value={formData.lag_24h} onChange={handleInputChange} icon={Zap} />
                            <TextInput label="Temperature (°C)" name="Temp" type="number" step="0.5" value={formData.Temp} onChange={handleInputChange} icon={Thermometer} />
                            <TextInput label="Relative Humidity (%)" name="RH" type="number" min={0} max={100} step="1" value={formData.RH} onChange={handleInputChange} icon={Droplets} />
                            <TextInput label="Wind Speed (km/h)" name="FF" type="number" step="1" min={0} value={formData.FF} onChange={handleInputChange} icon={Wind} />
                            <TextInput label="Pressure (hPa)" name="P" type="number" min={0} step="1" value={formData.P} onChange={handleInputChange} icon={Compass} />
                            <Button type="submit" disabled={isLoading} className="w-full">
                                {isLoading ? 'Generating Prediction...' : 'Predict Demand'}
                            </Button>
                        </form>
                    </Card>
                </div>

                {/* --- RESULTS COLUMN --- */}
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <h3 className="font-bold text-lg text-white mb-4">Prediction Results</h3>
                        {isLoading && <div className="flex justify-center items-center h-96"><Loader className="animate-spin h-8 w-8 text-blue-400" /><p className="ml-3">Loading results...</p></div>}
                        {!isLoading && !prediction && <div className="flex justify-center items-center h-96 text-gray-500"><p>Prediction results will be shown here.</p></div>}
                        {!isLoading && prediction && (
                            <div className="space-y-6">
                               <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                                    <p className="text-sm text-gray-400">Average Predicted Demand for {new Date(prediction.timestamp).toLocaleString()}</p>
                                    <p className="text-3xl font-bold text-amber-400">{averagePrediction} W</p>
                               </div>
                                <div style={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                                            <XAxis dataKey="model" stroke="#a0aec0" angle={-45} textAnchor="end" height={80} interval={0} />
                                            <YAxis stroke="#a0aec0" label={{ value: 'Watts', angle: -90, position: 'insideLeft', fill: '#a0aec0' }} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #4a5568' }}
                                                labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                                                formatter={(value) => `${value} W`}
                                            />
                                            <Legend wrapperStyle={{ color: '#e2e8f0' }} />
                                            <Bar dataKey="watts" fill="#FFC107" name="Predicted Demand" />
                                        </BarChart>
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
            {/* prediction log */}
            {/* <div className="mt-8">
                <Card>
                    <h3 className="font-bold text-lg text-white mb-4">Prediction Log</h3>
                    <p className="text-sm text-gray-400">This section will show a log of all predictions made during the session.</p>
                    
                    <div className="mt-4">
                        <p className="text-gray-500">Currently, this feature is under development. Stay tuned!</p>
                    </div>
                </Card>
            </div> */}
            <PredictionLog 
                title="Energy Prediction History"
                logData={predictionLog}
                headers={logHeaders}
                onRowClick={handleLogClick}
                onClearLog={handleClearLog}
            />
        </div>
    );
};

export default EnergyDemandPage;
