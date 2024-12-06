import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: "https://formbuilder-yyz3.onrender.com"
  // baseURL: 'http://localhost:5000/', // For development
});

export default axiosInstance;
