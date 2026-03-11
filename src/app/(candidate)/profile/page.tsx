"use client";

import { useEffect, useRef, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Availability } from "@prisma/client";
import { availabilityLabels } from "@/lib/utils";
import { X, Camera, Loader2 } from "lucide-react";
import { VerifiedBadge } from "@/components/verified-badge";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().max(500).optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  githubUrl: z.string().url().optional().or(z.literal("")),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  resumeUrl: z.string().url().optional().or(z.literal("")),
  availability: z.nativeEnum(Availability),
  hourlyRate: z.string().optional(),
  monthlyRate: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { data: profile, isLoading, refetch } = api.auth.getProfile.useQuery();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateMutation = api.auth.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully");
      refetch();
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
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      bio: "",
      phone: "",
      location: "",
      githubUrl: "",
      linkedinUrl: "",
      resumeUrl: "",
      availability: Availability.ACTIVELY_LOOKING,
      hourlyRate: "",
      monthlyRate: "",
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name ?? "",
        bio: profile.bio ?? "",
        phone: profile.phone ?? "",
        location: profile.location ?? "",
        githubUrl: profile.githubUrl ?? "",
        linkedinUrl: profile.linkedinUrl ?? "",
        resumeUrl: profile.resumeUrl ?? "",
        availability: profile.availability,
        hourlyRate: profile.hourlyRate != null ? String(profile.hourlyRate) : "",
        monthlyRate: profile.monthlyRate != null ? String(profile.monthlyRate) : "",
      });
    }
  }, [profile, reset]);

  const onSubmit = (data: ProfileFormData) => {
    const { hourlyRate, monthlyRate, ...rest } = data;
    updateMutation.mutate({
      ...rest,
      skills: profile?.skills,
      hourlyRate: hourlyRate && hourlyRate.trim() !== "" ? parseFloat(hourlyRate) : null,
      monthlyRate: monthlyRate && monthlyRate.trim() !== "" ? parseFloat(monthlyRate) : null,
    });
  };

  const addSkill = (skill: string) => {
    if (skill && profile?.skills && !profile.skills.includes(skill)) {
      updateMutation.mutate({
        skills: [...profile.skills, skill],
      });
    }
  };

  const removeSkill = (skillToRemove: string) => {
    if (profile?.skills) {
      updateMutation.mutate({
        skills: profile.skills.filter((s) => s !== skillToRemove),
      });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "avatar");

      const res = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Upload failed");
      }

      const { url } = await res.json();
      updateMutation.mutate({ profilePicture: url });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse" />
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-24 bg-gray-200 rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          Profile
          <VerifiedBadge passedCount={profile?.passedAssessmentCount ?? 0} size="md" />
        </h1>
        <p className="text-muted-foreground">
          Manage your personal information and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>
            Upload a photo so others can recognize you
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <div className="relative">
            {profile?.profilePicture ? (
              <img
                src={profile.profilePicture}
                alt={profile.name ?? "Profile"}
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center text-2xl font-semibold text-muted-foreground">
                {(profile?.name ?? "?").charAt(0).toUpperCase()}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 rounded-full bg-primary p-1.5 text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </button>
          </div>
          <div className="space-y-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Change Photo"}
            </Button>
            <p className="text-xs text-muted-foreground">
              JPEG, PNG, or WebP. Max 2MB.
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarUpload}
            className="hidden"
          />
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your basic profile details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" {...register("name")} />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={profile?.email ?? ""} disabled />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                {...register("bio")}
                rows={4}
              />
              {errors.bio && (
                <p className="text-sm text-red-500">{errors.bio.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="+1 (555) 123-4567"
                  {...register("phone")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="New York, USA"
                  {...register("location")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
            <CardDescription>Connect your professional profiles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="githubUrl">GitHub URL</Label>
              <Input
                id="githubUrl"
                placeholder="https://github.com/username"
                {...register("githubUrl")}
              />
              {errors.githubUrl && (
                <p className="text-sm text-red-500">
                  {errors.githubUrl.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
              <Input
                id="linkedinUrl"
                placeholder="https://linkedin.com/in/username"
                {...register("linkedinUrl")}
              />
              {errors.linkedinUrl && (
                <p className="text-sm text-red-500">
                  {errors.linkedinUrl.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="resumeUrl">Resume URL</Label>
              <Input
                id="resumeUrl"
                placeholder="https://example.com/resume.pdf"
                {...register("resumeUrl")}
              />
              {errors.resumeUrl && (
                <p className="text-sm text-red-500">
                  {errors.resumeUrl.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rates</CardTitle>
            <CardDescription>
              Set your hourly and monthly rates so clients can assess budget fit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly Rate ($/hr)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  min="0"
                  max="10000"
                  step="0.50"
                  placeholder="e.g. 75"
                  {...register("hourlyRate")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthlyRate">Monthly Rate ($/mo)</Label>
                <Input
                  id="monthlyRate"
                  type="number"
                  min="0"
                  max="10000"
                  step="0.50"
                  placeholder="e.g. 8000"
                  {...register("monthlyRate")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
            <CardDescription>
              Add your technical skills to help admins understand your expertise
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {profile?.skills?.map((skill) => (
                <Badge key={skill} variant="secondary" className="gap-1">
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {(!profile?.skills || profile.skills.length === 0) && (
                <p className="text-sm text-muted-foreground">
                  No skills added yet
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Add a skill (e.g., TypeScript)"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const target = e.target as HTMLInputElement;
                    addSkill(target.value.trim());
                    target.value = "";
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                  const input = (e.target as HTMLElement)
                    .previousElementSibling as HTMLInputElement;
                  addSkill(input.value.trim());
                  input.value = "";
                }}
              >
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Availability</CardTitle>
            <CardDescription>
              Let admins know your current job search status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={watch("availability")}
              onValueChange={(value) =>
                setValue("availability", value as Availability, {
                  shouldDirty: true,
                })
              }
            >
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Select availability" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(availabilityLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!isDirty || updateMutation.isPending}
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
