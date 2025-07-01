import axios from "axios";
import { createClient } from "./utils/supabase/client";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  validateStatus: () => true, // Accept all HTTP status codes as valid
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const supabase = createClient();
    let sessionData;
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) sessionData = session;
    } catch (error) {
      console.error("Error fetching session:", error);
      return config; // Proceed without modifying headers if there's an error
    }
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
