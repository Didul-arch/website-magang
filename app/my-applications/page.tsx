"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Briefcase,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  Play,
  FileCheck,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Link from "next/link";
import { useStore } from "@/lib/stores/user.store";
import Header from "@/components/header";

interface UserApplication {
  id: number;
  status: string;
  createdAt: string;
  cv: string | null;
  portfolio: string | null;
  vacancy: {
    id: number;
    title: string;
    location: string;
  };
  quiz: {
    hasAnswered: boolean;
    score: string | null;
    totalQuestions: number;
    answeredQuestions: number;
  };
}

interface Question {
  id: number;
  question: string;
  answers: Array<{
    id: number;
    answer: string;
    isCorrect: boolean;
  }>;
}

interface QuizSession {
  questions: Question[];
  applicationId: number;
  vacancyTitle: string;
}

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<UserApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [quizSession, setQuizSession] = useState<QuizSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [selectedApplicationDetails, setSelectedApplicationDetails] =
    useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const { toast } = useToast();
  const user = useStore((state) => state.user);

  useEffect(() => {
    if (user?.internship?.id) {
      fetchMyApplications();
    }
  }, [user]);

  const fetchMyApplications = async () => {
    if (!user?.internship?.id) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/internship/${user.internship.id}/applications`
      );

      if (!response.ok) {
        throw new Error("Gagal memuat lamaran");
      }

      const data = await response.json();
      setApplications(data.data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast({
        title: "Error",
        description: "Gagal memuat lamaran Anda",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicationDetails = async (applicationId: number) => {
    try {
      const response = await fetch(
        `/api/admin/application/${applicationId}/results`
      );

      if (!response.ok) {
        throw new Error("Gagal memuat detail lamaran");
      }

      const data = await response.json();
      setSelectedApplicationDetails(data.data);
      setIsDetailsModalOpen(true);
    } catch (error) {
      console.error("Error fetching application details:", error);
      toast({
        title: "Error",
        description: "Gagal memuat detail lamaran",
        variant: "destructive",
      });
    }
  };

  const startQuiz = async (applicationId: number, vacancyTitle: string) => {
    try {
      const response = await fetch(
        `/api/application/${applicationId}/questions`
      );

      if (!response.ok) {
        throw new Error("Gagal memuat pertanyaan kuis");
      }

      const data = await response.json();

      if (
        !data.data ||
        !data.data.questions ||
        data.data.questions.length === 0
      ) {
        toast({
          title: "Tidak Ada Pertanyaan",
          description:
            "Tidak ada pertanyaan kuis yang tersedia untuk lamaran ini",
          variant: "destructive",
        });
        return;
      }

      // Check if already answered
      if (data.data.hasAnswered) {
        toast({
          title: "Kuis Sudah Diselesaikan",
          description: `Anda sudah menyelesaikan kuis ini. Skor Anda: ${data.data.score}%`,
          variant: "destructive",
        });
        return;
      }

      console.log("Quiz questions fetched:", data.data);

      setQuizSession({
        questions: data.data.questions,
        applicationId,
        vacancyTitle,
      });
      setCurrentQuestionIndex(0);
      setAnswers({});
      setIsQuizModalOpen(true);
    } catch (error) {
      console.error("Error fetching quiz:", error);
      toast({
        title: "Error",
        description: "Gagal memulai kuis",
        variant: "destructive",
      });
    }
  };

  const handleAnswerSelect = (questionId: number, answerId: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }));
  };

  const nextQuestion = () => {
    if (
      quizSession &&
      currentQuestionIndex < quizSession.questions.length - 1
    ) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const submitQuiz = async () => {
    if (!quizSession) return;

    const unansweredQuestions = quizSession.questions.filter(
      (q) => !(q.id in answers)
    );

    if (unansweredQuestions.length > 0) {
      toast({
        title: "Kuis Belum Lengkap",
        description: `Silakan jawab semua pertanyaan. Tersisa ${unansweredQuestions.length} pertanyaan.`,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmittingQuiz(true);

      // Convert answers to the format expected by the API
      const formattedAnswers = Object.entries(answers).map(
        ([questionId, answerId]) => ({
          questionId: parseInt(questionId),
          answerId: answerId,
        })
      );

      const response = await fetch(
        `/api/application/${quizSession.applicationId}/submit-answers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ answers: formattedAnswers }),
        }
      );

      if (!response.ok) {
        throw new Error("Gagal mengirim kuis");
      }

      const result = await response.json();

      toast({
        title: "Kuis Dikirim",
        description: `Kuis Anda telah berhasil dikirim! Skor: ${result.data.score}%`,
      });

      setIsQuizModalOpen(false);
      setQuizSession(null);
      setAnswers({});
      setCurrentQuestionIndex(0);

      // Refresh applications to show updated quiz status
      fetchMyApplications();
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast({
        title: "Error",
        description: "Gagal mengirim kuis",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "reviewed":
        return "bg-blue-100 text-blue-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "reviewed":
        return <FileCheck className="h-4 w-4" />;
      case "accepted":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 font-semibold";
    if (score >= 60) return "text-yellow-600 font-semibold";
    return "text-red-600 font-semibold";
  };

  if (!user?.internship?.id) {
    return (
      <>
        <Header />
        <div className="container mx-auto p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Lamaran Saya</h1>
            <p className="text-gray-600">
              Silakan masuk untuk melihat lamaran Anda.
            </p>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memuat lamaran Anda...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Daftar Lamaran Saya</h1>
            <p className="text-gray-600 mt-2">
              Berikut adalah riwayat lamaran magang yang pernah Anda ajukan.
            </p>
          </div>
          <Button asChild>
            <Link href="/">
              <Briefcase className="h-4 w-4 mr-2" />
              Telusuri Magang
            </Link>
          </Button>
        </div>

        {/* Application Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Lamaran
                  </p>
                  <p className="text-2xl font-bold">{applications.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Menunggu</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {
                      applications.filter(
                        (app) => app.status.toLowerCase() === "pending"
                      ).length
                    }
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Diterima</p>
                  <p className="text-2xl font-bold text-green-600">
                    {
                      applications.filter(
                        (app) => app.status.toLowerCase() === "accepted"
                      ).length
                    }
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Kuis Diselesaikan
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {applications.filter((app) => app.quiz.hasAnswered).length}
                  </p>
                </div>
                <Award className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Applications List */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Lamaran Saya</CardTitle>
            <CardDescription>
              Berikut adalah riwayat lamaran magang yang pernah Anda ajukan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {applications.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Posisi</TableHead>
                    <TableHead>Lokasi</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Skor Tes</TableHead>
                    <TableHead>Tanggal Daftar</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div className="font-medium">
                          {application.vacancy.title}
                        </div>
                      </TableCell>
                      <TableCell>{application.vacancy.location}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(application.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(application.status)}
                            {application.status}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {application.quiz.hasAnswered ? (
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              <Award className="h-3 w-3 mr-1" />
                              Selesai
                            </Badge>
                            <span
                              className={getScoreColor(
                                parseFloat(application.quiz.score || "0")
                              )}
                            >
                              {application.quiz.score}%
                            </span>
                          </div>
                        ) : (
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            Menunggu
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(application.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {!application.quiz.hasAnswered && (
                            <Button
                              size="sm"
                              onClick={() =>
                                startQuiz(
                                  application.id,
                                  application.vacancy.title
                                )
                              }
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Mulai Kuis
                            </Button>
                          )}
                          {application.cv && (
                            <Button size="sm" variant="outline" asChild>
                              <a
                                href={application.cv}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                Lihat CV
                              </a>
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              fetchApplicationDetails(application.id)
                            }
                          >
                            Lihat Detail
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Briefcase className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">Belum Ada Lamaran</p>
                <p className="mb-4">
                  Anda belum mengajukan lamaran untuk magang manapun.
                </p>
                <Button asChild>
                  <Link href="/">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Telusuri Magang Tersedia
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quiz Modal */}
        <Dialog open={isQuizModalOpen} onOpenChange={setIsQuizModalOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Kuis: {quizSession?.vacancyTitle}</DialogTitle>
              <DialogDescription>
                Jawablah semua pertanyaan untuk menyelesaikan lamaran Anda.
                Pertanyaan {currentQuestionIndex + 1} dari{" "}
                {quizSession?.questions.length}
              </DialogDescription>
            </DialogHeader>

            {quizSession && (
              <div className="space-y-6">
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        ((currentQuestionIndex + 1) /
                          quizSession.questions.length) *
                        100
                      }%`,
                    }}
                  />
                </div>

                {/* Current Question */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-lg font-medium">
                      {currentQuestionIndex + 1}.{" "}
                      {quizSession.questions[currentQuestionIndex]?.question}
                    </Label>
                  </div>

                  <RadioGroup
                    value={
                      answers[
                        quizSession.questions[currentQuestionIndex]?.id
                      ]?.toString() || ""
                    }
                    onValueChange={(value) =>
                      handleAnswerSelect(
                        quizSession.questions[currentQuestionIndex]?.id,
                        parseInt(value)
                      )
                    }
                  >
                    {quizSession.questions[currentQuestionIndex]?.answers.map(
                      (answer) => (
                        <div
                          key={answer.id}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem
                            value={answer.id.toString()}
                            id={`answer-${answer.id}`}
                          />
                          <Label
                            htmlFor={`answer-${answer.id}`}
                            className="cursor-pointer"
                          >
                            {answer.answer}
                          </Label>
                        </div>
                      )
                    )}
                  </RadioGroup>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={previousQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    Sebelumnya
                  </Button>

                  <div className="flex gap-2">
                    {currentQuestionIndex < quizSession.questions.length - 1 ? (
                      <Button onClick={nextQuestion}>Selanjutnya</Button>
                    ) : (
                      <Button onClick={submitQuiz} disabled={isSubmittingQuiz}>
                        {isSubmittingQuiz ? "Mengirim..." : "Kirim Kuis"}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Question Navigation */}
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium mb-2 block">
                    Pertanyaan:
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {quizSession.questions.map((_, index) => (
                      <Button
                        key={index}
                        size="sm"
                        variant={
                          index === currentQuestionIndex
                            ? "default"
                            : answers[quizSession.questions[index]?.id]
                            ? "secondary"
                            : "outline"
                        }
                        onClick={() => setCurrentQuestionIndex(index)}
                        className="w-10 h-10"
                      >
                        {index + 1}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Application Details Modal */}
        <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detail Lamaran</DialogTitle>
              <DialogDescription>
                Detail lengkap lamaran dan hasil kuis
              </DialogDescription>
            </DialogHeader>

            {selectedApplicationDetails && (
              <div className="space-y-6">
                {/* Application Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Informasi Lamaran
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <Label className="text-sm font-medium">Posisi:</Label>
                        <p className="text-sm">
                          {selectedApplicationDetails.vacancy?.title}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Lokasi:</Label>
                        <p className="text-sm">
                          {selectedApplicationDetails.vacancy?.location}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Status:</Label>
                        <Badge
                          className={getStatusColor(
                            selectedApplicationDetails.application?.status
                          )}
                        >
                          {selectedApplicationDetails.application?.status}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">
                          Tanggal Daftar:
                        </Label>
                        <p className="text-sm">
                          {new Date(
                            selectedApplicationDetails.application?.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Hasil Kuis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {selectedApplicationDetails.quiz?.hasAnswered ? (
                        <>
                          <div>
                            <Label className="text-sm font-medium">Skor:</Label>
                            <p
                              className={`text-lg font-bold ${getScoreColor(
                                parseFloat(
                                  selectedApplicationDetails.quiz.score
                                )
                              )}`}
                            >
                              {selectedApplicationDetails.quiz.score}%
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">
                              Jawaban Benar:
                            </Label>
                            <p className="text-sm">
                              {selectedApplicationDetails.quiz.correctAnswers}{" "}
                              dari{" "}
                              {selectedApplicationDetails.quiz.totalQuestions}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">
                              Status:
                            </Label>
                            <Badge variant="secondary">
                              <Award className="h-3 w-3 mr-1" />
                              Selesai
                            </Badge>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-500">
                            Kuis belum diselesaikan
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Quiz Details */}
                {selectedApplicationDetails.quiz?.hasAnswered &&
                  selectedApplicationDetails.quiz?.details && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Detail Jawaban Kuis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {selectedApplicationDetails.quiz.details.map(
                            (detail: any, index: number) => (
                              <div
                                key={detail.questionId}
                                className="border-b pb-4"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <Label className="text-sm font-medium">
                                      {index + 1}. {detail.question}
                                    </Label>
                                    <div className="mt-2 space-y-1">
                                      <div
                                        className={`text-sm p-2 rounded ${
                                          detail.isCorrect
                                            ? "bg-green-50 text-green-800"
                                            : "bg-red-50 text-red-800"
                                        }`}
                                      >
                                        Jawaban Anda: {detail.selectedAnswer}
                                      </div>
                                      {!detail.isCorrect && (
                                        <div className="text-sm p-2 rounded bg-gray-50 text-gray-700">
                                          Jawaban Benar: {detail.correctAnswer}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <Badge
                                    variant={
                                      detail.isCorrect
                                        ? "default"
                                        : "destructive"
                                    }
                                  >
                                    {detail.isCorrect ? (
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                    ) : (
                                      <XCircle className="h-3 w-3 mr-1" />
                                    )}
                                    {detail.isCorrect ? "Benar" : "Salah"}
                                  </Badge>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                {/* Files */}
                {(selectedApplicationDetails.application?.cv ||
                  selectedApplicationDetails.application?.portfolio) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Dokumen Lamaran</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-4">
                        {selectedApplicationDetails.application?.cv && (
                          <Button size="sm" variant="outline" asChild>
                            <a
                              href={selectedApplicationDetails.application.cv}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Lihat CV
                            </a>
                          </Button>
                        )}
                        {selectedApplicationDetails.application?.portfolio && (
                          <Button size="sm" variant="outline" asChild>
                            <a
                              href={
                                selectedApplicationDetails.application.portfolio
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Briefcase className="h-4 w-4 mr-1" />
                              Lihat Portfolio
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
