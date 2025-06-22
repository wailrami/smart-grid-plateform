// import { data } from 'autoprefixer';
import axios from 'axios';

// Create an axios instance with a base URL for your backend.
// Replace 'http://127.0.0.1:8000' with the actual URL of your Python API.
const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Optional: Set a timeout for requests
});

/**
 * Predicts energy demand based on form inputs.
 * @param {object} demandData - The data from the energy demand form.
 * @returns {Promise<object>} - The prediction data from the backend.
 */
export const predictEnergyDemand = async (demandData) => {
  // The endpoint path should match your backend router's path, e.g., '/predict/demand'
  try {
    console.log('Predicting energy demand with data:', demandData);
    const response = await apiClient.post('/energy/predict', demandData);
    console.log('Energy demand prediction response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error predicting energy demand:', error);
    // You can handle errors more gracefully here, e.g., by returning a specific error object
    throw error;
  }
};

/**
 * Predicts a fault based on form input.
 * @param {object} faultData - The data from the fault prediction form.
 * @returns {Promise<object>} - The fault prediction result.
 */
export async function predictFault (faultData) {
  try {
    // The endpoint path should match your backend, e.g., '/predict/fault'
    // Ensure faultData is in the correct format expected by your backend.
    const data = {
      'bulb_number': faultData.bulbNumber,
      'timestamp': faultData.timestamp,
      'power_consumption__Watts': faultData.powerConsumption,
      'voltage_levels__Volts': faultData.voltageLevels,
      'current_fluctuations__Amperes': faultData.currentFluctuations,
      'temperature__Celsius': faultData.temperature,
      'current_fluctuations_env__Amperes': faultData.currentFluctuationsEnv,
      'environmental_conditions': faultData.environmentalConditions
    };
    console.log('Predicting fault with data in backendAPI:', data);
    const response = await apiClient.post('/faults/predict', data);
    console.log('Fault prediction response:', response.data);
    console.log('Fault prediction:', response.data.binary.random_forest.prediction);
    const return_data = {
      binary: {
        pred: response.data.binary.random_forest.prediction,
        probability: Math.round(response.data.binary.random_forest.probability * 10000) / 100,
        metrics: response.data.binary.random_forest.metrics,
      },
      multiclass: {
        pred: response.data.multiclass.random_forest.prediction,
        // Rounding the probabilities to 2 decimal places, keeping original keys
        probabilities: response.data.multiclass.random_forest.probabilities
          ? Object.fromEntries(
            Object.entries(response.data.multiclass.random_forest.probabilities).map(
            ([key, prob]) => [key, Math.round(prob * 10000) / 100]
            )
          )
          : {},
        metrics: response.data.multiclass.random_forest.metrics,
      }
    };
    console.log('Return data:', return_data);
    return return_data;
  } catch (error) {
    console.error('Error predicting fault:', error);
    throw error;
  }
};

/**
 * Uploads a dataset file to the backend for searching.
 * @param {File} file - The CSV or XLSX dataset file.
 * @returns {Promise<object>} - The confirmation message from the backend.
 */
export const uploadSearchDataset = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    // This endpoint now only handles the file upload.
    const response = await apiClient.post('/search/search/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading search dataset:', error);
    throw error;
  }
};

/**
 * Searches for a timestamp within the previously uploaded dataset.
 * @param {string} timestamp - The timestamp to search for.
 * @returns {Promise<object>} - The search results including neighbours.
 */
export const searchTimestamp = async (timestamp) => {
  try {
    // This endpoint performs the search on the loaded data.
    // It sends a JSON object as specified by the Pydantic model.
    const response = await apiClient.post('/search/search', { timestamp: timestamp });
    console.log('Search results:', response.data);
    // the csv columns are these:
    // [bulb_number,timestamp,power_consumption (Watts),voltage_levels (Volts),current_fluctuations (Amperes),temperature (Celsius),environmental_conditions,current_fluctuations_env (Amperes)]
    const data = {
      query_timestamp: response.data.query_timestamp,
      neighbours: response.data.neighbours.map(neighbour => ({
        bulb_number: neighbour.bulb_number,
        timestamp: neighbour.timestamp,
        power_consumption: neighbour['power_consumption (Watts)'],
        voltage_levels: neighbour['voltage_levels (Volts)'],
        current_fluctuations: neighbour['current_fluctuations (Amperes)'],
        temperature: neighbour['temperature (Celsius)'],
        environmental_conditions: neighbour['environmental_conditions'],
        current_fluctuations_env: neighbour['current_fluctuations_env (Amperes)']
      })),
      elapsed_ms: response.data.elapsed_ms

    }
    console.log('Formatted search data:', data);
    return data;
  } catch (error) {
    console.error('Error searching timestamp:', error);
    throw error;
  }
};


/**
 * Adds a new bulb data record to the dataset.
 * @param {object} bulbData - The data for the new bulb record.
 * @returns {Promise<object>} - The response from the backend.
 */
export const addBulbRecord = async (bulbData) => {
  try {
    // The endpoint path should match your backend, e.g., '/data/add'
  console.log('Adding bulb record with data:', bulbData);
  // Ensure bulbData is in the correct format expected by your backend.
  if (!bulbData || !bulbData.bulb_number || !bulbData.timestamp) {
    throw new Error('Invalid bulb data: bulb_number and timestamp are required.');
  }
  // The backend expects a JSON object with the bulb data.
  // Adjust the keys as necessary to match your backend's expected format.
  // const bulbDataFormatted = {
  //   bulb_number: bulbData.bulb_number,
  //   timestamp: bulbData.timestamp,
  //   power_consumption__Watts: bulbData.power_consumption,
  //   voltage_levels__Volts: bulbData.voltage_levels,
  //   current_fluctuations__Amperes: bulbData.current_fluctuations,
  //   temperature__Celsius: bulbData.temperature,
  //   environmental_conditions: bulbData.environmental_conditions,
  //   current_fluctuations_env__Amperes: bulbData.current_fluctuations
  // };
  // console.log('Formatted bulb data:', bulbDataFormatted);
    const response = await apiClient.post('/search/add', bulbData);
    return response.data;
  } catch (error) {
    console.error('Error adding bulb record:', error);
    throw error;
  }
};
