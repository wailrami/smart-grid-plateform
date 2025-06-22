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
 * Searches for the nearest timestamps in a dataset.
 * @param {File} file - The CSV dataset file.
 * @param {string} timestamp - The timestamp to search for.
 * @returns {Promise<object>} - The search results.
 */
export const searchTimestamps = async (file, timestamp) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    // The endpoint path should match your backend, e.g., '/search/timestamps'
    const response = await apiClient.post(`/search/timestamps?timestamp=${timestamp}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching timestamps:', error);
    throw error;
  }
};
