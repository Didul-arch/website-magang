"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface SopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => void;
}

export default function SopModal({ isOpen, onClose, onAgree }: SopModalProps) {
  const [hasAgreed, setHasAgreed] = useState(false);

  const handleAgreeAndContinue = () => {
    if (hasAgreed) {
      onAgree();
    }
  };

  // Reset state ketika modal ditutup/dibuka kembali
  React.useEffect(() => {
    if (isOpen) {
      setHasAgreed(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Standar Operasional Prosedur (SOP) Tes</DialogTitle>
          <DialogDescription>
            Harap baca dan pahami SOP berikut sebelum melanjutkan ke tes.
          </DialogDescription>
        </DialogHeader>
        <div className="prose prose-sm max-w-none max-h-[400px] overflow-y-auto py-4">
          {/* Ganti dengan isi SOP Anda */}
          <h3>1. Persiapan</h3>
          <p>
            Pastikan koneksi internet Anda stabil. Gunakan browser versi terbaru
            (Chrome, Firefox, atau Edge direkomendasikan).
          </p>
          <h3>2. Waktu Pengerjaan</h3>
          <p>
            Tes akan berlangsung selama X menit. Waktu akan mulai dihitung saat
            Anda memulai tes.
          </p>
          <h3>3. Kejujuran</h3>
          <p>
            Dilarang bekerja sama, membuka tab lain, atau menggunakan bantuan
            dari pihak manapun selama tes berlangsung. Pelanggaran akan
            mengakibatkan diskualifikasi.
          </p>
          <h3>4. Teknis</h3>
          <p>
            Jika terjadi kendala teknis, segera hubungi panitia. Jawaban yang
            sudah tersimpan tidak akan hilang jika koneksi terputus sementara.
          </p>
          {/* Tambahkan poin SOP lainnya di sini */}
        </div>
        <div className="flex items-center space-x-2 pt-4">
          <Checkbox
            id="agree-sop"
            checked={hasAgreed}
            onCheckedChange={(checked) => setHasAgreed(checked as boolean)}
          />
          <Label htmlFor="agree-sop" className="text-sm font-medium">
            Saya telah membaca, memahami, dan setuju dengan SOP pengerjaan tes.
          </Label>
        </div>
        <DialogFooter className="pt-6">
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={handleAgreeAndContinue} disabled={!hasAgreed}>
            Setuju & Lanjutkan ke Tes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}