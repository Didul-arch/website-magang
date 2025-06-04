import axios from "axios";
import { createClient } from "./utils/supabase/client";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const supabase = createClient();
    let sessionData;
    console.log("Fetching session from Supabase...");
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log("Session fetched successfully.");
      if (session) sessionData = session;
    } catch (error) {
      console.error("Error fetching session:", error);
      return config; // Proceed without modifying headers if there's an error
    }
    console.log("Current session:", sessionData);
    const token = sessionData?.access_token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    // Do something with request error
    return Promise.reject(error);
  }
);

export default axiosInstance;
