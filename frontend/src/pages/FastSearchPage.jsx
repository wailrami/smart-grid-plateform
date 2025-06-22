import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Upload, Clock, PlusCircle, Sparkles, Loader, ChevronDown, Filter, X, CheckCircle } from 'lucide-react';

// Reusable components (assuming they are in ../components/common/)
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import GeminiAPIButton from '../components/common/GeminiAPIButton';
import FileInput from '../components/common/FileInput';
import TextInput from '../components/common/TextInput';
import PageHeader from '../components/common/PageHeader';
import GeminiResponseCard from '../components/common/GeminiResponseCard';

// API call functions (assuming they are in ../api/)
// import { searchTimestamps, addBulbRecord } from '../api/backendAPI'; // Updated API functions
import { callGeminiAPI } from '../api/geminiAPI';
import { searchTimestamp, uploadSearchDataset, addBulbRecord } from '../api/backendAPI'; // Updated API functions
import SelectInput from '../components/common/SelectInput';

// --- Mock Data ---
const mockSearchResponse = {
  query_timestamp: "2023-10-27 14:30:00",
  elapsed_ms: 14.583,
  neighbours: [
    { "bulb_number": 101, "timestamp": "2023-10-27 14:31:05", "power_consumption__Watts": 150.2, "voltage_levels__Volts": 220.1, "current_fluctuations__Amperes": 0.68, "temperature__Celsius": 45.5, "current_fluctuations_env__Amperes": 0.1, "environmental_conditions": "Clear" },
    { "bulb_number": 102, "timestamp": "2023-10-27 14:29:58", "power_consumption__Watts": 149.9, "voltage_levels__Volts": 219.9, "current_fluctuations__Amperes": 0.68, "temperature__Celsius": 45.4, "current_fluctuations_env__Amperes": 0.1, "environmental_conditions": "Clear" },
    { "bulb_number": 101, "timestamp": "2023-10-27 14:32:11", "power_consumption__Watts": 155.6, "voltage_levels__Volts": 225.3, "current_fluctuations__Amperes": 0.70, "temperature__Celsius": 46.1, "current_fluctuations_env__Amperes": 0.2, "environmental_conditions": "Rainy" },
    { "bulb_number": 103, "timestamp": "2023-10-27 14:28:45", "power_consumption__Watts": 148.1, "voltage_levels__Volts": 218.5, "current_fluctuations__Amperes": 0.67, "temperature__Celsius": 45.2, "current_fluctuations_env__Amperes": 0.1, "environmental_conditions": "Cloudy" },
    { "bulb_number": 102, "timestamp": "2023-10-27 14:33:01", "power_consumption__Watts": 150.5, "voltage_levels__Volts": 220.5, "current_fluctuations__Amperes": 0.68, "temperature__Celsius": 45.6, "current_fluctuations_env__Amperes": 0.1, "environmental_conditions": "Rainy" }
  ]
};

const initialBulbFormState = {
    bulb_number: '',
    timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '), // Format as YYYY-MM-DD HH:MM
    power_consumption__Watts: '',
    voltage_levels__Volts: '',
    current_fluctuations__Amperes: '',
    temperature__Celsius: '',
    current_fluctuations_env__Amperes: '',
    environmental_conditions: 'Clear',
};

const initialFilterState = {
    bulb_number: '',
    power_min: '', power_max: '',
    voltage_min: '', voltage_max: '',
    temp_min: '', temp_max: '',
    env_cond: '',
};

// --- Helper component for the filter popover ---
const FilterPopover = ({ filters, setFilters, onApply, onReset, onClose }) => {
    const popoverRef = useRef();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({...prev, [name]: value}));
    };

    return (
         <div ref={popoverRef} className="absolute top-full mt-2 right-0 w-[600px] bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-20 p-6">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-bold text-white">Column Filters</h4>
                <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <TextInput label="Bulb Number" name="bulb_number" value={filters.bulb_number} onChange={handleFilterChange} placeholder="Contains..." />
                <TextInput label="Environmental Condition" name="env_cond" value={filters.env_cond} onChange={handleFilterChange} placeholder="Contains..." />
                
                <div className="flex gap-2 items-end">
                    <TextInput label="Power (W)" name="power_min" type="number" value={filters.power_min} onChange={handleFilterChange} placeholder="Min" />
                    <TextInput name="power_max" type="number" value={filters.power_max} onChange={handleFilterChange} placeholder="Max" />
                </div>
                <div className="flex gap-2 items-end">
                    <TextInput label="Voltage (V)" name="voltage_min" type="number" value={filters.voltage_min} onChange={handleFilterChange} placeholder="Min" />
                    <TextInput name="voltage_max" type="number" value={filters.voltage_max} onChange={handleFilterChange} placeholder="Max" />
                </div>
                 <div className="flex gap-2 items-end">
                    <TextInput label="Temperature (°C)" name="temp_min" type="number" value={filters.temp_min} onChange={handleFilterChange} placeholder="Min" />
                    <TextInput name="temp_max" type="number" value={filters.temp_max} onChange={handleFilterChange} placeholder="Max" />
                </div>
            </div>
             <div className="flex justify-end gap-3 mt-6 border-t border-gray-700 pt-4">
                <Button onClick={onReset} className="bg-gray-600 hover:bg-gray-700">Reset</Button>
                <Button onClick={onApply}>Apply Filters</Button>
            </div>
        </div>
    );
};


