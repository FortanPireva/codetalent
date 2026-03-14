"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  ExperienceLevel,
  EmploymentType,
  WorkArrangement,
  JobUrgency,
  JobStatus,
} from "@codetalent/db";
import {
  jobStatusLabels,
  jobStatusColors,
  experienceLevelLabels,
  employmentTypeLabels,
  workArrangementLabels,
  jobUrgencyLabels,
  currencyOptions,
  salaryPeriodOptions,
  formatDate,
} from "@/lib/utils";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Eye,
  Users,
  Trash2,
} from "lucide-react";

const editSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  roleType: z.string(),
  experienceLevel: z.string(),
  employmentType: z.string(),
  summary: z.string(),
  requiredSkillsStr: z.string(),
  preferredSkillsStr: z.string(),
  yearsMin: z.string(),
  yearsMax: z.string(),
  workArrangement: z.string(),
  location: z.string(),
  timezone: z.string(),
  relocation: z.boolean(),
  visaSponsorship: z.boolean(),
  showSalary: z.boolean(),
  salaryMin: z.string(),
  salaryMax: z.string(),
  salaryCurrency: z.string(),
  salaryPeriod: z.string(),
  equity: z.boolean(),
  equityRange: z.string(),
  bonus: z.string(),
  benefitsStr: z.string(),
  description: z.string(),
  responsibilities: z.string(),
  requirements: z.string(),
  niceToHave: z.string(),
  interviewStagesStr: z.string(),
  interviewLength: z.string(),
  status: z.string(),
  urgency: z.string(),
  headcount: z.string(),
  startsAt: z.string(),
  closesAt: z.string(),
});

type EditFormData = z.infer<typeof editSchema>;

