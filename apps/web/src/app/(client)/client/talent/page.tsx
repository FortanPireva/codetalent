"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/trpc/react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  availabilityColors,
  availabilityLabels,
  getScoreColor,
} from "@/lib/utils";
import {
  Search,
  MapPin,
  Star,
  Eye,
  Send,
  Loader2,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";
import { VerifiedBadge } from "@/components/verified-badge";

export default function TalentDiscoveryPage() {
  const [search, setSearch] = useState("");
  const [passedOnly, setPassedOnly] = useState(false);
  const [minRate, setMinRate] = useState("");
  const [maxRate, setMaxRate] = useState("");
  const [inviteCandidateId, setInviteCandidateId] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const utils = api.useUtils();

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = api.talentPool.clientList.useInfiniteQuery(
    {
      search: search || undefined,
      passedOnly,
      minHourlyRate: minRate ? parseFloat(minRate) : undefined,
      maxHourlyRate: maxRate ? parseFloat(maxRate) : undefined,
      limit: 20,
    },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );
  const candidates = data?.pages.flatMap((p) => p.items);

  const { data: openJobs, isLoading: isLoadingJobs } =
    api.job.list.useQuery(
      { status: "OPEN" },
      { enabled: !!inviteCandidateId }
    );

  const inviteMutation = api.application.inviteForInterview.useMutation({
    onSuccess: () => {
      toast.success("Interview invitation sent successfully");
      setInviteCandidateId(null);
      setSelectedJobId(null);
      void utils.application.invalidate();
    },
    onError: (error) => {
      if (error.data?.code === "CONFLICT") {
        toast.error("This candidate already has an application for this job");
      } else {
        toast.error(error.message);
      }
    },
  });

  const handleInvite = () => {
    if (!inviteCandidateId || !selectedJobId) return;
    inviteMutation.mutate({
      candidateId: inviteCandidateId,
      jobId: selectedJobId,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Discover Talent</h1>
        <p className="text-muted-foreground">
          Browse verified candidates who are actively looking for opportunities
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="passedOnly"
                checked={passedOnly}
                onChange={(e) => setPassedOnly(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="passedOnly" className="text-sm whitespace-nowrap">
                Passed assessments only
              </label>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex items-center gap-2">
              <label className="text-sm whitespace-nowrap">Hourly Rate ($)</label>
              <Input
                type="number"
                placeholder="Min"
                value={minRate}
                onChange={(e) => setMinRate(e.target.value)}
                className="w-24"
                min="0"
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="number"
                placeholder="Max"
                value={maxRate}
                onChange={(e) => setMaxRate(e.target.value)}
                className="w-24"
                min="0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Candidates</h2>
        <p className="text-sm text-muted-foreground">
          {candidates?.length ?? 0} candidate(s) found
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-2/3" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
                <div className="h-10 bg-muted rounded mb-3" />
                <div className="flex gap-1">
                  <div className="h-5 bg-muted rounded w-16" />
                  <div className="h-5 bg-muted rounded w-14" />
                  <div className="h-5 bg-muted rounded w-12" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : candidates?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No candidates found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your search filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {candidates?.map((candidate) => {
            const initials = candidate.name
              ? candidate.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
              : "?";

            return (
              <Card key={candidate.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  {/* Header: Avatar + Name + Location + Availability */}
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar className="h-12 w-12">
                      {candidate.profilePicture ? (
                        <AvatarImage
                          src={candidate.profilePicture}
                          alt={candidate.name ?? "Candidate"}
                        />
                      ) : null}
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate flex items-center gap-1">
                        {candidate.name ?? "Unknown"}
                        <VerifiedBadge passedCount={candidate.passedCount} />
                      </p>
                      {candidate.location && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {candidate.location}
                        </p>
                      )}
                    </div>
                    <Badge
                      className={`text-xs shrink-0 ${availabilityColors[candidate.availability]}`}
                    >
                      {availabilityLabels[candidate.availability]}
                    </Badge>
                  </div>

                  {/* Bio snippet */}
                  {candidate.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {candidate.bio}
                    </p>
                  )}

                  {/* Rate */}
                  {(candidate.hourlyRate != null || candidate.monthlyRate != null) && (
                    <p className="text-sm font-medium mb-3">
                      {candidate.hourlyRate != null && (
                        <span>${candidate.hourlyRate}/hr</span>
                      )}
                      {candidate.hourlyRate != null && candidate.monthlyRate != null && (
                        <span className="text-muted-foreground mx-1.5">·</span>
                      )}
                      {candidate.monthlyRate != null && (
                        <span>${candidate.monthlyRate}/mo</span>
                      )}
                    </p>
                  )}

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {candidate.skills?.slice(0, 4).map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="text-xs"
                      >
                        {skill}
                      </Badge>
                    ))}
                    {(candidate.skills?.length ?? 0) > 4 && (
                      <Badge variant="secondary" className="text-xs">
                        +{(candidate.skills?.length ?? 0) - 4}
                      </Badge>
                    )}
                  </div>

                  {/* Footer: Score + Action Buttons */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-3">
                      {candidate.averageScore !== null ? (
                        <span
                          className={`flex items-center gap-1 text-sm font-semibold ${getScoreColor(
                            candidate.averageScore
                          )}`}
                        >
                          <Star className="h-3.5 w-3.5" />
                          {candidate.averageScore.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">No score</span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        <span className="text-green-600 font-medium">
                          {candidate.passedCount}
                        </span>
                        /{candidate.submissionCount} passed
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1"
                        asChild
                      >
                        <Link href={`/client/talent/${candidate.id}`}>
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        className="h-8 gap-1"
                        onClick={() => {
                          setInviteCandidateId(candidate.id);
                          setSelectedJobId(null);
                        }}
                      >
                        <Send className="h-3.5 w-3.5" />
                        Invite
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}

      {/* Invite to Interview Dialog */}
      <Dialog
        open={!!inviteCandidateId}
        onOpenChange={(open) => {
          if (!open) {
            setInviteCandidateId(null);
            setSelectedJobId(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite to Interview</DialogTitle>
            <DialogDescription>
              Select a job to invite this candidate for an interview
            </DialogDescription>
          </DialogHeader>

          {isLoadingJobs ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !openJobs || openJobs.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                You have no open jobs. Create a job posting first to invite candidates.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {openJobs.map((job) => (
                <button
                  key={job.id}
                  type="button"
                  className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                    selectedJobId === job.id
                      ? "border-primary bg-primary/5"
                      : "border-transparent bg-muted/50 hover:bg-muted"
                  }`}
                  onClick={() => setSelectedJobId(job.id)}
                >
                  <p className="font-medium text-sm">{job.title}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    {job.location && (
                      <span className="flex items-center gap-0.5">
                        <MapPin className="h-3 w-3" />
                        {job.location}
                      </span>
                    )}
                    {job.employmentType && (
                      <span>{job.employmentType.replace(/_/g, " ")}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setInviteCandidateId(null);
                setSelectedJobId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleInvite}
              disabled={!selectedJobId || inviteMutation.isPending}
            >
              {inviteMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              )}
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
