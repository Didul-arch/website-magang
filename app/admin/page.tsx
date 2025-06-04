"use client";

import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Search, UserX } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import axiosInstance from "@/lib/axios";

interface User {
  id: number;
  company: string;
  degree: string;
  semester: number;
  idCard: string;
  cv: string | null;
  portfolio: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  status: string;
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
}

const LIMIT = 10; // Jumlah data per halaman

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(1);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get(
          `/api/internship?limit=${LIMIT}&page=${page}`
        );

        const fetchedUsers: User[] = response.data.data.map((user: any) => ({
          id: user.id,
          company: user.company,
          degree: user.degree,
          semester: user.semester,
          idCard: user.idCard,
          cv: user.cv,
          portfolio: user.portfolio,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          userId: user.userId,
          status: user.status,
          user: {
            id: user.user.id,
            name: user.user.name,
            email: user.user.email,
            phoneNumber: user.user.phoneNumber,
            role: user.user.role,
            createdAt: user.user.createdAt,
            updatedAt: user.user.updatedAt,
          },
        }));

        setUsers(fetchedUsers);
        setFilteredUsers(fetchedUsers);

        // Assume response.data.pagination.totalPages contains the total number of users
        const total = response.data?.pagination?.totalPages || 0;
        setMaxPage(total);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          variant: "destructive",
          title: "Terjadi kesalahan",
          description: "Gagal memuat data peserta.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [toast, page]);

  // Pagination handlers
  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < maxPage) setPage(page + 1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Manajemen Peserta</h1>
        <p className="text-muted-foreground">
          Kelola data peserta program magang PT Mada Wikri Tunggal
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Peserta</CardTitle>
          <CardDescription>
            Total {filteredUsers.length} peserta terdaftar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center space-y-2 text-center">
              <UserX className="h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">
                Tidak ada peserta yang ditemukan
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Universitas</TableHead>
                      <TableHead>Jurusan</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.user?.name}
                        </TableCell>
                        <TableCell>{user.user?.email}</TableCell>
                        <TableCell>{user.company}</TableCell>
                        <TableCell>{user.degree}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {/* <Link href={`/admin/users/${user.id}`}> */}
                            <Button variant="outline" size="icon">
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">Detail</span>
                            </Button>
                            {/* </Link> */}
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-red-500 hover:text-red-600"
                            >
                              <UserX className="h-4 w-4" />
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
                  disabled={page === maxPage}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
