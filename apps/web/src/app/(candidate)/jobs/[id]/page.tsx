"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  experienceLevelLabels,
  employmentTypeLabels,
  workArrangementLabels,
  jobUrgencyLabels,
  formatDate,
  companySizeLabels,
  applicationStatusLabels,
  applicationStatusColors,
} from "@/lib/utils";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Clock,
  Globe,
  DollarSign,
  Calendar,
  Users,
  Plane,
  CheckCircle,
  Briefcase,
  Send,
} from "lucide-react";
import { toast } from "sonner";

export default function CandidateJobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");

  const utils = api.useUtils();

  const { data: job, isLoading } = api.job.candidateGetById.useQuery(
    { id: jobId },
    { enabled: !!jobId }
  );

  const { data: applicationData } = api.application.hasApplied.useQuery(
    { jobId },
    { enabled: !!jobId }
  );

  const applyMutation = api.application.apply.useMutation({
    onSuccess: () => {
      toast.success("Application submitted successfully!");
      setDialogOpen(false);
      setCoverLetter("");
      void utils.application.hasApplied.invalidate({ jobId });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse" />
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-8 bg-gray-200 rounded w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-200 rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!job) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">
            Job not found or no longer available
          </p>
          <Button asChild>
            <Link href="/jobs">Back to Jobs</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const hasSalary =
    job.showSalary && job.salaryMin != null && job.salaryMax != null;

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild className="gap-2">
        <Link href="/jobs">
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <Card>
            <CardContent className="pt-6">
              <h1 className="text-2xl font-bold mb-2">{job.title}</h1>
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                {job.client.logo ? (
                  <img
                    src={job.client.logo}
                    alt={job.client.name}
                    className="h-5 w-5 rounded object-contain shrink-0"
                  />
                ) : (
                  <Building2 className="h-4 w-4" />
                )}
                <span className="font-medium">{job.client.name}</span>
                {job.location && (
                  <>
                    <span className="text-gray-300">|</span>
                    <MapPin className="h-4 w-4" />
                    <span>{job.location}</span>
                  </>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {job.roleType && (
                  <Badge variant="secondary">{job.roleType}</Badge>
                )}
                {job.experienceLevel && (
                  <Badge variant="outline">
                    {experienceLevelLabels[job.experienceLevel]}
                  </Badge>
                )}
                {job.employmentType && (
                  <Badge variant="outline">
                    {employmentTypeLabels[job.employmentType]}
                  </Badge>
                )}
                {job.workArrangement && (
                  <Badge variant="outline">
                    {workArrangementLabels[job.workArrangement]}
                  </Badge>
                )}
              </div>

              {job.summary && (
                <p className="text-muted-foreground">{job.summary}</p>
              )}
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {job.experienceLevel && (
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Experience</p>
                      <p className="text-sm font-medium">
                        {experienceLevelLabels[job.experienceLevel]}
                        {job.yearsMin != null || job.yearsMax != null ? (
                          <span className="text-muted-foreground font-normal">
                            {" "}({job.yearsMin ?? 0}–{job.yearsMax ?? "∞"} years)
                          </span>
                        ) : null}
                      </p>
                    </div>
                  </div>
                )}
                {job.employmentType && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Employment</p>
                      <p className="text-sm font-medium">
                        {employmentTypeLabels[job.employmentType]}
                      </p>
                    </div>
                  </div>
                )}
                {job.workArrangement && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Work Arrangement</p>
                      <p className="text-sm font-medium">
                        {workArrangementLabels[job.workArrangement]}
                      </p>
                    </div>
                  </div>
                )}
                {job.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="text-sm font-medium">{job.location}</p>
                    </div>
                  </div>
                )}
                {job.timezone && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Timezone</p>
                      <p className="text-sm font-medium">{job.timezone}</p>
                    </div>
                  </div>
                )}
                {job.urgency && job.urgency !== "MEDIUM" && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Urgency</p>
                      <p className="text-sm font-medium">
                        {jobUrgencyLabels[job.urgency]}
                      </p>
                    </div>
                  </div>
                )}
                {job.headcount > 1 && (
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Headcount</p>
                      <p className="text-sm font-medium">
                        {job.headcount} positions
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {(job.relocation || job.visaSponsorship) && (
                <>
                  <Separator className="my-4" />
                  <div className="flex flex-wrap gap-4">
                    {job.relocation && (
                      <div className="flex items-center gap-2 text-sm">
                        <Plane className="h-4 w-4 text-green-600" />
                        <span>Relocation support available</span>
                      </div>
                    )}
                    {job.visaSponsorship && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Visa sponsorship available</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Compensation */}
          {(hasSalary || job.equity || job.bonus || job.benefits.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Compensation & Benefits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {hasSalary && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {job.salaryCurrency}{" "}
                        {job.salaryMin!.toLocaleString()} – {job.salaryMax!.toLocaleString()}
                        <span className="text-muted-foreground font-normal">
                          {" "}/ {job.salaryPeriod === "YEARLY" ? "year" : job.salaryPeriod === "MONTHLY" ? "month" : "hour"}
                        </span>
                      </p>
                    </div>
                  </div>
                )}
                {job.equity && job.equityRange && (
                  <p className="text-sm">
                    <span className="font-medium">Equity:</span>{" "}
                    {job.equityRange}
                  </p>
                )}
                {job.bonus && (
                  <p className="text-sm">
                    <span className="font-medium">Bonus:</span> {job.bonus}
                  </p>
                )}
                {job.benefits.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Benefits</p>
                    <div className="flex flex-wrap gap-2">
                      {job.benefits.map((benefit) => (
                        <Badge key={benefit} variant="secondary">
                          {benefit}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Description sections */}
          {job.description && (
            <Card>
              <CardHeader>
                <CardTitle>About the Role</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-line">{job.description}</p>
              </CardContent>
            </Card>
          )}

          {job.responsibilities && (
            <Card>
              <CardHeader>
                <CardTitle>Responsibilities</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-line">
                  {job.responsibilities}
                </p>
              </CardContent>
            </Card>
          )}

          {job.requirements && (
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-line">
                  {job.requirements}
                </p>
              </CardContent>
            </Card>
          )}

          {job.niceToHave && (
            <Card>
              <CardHeader>
                <CardTitle>Nice to Have</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-line">{job.niceToHave}</p>
              </CardContent>
            </Card>
          )}

          {/* Interview process */}
          {(job.interviewStages.length > 0 || job.interviewLength) && (
            <Card>
              <CardHeader>
                <CardTitle>Interview Process</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {job.interviewStages.length > 0 && (
                  <div className="space-y-2">
                    {job.interviewStages.map((stage, i) => (
                      <div key={stage} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium shrink-0">
                          {i + 1}
                        </div>
                        <span className="text-sm">{stage}</span>
                      </div>
                    ))}
                  </div>
                )}
                {job.interviewLength && (
                  <p className="text-sm text-muted-foreground">
                    Expected timeline: {job.interviewLength}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Company info */}
          <Card>
            <CardHeader>
              <CardTitle>About the Company</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                {job.client.logo ? (
                  <img
                    src={job.client.logo}
                    alt={job.client.name}
                    className="h-10 w-10 rounded-lg object-contain border bg-white shrink-0"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                )}
                <div>
                  <p className="font-medium">{job.client.name}</p>
                  {job.client.industry && (
                    <p className="text-xs text-muted-foreground">
                      {job.client.industry}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {job.client.size && (
                  <Badge variant="outline">
                    {companySizeLabels[job.client.size]}
                  </Badge>
                )}
              </div>
              {job.client.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {job.client.location}
                </div>
              )}
              {job.client.website && (
                <a
                  href={job.client.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                >
                  <Globe className="h-4 w-4" />
                  {job.client.website}
                </a>
              )}
              {job.client.description && (
                <>
                  <Separator />
                  <p className="text-sm text-muted-foreground">
                    {job.client.description}
                  </p>
                </>
              )}
              {job.client.techStack && job.client.techStack.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Company Tech Stack
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {job.client.techStack.map((tech) => (
                        <Badge key={tech} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Skills */}
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

          {/* Tech Stack */}
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

          {/* Apply */}
          <Card>
            <CardHeader>
              <CardTitle>Apply for this Position</CardTitle>
            </CardHeader>
            <CardContent>
              {applicationData ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className={applicationStatusColors[applicationData.status]}>
                      {applicationStatusLabels[applicationData.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Applied {formatDate(applicationData.appliedAt)}
                  </p>
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href="/applications">View My Applications</Link>
                  </Button>
                </div>
              ) : (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full gap-2">
                      <Send className="h-4 w-4" />
                      Apply Now
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Apply for {job.title}</DialogTitle>
                      <DialogDescription>
                        at {job.client.name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="coverLetter">Cover Letter (optional)</Label>
                        <Textarea
                          id="coverLetter"
                          placeholder="Tell the employer why you're a great fit for this role..."
                          value={coverLetter}
                          onChange={(e) => setCoverLetter(e.target.value)}
                          maxLength={2000}
                          rows={6}
                        />
                        <p className="text-xs text-muted-foreground text-right">
                          {coverLetter.length}/2000
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() =>
                          applyMutation.mutate({
                            jobId,
                            coverLetter: coverLetter || undefined,
                          })
                        }
                        disabled={applyMutation.isPending}
                      >
                        {applyMutation.isPending ? "Submitting..." : "Submit Application"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>

          {/* Posted date */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Posted {job.publishedAt ? formatDate(job.publishedAt) : formatDate(job.createdAt)}
              </div>
              {job.closesAt && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                  <Clock className="h-4 w-4" />
                  Closes {formatDate(job.closesAt)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
