"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, BrainCircuit, FileText } from "lucide-react";

interface AnalysisResult {
  cv_match_analysis: string;
  reason_match_analysis: string;
  overall_recommendation: "RECOMMENDED" | "NOT_RECOMMENDED";
  recommendation_reason: string;
}

interface AnalysisResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: AnalysisResult | null;
  applicantName: string;
}

export function AnalysisResultModal({
  isOpen,
  onClose,
  result,
  applicantName,
}: AnalysisResultModalProps) {
  if (!result) return null;

  const isRecommended = result.overall_recommendation === "RECOMMENDED";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-primary" />
            Analisis AI untuk {applicantName}
          </DialogTitle>
          <DialogDescription>
            Berikut adalah hasil analisis kecocokan kandidat berdasarkan data
            yang diberikan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Kecocokan CV dengan Deskripsi Posisi
            </h3>
            <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-md">
              {result.cv_match_analysis}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Analisis Alasan Melamar
            </h3>
            <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-md">
              {result.reason_match_analysis}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Rekomendasi Keseluruhan</h3>
            <div className="flex items-center gap-4">
              <Badge
                variant={isRecommended ? "secondary" : "destructive"}
                className="text-base px-4 py-2"
              >
                {isRecommended ? (
                  <ThumbsUp className="h-5 w-5 mr-2" />
                ) : (
                  <ThumbsDown className="h-5 w-5 mr-2" />
                )}
                {result.overall_recommendation === "RECOMMENDED"
                  ? "Direkomendasikan"
                  : "Tidak Direkomendasikan"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground italic border-l-4 pl-3">
              {result.recommendation_reason}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Tutup</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
