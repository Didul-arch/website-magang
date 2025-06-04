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
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
// import { db } from "@/lib/firebase/config"
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

interface User {
  id: string;
  fullName: string;
  email: string;
  university: string;
  major: string;
  progress: {
    registration: boolean;
    readSOP: boolean;
    completedTest: boolean;
  };
  testResult?: {
    score: number;
    isPassed: boolean;
  };
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "users");
        const usersQuery = query(usersCollection, where("role", "==", "user"));
        const usersSnapshot = await getDocs(usersQuery);

        const fetchedUsers: User[] = [];
        usersSnapshot.forEach((doc) => {
          fetchedUsers.push({
            id: doc.id,
            ...doc.data(),
          } as User);
        });

        setUsers(fetchedUsers);
        setFilteredUsers(fetchedUsers);
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
  }, [toast]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(
        (user) =>
          user.fullName.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.university.toLowerCase().includes(query) ||
          user.major.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus peserta ini?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "users", userId));

      setUsers(users.filter((user) => user.id !== userId));
      setFilteredUsers(filteredUsers.filter((user) => user.id !== userId));

      toast({
        title: "Peserta dihapus",
        description: "Data peserta berhasil dihapus.",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        variant: "destructive",
        title: "Terjadi kesalahan",
        description: "Gagal menghapus data peserta.",
      });
    }
  };

  const getProgressStatus = (user: User) => {
    if (user.progress.completedTest) {
      return <Badge className="bg-green-500">Selesai</Badge>;
    } else if (user.progress.readSOP) {
      return <Badge className="bg-blue-500">Tes</Badge>;
    } else if (user.progress.registration) {
      return <Badge className="bg-yellow-500">SOP</Badge>;
    } else {
      return <Badge variant="outline">Baru</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Manajemen Peserta</h1>
        <p className="text-muted-foreground">
          Kelola data peserta program magang PT Mada Wikri Tunggal
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari peserta..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
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
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Universitas</TableHead>
                    <TableHead>Jurusan</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Skor</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.fullName}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.university}</TableCell>
                      <TableCell>{user.major}</TableCell>
                      <TableCell>{getProgressStatus(user)}</TableCell>
                      <TableCell>
                        {user.testResult ? (
                          <span
                            className={
                              user.testResult.isPassed
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {user.testResult.score}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/users/${user.id}`}>
                            <Button variant="outline" size="icon">
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">Detail</span>
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => handleDeleteUser(user.id)}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
