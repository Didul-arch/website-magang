"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Search, UserX, Edit, Trash2, PlusCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import axiosInstance from "@/lib/axios";
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
import PositionFormModal from "./PositionFormModal"; // We will create this component

interface Position {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

const LIMIT = 10; // Jumlah data per halaman

export default function AdminPositionsPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // State for modals and selected position
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [positionToDelete, setPositionToDelete] = useState<Position | null>(
    null
  );

  // Debounce searchQuery
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchPositions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        limit: LIMIT.toString(),
        page: page.toString(),
      });
      if (debouncedSearchQuery) {
        params.append("search", debouncedSearchQuery);
      }
      const response = await axiosInstance.get(
        `/api/position?${params.toString()}`
      );

      const fetchedPositions: Position[] = response.data.data.map(
        (position: any) => ({
          id: position.id,
          title: position.title,
          description: position.description,
          createdAt: new Date(position.createdAt).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }),
          updatedAt: new Date(position.updatedAt).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }),
        })
      );

      setPositions(fetchedPositions);

      const total = response.data?.pagination?.totalPages || 1;
      setMaxPage(total);
    } catch (error) {
      console.error("Error fetching positions:", error);
      toast({
        variant: "destructive",
        title: "Terjadi kesalahan",
        description: "Gagal memuat data jabatan.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearchQuery, toast]);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  // Modal handlers
  const handleOpenCreateModal = () => {
    setSelectedPosition(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (position: Position) => {
    setSelectedPosition(position);
    setIsModalOpen(true);
  };

  const handleOpenDeleteDialog = (position: Position) => {
    setPositionToDelete(position);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPosition(null);
  };

  const handleDeleteConfirm = async () => {
    if (!positionToDelete) return;
    try {
      await axiosInstance.delete(`/api/position/${positionToDelete.id}`);
      toast({
        title: "Berhasil",
        description: "Jabatan berhasil dihapus.",
      });
      fetchPositions(); // Refresh data
    } catch (error) {
      console.error("Error deleting position:", error);
      toast({
        variant: "destructive",
        title: "Gagal Menghapus",
        description: "Terjadi kesalahan saat menghapus jabatan.",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setPositionToDelete(null);
    }
  };

  // Pagination handlers
  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < maxPage) setPage(page + 1);
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Manajemen Position dan Vacancies
          </h1>
          <p className="text-muted-foreground">
            Kelola data jabatan dan lowongan program magang PT Mada Wikri
            Tunggal
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Daftar Jabatan</CardTitle>
                <CardDescription>
                  Total {positions.length} jabatan terdaftar
                </CardDescription>
              </div>
              <Button onClick={handleOpenCreateModal}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambah Jabatan
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search Input */}
            <div className="mb-4 flex items-center gap-2">
              <Input
                placeholder="Cari jabatan atau deskripsi..."
                value={searchQuery}
                onChange={(e) => {
                  setPage(1);
                  setSearchQuery(e.target.value);
                }}
                className="max-w-xs"
              />
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            {isLoading ? (
              <div className="flex h-40 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : positions.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center space-y-2 text-center">
                <UserX className="h-10 w-10 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Tidak ada jabatan yang ditemukan.
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>Deskripsi</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead className="text-right w-[180px]">
                          Aksi
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {positions.map((position) => (
                        <TableRow key={position.id}>
                          <TableCell className="font-medium">
                            {position.title}
                          </TableCell>
                          <TableCell>{position.description}</TableCell>
                          <TableCell>{position.createdAt}</TableCell>
                          <TableCell>{position.updatedAt}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Link href={`/admin/position/${position.id}`}>
                                <Button variant="outline" size="icon">
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">Detail</span>
                                </Button>
                              </Link>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleOpenEditModal(position)}
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="text-red-500 hover:text-red-600"
                                onClick={() => handleOpenDeleteDialog(position)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Hapus</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {/* Pagination Controls */}
                <div className="flex justify-between items-center mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={page === 1}
                  >
                    Prev
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Halaman {page} dari {maxPage}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={page >= maxPage}
                  >
                    Next
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <PositionFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        position={selectedPosition}
        onSuccess={() => {
          fetchPositions();
          handleCloseModal();
        }}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anda yakin ingin menghapus?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus jabatan
              secara permanen.
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
