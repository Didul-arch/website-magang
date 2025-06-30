import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { AxiosRequestConfig } from 'axios';
import axiosInstance from '@/lib/axios';
import { Msg } from '@/components/toastify';

interface UseApiOptions<T> {
  showToastOnError?: boolean;
  showToastOnSuccess?: boolean;
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
}

function useApi<T = any>() {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const request = useCallback(
    async (
      config: AxiosRequestConfig,
      options?: UseApiOptions<T>
    ): Promise<{ data: T | null; error: any | null }> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await axiosInstance.request<T>(config);
        
        // Flexible data extraction based on common API patterns
        const responseData = (response.data as any)?.data || response.data;
        setData(responseData);

        if (options?.onSuccess) {
          options.onSuccess(responseData);
        }

        if (options?.showToastOnSuccess) {
          const message = options.successMessage || (response.data as any)?.message || 'Operasi berhasil!';
          toast.success(Msg, { data: { title: 'Sukses', description: message } });
        }

        return { data: responseData, error: null };
      } catch (err: any) {
        const errMsg =
          options?.errorMessage ||
          err.response?.data?.message ||
          err.message ||
          'Terjadi kesalahan yang tidak terduga.';
        
        setError(err);

        if (options?.onError) {
          options.onError(err);
        }

        if (options?.showToastOnError !== false) { // Default to showing error toast
          toast.error(Msg, { data: { title: 'Error', description: errMsg } });
        }

        return { data: null, error: err };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { data, isLoading, error, request };
}

export default useApi;