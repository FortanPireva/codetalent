"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  availabilityColors,
  availabilityLabels,
  getScoreColor,
} from "@/lib/utils";
import { Search, Github, Linkedin } from "lucide-react";

export default function TalentDiscoveryPage() {
  const [search, setSearch] = useState("");
  const [passedOnly, setPassedOnly] = useState(false);

  const { data: candidates, isLoading } =
    api.talentPool.clientList.useQuery({
      search: search || undefined,
      passedOnly,
    });

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
            <div className="text-center py-8">
              <p className="text-muted-foreground">No candidates found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your search filters
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Skills</TableHead>
                    <TableHead>Assessments</TableHead>
                    <TableHead>Avg Score</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead className="text-right">Links</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidates?.map((candidate) => (
                    <TableRow key={candidate.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {candidate.name ?? "Unknown"}
                          </p>
                          {candidate.location && (
                            <p className="text-xs text-muted-foreground">
                              {candidate.location}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-48">
                          {candidate.skills?.slice(0, 3).map((skill) => (
                            <Badge
                              key={skill}
                              variant="secondary"
                              className="text-xs"
                            >
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
                        <Badge
                          className={availabilityColors[candidate.availability]}
                        >
                          {availabilityLabels[candidate.availability]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
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
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
