"use client";

import { useState } from "react";
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
import { CompanySize } from "@prisma/client";
import { companySizeLabels } from "@/lib/utils";
import {
  User,
  Building2,
  Code,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  X,
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
    title: "Review & Submit",
    icon: CheckCircle,
    description: "Confirm your details",
  },
];

const stepFields: (keyof ClientOnboardingFormData)[][] = [
  ["name", "phone"],
  ["companyName", "industry", "size", "location", "description"],
  ["techStack"],
  [],
];

export default function ClientOnboardingPage() {
  const router = useRouter();
  const { update } = useSession();
  const [currentStep, setCurrentStep] = useState(0);
  const [techInput, setTechInput] = useState("");

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
          Tell us about your company to get started with Codeks HR
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((step, index) => (
          <div key={step.title} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                index < currentStep
                  ? "bg-primary border-primary text-primary-foreground"
                  : index === currentStep
                    ? "border-primary text-primary"
                    : "border-gray-300 text-gray-400"
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
                className={`w-8 h-0.5 mx-1 ${
                  index < currentStep ? "bg-primary" : "bg-gray-300"
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

            {/* Step 3: Review & Submit */}
            {currentStep === 3 && (
              <div className="space-y-6">
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
