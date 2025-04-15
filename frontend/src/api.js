import axios from "axios"
import { ACCESS_TOKEN } from "./constants"

const isDev = import.meta.env.MODE === 'development'
const myBaseUrl = isDev ? import.meta.env.VITE_API_URL : import.meta.env.VITE_API_URL_DEPLOY

const api = axios.create({
    baseURL: myBaseUrl
})

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN)
        if (token) { // look in local storage for the token
            config.headers.Authorization = `Bearer ${token}`; // add token to the header
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;