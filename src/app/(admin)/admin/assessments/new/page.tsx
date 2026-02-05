"use client";

import { useRouter } from "next/navigation";
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
import { toast } from "sonner";
import { Difficulty } from "@prisma/client";
import { difficultyLabels } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

const assessmentSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
  description: z.string().min(10, "Description must be at least 10 characters"),
  difficulty: z.nativeEnum(Difficulty),
  repoUrl: z.string().url("Must be a valid URL"),
  timeLimit: z.number().min(1).max(30),
  isActive: z.boolean(),
});

type AssessmentFormData = z.infer<typeof assessmentSchema>;

export default function NewAssessmentPage() {
  const router = useRouter();

  const createMutation = api.assessment.create.useMutation({
    onSuccess: () => {
      toast.success("Assessment created successfully!");
      router.push("/admin/assessments");
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
    formState: { errors },
  } = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      difficulty: Difficulty.JUNIOR,
      repoUrl: "",
      timeLimit: 7,
      isActive: true,
    },
  });

  const title = watch("title");

  const generateSlug = () => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
    setValue("slug", slug);
  };

  const onSubmit = (data: AssessmentFormData) => {
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild className="gap-2">
        <Link href="/admin/assessments">
          <ArrowLeft className="h-4 w-4" />
          Back to Assessments
        </Link>
      </Button>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Assessment</h1>
        <p className="text-muted-foreground">
          Set up a new technical assessment
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              General details about the assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., React Todo App"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <div className="flex gap-2">
                <Input
                  id="slug"
                  placeholder="e.g., react-todo-app"
                  {...register("slug")}
                />
                <Button type="button" variant="outline" onClick={generateSlug}>
                  Generate
                </Button>
              </div>
              {errors.slug && (
                <p className="text-sm text-red-500">{errors.slug.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what candidates need to build..."
                rows={5}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assessment Settings</CardTitle>
            <CardDescription>Configure difficulty and limits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select
                  value={watch("difficulty")}
                  onValueChange={(v) => setValue("difficulty", v as Difficulty)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(difficultyLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Pass thresholds: Intern ≥3.0, Junior ≥3.5, Mid ≥4.0
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeLimit">Time Limit (days)</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  min={1}
                  max={30}
                  {...register("timeLimit", { valueAsNumber: true })}
                />
                {errors.timeLimit && (
                  <p className="text-sm text-red-500">
                    {errors.timeLimit.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Repository</CardTitle>
            <CardDescription>
              Link to the starter repository on GitHub
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="repoUrl">Repository URL</Label>
              <Input
                id="repoUrl"
                placeholder="https://github.com/your-org/starter-repo"
                {...register("repoUrl")}
              />
              {errors.repoUrl && (
                <p className="text-sm text-red-500">{errors.repoUrl.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                This repository will be forked by candidates
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                {...register("isActive")}
                className="rounded"
              />
              <Label htmlFor="isActive" className="font-normal">
                Make this assessment active immediately
              </Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/assessments">Cancel</Link>
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating..." : "Create Assessment"}
          </Button>
        </div>
      </form>
    </div>
  );
}
