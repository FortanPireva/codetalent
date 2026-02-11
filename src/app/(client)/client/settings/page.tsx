"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { CompanySize } from "@prisma/client";
import { companySizeLabels } from "@/lib/utils";
import { X, ImagePlus, Loader2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

const companyProfileSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  industry: z.string().min(2, "Industry is required"),
  size: z.nativeEnum(CompanySize),
  location: z.string().min(2, "Location is required"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000),
  techStack: z.array(z.string()),
  logo: z.string().url().optional().or(z.literal("")),
  contactName: z.string().min(2, "Contact name is required"),
  phone: z.string().min(1, "Phone is required"),
});

type CompanyProfileFormData = z.infer<typeof companyProfileSchema>;

export default function CompanySettingsPage() {
  const router = useRouter();
  const [techInput, setTechInput] = useState("");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const { data: status, isLoading } = api.clientOnboarding.getStatus.useQuery();
  const utils = api.useUtils();

  const updateMutation = api.clientOnboarding.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Company profile updated!");
      void utils.clientOnboarding.getStatus.invalidate();
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
  } = useForm<CompanyProfileFormData>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      companyName: "",
      website: "",
      industry: "",
      size: CompanySize.STARTUP,
      location: "",
      description: "",
      techStack: [],
      logo: "",
      contactName: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (status?.client) {
      const c = status.client;
      reset({
        companyName: c.name,
        website: c.website ?? "",
        industry: c.industry,
        size: c.size,
        location: c.location,
        description: c.description,
        techStack: c.techStack,
        logo: c.logo ?? "",
        contactName: c.contactName,
        phone: status.phone ?? "",
      });
      if (c.logo) setLogoPreview(c.logo);
    }
  }, [status, reset]);

  const techStack = watch("techStack");
  const formValues = watch();

  const addTech = () => {
    const trimmed = techInput.trim();
    if (trimmed && !techStack.includes(trimmed)) {
      setValue("techStack", [...techStack, trimmed], { shouldValidate: true, shouldDirty: true });
      setTechInput("");
    }
  };

  const removeTech = (tech: string) => {
    setValue(
      "techStack",
      techStack.filter((t) => t !== tech),
      { shouldValidate: true, shouldDirty: true }
    );
  };

  const handleLogoUpload = async (file: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Only JPEG, PNG, and WebP images are accepted");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    setIsUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "logo");

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      const { url } = await response.json();
      setValue("logo", url, { shouldDirty: true });
      setLogoPreview(url);
      toast.success("Logo uploaded!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload logo");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const onSubmit = (data: CompanyProfileFormData) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/client/dashboard">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Company Settings</h1>
          <p className="text-muted-foreground">
            Update your company profile information
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Logo & Company Name */}
        <Card>
          <CardHeader>
            <CardTitle>Company Identity</CardTitle>
            <CardDescription>Your company logo and name</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Company Logo</Label>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleLogoUpload(file);
                }}
              />
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                disabled={isUploadingLogo}
                className="mt-1 w-full"
              >
                {logoPreview ? (
                  <div className="border-2 border-dashed rounded-lg p-4 flex items-center gap-4 hover:border-primary transition-colors">
                    <img
                      src={logoPreview}
                      alt="Company logo"
                      className="h-16 w-16 object-contain rounded"
                    />
                    <div className="text-left">
                      <p className="text-sm font-medium">Logo uploaded</p>
                      <p className="text-xs text-muted-foreground">
                        Click to change
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center gap-2 hover:border-primary transition-colors">
                    {isUploadingLogo ? (
                      <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                    ) : (
                      <ImagePlus className="h-8 w-8 text-muted-foreground" />
                    )}
                    <p className="text-sm text-muted-foreground">
                      {isUploadingLogo
                        ? "Uploading..."
                        : "Upload company logo (JPEG, PNG, or WebP, max 2MB)"}
                    </p>
                  </div>
                )}
              </button>
            </div>

            <div>
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                {...register("companyName")}
                placeholder="Acme Corp"
              />
              {errors.companyName && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.companyName.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Company Details */}
        <Card>
          <CardHeader>
            <CardTitle>Company Details</CardTitle>
            <CardDescription>
              Industry, size, location, and description
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                {...register("website")}
                placeholder="https://acme.com"
              />
              {errors.website && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.website.message}
                </p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="industry">Industry *</Label>
                <Input
                  id="industry"
                  {...register("industry")}
                  placeholder="Technology"
                />
                {errors.industry && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.industry.message}
                  </p>
                )}
              </div>
              <div>
                <Label>Company Size *</Label>
                <Select
                  value={formValues.size}
                  onValueChange={(v) =>
                    setValue("size", v as CompanySize, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(companySizeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                {...register("location")}
                placeholder="San Francisco, CA"
              />
              {errors.location && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.location.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="description">Company Description *</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Tell us about your company..."
                rows={4}
              />
              <div className="flex justify-between mt-1">
                {errors.description && (
                  <p className="text-sm text-red-500">
                    {errors.description.message}
                  </p>
                )}
                <p className="text-sm text-muted-foreground ml-auto">
                  {formValues.description?.length ?? 0}/1000
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tech Stack */}
        <Card>
          <CardHeader>
            <CardTitle>Tech Stack</CardTitle>
            <CardDescription>
              Technologies your company uses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                placeholder="e.g. React, Node.js, Python"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTech();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addTech}>
                Add
              </Button>
            </div>
            {techStack.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {techStack.map((tech) => (
                  <Badge key={tech} variant="secondary" className="gap-1">
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeTech(tech)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Primary contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="contactName">Contact Name *</Label>
                <Input
                  id="contactName"
                  {...register("contactName")}
                  placeholder="Jane Smith"
                />
                {errors.contactName && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.contactName.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder="+1 234 567 8900"
                />
                {errors.phone && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit" disabled={updateMutation.isPending || !isDirty}>
            {updateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
