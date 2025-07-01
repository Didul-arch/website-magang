import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
import { useToast } from "@/components/ui/use-toast";
import axiosInstance from "@/lib/axios";
import positionFormSchema from "@/lib/schemas/position.schema";

interface Position {
  id: number;
  title: string;
  description: string;
}

interface PositionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: Position | null;
  onSuccess: () => void;
}

type PositionFormValues = z.infer<typeof positionFormSchema>;

export default function PositionFormModal({
  isOpen,
  onClose,
  position,
  onSuccess,
}: PositionFormModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PositionFormValues>({
    resolver: zodResolver(positionFormSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  useEffect(() => {
    if (position) {
      form.reset({
        title: position.title,
        description: position.description,
      });
    } else {
      form.reset({
        title: "",
        description: "",
      });
    }
  }, [position, form]);

  const onSubmit = async (values: PositionFormValues) => {
    setIsSubmitting(true);
    try {
      if (position) {
        // Update existing position
        await axiosInstance.put(`/api/position/${position.id}`, values);
        toast({
          title: "Berhasil",
          description: "Jabatan berhasil diperbarui.",
        });
      } else {
        // Create new position
        await axiosInstance.post("/api/position", values);
        toast({
          title: "Berhasil",
          description: "Jabatan baru berhasil ditambahkan.",
        });
      }
      onSuccess();
    } catch (error) {
      console.error("Failed to save position:", error);
      toast({
        variant: "destructive",
        title: "Gagal Menyimpan",
        description: "Terjadi kesalahan saat menyimpan jabatan.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {position ? "Edit Jabatan" : "Tambah Jabatan Baru"}
          </DialogTitle>
          <DialogDescription>
            {position
              ? "Ubah detail jabatan di bawah ini."
              : "Isi detail untuk jabatan baru."}
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
                  <FormLabel>Nama Jabatan</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: Software Engineer Intern"
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
                      placeholder="Jelaskan tentang jabatan ini"
                      className="resize-none"
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
