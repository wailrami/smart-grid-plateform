
import { useState } from 'react';
import { Zap, Calendar, Loader, Thermometer, Lightbulb, CircleGauge, Gauge, PlugZap, Cable, CloudSunRain, Sun, CloudRain, Cloud } from 'lucide-react';
// Pie chart from recharts
import { PieChart, Pie, ResponsiveContainer, PolarAngleAxis, Label, Tooltip, Cell } from 'recharts';
import { callGeminiAPI } from '../api/geminiAPI';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import TextInput from '../components/common/TextInput';
import Button from '../components/common/Button';
import GeminiAPIButton from '../components/common/GeminiAPIButton';
import GeminiResponseCard from '../components/common/GeminiResponseCard';
import { predictFault } from '../api/backendAPI';
import SelectInput from '../components/common/SelectInput';
import PredictionLog from '../components/common/PredictionLog';
import usePersistentState from '../hooks/usePersistentState';


const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function FaultPredictionPage () {
    // put these fields in a form state
    // data = {
    //         'bulb_number': input_data.bulb_number,
    //         'timestamp': input_data.timestamp,
    //         'power_consumption (Watts)': input_data.power_consumption__Watts,
    //         'voltage_levels (Volts)': input_data.voltage_levels__Volts,
    //         'current_fluctuations (Amperes)': input_data.current_fluctuations__Amperes,
    //         'temperature (Celsius)': input_data.temperature__Celsius,
    //         'current_fluctuations_env (Amperes)': input_data.current_fluctuations_env__Amperes,
    //         'environmental_conditions': input_data.environmental_conditions
    //     }
    const [formState, setFormState] = useState({ 
        bulbNumber: '101',
        timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '), // Current date and time
        powerConsumption: '120',
        voltageLevels: '230',
        currentFluctuations: '5',
        temperature: '25',
        currentFluctuationsEnv: '3',
        environmentalConditions: 'Rainy' 
    });
    const [prediction, setPrediction] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [geminiSteps, setGeminiSteps] = useState('');
    const [isGeminiLoading, setIsGeminiLoading] = useState(false);
    const [binaryPieData, setBinaryPieData] = useState([]);
    const [multiclassPieData, setMulticlassPieData] = useState([]);
    const [error, setError] = useState(null);
    const [fieldsError, setFieldsError] = useState(null);

    const [predictionLog, setPredictionLog] = usePersistentState('faultPredictionLog', []);

    const handleInputChange = (e) => {
        setFormState({
            ...formState,
            [e.target.name]: e.target.value
        });
    };

    const handlePredict = async (e) => {
      e.preventDefault();
      setError(null);
      setFieldsError(null);
      
      // Validate form inputs
      if (!formState.bulbNumber || !formState.timestamp || !formState.powerConsumption || !formState.voltageLevels || !formState.currentFluctuations || !formState.temperature || !formState.currentFluctuationsEnv || !formState.environmentalConditions) {
        setFieldsError("Please fill in all fields.");
        return;
      }
      setIsLoading(true);
      setPrediction(null);
      setGeminiSteps('');
      try {
        console.log("Form state before prediction: ", formState);
        const res = await predictFault(formState);
        console.log("Prediction response: ", res);
        
        console.log("Binary prediction: ", res.binary.pred);
        setPrediction(res);
        // Add to log
        setPredictionLog(prevLog => [{
            inputs: formState,
            results: { 
                fault_prediction: res.binary.pred,
                fault_type: res.multiclass.pred
            }
        }, ...prevLog].slice(0, 10)); // Keep last 10


        console.log("Setting binary pie data");
        setBinaryPieData(res.binary.pred ? [
          { name: "Fault", value: res.binary.probability },
          { name: "No Fault", value: Math.round((100 - res.binary.probability)*100)/100 }
        ] : [
          { name: 'No Fault', value: 100 }
        ]);
        console.log("Binary Pie Data: ", binaryPieData);
        setMulticlassPieData(
          res.multiclass.probabilities ? Object.entries(res.multiclass.probabilities).map(([key, value]) => ({
            name: String(key),
            value: value
          })) : []
        );
        console.log("Multiclass Pie Data: ", multiclassPieData);
      }catch (error) {
        console.error("Error predicting fault:", error);
        setError(error.response?.data?.detail ||
          error.response?.data?.message ||
          error.message ||
          "An error occurred while predicting the fault. Please try again.");
        setPrediction(null);
        setBinaryPieData([]);
        setMulticlassPieData([]);
      }
      
      setIsLoading(false);
      console.log("Prediction: ", prediction);
    };
    
    const handleSuggestSteps = async () => {
        if (!prediction || prediction.binary.pred !== 'Fault') return;
        setIsGeminiLoading(true);
        const prompt = `A smart grid sensor has predicted a fault. The fault type is: "${prediction.multiclass.pred}". As a senior maintenance engineer, provide a clear, step-by-step diagnostic plan for a field technician. Use a numbered list. Include steps for safety precautions, verification of the fault, and initial remediation actions.`;
        const steps = await callGeminiAPI(prompt);
        setGeminiSteps(steps);
        setIsGeminiLoading(false);
    };

    const handleLogClick = (logEntryInputs) => {
        setFormState(logEntryInputs);
    };

    const handleClearLog = () => {
        setPredictionLog([]);
    };

    const logHeaders = [
        { key: 'bulbNumber', label: 'Bulb #' },
        { key: 'timestamp', label: 'Timestamp' },
        { key: 'powerConsumption', label: 'Power Consumption (W)' },
        { key: 'voltageLevels', label: 'Voltage Levels (V)' },
        { key: 'currentFluctuations', label: 'Current Fluctuations (A)' },
        { key: 'temperature', label: 'Temperature (°C)' },
        { key: 'currentFluctuationsEnv', label: 'Current Fluctuations Env (A)' },
        { key: 'environmentalConditions', label: 'Environmental Conditions' },
        { key: 'fault_prediction', label: 'Prediction', className: 'text-red-400 font-bold' },
        { key: 'fault_type', label: 'Fault Type', className: 'text-white' }
    ];

    return (
          <div className='space-y-8'>
            <PageHeader title="Fault Prediction" subtitle="Input system parameters to predict potential equipment faults." />
            <div className = "grid grid-cols-1 lg:grid-cols-5 gap-8 space-y-8">
              <div className="col-span-2">
                <Card className='space-y-8 col-span-2'>
                  <h2 className="font-bold text-lg mb-4 text-white">Enter the bulb features</h2>
                  <form onSubmit={handlePredict} className="space-y-4">
                    {fieldsError && <div className="error-message">{fieldsError}</div>}
                    <div className="grid grid-cols-2 gap-3">
                      {/* fill icons for inputs */}
                      {/* <div> */}
                        <TextInput label="Bulb Number" name="bulbNumber" placeholder="e.g., 101" min={0} value={formState.bulbNumber} onChange={handleInputChange} icon={Lightbulb} />
                        <TextInput label="Timestamp" name="timestamp" type="datetime-local" showSeconds={true} value={formState.timestamp} onChange={handleInputChange} icon={Calendar} />
                      {/* </div> */}
                      {/* <div> */}
                        <TextInput label="Power Consumption (Watts)" name="powerConsumption" type="number" min={0} placeholder="e.g., 120" value={formState.powerConsumption} onChange={handleInputChange} icon={Zap} />
                        <TextInput label="Voltage Levels (Volts)" name="voltageLevels" type="number" min={0} placeholder="e.g., 230" value={formState.voltageLevels} onChange={handleInputChange} icon={PlugZap} />
                      {/* </div>
                      <div> */}
                        <TextInput label="Current Fluctuations (Amperes)" name="currentFluctuations" min={0} type="number" placeholder="e.g., 5" value={formState.currentFluctuations} onChange={handleInputChange} icon={Cable} />
                        <TextInput label="Temperature (Celsius)" name="temperature" type="number" placeholder="e.g., 25" value={formState.temperature} onChange={handleInputChange} icon={Thermometer} />
                      {/* </div>
                      <div> */}
                      </div>
                      <TextInput label="Current Fluctuations (Environmental, Amperes)" min={0} name="currentFluctuationsEnv" type="number" placeholder="e.g., 3" value={formState.currentFluctuationsEnv} onChange={handleInputChange} icon={Cable} />
                      {/* <TextInput label="Environmental Conditions" name="environmentalConditions" placeholder="e.g., Normal" value={formState.environmentalConditions} onChange={handleInputChange} /> */}
                      <SelectInput label="Environmental Conditions" name='environmentalConditions' icon={CloudSunRain}
                        options={[
                          { value: 'Clear', label: 'Clear', icon:Sun },
                          { value: 'Rainy', label: 'Rainy', icon:CloudRain },
                          { value: 'Cloudy', label: 'Cloudy', icon:Cloud }
                        ]}
                        value={formState.environmentalConditions}
                        onChange={handleInputChange}
                        />
                      {/* </div> */}
                          
                      <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? 'Analyzing...' : 'Predict Fault'}
                      </Button>
                  </form>
                </Card>
              </div>
              <div className="lg:col-span-3 space-y-8">
                <Card>
                  
                  <h2 className="font-bold text-lg text-white mb-4">Prediction Result</h2>
                  {isLoading && <div className="flex justify-center items-center h-64"><Loader className="animate-spin h-8 w-8 text-blue-400" /><p className="ml-3">Loading results...</p></div>}
                  {!isLoading && !error && !prediction && <div className="flex justify-center items-center h-64 text-gray-500"><p>Prediction will be shown here.</p></div>}
                  {error && <div className="error-message">{error}</div>}
                  {!isLoading && prediction && (
                      <div className="gap-6 p-6 space-y-6 items-stretch">
                        <div className=''>
                          <div className={`p-6 rounded-lg border-2 ${prediction?.binary?.pred === 'Fault' ? 'border-red-500 bg-red-900/20' : 'border-green-500 bg-green-900/20'} `}>
                            <p className="text-sm text-gray-400">Binary Prediction</p>
                            <p className={`text-3xl font-bold ${prediction?.binary.pred === 'Fault' ? 'text-red-400' : 'text-green-400'}`}>{console.log("Pred; ", prediction?.binary?.pred)}{prediction?.binary?.pred}</p>
                            <p className="text-gray-300">Fault Probability: <span className="font-semibold">{prediction?.binary?.probability}%</span></p>
                            <ResponsiveContainer width="100%" height={200} className={"hover:scale-110 transition-transform duration-300 ease-in-out"}>
                              <PieChart width={400} height={200}>
                                <Pie data={binaryPieData} dataKey='value' nameKey="name"  cx="50%" cy="50%" outerRadius={80} innerRadius={60} fill="#8884d8">
                                  <Label value={prediction?.binary?.probability + "%"} position="center" style={{ fill: '#fff', fontSize: '24px', fontWeight: 'bold' }} />
                                  <Cell key={`cell-0`} fill={prediction?.binary?.pred === 'Fault' ? '#ff4d4d' : '#4caf50'} />
                                  <Cell key={`cell-1`} fill={prediction?.binary?.pred === 'Fault' ? '#ffcccc' : '#c8e6c9'} />
                                </Pie>
                                <Tooltip />
                                
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                        <div className=''>  
                          <div className="p-6 rounded-lg bg-gray-700/50">
                            <p className="text-sm text-gray-400">Multiclass Prediction (Fault Type)</p>
                            <p className="text-2xl font-bold text-white">{prediction.multiclass.pred}</p>
                            <p className="text-gray-300">Probability: <span className="font-semibold">{prediction.multiclass.probabilities[prediction.multiclass.pred]}%</span></p>
                            <ResponsiveContainer width="100%" height={300}>
                            <PieChart width={400} height={200} className={"hover:scale-105 transition-transform duration-300 ease-in-out"}>
                              <Pie data={multiclassPieData} dataKey='value' nameKey="name" cx="50%" cy="50%" outerRadius={120} fill="#82ca9d"
                               label={renderCustomizedLabel} labelLine={false}>
                                {multiclassPieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      
                        {prediction?.binary?.pred === 'Fault' && (
                          <GeminiAPIButton onClick={handleSuggestSteps} disabled={isGeminiLoading} className='col-span-2 w-full'>
                              {isGeminiLoading ? "Generating..." : "✨ Suggest Diagnostic Steps"}
                          </GeminiAPIButton>
                        )}
                      </div>
                  )}
                </Card>
              </div>
              {/* Prediction log */}
            </div>
            {geminiSteps && <GeminiResponseCard content={geminiSteps} isLoading={isGeminiLoading} />}
            {/* <div className="lg:col-span-1 space-y-4">
              <Card>
                <h2 className="font-bold text-lg mb-4 text-white">Prediction Log</h2>
                <p className="text-gray-400">This section will display the history of predictions made.</p>
                <div className="mt-4">
                      <p className="text-gray-500">Currently, this feature is under development. Stay tuned!</p>
                </div> */}
                {/* Add prediction log component here */}
                {/* draw a table which has the bulb features as coloumns */}
                { /*
                  ( !prediction || !prediction.binary || !prediction.multiclass) && (
                  <div className="">
                    <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Bulb Number</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Timestamp</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Power Consumption (W)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Voltage Levels (V)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Current Fluctuations (A)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Temperature (°C)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Environmental Conditions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {/* Add rows dynamically based on prediction history */}
                      {/* Example row }
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">101</td>
                        <td className="px-6 py-4 whitespace-nowrap">2023-10-01 12:00:00</td>
                        <td className="px-6 py-4 whitespace-nowrap">120</td>
                        <td className="px-6 py-4 whitespace-nowrap">230</td>
                        <td className="px-6 py-4 whitespace-nowrap">5</td>
                        <td className="px-6 py-4 whitespace-nowrap">25</td>
                        <td className="px-6 py-4 whitespace-nowrap">Rainy</td>
                      </tr>
                    </tbody>
                  </table>
                  </div>)*/}

              {/* </Card>
            </div> */}
            <PredictionLog 
                title="Fault Prediction History"
                logData={predictionLog}
                headers={logHeaders}
                onRowClick={handleLogClick}
                onClearLog={handleClearLog}
            />
          </div>
        );
};
