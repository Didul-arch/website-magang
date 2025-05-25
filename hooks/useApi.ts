import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '@/lib/axios'; // Menggunakan instance Axios Anda
import { toast } from 'react-toastify';
import { Msg } from '@/components/toastify';

interface FetchDataOptions {
  params?: any; // Untuk query params pada GET request
  showToastOnError?: boolean;
  errorMessage?: string;
  initialData?: any; // Data awal sebelum fetch
}

// TData adalah tipe data yang diharapkan dari array 'data' dalam respons API Anda
// Misalnya, jika API mengembalikan { message: "...", data: Vacancy[] }, maka TData adalah Vacancy[]
function useFetchData<TData = any>(
  url: string | null, // url bisa null jika fetch tidak langsung dijalankan
  options?: FetchDataOptions
) {
  const [data, setData] = useState<TData | null>(options?.initialData || null);
  const [isLoading, setIsLoading] = useState(false); // Awalnya false, jadi true hanya saat fetching
  const [error, setError] = useState<string | null>(null);
  const [refetchIndex, setRefetchIndex] = useState(0);

  const refresh = useCallback(() => {
    setRefetchIndex((prevIndex) => prevIndex + 1);
  }, []);

  useEffect(() => {
    if (!url) { // Jangan fetch jika URL null atau kosong
      setData(options?.initialData || null); // Reset ke initial data jika ada
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get(url, { params: options?.params });
        
        // Asumsi respons Anda memiliki struktur { message: "...", data: [...] }
        // atau langsung array data. Sesuaikan ini.
        const responseData = response.data?.data || response.data; 

        if (isMounted) {
          setData(responseData as TData);
        }
      } catch (err: any) {
        const errMsg = err.response?.data?.message || options?.errorMessage || err.message || "Gagal mengambil data.";
        if (isMounted) {
          setError(errMsg);
          setData(options?.initialData || null); // Kembali ke initial data jika error
        }
        if (options?.showToastOnError) {
          toast.error(Msg, { data: { title: "Error Pengambilan Data", description: errMsg } });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [url, refetchIndex, options?.params, options?.initialData, options?.showToastOnError, options?.errorMessage]); // Tambahkan options?.params jika bisa berubah

  return { data, isLoading, error, refresh };
}

type HttpMethod = 'post' | 'put' | 'patch' | 'delete';

interface SubmitDataOptions<TResponseData, TRequestData> {
  onSuccess?: (data: TResponseData, requestData?: TRequestData) => void;
  onError?: (error: any, requestData?: TRequestData) => void;
  showToastOnError?: boolean;
  showToastOnSuccess?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

// TResponseData adalah tipe data yang diharapkan dari respons setelah submit
// TRequestData adalah tipe data dari body yang dikirim
function useSubmitData<TResponseData = any, TRequestData = any>() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TResponseData | null>(null); // Untuk menyimpan data respons jika perlu

  const submitData = useCallback(
    async (
      url: string,
      method: HttpMethod,
      requestPayload?: TRequestData,
      options?: SubmitDataOptions<TResponseData, TRequestData>
    ) => {
      setIsLoading(true);
      setError(null);
      setData(null);

      try {
        let response;
        switch (method) {
          case 'post':
            response = await axiosInstance.post<TResponseData>(url, requestPayload);
            break;
          case 'put':
            response = await axiosInstance.put<TResponseData>(url, requestPayload);
            break;
          case 'patch':
            response = await axiosInstance.patch<TResponseData>(url, requestPayload);
            break;
          case 'delete':
            // Untuk delete, requestPayload mungkin ada di config.data jika diperlukan oleh server
            response = await axiosInstance.delete<TResponseData>(url, { data: requestPayload });
            break;
          default:
            throw new Error(`Unsupported submit method: ${method}`);
        }
        
        const responseData = response.data;
        setData(responseData);

        if (options?.onSuccess) {
          options.onSuccess(responseData, requestPayload);
        }
        if (options?.showToastOnSuccess) {
          toast.success(Msg, { data: { title: "Sukses", description: options.successMessage || "Operasi berhasil." } });
        }
        return responseData; // Kembalikan data agar bisa di-chain
      } catch (err: any) {
        const errMsg = err.response?.data?.message || options?.errorMessage || err.message || "Operasi gagal.";
        setError(errMsg);

        if (options?.onError) {
          options.onError(err, requestPayload);
        }
        if (options?.showToastOnError) {
          toast.error(Msg, { data: { title: "Error Operasi", description: errMsg } });
        }
        throw err; // Rethrow error agar bisa ditangkap di komponen jika perlu
      } finally {
        setIsLoading(false);
      }
    },
    [] // useCallback dependencies kosong karena semua variabel ada di dalam scope fungsi
  );

  return { submitData, isLoading, error, data };
}

export { useFetchData, useSubmitData };