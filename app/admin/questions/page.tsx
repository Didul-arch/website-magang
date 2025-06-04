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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash, Info } from "lucide-react";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
// import { db } from "@/lib/firebase/config"
import { useToast } from "@/components/ui/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Option {
  id: string;
  text: string;
  weight: number;
}

interface Question {
  id: string;
  text: string;
  options: Option[];
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    options: [
      { id: "1", text: "", weight: 0 },
      { id: "2", text: "", weight: 0 },
      { id: "3", text: "", weight: 0 },
      { id: "4", text: "", weight: 0 },
    ],
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const questionsCollection = collection(db, "questions");
        const questionsSnapshot = await getDocs(questionsCollection);

        const fetchedQuestions: Question[] = [];
        questionsSnapshot.forEach((doc) => {
          fetchedQuestions.push({
            id: doc.id,
            ...doc.data(),
          } as Question);
        });

        setQuestions(fetchedQuestions);
      } catch (error) {
        console.error("Error fetching questions:", error);
        toast({
          variant: "destructive",
          title: "Terjadi kesalahan",
          description: "Gagal memuat data soal.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [toast]);

  const validateWeights = (options: Option[]) => {
    // Check if at least one option has a weight > 0
    const hasValidWeight = options.some((option) => option.weight > 0);
    if (!hasValidWeight) {
      toast({
        variant: "destructive",
        title: "Bobot tidak valid",
        description:
          "Setidaknya satu pilihan harus memiliki bobot lebih dari 0.",
      });
      return false;
    }

    // Ensure weights are between 0 and 100
    for (const option of options) {
      if (option.weight < 0 || option.weight > 100) {
        toast({
          variant: "destructive",
          title: "Bobot tidak valid",
          description: "Bobot harus berada di antara 0 dan 100.",
        });
        return false;
      }
    }

    return true;
  };

  const handleAddQuestion = async () => {
    // Validate inputs
    if (!newQuestion.text.trim()) {
      toast({
        variant: "destructive",
        title: "Teks soal diperlukan",
        description: "Silakan isi teks soal.",
      });
      return;
    }

    for (const option of newQuestion.options) {
      if (!option.text.trim()) {
        toast({
          variant: "destructive",
          title: "Teks pilihan diperlukan",
          description: "Silakan isi semua teks pilihan.",
        });
        return;
      }
    }

    // Validate weights
    if (!validateWeights(newQuestion.options)) {
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "questions"), {
        text: newQuestion.text,
        options: newQuestion.options,
      });

      const addedQuestion: Question = {
        id: docRef.id,
        text: newQuestion.text,
        options: newQuestion.options,
      };

      setQuestions([...questions, addedQuestion]);

      // Reset form
      setNewQuestion({
        text: "",
        options: [
          { id: "1", text: "", weight: 0 },
          { id: "2", text: "", weight: 0 },
          { id: "3", text: "", weight: 0 },
          { id: "4", text: "", weight: 0 },
        ],
      });

      setIsAddDialogOpen(false);

      toast({
        title: "Soal ditambahkan",
        description: "Soal baru berhasil ditambahkan.",
      });
    } catch (error) {
      console.error("Error adding question:", error);
      toast({
        variant: "destructive",
        title: "Terjadi kesalahan",
        description: "Gagal menambahkan soal baru.",
      });
    }
  };

  const handleEditQuestion = async () => {
    if (!currentQuestion) return;

    // Validate inputs
    if (!currentQuestion.text.trim()) {
      toast({
        variant: "destructive",
        title: "Teks soal diperlukan",
        description: "Silakan isi teks soal.",
      });
      return;
    }

    for (const option of currentQuestion.options) {
      if (!option.text.trim()) {
        toast({
          variant: "destructive",
          title: "Teks pilihan diperlukan",
          description: "Silakan isi semua teks pilihan.",
        });
        return;
      }
    }

    // Validate weights
    if (!validateWeights(currentQuestion.options)) {
      return;
    }

    try {
      await updateDoc(doc(db, "questions", currentQuestion.id), {
        text: currentQuestion.text,
        options: currentQuestion.options,
      });

      setQuestions(
        questions.map((q) =>
          q.id === currentQuestion.id ? currentQuestion : q
        )
      );

      setIsEditDialogOpen(false);

      toast({
        title: "Soal diperbarui",
        description: "Soal berhasil diperbarui.",
      });
    } catch (error) {
      console.error("Error updating question:", error);
      toast({
        variant: "destructive",
        title: "Terjadi kesalahan",
        description: "Gagal memperbarui soal.",
      });
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus soal ini?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "questions", questionId));

      setQuestions(questions.filter((q) => q.id !== questionId));

      toast({
        title: "Soal dihapus",
        description: "Soal berhasil dihapus.",
      });
    } catch (error) {
      console.error("Error deleting question:", error);
      toast({
        variant: "destructive",
        title: "Terjadi kesalahan",
        description: "Gagal menghapus soal.",
      });
    }
  };

  const handleNewQuestionChange = (field: string, value: string) => {
    setNewQuestion({
      ...newQuestion,
      [field]: value,
    });
  };

  const handleNewOptionChange = (index: number, field: string, value: any) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index] = {
      ...updatedOptions[index],
      [field]: field === "weight" ? Number(value) : value,
    };
    setNewQuestion({
      ...newQuestion,
      options: updatedOptions,
    });
  };

  const handleCurrentQuestionChange = (field: string, value: string) => {
    if (!currentQuestion) return;
    setCurrentQuestion({
      ...currentQuestion,
      [field]: value,
    });
  };

  const handleCurrentOptionChange = (
    index: number,
    field: string,
    value: any
  ) => {
    if (!currentQuestion) return;
    const updatedOptions = [...currentQuestion.options];
    updatedOptions[index] = {
      ...updatedOptions[index],
      [field]: field === "weight" ? Number(value) : value,
    };
    setCurrentQuestion({
      ...currentQuestion,
      options: updatedOptions,
    });
  };

  const getMaxWeightOption = (question: Question) => {
    if (!question.options.length) return null;
    return question.options.reduce(
      (max, option) => (option.weight > max.weight ? option : max),
      question.options[0]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manajemen Soal</h1>
          <p className="text-muted-foreground">
            Kelola soal tes seleksi program magang
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Soal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Tambah Soal Baru</DialogTitle>
              <DialogDescription>
                Tambahkan soal baru untuk tes seleksi program magang
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="question-text">Teks Soal</Label>
                <Input
                  id="question-text"
                  value={newQuestion.text}
                  onChange={(e) =>
                    handleNewQuestionChange("text", e.target.value)
                  }
                  placeholder="Masukkan teks soal"
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Pilihan Jawaban</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Info className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Bobot adalah nilai persentase (0-100) untuk setiap
                          pilihan jawaban. Pilihan dengan bobot tertinggi
                          dianggap sebagai jawaban terbaik. Setidaknya satu
                          pilihan harus memiliki bobot lebih dari 0.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                {newQuestion.options.map((option, index) => (
                  <div key={index} className="grid grid-cols-4 gap-4">
                    <div className="col-span-3">
                      <Input
                        value={option.text}
                        onChange={(e) =>
                          handleNewOptionChange(index, "text", e.target.value)
                        }
                        placeholder={`Pilihan ${index + 1}`}
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={option.weight}
                        onChange={(e) =>
                          handleNewOptionChange(index, "weight", e.target.value)
                        }
                        placeholder="Bobot"
                        className="text-right"
                      />
                    </div>
                  </div>
                ))}
                <p className="text-sm text-muted-foreground">
                  Bobot adalah nilai persentase (0-100) untuk setiap pilihan
                  jawaban. Pilihan dengan bobot tertinggi dianggap sebagai
                  jawaban terbaik.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Batal
              </Button>
              <Button onClick={handleAddQuestion}>Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Soal</DialogTitle>
              <DialogDescription>
                Edit soal tes seleksi program magang
              </DialogDescription>
            </DialogHeader>
            {currentQuestion && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-question-text">Teks Soal</Label>
                  <Input
                    id="edit-question-text"
                    value={currentQuestion.text}
                    onChange={(e) =>
                      handleCurrentQuestionChange("text", e.target.value)
                    }
                    placeholder="Masukkan teks soal"
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Pilihan Jawaban</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Info className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Bobot adalah nilai persentase (0-100) untuk setiap
                            pilihan jawaban. Pilihan dengan bobot tertinggi
                            dianggap sebagai jawaban terbaik. Setidaknya satu
                            pilihan harus memiliki bobot lebih dari 0.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="grid grid-cols-4 gap-4">
                      <div className="col-span-3">
                        <Input
                          value={option.text}
                          onChange={(e) =>
                            handleCurrentOptionChange(
                              index,
                              "text",
                              e.target.value
                            )
                          }
                          placeholder={`Pilihan ${index + 1}`}
                        />
                      </div>
                      <div>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={option.weight}
                          onChange={(e) =>
                            handleCurrentOptionChange(
                              index,
                              "weight",
                              e.target.value
                            )
                          }
                          placeholder="Bobot"
                          className="text-right"
                        />
                      </div>
                    </div>
                  ))}
                  <p className="text-sm text-muted-foreground">
                    Bobot adalah nilai persentase (0-100) untuk setiap pilihan
                    jawaban. Pilihan dengan bobot tertinggi dianggap sebagai
                    jawaban terbaik.
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Batal
              </Button>
              <Button onClick={handleEditQuestion}>Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Soal</CardTitle>
          <CardDescription>
            Total {questions.length} soal tes seleksi
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : questions.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center space-y-2 text-center">
              <p className="text-muted-foreground">
                Belum ada soal yang ditambahkan
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Soal
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>Soal</TableHead>
                    <TableHead>Jumlah Pilihan</TableHead>
                    <TableHead>Bobot Tertinggi</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questions.map((question, index) => {
                    const maxWeightOption = getMaxWeightOption(question);
                    return (
                      <TableRow key={question.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">
                          {question.text}
                        </TableCell>
                        <TableCell>{question.options.length}</TableCell>
                        <TableCell>
                          {maxWeightOption ? (
                            <span className="font-medium">
                              {maxWeightOption.weight}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setCurrentQuestion(question);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => handleDeleteQuestion(question.id)}
                            >
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Hapus</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