const FastSearchPage = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDatasetLoaded, setIsDatasetLoaded] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const [timestamp, setTimestamp] = useState(new Date().toISOString().slice(0, 19).replace('T', ' '));
    const [results, setResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // State for filtering
    const [showFilterPopover, setShowFilterPopover] = useState(false);
    const [filters, setFilters] = useState(initialFilterState);

    // State for adding a bulb
    const [showAddBulb, setShowAddBulb] = useState(false);
    const [addBulbForm, setAddBulbForm] = useState(initialBulbFormState);
    const [isAddingBulb, setIsAddingBulb] = useState(false);
    const [addBulbMessage, setAddBulbMessage] = useState({ type: '', text: '' });

    // State for Gemini AI
    const [geminiAnalysis, setGeminiAnalysis] = useState('');
    const [isGeminiLoading, setIsGeminiLoading] = useState(false);
    
    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            setIsDatasetLoaded(false);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        setIsUploading(true);
        try {
            await uploadSearchDataset(selectedFile);
            setIsDatasetLoaded(true);
        } catch (error) {
            console.error("Upload failed", error);
        }
        setIsUploading(false);
    };

    const handleSearch = async () => {
        if (!isDatasetLoaded) return;
        setIsLoading(true);
        setResults(null);
        setGeminiAnalysis('');
        try {
            const response = await searchTimestamp(timestamp); // REAL
            // const response = mockSearchResponse; // MOCK
            setResults(response);
            setIsLoading(false);

            // setTimeout(() => { // MOCK
            //     setResults(mockSearchResponse);
            //     setIsLoading(false);
            // }, 1000);

        } catch (error) {
            console.error("Search failed", error);
            setIsLoading(false);
        }
    };

    const handleAnalyzeCluster = async () => {
        if (!results) return;
        setIsGeminiLoading(true);
        const resultsString = results.neighbours.map(r => `Timestamp: ${r.timestamp}, Bulb: ${r.bulb_number}, Condition: ${r.environmental_conditions}`).join('; ');
        const prompt = `I have performed a nearest-neighbor search on a time-series dataset from a smart grid. My query timestamp was ${results.query_timestamp}. The top 5 closest results are: ${resultsString}. As a data analyst, what could this clustering of timestamps signify? Provide a brief analysis. Consider possibilities like a single event affecting multiple bulbs, a recurring pattern, or a data anomaly. Keep it concise.`;
        const analysis = await callGeminiAPI(prompt);
        setGeminiAnalysis(analysis);
        setIsGeminiLoading(false);
    };

    const filteredNeighbours = useMemo(() => {
        if (!results) return [];
        return results.neighbours.filter(n => {
            const powerMin = filters.power_min === '' ? -Infinity : parseFloat(filters.power_min);
            const powerMax = filters.power_max === '' ? Infinity : parseFloat(filters.power_max);
            const voltMin = filters.voltage_min === '' ? -Infinity : parseFloat(filters.voltage_min);
            const voltMax = filters.voltage_max === '' ? Infinity : parseFloat(filters.voltage_max);
            const tempMin = filters.temp_min === '' ? -Infinity : parseFloat(filters.temp_min);
            const tempMax = filters.temp_max === '' ? Infinity : parseFloat(filters.temp_max);

            return (
                n.bulb_number.toString().includes(filters.bulb_number) &&
                n.environmental_conditions.toLowerCase().includes(filters.env_cond.toLowerCase()) &&
                n.power_consumption >= powerMin && n.power_consumption <= powerMax &&
                n.voltage_levels >= voltMin && n.voltage_levels <= voltMax &&
                n.temperature >= tempMin && n.temperature <= tempMax
            );
        });
    }, [results, filters]);
    
    const handleAddBulbInputChange = (e) => {
        const { name, value } = e.target;
        setAddBulbForm(prev => ({ ...prev, [name]: value }));
    };

    const handleAddBulbSubmit = async (e) => {
        e.preventDefault();
        setIsAddingBulb(true);
        setAddBulbMessage({ type: '', text: '' });
        try {
            await addBulbRecord(addBulbForm); // REAL
            // await new Promise(resolve => setTimeout(resolve, 1000)); // MOCK
            setAddBulbMessage({ type: 'success', text: 'Bulb record added successfully!' });
            // setAddBulbForm(initialBulbFormState); // Reset form
            // setShowAddBulb(false); // Hide form after submission
            setIsAddingBulb(false);
            
        } catch (error) {
            setAddBulbMessage({ type: 'error', text: 'Failed to add bulb. Please try again.' });
            setIsAddingBulb(false);
        }
    };

    return (
        <div>
            <PageHeader title="Fast Timestamp Search" subtitle="Find nearest timestamps in your dataset or add new data points." />
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <h3 className="font-bold text-lg mb-4 text-white">1. Upload & Process Dataset</h3>
                       <FileInput onFileSelect={handleFileChange} fileName={selectedFile?.name} />
                       <Button onClick={handleUpload} disabled={!selectedFile || isUploading} className="w-full mt-4" icon={Upload}>
                           {isUploading ? 'Processing...' : 'Upload Dataset'}
                       </Button>
                       {isDatasetLoaded && (
                           <div className="flex items-center justify-center mt-4 text-green-400">
                               <CheckCircle size={20} className="mr-2" />
                               <span>Dataset loaded and ready.</span>
                           </div>
                       )}

                       {/* <h3 className="font-bold text-lg mb-4 text-white">1. Upload Dataset</h3>
                       <FileInput onFileSelect={handleFileChange} fileName={fileName} /> */}
                       
                    </Card>
                    <Card>
                       <h3 className="font-bold text-lg mb-4 text-white">2. Search Query</h3>
                        <TextInput label="Timestamp to Search" type='datetime-local' showSeconds={true} placeholder="YYYY-MM-DD HH:MM:SS" value={timestamp} onChange={e => setTimestamp(e.target.value)} icon={Clock}/>
                        <Button onClick={handleSearch} disabled={isLoading || !isDatasetLoaded} className="w-full mt-4" icon={Search}>
                            {isLoading ? 'Searching...' : 'Search'}
                         </Button>
                         {!isDatasetLoaded && <p className="text-xs text-center text-amber-400 mt-2">Please upload and process a dataset first.</p>}
                    
                    </Card>
                    {/* <Button onClick={handleSearch} disabled={isLoading} className="w-full" icon={Search}>
                        {isLoading ? 'Searching...' : 'Search'}
                    </Button> */}
                    <Card>
                        <button onClick={() => setShowAddBulb(!showAddBulb)} className="w-full flex justify-between items-center">
                            <h3 className="font-bold text-lg text-white">3. Add a New Bulb Record</h3>
                            <ChevronDown className={`transition-transform duration-300 ${showAddBulb ? 'rotate-180' : ''}`} />
                        </button>
                        {showAddBulb && (
                            <form onSubmit={handleAddBulbSubmit} className="space-y-3 mt-4 animate-fade-in">
                                <div className="grid grid-cols-2 gap-3">
                                   <TextInput label="Bulb #" name="bulb_number" type="number" min={0} value={addBulbForm.bulb_number} onChange={handleAddBulbInputChange} />
                                   <TextInput label="Timestamp" name="timestamp" type="datetime-local" showSeconds={true} value={addBulbForm.timestamp} onChange={handleAddBulbInputChange} />
                                   <TextInput label="Power (W)" name="power_consumption__Watts" min={0} type="number" step="0.1" value={addBulbForm.power_consumption__Watts} onChange={handleAddBulbInputChange} />
                                   <TextInput label="Voltage (V)" name="voltage_levels__Volts" min={0} type="number" step="0.1" value={addBulbForm.voltage_levels__Volts} onChange={handleAddBulbInputChange} />
                                   <TextInput label="Current Fluc. (A)" name="current_fluctuations__Amperes" min={0} type="number" step="0.01" value={addBulbForm.current_fluctuations__Amperes} onChange={handleAddBulbInputChange} />
                                   <TextInput label="Temp (°C)" name="temperature__Celsius" type="number" step="0.1" value={addBulbForm.temperature__Celsius} onChange={handleAddBulbInputChange} />
                                </div>
                                <TextInput label="Env. Current Fluc. (A)" name="current_fluctuations_env__Amperes" min={0} type="number" step="0.01" value={addBulbForm.current_fluctuations_env__Amperes} onChange={handleAddBulbInputChange} />
                                <SelectInput label="Environmental Condition" name="environmental_conditions" value={addBulbForm.environmental_conditions} 
                                    onChange={handleAddBulbInputChange} 
                                    options={[
                                        { value: 'Clear', label: 'Clear' },
                                        { value: 'Cloudy', label: 'Cloudy' },
                                        { value: 'Rainy', label: 'Rainy' }]} />
                               {addBulbMessage.text && <p className={`text-sm ${addBulbMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{addBulbMessage.text}</p>}
                                <Button type="submit" disabled={isAddingBulb} className="w-full !mt-5" icon={PlusCircle}>
                                   {isAddingBulb ? 'Adding...' : 'Add Record'}
                                </Button>
                            </form>
                        )}
                    </Card>
                </div>
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <div className="flex justify-between items-center mb-4">
                           <h3 className="font-bold text-lg text-white">Search Results</h3>
                           <div className="relative">
                               <Button onClick={() => setShowFilterPopover(!showFilterPopover)} icon={Filter} className="bg-gray-700 hover:bg-gray-600">
                                   Column Filters
                               </Button>
                               {showFilterPopover && <FilterPopover filters={filters} setFilters={setFilters} onClose={() => setShowFilterPopover(false)} onApply={() => setShowFilterPopover(false)} onReset={() => setFilters(initialFilterState)} />}
                           </div>
                        </div>
                        {isLoading && <div className="flex justify-center items-center h-80"><Loader className="animate-spin h-8 w-8 text-blue-400" /><p className="ml-3">Loading results...</p></div>}
                        {!isLoading && !results && <div className="flex justify-center items-center h-80 text-gray-500"><p>Search results will appear here.</p></div>}
                        {!isLoading && results && (
                            <div className="space-y-6">
                                <div className="flex flex-wrap gap-4 text-sm">
                                    <div className="bg-gray-700/50 p-3 rounded-lg">Query: <span className="font-mono text-blue-300">{results.query_timestamp}</span></div>
                                    <div className="bg-gray-700/50 p-3 rounded-lg">Time: <span className="font-mono text-blue-300">{results.elapsed_ms} ms</span></div>
                                    <div className="bg-gray-700/50 p-3 rounded-lg">Found: <span className="font-mono text-blue-300">{filteredNeighbours.length} / {results.neighbours.length}</span></div>
                                </div>
                                
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="border-b border-gray-600">
                                            <tr>
                                                <th className="p-3 font-semibold text-gray-400">Bulb #</th>
                                                <th className="p-3 font-semibold text-gray-400">Timestamp</th>
                                                <th className="p-3 font-semibold text-gray-400">Power (W)</th>
                                                <th className="p-3 font-semibold text-gray-400">Voltage (V)</th>
                                                <th className="p-3 font-semibold text-gray-400">Current (A)</th>
                                                <th className="p-3 font-semibold text-gray-400">Temp (°C)</th>
                                                <th className="p-3 font-semibold text-gray-400">Env Curr (A)</th>
                                                <th className="p-3 font-semibold text-gray-400">Condition</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredNeighbours.map((n, index) => (
                                                <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                                    <td className="p-3 font-mono text-white">{n.bulb_number}</td>
                                                    <td className="p-3 font-mono text-gray-300">{n.timestamp}</td>
                                                    <td className="p-3 font-mono text-amber-300">{n.power_consumption}</td>
                                                    <td className="p-3 font-mono text-green-300">{n.voltage_levels}</td>
                                                    <td className="p-3 font-mono text-cyan-300">{n.current_fluctuations}</td>
                                                    <td className="p-3 font-mono text-orange-300">{n.temperature}</td>
                                                    <td className="p-3 font-mono text-purple-300">{n.current_fluctuations_env}</td>
                                                    <td className={`p-3 font-mono ${n.environmental_conditions !== 'Clear' ? 'text-red-400 font-semibold' : 'text-gray-400'}`}>{n.environmental_conditions}</td>
                                                </tr>
                                            ))}
                                            {filteredNeighbours.length === 0 && (
                                                <tr><td colSpan="8" className="text-center p-6 text-gray-500">No results match your filters.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <GeminiAPIButton onClick={handleAnalyzeCluster} disabled={isGeminiLoading || results.neighbours.length === 0}>
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

export default FastSearchPage;

