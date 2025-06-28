"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  FileText,
  Briefcase,
  Award,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
  totalQuestions: number;
  totalVacancies: number;
  completedQuizzes: number;
  averageScore: number;
}

interface RecentApplication {
  id: number;
  applicant: {
    name: string;
    email: string;
  };
  vacancy: {
    title: string;
  };
  status: string;
  createdAt: string;
  quiz: {
    hasAnswered: boolean;
    score: string | null;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0,
    totalQuestions: 0,
    totalVacancies: 0,
    completedQuizzes: 0,
    averageScore: 0,
  });
  const [recentApplications, setRecentApplications] = useState<
    RecentApplication[]
  >([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch applications data
      const [applicationsRes, questionsRes, vacanciesRes] = await Promise.all([
        fetch("/api/admin/applications?limit=1000"),
        fetch("/api/admin/questions?limit=1000"),
        fetch("/api/admin/vacancy?limit=1000"),
      ]);

      const [applicationsData, questionsData, vacanciesData] =
        await Promise.all([
          applicationsRes.json(),
          questionsRes.json(),
          vacanciesRes.json(),
        ]);

      if (applicationsRes.ok && questionsRes.ok && vacanciesRes.ok) {
        const applications = applicationsData.data;
        const questions = questionsData.data;
        const vacancies = vacanciesData.data;

        // Calculate stats
        const completedQuizzes = applications.filter(
          (app: any) => app.quiz.hasAnswered
        );
        const averageScore =
          completedQuizzes.length > 0
            ? completedQuizzes.reduce(
                (sum: number, app: any) =>
                  sum + parseFloat(app.quiz.score || "0"),
                0
              ) / completedQuizzes.length
            : 0;

        setStats({
          totalApplications: applications.length,
          pendingApplications: applications.filter(
            (app: any) => app.status === "PENDING"
          ).length,
          acceptedApplications: applications.filter(
            (app: any) => app.status === "ACCEPTED"
          ).length,
          rejectedApplications: applications.filter(
            (app: any) => app.status === "REJECTED"
          ).length,
          totalQuestions: questions.length,
          totalVacancies: vacancies.length,
          completedQuizzes: completedQuizzes.length,
          averageScore: Math.round(averageScore),
        });

        // Set recent applications (last 5)
        setRecentApplications(applications.slice(0, 5));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Overview of internship applications and system statistics
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/admin/questions">
              <Plus className="h-4 w-4 mr-2" />
              Add Questions
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/applications">View All Applications</Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Applications
                </p>
                <p className="text-2xl font-bold">{stats.totalApplications}</p>
                <p className="text-xs text-gray-500 mt-1">
                  +{stats.pendingApplications} pending review
                </p>
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
                  Active Vacancies
                </p>
                <p className="text-2xl font-bold">{stats.totalVacancies}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.totalQuestions} questions total
                </p>
              </div>
              <Briefcase className="h-8 w-8 text-green-600" />
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
                <p className="text-2xl font-bold">{stats.completedQuizzes}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {Math.round(
                    (stats.completedQuizzes / (stats.totalApplications || 1)) *
                      100
                  )}
                  % completion rate
                </p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Average Quiz Score
                </p>
                <p
                  className={`text-2xl font-bold ${getScoreColor(
                    stats.averageScore
                  )}`}
                >
                  {stats.averageScore}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Across all completed quizzes
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Application Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Review
                </p>
                <p className="text-3xl font-bold text-yellow-600">
                  {stats.pendingApplications}
                </p>
              </div>
              <Clock className="h-10 w-10 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Accepted</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.acceptedApplications}
                </p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-3xl font-bold text-red-600">
                  {stats.rejectedApplications}
                </p>
              </div>
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Recent Applications
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/applications">View All</Link>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentApplications.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Vacancy</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Quiz</TableHead>
                  <TableHead>Applied</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentApplications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {application.applicant.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {application.applicant.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {application.vacancy.title}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(application.status)}>
                        {application.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {application.quiz.hasAnswered ? (
                        <span
                          className={getScoreColor(
                            parseFloat(application.quiz.score || "0")
                          )}
                        >
                          {application.quiz.score}%
                        </span>
                      ) : (
                        <span className="text-gray-400">Pending</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {new Date(application.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No applications yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
