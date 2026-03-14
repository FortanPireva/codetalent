"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
import { toast } from "sonner";
import { Availability } from "@codetalent/db";
import { availabilityLabels } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Upload,
  User,
  Link as LinkIcon,
  Briefcase,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  X,
  FileText,
  Loader2,
  Camera,
} from "lucide-react";

const onboardingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().min(10, "Bio must be at least 10 characters").max(500, "Bio must be at most 500 characters"),
  phone: z.string().min(1, "Phone is required"),
  location: z.string().min(1, "Location is required"),
  githubUrl: z.string().url("Must be a valid URL"),
  linkedinUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  resumeUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  profilePicture: z.string().url().optional().or(z.literal("")),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  availability: z.nativeEnum(Availability),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

const steps = [
  { title: "Upload Resume", icon: Upload, description: "Auto-fill your profile (optional)" },
  { title: "Personal Info", icon: User, description: "Tell us about yourself" },
  { title: "Professional Links", icon: LinkIcon, description: "Connect your profiles" },
  { title: "Skills & Availability", icon: Briefcase, description: "Your expertise" },
  { title: "Review & Submit", icon: CheckCircle, description: "Confirm your details" },
];

// Fields validated at each step
const stepFields: (keyof OnboardingFormData)[][] = [
  [], // Resume upload - no validation needed
  ["name", "bio", "phone", "location"],
  ["githubUrl", "linkedinUrl", "resumeUrl"],
  ["skills", "availability"],
  [],
];

