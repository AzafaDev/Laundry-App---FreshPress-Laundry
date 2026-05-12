import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_URL || "http://localhost:8080/api",
  withCredentials: true,
});