export default function AdminJobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: job, isLoading } = api.job.adminGetById.useQuery(
    { id: jobId },
    { enabled: !!jobId }
  );

  const updateMutation = api.job.adminUpdate.useMutation({
    onSuccess: () => {
      toast.success("Job updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = api.job.adminDelete.useMutation({
    onSuccess: () => {
      toast.success("Job deleted");
      router.push("/admin/jobs");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      title: "",
      roleType: "",
      experienceLevel: "",
      employmentType: "",
      summary: "",
      requiredSkillsStr: "",
      preferredSkillsStr: "",
      yearsMin: "",
      yearsMax: "",
      workArrangement: "",
      location: "",
      timezone: "",
      relocation: false,
      visaSponsorship: false,
      showSalary: true,
      salaryMin: "",
      salaryMax: "",
      salaryCurrency: "USD",
      salaryPeriod: "YEARLY",
      equity: false,
      equityRange: "",
      bonus: "",
      benefitsStr: "",
      description: "",
      responsibilities: "",
      requirements: "",
      niceToHave: "",
      interviewStagesStr: "",
      interviewLength: "",
      status: "DRAFT",
      urgency: "MEDIUM",
      headcount: "1",
      startsAt: "",
      closesAt: "",
    },
  });

  useEffect(() => {
    if (job) {
      reset({
        title: job.title,
        roleType: job.roleType ?? "",
        experienceLevel: job.experienceLevel ?? "",
        employmentType: job.employmentType ?? "",
        summary: job.summary ?? "",
        requiredSkillsStr: job.requiredSkills.join(", "),
        preferredSkillsStr: job.preferredSkills.join(", "),
        yearsMin: job.yearsMin?.toString() ?? "",
        yearsMax: job.yearsMax?.toString() ?? "",
        workArrangement: job.workArrangement ?? "",
        location: job.location ?? "",
        timezone: job.timezone ?? "",
        relocation: job.relocation,
        visaSponsorship: job.visaSponsorship,
        showSalary: job.showSalary,
        salaryMin: job.salaryMin?.toString() ?? "",
        salaryMax: job.salaryMax?.toString() ?? "",
        salaryCurrency: job.salaryCurrency ?? "USD",
        salaryPeriod: job.salaryPeriod ?? "YEARLY",
        equity: job.equity,
        equityRange: job.equityRange ?? "",
        bonus: job.bonus ?? "",
        benefitsStr: job.benefits.join(", "),
        description: job.description ?? "",
        responsibilities: job.responsibilities ?? "",
        requirements: job.requirements ?? "",
        niceToHave: job.niceToHave ?? "",
        interviewStagesStr: job.interviewStages.join(", "),
        interviewLength: job.interviewLength ?? "",
        status: job.status,
        urgency: job.urgency,
        headcount: job.headcount.toString(),
        startsAt: job.startsAt
          ? new Date(job.startsAt).toISOString().split("T")[0]!
          : "",
        closesAt: job.closesAt
          ? new Date(job.closesAt).toISOString().split("T")[0]!
          : "",
      });
    }
  }, [job, reset]);

  const parseCommaSeparated = (str: string) =>
    str
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const onSubmit = (data: EditFormData) => {
    updateMutation.mutate({
      id: jobId,
      title: data.title,
      roleType: data.roleType || undefined,
      experienceLevel: (data.experienceLevel as ExperienceLevel) || undefined,
      employmentType: (data.employmentType as EmploymentType) || undefined,
      summary: data.summary || undefined,
      requiredSkills: parseCommaSeparated(data.requiredSkillsStr),
      preferredSkills: parseCommaSeparated(data.preferredSkillsStr),
      yearsMin: data.yearsMin ? parseInt(data.yearsMin) : undefined,
      yearsMax: data.yearsMax ? parseInt(data.yearsMax) : undefined,
      workArrangement: (data.workArrangement as WorkArrangement) || undefined,
      location: data.location || undefined,
      timezone: data.timezone || undefined,
      relocation: data.relocation,
      visaSponsorship: data.visaSponsorship,
      showSalary: data.showSalary,
      salaryMin: data.salaryMin ? parseInt(data.salaryMin) : undefined,
      salaryMax: data.salaryMax ? parseInt(data.salaryMax) : undefined,
      salaryCurrency: data.salaryCurrency,
      salaryPeriod: data.salaryPeriod,
      equity: data.equity,
      equityRange: data.equityRange || undefined,
      bonus: data.bonus || undefined,
      benefits: parseCommaSeparated(data.benefitsStr),
      description: data.description || undefined,
      responsibilities: data.responsibilities || undefined,
      requirements: data.requirements || undefined,
      niceToHave: data.niceToHave || undefined,
      interviewStages: parseCommaSeparated(data.interviewStagesStr),
      interviewLength: data.interviewLength || undefined,
      status: data.status as JobStatus,
      urgency: (data.urgency as JobUrgency) || undefined,
      headcount: data.headcount ? parseInt(data.headcount) : undefined,
      startsAt: data.startsAt || null,
      closesAt: data.closesAt || null,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-1/4 animate-pulse" />
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-8 bg-muted rounded w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!job) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">Job not found</p>
          <Button asChild>
            <Link href="/admin/jobs">Back to Jobs</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild className="gap-2">
        <Link href="/admin/jobs">
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main edit form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Info</CardTitle>
                <CardDescription>Core job details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" {...register("title")} />
                  {errors.title && (
                    <p className="text-sm text-red-500">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Role Type</Label>
                    <Input {...register("roleType")} placeholder="e.g. Frontend" />
                  </div>

                  <div className="space-y-2">
                    <Label>Experience Level</Label>
                    <Select
                      value={watch("experienceLevel")}
                      onValueChange={(v) => setValue("experienceLevel", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(experienceLevelLabels).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Employment Type</Label>
                    <Select
                      value={watch("employmentType")}
                      onValueChange={(v) => setValue("employmentType", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(employmentTypeLabels).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summary">Summary</Label>
                  <Textarea
                    id="summary"
                    rows={2}
                    {...register("summary")}
                    placeholder="Brief job summary (max 300 chars)"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Required Skills</Label>
                  <Input
                    {...register("requiredSkillsStr")}
                    placeholder="React, TypeScript, Node.js"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate with commas
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Preferred Skills</Label>
                  <Input
                    {...register("preferredSkillsStr")}
                    placeholder="GraphQL, AWS, Docker"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate with commas
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Years Min</Label>
                    <Input
                      type="number"
                      {...register("yearsMin")}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Years Max</Label>
                    <Input
                      type="number"
                      {...register("yearsMax")}
                      placeholder="10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Work Setup */}
            <Card>
              <CardHeader>
                <CardTitle>Work Setup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Work Arrangement</Label>
                    <Select
                      value={watch("workArrangement")}
                      onValueChange={(v) => setValue("workArrangement", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select arrangement" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(workArrangementLabels).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input {...register("location")} placeholder="e.g. Berlin, Germany" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Input {...register("timezone")} placeholder="e.g. CET, EST" />
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={watch("relocation")}
                      onCheckedChange={(v) => setValue("relocation", v)}
                    />
                    <Label>Relocation Support</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={watch("visaSponsorship")}
                      onCheckedChange={(v) => setValue("visaSponsorship", v)}
                    />
                    <Label>Visa Sponsorship</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compensation */}
            <Card>
              <CardHeader>
                <CardTitle>Compensation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={watch("showSalary")}
                    onCheckedChange={(v) => setValue("showSalary", v)}
                  />
                  <Label>Show Salary on Listing</Label>
                </div>

                <div className="grid gap-4 sm:grid-cols-4">
                  <div className="space-y-2">
                    <Label>Min Salary</Label>
                    <Input
                      type="number"
                      {...register("salaryMin")}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Salary</Label>
                    <Input
                      type="number"
                      {...register("salaryMax")}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select
                      value={watch("salaryCurrency")}
                      onValueChange={(v) => setValue("salaryCurrency", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencyOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Period</Label>
                    <Select
                      value={watch("salaryPeriod")}
                      onValueChange={(v) => setValue("salaryPeriod", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {salaryPeriodOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={watch("equity")}
                    onCheckedChange={(v) => setValue("equity", v)}
                  />
                  <Label>Equity Offered</Label>
                </div>

                {watch("equity") && (
                  <div className="space-y-2">
                    <Label>Equity Range</Label>
                    <Input
                      {...register("equityRange")}
                      placeholder="e.g. 0.1% - 0.5%"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Bonus</Label>
                  <Input
                    {...register("bonus")}
                    placeholder="e.g. Up to 15% annual"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Benefits</Label>
                  <Input
                    {...register("benefitsStr")}
                    placeholder="Health Insurance, 401(k), Unlimited PTO"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate with commas
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Description</Label>
                  <Textarea rows={5} {...register("description")} />
                </div>
                <div className="space-y-2">
                  <Label>Responsibilities</Label>
                  <Textarea rows={4} {...register("responsibilities")} />
                </div>
                <div className="space-y-2">
                  <Label>Requirements</Label>
                  <Textarea rows={4} {...register("requirements")} />
                </div>
                <div className="space-y-2">
                  <Label>Nice to Have</Label>
                  <Textarea rows={3} {...register("niceToHave")} />
                </div>
              </CardContent>
            </Card>

            {/* Interview */}
            <Card>
              <CardHeader>
                <CardTitle>Interview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Interview Stages</Label>
                  <Input
                    {...register("interviewStagesStr")}
                    placeholder="Phone Screen, Technical, Culture Fit"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate with commas
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Interview Length</Label>
                  <Input
                    {...register("interviewLength")}
                    placeholder="e.g. 2-3 weeks"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Hiring */}
            <Card>
              <CardHeader>
                <CardTitle>Hiring</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={watch("status")}
                      onValueChange={(v) => setValue("status", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(jobStatusLabels).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Urgency</Label>
                    <Select
                      value={watch("urgency")}
                      onValueChange={(v) => setValue("urgency", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(jobUrgencyLabels).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Headcount</Label>
                    <Input
                      type="number"
                      min={1}
                      {...register("headcount")}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Starts At</Label>
                    <Input type="date" {...register("startsAt")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Closes At</Label>
                    <Input type="date" {...register("closesAt")} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge className={jobStatusColors[job.status]}>
                  {jobStatusLabels[job.status]}
                </Badge>
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <Link
                    href={`/admin/clients/${job.client.id}`}
                    className="hover:underline"
                  >
                    {job.client.name}
                  </Link>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Created {formatDate(job.createdAt)}
                </div>
                {job.publishedAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Published {formatDate(job.publishedAt)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  Views
                </span>
                <span className="font-medium">{job.viewCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  Applications
                </span>
                <span className="font-medium">{job.applicationCount}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Headcount</span>
                <span className="font-medium">{job.headcount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Filled</span>
                <span className="font-medium">{job.filledCount}</span>
              </div>
            </CardContent>
          </Card>

          {(job.requiredSkills.length > 0 ||
            job.preferredSkills.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {job.requiredSkills.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Required
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {job.requiredSkills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {job.preferredSkills.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Preferred
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {job.preferredSkills.map((skill) => (
                        <Badge key={skill} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {(job.frameworks.length > 0 ||
            job.databases.length > 0 ||
            job.cloud.length > 0 ||
            job.tools.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Tech Stack</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {job.frameworks.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Frameworks
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {job.frameworks.map((f) => (
                        <Badge key={f} variant="secondary">
                          {f}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {job.databases.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Databases
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {job.databases.map((d) => (
                        <Badge key={d} variant="secondary">
                          {d}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {job.cloud.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Cloud</p>
                    <div className="flex flex-wrap gap-1">
                      {job.cloud.map((c) => (
                        <Badge key={c} variant="secondary">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {job.tools.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Tools</p>
                    <div className="flex flex-wrap gap-1">
                      {job.tools.map((t) => (
                        <Badge key={t} variant="secondary">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Job
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{job.title}&quot;? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate({ id: jobId })}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
