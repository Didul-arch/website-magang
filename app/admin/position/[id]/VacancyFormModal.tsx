import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import axiosInstance from "@/lib/axios";
import {
  vacancyFormSchema,
  VacancyFormValues,
} from "@/lib/schemas/vacancy.schema";

// The prop can be a partial version of the form values, plus the id
interface VacancyForModal extends Partial<VacancyFormValues> {
  id: number;
}

interface VacancyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  vacancy: VacancyForModal | null; // Use the new interface
  positionId: number;
  onSuccess: () => void;
}

// Helper to format date to YYYY-MM-DD for input[type="date"]
const formatDateForInput = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
};

export default function VacancyFormModal({
  isOpen,
  onClose,
  vacancy,
  positionId,
  onSuccess,
}: VacancyFormModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<VacancyFormValues>({
    resolver: zodResolver(vacancyFormSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "ONSITE" as const,
      status: "OPEN" as const,
      startDate: "",
      endDate: "",
      thumbnail: "",
      positionId: positionId, // Always ensure positionId is part of the form's data
    },
  });

  useEffect(() => {
    if (vacancy) {
      // If editing, reset the form with the vacancy's data
      form.reset({
        title: vacancy.title || "",
        description: vacancy.description || "",
        location: (vacancy.location || "ONSITE") as
          | "ONSITE"
          | "REMOTE"
          | "HYBRID",
        status: (vacancy.status || "OPEN") as "OPEN" | "CLOSED",
        startDate: vacancy.startDate
          ? formatDateForInput(vacancy.startDate)
          : "",
        endDate: vacancy.endDate ? formatDateForInput(vacancy.endDate) : "",
        thumbnail: vacancy.thumbnail || "",
        positionId: positionId,
      });
    } else {
      // If creating, reset with default values but ensure positionId is set
      form.reset({
        title: "",
        description: "",
        location: "ONSITE" as const,
        status: "OPEN" as const,
        startDate: "",
        endDate: "",
        thumbnail: "",
        positionId: positionId,
      });
    }
  }, [vacancy, positionId, form]);

  const onSubmit = async (values: VacancyFormValues) => {
    setIsSubmitting(true);

    // Konversi tanggal ke format ISO-8601 sebelum mengirim ke backend
    const payload = {
      ...values,
      startDate: new Date(values.startDate).toISOString(),
      endDate: new Date(values.endDate).toISOString(),
    };

    try {
      if (vacancy) {
        // Update existing vacancy
        await axiosInstance.put(`/api/vacancy/${vacancy.id}`, payload);
        toast({
          title: "Berhasil",
          description: "Lowongan berhasil diperbarui.",
        });
      } else {
        // Create new vacancy
        await axiosInstance.post("/api/vacancy", payload);
        toast({
          title: "Berhasil",
          description: "Lowongan baru berhasil ditambahkan.",
        });
      }
      onSuccess();
    } catch (error: any) {
      console.error("Failed to save vacancy:", error);
      toast({
        variant: "destructive",
        title: "Gagal Menyimpan",
        description:
          error.response?.data?.message ||
          "Terjadi kesalahan saat menyimpan lowongan.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {vacancy ? "Edit Lowongan" : "Tambah Lowongan Baru"}
          </DialogTitle>
          <DialogDescription>
            {vacancy
              ? "Ubah detail lowongan di bawah ini."
              : "Isi detail untuk lowongan baru."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul Lowongan</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: Internship Frontend Developer Batch 5"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Jelaskan tentang lowongan ini"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lokasi</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih lokasi kerja" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ONSITE">On-site</SelectItem>
                        <SelectItem value="REMOTE">Remote</SelectItem>
                        <SelectItem value="HYBRID">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status lowongan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="OPEN">Open</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Mulai</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Selesai</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="thumbnail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Gambar (Opsional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/image.png"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
