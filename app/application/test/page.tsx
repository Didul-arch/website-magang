"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import useApi from "@/hooks/useApi";
import { Suspense, useEffect, useState } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Question {
  id: number;
  question: string;
  answers: {
    id: number;
    answer: string;
  }[];
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="text-lg text-muted-foreground">Loading...</div>
        </div>
      }
    >
      <TestPage />
    </Suspense>
  );
}

function TestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("id");
  const { toast } = useToast();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: number]: number;
  }>({});
  const [submitting, setSubmitting] = useState(false);
  const [testStatus, setTestStatus] = useState<
    "LOADING" | "NOT_STARTED" | "COMPLETED" | "INVALID"
  >("LOADING");
  const [vacancyTitle, setVacancyTitle] = useState<string>("");
  const [sopConfirmed, setSopConfirmed] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      if (!applicationId) {
        setTestStatus("INVALID");
        return;
      }
      try {
        // 1. Check eligibility
        const statusRes = await fetch(
          `/api/application/status?id=${applicationId}`
        );
        const statusJson = await statusRes.json();
        const statusData = statusJson.data;
        if (!statusRes.ok || !statusData?.canTakeTest) {
          setTestStatus("INVALID");
          toast({
            title: "Error",
            description:
              statusData?.message || "You are not eligible to take this test.",
            variant: "destructive",
          });
          return;
        }
        // 2. Fetch questions
        const res = await fetch(`/api/application/${applicationId}/questions`);
        const data = await res.json();
        if (!res.ok || !data.data?.questions) {
          setTestStatus("INVALID");
          toast({
            title: "Error",
            description: data.message || "Could not load the test.",
            variant: "destructive",
          });
          return;
        }
        setVacancyTitle(data.data.vacancyTitle || "");
        if (data.data.hasAnswered) {
          setTestStatus("COMPLETED");
        } else {
          setTestStatus("NOT_STARTED");
          setQuestions(data.data.questions || []);
        }
      } catch (error) {
        setTestStatus("INVALID");
        toast({
          title: "Error",
          description:
            "Could not load the test. The application might be invalid.",
          variant: "destructive",
        });
      }
    };
    checkStatus();
  }, [applicationId]);

  const handleSelect = (questionId: number, answerId: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answerId }));
  };

  const handleSubmit = async () => {
    if (Object.keys(selectedAnswers).length !== questions.length) {
      toast({
        title: "Error",
        description: "Please answer all questions",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        answers: Object.entries(selectedAnswers).map(
          ([questionId, answerId]) => ({
            questionId: Number(questionId),
            answerId: Number(answerId),
          })
        ),
      };
      const res = await fetch(
        `/api/application/${applicationId}/submit-answers`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast({ title: "Success", description: "Test submitted!" });
        setTestStatus("COMPLETED");
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to submit answers",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (testStatus === "LOADING") {
    return (
      <div className="container mx-auto p-6 text-center">Loading test...</div>
    );
  }

  if (testStatus === "INVALID" || !applicationId) {
    return (
      <div className="container mx-auto p-6 text-center text-red-600">
        Application not found or invalid. Please return to the dashboard.
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>{vacancyTitle || "Internship Test"}</CardTitle>
        </CardHeader>
        <CardContent>
          {testStatus === "COMPLETED" ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold">Tes Selesai</h2>
              <p className="text-muted-foreground mt-2">
                Jawaban Anda telah berhasil dikirim. Silakan tunggu informasi
                selanjutnya melalui email.
              </p>
              <Button className="mt-4" onClick={() => router.push("/")}>
                Kembali ke Beranda
              </Button>
            </div>
          ) : !sopConfirmed ? (
            <div className="py-8 text-center">
              <h2 className="text-xl font-bold mb-4">
                Standard Operating Procedure (SOP)
              </h2>
              <div className="text-left mx-auto max-w-2xl space-y-4 mb-6 bg-muted p-4 rounded-lg">
                <p>
                  1. Please ensure you have a stable internet connection before
                  starting.
                </p>
                <p>2. Once you begin, you cannot pause or restart the test.</p>
                <p>
                  3. Do not open other browser tabs or applications, as this may
                  invalidate your session.
                </p>
                <p>
                  4. Your final score will not be displayed. We will contact you
                  regarding the results.
                </p>
              </div>
              <Button onClick={() => setShowConfirmDialog(true)}>
                I Understand, Start the Test
              </Button>
            </div>
          ) : questions.length === 0 ? (
            <div className="py-8 text-center">
              No questions are available for this position.
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="space-y-8"
            >
              {questions.map((q, idx) => (
                <div key={q.id} className="space-y-2">
                  <div className="font-medium">
                    {idx + 1}. {q.question}
                  </div>
                  <RadioGroup
                    value={selectedAnswers[q.id]?.toString() || ""}
                    onValueChange={(val: string) =>
                      handleSelect(q.id, Number(val))
                    }
                    className="space-y-2"
                  >
                    {q.answers.map((a) => (
                      <div key={a.id} className="flex items-center gap-2">
                        <RadioGroupItem
                          value={a.id.toString()}
                          id={`q${q.id}_a${a.id}`}
                        />
                        <label htmlFor={`q${q.id}_a${a.id}`}>{a.answer}</label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Submitting..." : "Submit Answers"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you ready to begin?</AlertDialogTitle>
            <AlertDialogDescription>
              The test will start immediately after you continue. Make sure you
              are prepared.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setSopConfirmed(true);
                setShowConfirmDialog(false);
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
