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
import { CompanySize, SubscriptionTier, BillingInterval } from "@codetalent/db";
import { companySizeLabels } from "@/lib/utils";
import { PLANS, formatPrice } from "@/lib/plans";
import { cn } from "@/lib/utils";
import {
  User,
  Building2,
  Code,
  CreditCard,
  CheckCircle,
  Check,
  ArrowRight,
  ArrowLeft,
  X,
  ImagePlus,
  Loader2,
} from "lucide-react";

const clientOnboardingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(1, "Phone is required"),
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
  selectedPlan: z.nativeEnum(SubscriptionTier),
  billingInterval: z.nativeEnum(BillingInterval),
});

type ClientOnboardingFormData = z.infer<typeof clientOnboardingSchema>;

const steps = [
  {
    title: "Personal Info",
    icon: User,
    description: "Your contact details",
  },
  {
    title: "Company Info",
    icon: Building2,
    description: "Tell us about your company",
  },
  {
    title: "Technical Details",
    icon: Code,
    description: "Your tech stack",
  },
  {
    title: "Choose Plan",
    icon: CreditCard,
    description: "Select your subscription plan",
  },
  {
    title: "Review & Submit",
    icon: CheckCircle,
    description: "Confirm your details",
  },
];

const stepFields: (keyof ClientOnboardingFormData)[][] = [
  ["name", "phone"],
  ["companyName", "industry", "size", "location", "description"],
  ["techStack"],
  ["selectedPlan", "billingInterval"],
  [],
];

export default function ClientOnboardingPage() {
  const router = useRouter();
  const { update } = useSession();
  const [currentStep, setCurrentStep] = useState(0);
  const [techInput, setTechInput] = useState("");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const submitMutation = api.clientOnboarding.submit.useMutation({
    onSuccess: async () => {
      toast.success("Company profile submitted for review!");
      await update();
      router.push("/client/pending");
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
  } = useForm<ClientOnboardingFormData>({
    resolver: zodResolver(clientOnboardingSchema),
    defaultValues: {
      name: "",
      phone: "",
      companyName: "",
      website: "",
      industry: "",
      size: CompanySize.STARTUP,
      location: "",
      description: "",
      techStack: [],
      logo: "",
      selectedPlan: SubscriptionTier.GROWTH,
      billingInterval: BillingInterval.MONTHLY,
    },
  });

  const techStack = watch("techStack");
  const formValues = watch();

  const addTech = () => {
    const trimmed = techInput.trim();
    if (trimmed && !techStack.includes(trimmed)) {
      setValue("techStack", [...techStack, trimmed], { shouldValidate: true });
      setTechInput("");
    }
  };

  const removeTech = (tech: string) => {
    setValue(
      "techStack",
      techStack.filter((t) => t !== tech),
      { shouldValidate: true }
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
      setValue("logo", url);
      setLogoPreview(url);
      toast.success("Company logo uploaded!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload logo");
    } finally {
      setIsUploadingLogo(false);
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

  const onSubmit = (data: ClientOnboardingFormData) => {
    submitMutation.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Complete Your Company Profile
        </h1>
        <p className="text-muted-foreground mt-2">
          Tell us about your company to get started with Talentflow
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
            {/* Step 0: Personal Info */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="Jane Smith"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.name.message}
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
            )}

            {/* Step 1: Company Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                {/* Logo upload */}
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
                          <p className="text-xs text-muted-foreground">Click to change</p>
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
                          {isUploadingLogo ? "Uploading..." : "Upload company logo (JPEG, PNG, or WebP, max 2MB)"}
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
                      })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(companySizeLabels).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
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
                    placeholder="Tell us about your company, what you do, and what kind of developers you're looking to hire..."
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
              </div>
            )}

            {/* Step 2: Technical Details */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label>Tech Stack</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Add the technologies your company uses
                  </p>
                  <div className="flex gap-2 mt-1">
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
                </div>
              </div>
            )}

            {/* Step 3: Choose Plan */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setValue("billingInterval", BillingInterval.MONTHLY, {
                        shouldValidate: true,
                      })
                    }
                    className={cn(
                      "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                      formValues.billingInterval === "MONTHLY"
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground bg-secondary"
                    )}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setValue("billingInterval", BillingInterval.YEARLY, {
                        shouldValidate: true,
                      })
                    }
                    className={cn(
                      "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                      formValues.billingInterval === "YEARLY"
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground bg-secondary"
                    )}
                  >
                    Yearly (Save 26%)
                  </button>
                </div>

                {/* Plan Cards */}
                <div className="grid gap-4">
                  {PLANS.map((plan) => {
                    const isSelected = formValues.selectedPlan === plan.tier;
                    const price =
                      formValues.billingInterval === "YEARLY"
                        ? Math.round(plan.yearlyPrice / 12)
                        : plan.monthlyPrice;

                    return (
                      <button
                        key={plan.tier}
                        type="button"
                        onClick={() =>
                          setValue("selectedPlan", plan.tier as SubscriptionTier, {
                            shouldValidate: true,
                          })
                        }
                        className={cn(
                          "w-full text-left rounded-lg border-2 p-4 transition-all duration-200",
                          isSelected
                            ? "border-foreground bg-foreground/5"
                            : "border-border hover:border-foreground/30"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{plan.name}</span>
                              {plan.recommended && (
                                <Badge variant="default" className="text-[10px] rounded-md">
                                  Most Popular
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {plan.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-bold">
                              {formatPrice(price)}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              /mo
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                          {plan.features.slice(0, 3).map((f) => (
                            <span
                              key={f}
                              className="text-xs text-muted-foreground flex items-center gap-1"
                            >
                              <Check className="h-3 w-3" />
                              {f}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <p className="text-sm text-muted-foreground text-center">
                  Have a promo code? You&apos;ll enter it at checkout.
                </p>
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {currentStep === 4 && (
              <div className="space-y-6">
                {logoPreview && (
                  <div className="flex items-center gap-4">
                    <img
                      src={logoPreview}
                      alt="Company logo"
                      className="h-14 w-14 object-contain rounded"
                    />
                    <p className="font-semibold text-lg">{formValues.companyName}</p>
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Contact Name
                    </p>
                    <p className="font-medium">{formValues.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Phone
                    </p>
                    <p className="font-medium">{formValues.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Company Name
                    </p>
                    <p className="font-medium">{formValues.companyName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Industry
                    </p>
                    <p className="font-medium">{formValues.industry}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Company Size
                    </p>
                    <p className="font-medium">
                      {companySizeLabels[formValues.size]}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Location
                    </p>
                    <p className="font-medium">{formValues.location}</p>
                  </div>
                </div>
                {formValues.website && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Website
                    </p>
                    <p className="font-medium text-blue-600">
                      {formValues.website}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Description
                  </p>
                  <p className="mt-1">{formValues.description}</p>
                </div>
                {techStack.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Tech Stack
                    </p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {techStack.map((tech) => (
                        <Badge key={tech} variant="secondary">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Selected Plan
                    </p>
                    <p className="font-medium">
                      {PLANS.find((p) => p.tier === formValues.selectedPlan)?.name ?? formValues.selectedPlan}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Billing
                    </p>
                    <p className="font-medium">
                      {formValues.billingInterval === "YEARLY" ? "Yearly" : "Monthly"}
                    </p>
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
              {currentStep < steps.length - 1 ? (
                <Button type="button" onClick={handleNext}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" disabled={submitMutation.isPending}>
                  {submitMutation.isPending
                    ? "Submitting..."
                    : "Submit Company Profile"}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
