"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";

interface Answer {
  id: number;
  answer: string;
}

interface Question {
  id: number;
  question: string;
  answers: Answer[];
}

export default function TestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("id");
  const { toast } = useToast();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [testStatus, setTestStatus] = useState<"LOADING" | "NOT_STARTED" | "COMPLETED" | "INVALID">("LOADING");
  const [score, setScore] = useState<number | null>(null);
  const [vacancyTitle, setVacancyTitle] = useState<string>("");

  useEffect(() => {
    if (!applicationId) {
        setTestStatus("INVALID");
        return;
    }
    fetchTestStatus();
  }, [applicationId]);

  const fetchTestStatus = async () => {
    try {
      const res = await fetch(`/api/application/${applicationId}/questions`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch test status");
      }

      setVacancyTitle(data.data.vacancyTitle || "");

      if (data.data.hasAnswered) {
        setTestStatus("COMPLETED");
        setScore(data.data.score);
      } else {
        setTestStatus("NOT_STARTED");
        setQuestions(data.data.questions || []);
      }
    } catch (error) {
        console.error(error);
        setTestStatus("INVALID");
        toast({ title: "Error", description: "Could not load the test. The application might be invalid.", variant: "destructive" });
    } 
  };

  const handleSelect = (questionId: number, answerId: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answerId }));
  };

  const handleSubmit = async () => {
    if (Object.keys(selectedAnswers).length !== questions.length) {
      toast({ title: "Error", description: "Please answer all questions", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        answers: Object.entries(selectedAnswers).map(([questionId, answerId]) => ({
          questionId: Number(questionId),
          answerId: Number(answerId),
        })),
      };
      const res = await fetch(`/api/application/${applicationId}/submit-answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "Success", description: "Test submitted!" });
        setScore(parseFloat(data.data?.score));
        setTestStatus("COMPLETED");
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to submit answers", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (testStatus === "LOADING") {
    return <div className="container mx-auto p-6 text-center">Loading test...</div>;
  }

  if (testStatus === "INVALID" || !applicationId) {
    return <div className="container mx-auto p-6 text-center text-red-600">Application not found or invalid. Please return to the dashboard.</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>{vacancyTitle || "Internship Test"}</CardTitle>
        </CardHeader>
        <CardContent>
          {testStatus === "COMPLETED" ? (
            <div className="py-8 text-center">
              <div className="text-2xl font-bold mb-2">Test Completed</div>
              {score !== null && <div className="text-lg">Your Score: {score.toFixed(2)}</div>}
              <Button className="mt-4" onClick={() => router.push("/application")}>Back to My Applications</Button>
            </div>
          ) : questions.length === 0 ? (
            <div className="py-8 text-center">No questions are available for this position.</div>
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
                    onValueChange={(val) => handleSelect(q.id, Number(val))}
                  >
                    {q.answers.map((a) => (
                      <div key={a.id} className="flex items-center gap-2">
                        <RadioGroupItem value={a.id.toString()} id={`q${q.id}_a${a.id}`} />
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
    </div>
  );
}