export default function OnboardingPage() {
  const router = useRouter();
  const { update } = useSession();
  const [currentStep, setCurrentStep] = useState(0);
  const [skillInput, setSkillInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const submitMutation = api.onboarding.submit.useMutation({
    onSuccess: async () => {
      toast.success("Profile submitted for review!");
      await update();
      router.push("/pending");
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
    trigger,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: "",
      bio: "",
      phone: "",
      location: "",
      githubUrl: "",
      linkedinUrl: "",
      resumeUrl: "",
      profilePicture: "",
      skills: [],
      availability: Availability.ACTIVELY_LOOKING,
    },
  });

  const skills = watch("skills");
  const formValues = watch();

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setValue("skills", [...skills, trimmed], { shouldValidate: true });
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setValue(
      "skills",
      skills.filter((s) => s !== skill),
      { shouldValidate: true }
    );
  };

  const handleResumeUpload = async (file: File) => {
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are accepted");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload-resume", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      const { resumeUrl, parsedProfile } = await response.json();

      // Store resume URL
      setValue("resumeUrl", resumeUrl);
      setUploadedFileName(file.name);

      // Auto-fill form fields from parsed profile
      if (parsedProfile.name) setValue("name", parsedProfile.name);
      if (parsedProfile.bio) setValue("bio", parsedProfile.bio.slice(0, 500));
      if (parsedProfile.phone) setValue("phone", parsedProfile.phone);
      if (parsedProfile.location) setValue("location", parsedProfile.location);
      if (parsedProfile.githubUrl) setValue("githubUrl", parsedProfile.githubUrl);
      if (parsedProfile.linkedinUrl) setValue("linkedinUrl", parsedProfile.linkedinUrl);
      if (parsedProfile.skills && Array.isArray(parsedProfile.skills)) {
        setValue("skills", parsedProfile.skills);
      }

      toast.success("Resume uploaded and profile auto-filled!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload resume");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Only JPEG, PNG, and WebP images are accepted");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "avatar");

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      const { url } = await response.json();
      setValue("profilePicture", url);
      setAvatarPreview(url);
      toast.success("Profile picture uploaded!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload image");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleNext = async () => {
    const fieldsToValidate = stepFields[currentStep];
    if (fieldsToValidate && fieldsToValidate.length > 0) {
      const valid = await trigger(fieldsToValidate);
      if (!valid) return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit = (data: OnboardingFormData) => {
    submitMutation.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Complete Your Profile</h1>
        <p className="text-muted-foreground mt-2">
          Fill in your details to get started with Talentflow
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((step, index) => (
          <div key={step.title} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${index < currentStep
                  ? "bg-primary border-primary text-primary-foreground"
                  : index === currentStep
                    ? "border-primary text-primary"
                    : "border text-muted-foreground"
                }`}
            >
              {index < currentStep ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <step.icon className="h-5 w-5" />
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-8 h-0.5 mx-1 ${index < currentStep ? "bg-primary" : "bg-border"
                  }`}
              />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep]!.title}</CardTitle>
          <CardDescription>{steps[currentStep]!.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 0: Resume Upload */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleResumeUpload(file);
                    }}
                  />
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-10 w-10 text-primary animate-spin" />
                      <p className="text-sm text-muted-foreground">
                        Uploading and parsing your resume...
                      </p>
                    </div>
                  ) : uploadedFileName ? (
                    <div className="flex flex-col items-center gap-3">
                      <FileText className="h-10 w-10 text-green-600" />
                      <p className="font-medium text-green-600">{uploadedFileName}</p>
                      <p className="text-sm text-muted-foreground">
                        Resume uploaded and profile fields auto-filled
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Upload a different file
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <Upload className="h-10 w-10 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Upload your resume</p>
                        <p className="text-sm text-muted-foreground">
                          PDF only, max 5MB. We&apos;ll auto-fill your profile from it.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Choose PDF file
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                {/* Avatar upload */}
                <div className="flex flex-col items-center gap-3">
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAvatarUpload(file);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="relative group"
                    disabled={isUploadingAvatar}
                  >
                    <Avatar className="h-24 w-24">
                      {avatarPreview ? (
                        <AvatarImage src={avatarPreview} alt="Profile picture" />
                      ) : null}
                      <AvatarFallback className="text-2xl">
                        {formValues.name
                          ? formValues.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                          : <User className="h-8 w-8" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      {isUploadingAvatar ? (
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                      ) : (
                        <Camera className="h-6 w-6 text-white" />
                      )}
                    </div>
                  </button>
                  <p className="text-sm text-muted-foreground">
                    {avatarPreview ? "Click to change photo" : "Click to add a profile photo"}
                  </p>
                </div>

                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" {...register("name")} placeholder="John Doe" />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="bio">Bio *</Label>
                  <Textarea
                    id="bio"
                    {...register("bio")}
                    placeholder="Tell us about yourself, your experience, and what you're looking for..."
                    rows={4}
                  />
                  <div className="flex justify-between mt-1">
                    {errors.bio && (
                      <p className="text-sm text-red-500">{errors.bio.message}</p>
                    )}
                    <p className="text-sm text-muted-foreground ml-auto">
                      {formValues.bio?.length ?? 0}/500
                    </p>
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input id="phone" {...register("phone")} placeholder="+1 234 567 8900" />
                  {errors.phone && (
                    <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input id="location" {...register("location")} placeholder="New York, USA" />
                  {errors.location && (
                    <p className="text-sm text-red-500 mt-1">{errors.location.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Professional Links */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="githubUrl">GitHub Profile URL *</Label>
                  <Input
                    id="githubUrl"
                    {...register("githubUrl")}
                    placeholder="https://github.com/username"
                  />
                  {errors.githubUrl && (
                    <p className="text-sm text-red-500 mt-1">{errors.githubUrl.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="linkedinUrl">LinkedIn Profile URL</Label>
                  <Input
                    id="linkedinUrl"
                    {...register("linkedinUrl")}
                    placeholder="https://linkedin.com/in/username"
                  />
                  {errors.linkedinUrl && (
                    <p className="text-sm text-red-500 mt-1">{errors.linkedinUrl.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="resumeUrl">Resume URL</Label>
                  <Input
                    id="resumeUrl"
                    {...register("resumeUrl")}
                    placeholder="https://example.com/resume.pdf"
                  />
                  {errors.resumeUrl && (
                    <p className="text-sm text-red-500 mt-1">{errors.resumeUrl.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Skills & Availability */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <Label>Skills *</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="e.g. TypeScript, React, Node.js"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={addSkill}>
                      Add
                    </Button>
                  </div>
                  {errors.skills && (
                    <p className="text-sm text-red-500 mt-1">{errors.skills.message}</p>
                  )}
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {skills.map((skill) => (
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
                    </div>
                  )}
                </div>
                <div>
                  <Label>Availability *</Label>
                  <Select
                    value={formValues.availability}
                    onValueChange={(v) =>
                      setValue("availability", v as Availability, { shouldValidate: true })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(availabilityLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {currentStep === 4 && (
              <div className="space-y-6">
                {/* Avatar + Name header */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    {avatarPreview ? (
                      <AvatarImage src={avatarPreview} alt="Profile picture" />
                    ) : null}
                    <AvatarFallback className="text-lg">
                      {formValues.name
                        ? formValues.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                        : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-lg font-semibold">{formValues.name}</p>
                    <p className="text-sm text-muted-foreground">{formValues.location}</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p className="font-medium">{formValues.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <p className="font-medium">{formValues.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Location</p>
                    <p className="font-medium">{formValues.location}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Availability</p>
                    <p className="font-medium">
                      {availabilityLabels[formValues.availability]}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Bio</p>
                  <p className="mt-1">{formValues.bio}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">GitHub</p>
                  <p className="font-medium text-blue-600">{formValues.githubUrl}</p>
                </div>
                {formValues.linkedinUrl && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">LinkedIn</p>
                    <p className="font-medium text-blue-600">{formValues.linkedinUrl}</p>
                  </div>
                )}
                {formValues.resumeUrl && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Resume</p>
                    <p className="font-medium text-blue-600">{formValues.resumeUrl}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Skills</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between pt-4">
              {currentStep > 0 ? (
                <Button type="button" variant="outline" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              ) : (
                <div />
              )}
              {currentStep === 0 ? (
                <Button type="button" onClick={handleNext}>
                  {uploadedFileName ? "Next" : "Skip"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : currentStep < steps.length - 1 ? (
                <Button type="button" onClick={handleNext}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={submitMutation.isPending}
                >
                  {submitMutation.isPending ? "Submitting..." : "Submit Profile"}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
