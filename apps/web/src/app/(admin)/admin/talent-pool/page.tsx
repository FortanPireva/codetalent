"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  formatDate,
  availabilityColors,
  availabilityLabels,
  getScoreColor,
} from "@/lib/utils";
import { Availability } from "@codetalent/db";
import { Search, Github, Linkedin, ExternalLink, Eye } from "lucide-react";
import { VerifiedBadge } from "@/components/verified-badge";

export default function TalentPoolPage() {
  const [search, setSearch] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState<
    Availability | "ALL"
  >("ALL");
  const [passedOnly, setPassedOnly] = useState(false);
  const [minRate, setMinRate] = useState("");
  const [maxRate, setMaxRate] = useState("");

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = api.talentPool.list.useInfiniteQuery(
    {
      search: search || undefined,
      availability: availabilityFilter === "ALL" ? undefined : availabilityFilter,
      passedOnly,
      minHourlyRate: minRate ? parseFloat(minRate) : undefined,
      maxHourlyRate: maxRate ? parseFloat(maxRate) : undefined,
      limit: 20,
    },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );
  const candidates = data?.pages.flatMap((p) => p.items);

  const updateAvailabilityMutation = api.talentPool.updateAvailability.useMutation(
    {
      onSuccess: () => {
        toast.success("Availability updated");
        refetch();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }
  );

  const handleAvailabilityChange = (userId: string, availability: Availability) => {
    updateAvailabilityMutation.mutate({ userId, availability });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Talent Pool</h1>
        <p className="text-muted-foreground">
          Browse and manage qualified candidates
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
                placeholder="Search by name, email, or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={availabilityFilter}
              onValueChange={(v) =>
                setAvailabilityFilter(v as Availability | "ALL")
              }
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                {Object.entries(availabilityLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

      <Card>
        <CardHeader>
          <CardTitle>Candidates</CardTitle>
          <CardDescription>
            {candidates?.length ?? 0} candidate(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-100 rounded animate-pulse"
                />
              ))}
            </div>
          ) : candidates?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No candidates found
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Skills</TableHead>
                    <TableHead>Assessments</TableHead>
                    <TableHead>Avg Score</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Links</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidates?.map((candidate) => (
                    <TableRow key={candidate.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {candidate.profilePicture ? (
                            <img
                              src={candidate.profilePicture}
                              alt={candidate.name ?? "Candidate"}
                              className="h-9 w-9 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground shrink-0">
                              {(candidate.name ?? "?").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <span className="flex items-center gap-1">
                              <Link
                                href={`/admin/verification/${candidate.id}`}
                                className="font-medium hover:underline"
                              >
                                {candidate.name ?? "Unknown"}
                              </Link>
                              <VerifiedBadge passedCount={candidate.passedCount} />
                            </span>
                            <p className="text-sm text-muted-foreground">
                              {candidate.email}
                            </p>
                            {candidate.location && (
                              <p className="text-xs text-muted-foreground">
                                {candidate.location}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-48">
                          {candidate.skills?.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {(candidate.skills?.length ?? 0) > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{(candidate.skills?.length ?? 0) - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="text-green-600 font-medium">
                            {candidate.passedCount}
                          </span>
                          <span className="text-muted-foreground">
                            {" "}
                            / {candidate.submissionCount}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {candidate.averageScore !== null ? (
                          <span
                            className={`font-semibold ${getScoreColor(
                              candidate.averageScore
                            )}`}
                          >
                            {candidate.averageScore.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {candidate.hourlyRate != null ? (
                            <span>${candidate.hourlyRate}/hr</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                          {candidate.monthlyRate != null && (
                            <p className="text-xs text-muted-foreground">
                              ${candidate.monthlyRate}/mo
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={candidate.availability}
                          onValueChange={(v) =>
                            handleAvailabilityChange(
                              candidate.id,
                              v as Availability
                            )
                          }
                        >
                          <SelectTrigger className="w-36">
                            <Badge
                              className={availabilityColors[candidate.availability]}
                            >
                              {availabilityLabels[candidate.availability]}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(availabilityLabels).map(
                              ([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{formatDate(candidate.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {candidate.githubUrl && (
                            <Button variant="ghost" size="sm" asChild>
                              <a
                                href={candidate.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Github className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          {candidate.linkedinUrl && (
                            <Button variant="ghost" size="sm" asChild>
                              <a
                                href={candidate.linkedinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Linkedin className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/verification/${candidate.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
