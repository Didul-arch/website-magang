"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, PlusCircle, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import axiosInstance from "@/lib/axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import VacancyFormModal from "./VacancyFormModal"; // Import the modal

// Interfaces (can be moved to a types file later)
interface Position {
  id: number;
  title: string;
  description: string;
}

interface Vacancy {
  id: number;
  title: string;
  description: string;
  location: "REMOTE" | "ONSITE" | "HYBRID"; // FIX: Make type specific
  status: "OPEN" | "CLOSED";
  startDate: string;
  endDate: string;
  thumbnail?: string;
}

export default function PositionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { toast } = useToast();

  const [position, setPosition] = useState<Position | null>(null);
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State for modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [vacancyToDelete, setVacancyToDelete] = useState<Vacancy | null>(null);

  const fetchPositionAndVacancies = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      // Fetch position details
      const positionPromise = axiosInstance.get(`/api/position/${id}`);

      // Fetch all vacancies and filter on the client-side
      // This is not ideal, but we're constrained to not change the backend.
      const vacanciesPromise = axiosInstance.get("/api/vacancy");

      const [positionResponse, vacanciesResponse] = await Promise.all([
        positionPromise,
        vacanciesPromise,
      ]);

      setPosition(positionResponse.data.data);

      // Filter vacancies that belong to this position
      const allVacancies = vacanciesResponse.data.data;
      const relatedVacancies = allVacancies
        .filter(
          (vacancy: any) => vacancy.position.id === parseInt(id as string, 10)
        )
        .map((v: any) => ({ ...v, position: undefined })); // remove nested position object

      setVacancies(relatedVacancies);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        variant: "destructive",
        title: "Gagal memuat data",
        description:
          "Tidak dapat menemukan jabatan atau terjadi kesalahan pada server.",
      });
      // Redirect back if position not found or error
      router.push("/admin/position");
    } finally {
      setIsLoading(false);
    }
  }, [id, toast, router]);

  useEffect(() => {
    fetchPositionAndVacancies();
  }, [fetchPositionAndVacancies]);

  // Modal and Dialog Handlers
  const handleOpenCreateModal = () => {
    setSelectedVacancy(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (vacancy: Vacancy) => {
    setSelectedVacancy(vacancy);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVacancy(null);
  };

  const handleOpenDeleteDialog = (vacancy: Vacancy) => {
    setVacancyToDelete(vacancy);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!vacancyToDelete) return;
    try {
      await axiosInstance.delete(`/api/vacancy/${vacancyToDelete.id}`);
      toast({
        title: "Berhasil",
        description: "Lowongan berhasil dihapus.",
      });
      fetchPositionAndVacancies(); // Refresh data
    } catch (error) {
      console.error("Error deleting vacancy:", error);
      toast({
        variant: "destructive",
        title: "Gagal Menghapus",
        description: "Terjadi kesalahan saat menghapus lowongan.",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setVacancyToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!position) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <p className="text-lg text-muted-foreground">
          Jabatan tidak ditemukan.
        </p>
        <Button
          variant="outline"
          onClick={() => router.push("/admin/position")}
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Daftar Jabatan
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <Button
          variant="outline"
          onClick={() => router.push("/admin/position")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Daftar Jabatan
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Detail Jabatan</CardTitle>
            <CardDescription>
              Informasi lengkap untuk jabatan {position.title}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <h3 className="font-semibold">Nama Jabatan:</h3>
            <p className="text-muted-foreground">{position.title}</p>
            <Separator className="my-4" />
            <h3 className="font-semibold">Deskripsi:</h3>
            <p className="text-muted-foreground">{position.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Daftar Lowongan</CardTitle>
                <CardDescription>
                  Kelola lowongan yang tersedia untuk jabatan {position.title}.
                </CardDescription>
              </div>
              <Button onClick={handleOpenCreateModal}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambah Lowongan
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Judul Lowongan</TableHead>
                    <TableHead>Lokasi</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal Mulai</TableHead>
                    <TableHead>Tanggal Selesai</TableHead>
                    <TableHead className="text-right w-[140px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vacancies.length > 0 ? (
                    vacancies.map((vacancy) => (
                      <TableRow key={vacancy.id}>
                        <TableCell className="font-medium">
                          {vacancy.title}
                        </TableCell>
                        <TableCell>{vacancy.location}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              vacancy.status === "OPEN"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {vacancy.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(vacancy.startDate).toLocaleDateString(
                            "id-ID"
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(vacancy.endDate).toLocaleDateString(
                            "id-ID"
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleOpenEditModal(vacancy)}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => handleOpenDeleteDialog(vacancy)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Hapus</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        Belum ada lowongan untuk jabatan ini.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal for Add/Edit Vacancy */}
      <VacancyFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        vacancy={selectedVacancy}
        positionId={position.id}
        onSuccess={() => {
          fetchPositionAndVacancies();
          handleCloseModal();
        }}
      />

      {/* Dialog for Delete Confirmation */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Anda yakin ingin menghapus lowongan ini?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus data
              lowongan secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
