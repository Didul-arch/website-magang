"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Download,
  FileText,
  Briefcase,
  Award,
  Search,
} from "lucide-react";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ApplicationQuizResult {
  hasAnswered: boolean;
  totalAnswers: number;
  correctAnswers: number;
  score: string | null;
}

interface Application {
  id: number;
  status: string;
  createdAt: string;
  applicant: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    company: string;
    degree: string;
    semester: number;
  };
  vacancy: {
    id: number;
    title: string;
    location: string;
  };
  quiz: ApplicationQuizResult;
  files: {
    cv: string | null;
    portfolio: string | null;
  };
}

interface ApplicationDetails {
  application: {
    id: number;
    status: string;
    createdAt: string;
    cv: string | null;
    portfolio: string | null;
    reason: string | null;
  };
  applicant: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    company: string;
    degree: string;
    semester: number;
  };
  vacancy: {
    id: number;
    title: string;
    description: string;
    location: string;
  };
  quiz: {
    totalQuestions: number;
    answeredQuestions: number;
    correctAnswers: number;
    score: string;
    hasAnswered: boolean;
    details: Array<{
      questionId: number;
      question: string;
      selectedAnswerId: number;
      selectedAnswer: string;
      isCorrect: boolean;
      correctAnswer: string;
    }>;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [vacancyFilter, setVacancyFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationDetails | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({ status: "", reason: "" });
  const [vacancies, setVacancies] = useState<
    Array<{ id: number; title: string }>
  >([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();
    fetchVacancies();
  }, [pagination.page, statusFilter, vacancyFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (statusFilter && statusFilter !== "ALL") {
        params.append("status", statusFilter);
      }
      if (vacancyFilter && vacancyFilter !== "ALL") {
        params.append("vacancyId", vacancyFilter);
      }

      const response = await fetch(`/api/admin/applications?${params}`);
      const data = await response.json();

      if (response.ok) {
        setApplications(data.data);
        setPagination(data.pagination);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch applications",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch applications",
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

  const fetchApplicationDetails = async (applicationId: number) => {
    try {
      const response = await fetch(
        `/api/admin/application/${applicationId}/results`
      );
      const data = await response.json();

      if (response.ok) {
        setSelectedApplication(data.data);
        setIsDetailModalOpen(true);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch application details",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch application details",
        variant: "destructive",
      });
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedApplication || !statusUpdate.status) {
      toast({
        title: "Error",
        description: "Please select a status",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/application/${selectedApplication.application.id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(statusUpdate),
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: "Application status updated successfully",
        });
        setIsStatusModalOpen(false);
        setIsDetailModalOpen(false);
        setStatusUpdate({ status: "", reason: "" });
        fetchApplications();
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.message || "Failed to update application status",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 font-semibold";
    if (score >= 60) return "text-yellow-600 font-semibold";
    return "text-red-600 font-semibold";
  };

  const filteredApplications = applications.filter(
    (app) =>
      app.applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.vacancy.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Applications Management</h1>
          <p className="text-gray-600 mt-2">
            Review internship applications and quiz results
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Applications
                </p>
                <p className="text-2xl font-bold">{pagination.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Review
                </p>
                <p className="text-2xl font-bold">
                  {
                    applications.filter((app) => app.status === "PENDING")
                      .length
                  }
                </p>
              </div>
              <Briefcase className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Completed Quizzes
                </p>
                <p className="text-2xl font-bold">
                  {applications.filter((app) => app.quiz.hasAnswered).length}
                </p>
              </div>
              <Award className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Avg Quiz Score
                </p>
                <p className="text-2xl font-bold">
                  {applications.filter((app) => app.quiz.hasAnswered).length > 0
                    ? Math.round(
                        applications
                          .filter((app) => app.quiz.hasAnswered)
                          .reduce(
                            (sum, app) =>
                              sum + parseFloat(app.quiz.score || "0"),
                            0
                          ) /
                          applications.filter((app) => app.quiz.hasAnswered)
                            .length
                      )
                    : 0}
                  %
                </p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="REVIEWED">Reviewed</SelectItem>
                <SelectItem value="ACCEPTED">Accepted</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={vacancyFilter} onValueChange={setVacancyFilter}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Filter by vacancy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Vacancies</SelectItem>
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

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Applications List ({pagination.total} total)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Vacancy</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Quiz Score</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {application.applicant.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {application.applicant.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {application.applicant.company} -{" "}
                          {application.applicant.degree}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {application.vacancy.title}
                        </div>
                        <div className="text-sm text-gray-600">
                          {application.vacancy.location}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(application.status)}>
                        {application.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {application.quiz.hasAnswered ? (
                        <div>
                          <span
                            className={getScoreColor(
                              parseFloat(application.quiz.score || "0")
                            )}
                          >
                            {application.quiz.score}%
                          </span>
                          <div className="text-sm text-gray-600">
                            {application.quiz.correctAnswers}/
                            {application.quiz.totalAnswers} correct
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Not completed</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {new Date(application.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => fetchApplicationDetails(application.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
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

      {/* Application Details Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Complete application information and quiz results
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Applicant Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <strong>Name:</strong>{" "}
                        {selectedApplication.applicant.name}
                      </div>
                      <div>
                        <strong>Email:</strong>{" "}
                        {selectedApplication.applicant.email}
                      </div>
                      <div>
                        <strong>Phone:</strong>{" "}
                        {selectedApplication.applicant.phoneNumber}
                      </div>
                      <div>
                        <strong>Company:</strong>{" "}
                        {selectedApplication.applicant.company}
                      </div>
                      <div>
                        <strong>Degree:</strong>{" "}
                        {selectedApplication.applicant.degree}
                      </div>
                      <div>
                        <strong>Semester:</strong>{" "}
                        {selectedApplication.applicant.semester}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Application Info</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <strong>Vacancy:</strong>{" "}
                        {selectedApplication.vacancy.title}
                      </div>
                      <div>
                        <strong>Location:</strong>{" "}
                        {selectedApplication.vacancy.location}
                      </div>
                      <div>
                        <strong>Applied:</strong>{" "}
                        {new Date(
                          selectedApplication.application.createdAt
                        ).toLocaleDateString()}
                      </div>
                      <div>
                        <strong>Status:</strong>
                        <Badge
                          className={`ml-2 ${getStatusColor(
                            selectedApplication.application.status
                          )}`}
                        >
                          {selectedApplication.application.status}
                        </Badge>
                      </div>
                      <div className="flex gap-2 mt-3">
                        {selectedApplication.application.cv && (
                          <Button size="sm" variant="outline" asChild>
                            <a
                              href={selectedApplication.application.cv}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              CV
                            </a>
                          </Button>
                        )}
                        {selectedApplication.application.portfolio && (
                          <Button size="sm" variant="outline" asChild>
                            <a
                              href={selectedApplication.application.portfolio}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Portfolio
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quiz Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quiz Results</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedApplication.quiz.hasAnswered ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">
                            {selectedApplication.quiz.totalQuestions}
                          </div>
                          <div className="text-sm text-gray-600">
                            Total Questions
                          </div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            {selectedApplication.quiz.correctAnswers}
                          </div>
                          <div className="text-sm text-gray-600">
                            Correct Answers
                          </div>
                        </div>
                        <div>
                          <div
                            className={`text-2xl font-bold ${getScoreColor(
                              parseFloat(selectedApplication.quiz.score)
                            )}`}
                          >
                            {selectedApplication.quiz.score}%
                          </div>
                          <div className="text-sm text-gray-600">
                            Final Score
                          </div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-purple-600">
                            {selectedApplication.quiz.answeredQuestions}
                          </div>
                          <div className="text-sm text-gray-600">Answered</div>
                        </div>
                      </div>

                      {/* Quiz Details */}
                      <div className="mt-6">
                        <h4 className="font-medium mb-3">Answer Details:</h4>
                        <div className="space-y-3">
                          {selectedApplication.quiz.details.map(
                            (detail, index) => (
                              <div
                                key={index}
                                className="border rounded-lg p-3"
                              >
                                <div className="font-medium mb-2">
                                  Q{index + 1}: {detail.question}
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-600">
                                      Selected:
                                    </span>
                                    <span
                                      className={`ml-2 ${
                                        detail.isCorrect
                                          ? "text-green-600"
                                          : "text-red-600"
                                      }`}
                                    >
                                      {detail.selectedAnswer}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">
                                      Correct Answer:
                                    </span>
                                    <span className="ml-2 text-green-600">
                                      {detail.correctAnswer}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Quiz has not been completed yet
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <Button
                  onClick={() => {
                    setStatusUpdate({
                      status: selectedApplication.application.status,
                      reason: selectedApplication.application.reason || "",
                    });
                    setIsStatusModalOpen(true);
                  }}
                >
                  Update Status
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Update Modal */}
      <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Application Status</DialogTitle>
            <DialogDescription>
              Change the status of this application and optionally add a reason
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={statusUpdate.status}
                onValueChange={(value) =>
                  setStatusUpdate((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="REVIEWED">Reviewed</SelectItem>
                  <SelectItem value="ACCEPTED">Accepted</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Textarea
                id="reason"
                placeholder="Add a reason for this status change..."
                value={statusUpdate.reason}
                onChange={(e) =>
                  setStatusUpdate((prev) => ({
                    ...prev,
                    reason: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsStatusModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate}>Update Status</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
