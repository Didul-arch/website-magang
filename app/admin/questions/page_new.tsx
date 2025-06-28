"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface Answer {
  id: number;
  answer: string;
  isCorrect: boolean;
}

interface Question {
  id: number;
  question: string;
  answer: string;
  createdAt: string;
  vacancy: {
    id: number;
    title: string;
  };
  answers: Answer[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface QuestionFormData {
  question: string;
  vacancyId: number;
  answers: Array<{
    answer: string;
    isCorrect: boolean;
  }>;
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [vacancyFilter, setVacancyFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [vacancies, setVacancies] = useState<
    Array<{ id: number; title: string }>
  >([]);
  const [formData, setFormData] = useState<QuestionFormData>({
    question: "",
    vacancyId: 0,
    answers: [
      { answer: "", isCorrect: false },
      { answer: "", isCorrect: false },
      { answer: "", isCorrect: false },
      { answer: "", isCorrect: false },
    ],
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchQuestions();
    fetchVacancies();
  }, [pagination.page, vacancyFilter]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (vacancyFilter) {
        params.append("vacancyId", vacancyFilter);
      }

      const response = await fetch(`/api/admin/questions?${params}`);
      const data = await response.json();

      if (response.ok) {
        setQuestions(data.data);
        setPagination(data.pagination);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch questions",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch questions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchVacancies = async () => {
    try {
      const response = await fetch("/api/admin/vacancy");
      const data = await response.json();
      if (response.ok) {
        setVacancies(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch vacancies:", error);
    }
  };

  const handleCreate = () => {
    setSelectedQuestion(null);
    setFormData({
      question: "",
      vacancyId: 0,
      answers: [
        { answer: "", isCorrect: false },
        { answer: "", isCorrect: false },
        { answer: "", isCorrect: false },
        { answer: "", isCorrect: false },
      ],
    });
    setIsModalOpen(true);
  };

  const handleEdit = (question: Question) => {
    setSelectedQuestion(question);
    setFormData({
      question: question.question,
      vacancyId: question.vacancy.id,
      answers: question.answers.map((a) => ({
        answer: a.answer,
        isCorrect: a.isCorrect,
      })),
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (questionId: number) => {
    if (!confirm("Are you sure you want to delete this question?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Question deleted successfully",
        });
        fetchQuestions();
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.message || "Failed to delete question",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.question.trim()) {
      toast({
        title: "Error",
        description: "Question is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.vacancyId) {
      toast({
        title: "Error",
        description: "Please select a vacancy",
        variant: "destructive",
      });
      return;
    }

    const validAnswers = formData.answers.filter((a) => a.answer.trim());
    if (validAnswers.length < 2) {
      toast({
        title: "Error",
        description: "At least 2 answers are required",
        variant: "destructive",
      });
      return;
    }

    const correctAnswers = validAnswers.filter((a) => a.isCorrect);
    if (correctAnswers.length !== 1) {
      toast({
        title: "Error",
        description: "Exactly one answer must be marked as correct",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        question: formData.question,
        vacancyId: formData.vacancyId,
        answers: validAnswers,
      };

      const url = selectedQuestion
        ? `/api/admin/questions/${selectedQuestion.id}`
        : "/api/admin/questions";

      const method = selectedQuestion ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Question ${
            selectedQuestion ? "updated" : "created"
          } successfully`,
        });
        setIsModalOpen(false);
        fetchQuestions();
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description:
            data.message ||
            `Failed to ${selectedQuestion ? "update" : "create"} question`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${
          selectedQuestion ? "update" : "create"
        } question`,
        variant: "destructive",
      });
    }
  };

  const handleAnswerChange = (
    index: number,
    field: "answer" | "isCorrect",
    value: string | boolean
  ) => {
    const updatedAnswers = [...formData.answers];
    if (field === "isCorrect" && value === true) {
      // Only allow one correct answer
      updatedAnswers.forEach((answer, i) => {
        answer.isCorrect = i === index;
      });
    } else {
      updatedAnswers[index] = { ...updatedAnswers[index], [field]: value };
    }
    setFormData({ ...formData, answers: updatedAnswers });
  };

  const addAnswer = () => {
    setFormData({
      ...formData,
      answers: [...formData.answers, { answer: "", isCorrect: false }],
    });
  };

  const removeAnswer = (index: number) => {
    if (formData.answers.length > 2) {
      const updatedAnswers = formData.answers.filter((_, i) => i !== index);
      setFormData({ ...formData, answers: updatedAnswers });
    }
  };

  const filteredQuestions = questions.filter(
    (question) =>
      question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.vacancy.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Questions Management</h1>
          <p className="text-gray-600 mt-2">
            Manage questions and answers for internship applications
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Question
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={vacancyFilter} onValueChange={setVacancyFilter}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Filter by vacancy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Vacancies</SelectItem>
                {vacancies.map((vacancy) => (
                  <SelectItem key={vacancy.id} value={vacancy.id.toString()}>
                    {vacancy.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Questions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Questions List ({pagination.total} total)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Vacancy</TableHead>
                  <TableHead>Answers</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuestions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell className="max-w-md">
                      <div className="truncate">{question.question}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{question.vacancy.title}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {question.answers.length} options
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {new Date(question.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(question)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(question.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} results
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
                disabled={pagination.page <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
                disabled={pagination.page >= pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedQuestion ? "Edit Question" : "Create New Question"}
            </DialogTitle>
            <DialogDescription>
              {selectedQuestion
                ? "Edit the question and its answers"
                : "Create a new question with multiple choice answers"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Question Text */}
            <div>
              <Label htmlFor="question">Question</Label>
              <Textarea
                id="question"
                placeholder="Enter your question here..."
                value={formData.question}
                onChange={(e) =>
                  setFormData({ ...formData, question: e.target.value })
                }
                className="mt-1"
              />
            </div>

            {/* Vacancy Selection */}
            <div>
              <Label htmlFor="vacancy">Vacancy</Label>
              <Select
                value={formData.vacancyId.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, vacancyId: parseInt(value) })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a vacancy" />
                </SelectTrigger>
                <SelectContent>
                  {vacancies.map((vacancy) => (
                    <SelectItem key={vacancy.id} value={vacancy.id.toString()}>
                      {vacancy.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Answers */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Answers</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAnswer}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Answer
                </Button>
              </div>

              <div className="space-y-3">
                {formData.answers.map((answer, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <Input
                        placeholder={`Answer ${index + 1}`}
                        value={answer.answer}
                        onChange={(e) =>
                          handleAnswerChange(index, "answer", e.target.value)
                        }
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={answer.isCorrect}
                        onCheckedChange={(checked) =>
                          handleAnswerChange(index, "isCorrect", checked)
                        }
                      />
                      <span className="text-sm">Correct</span>
                    </div>
                    {formData.answers.length > 2 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeAnswer(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {selectedQuestion ? "Update" : "Create"} Question
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
