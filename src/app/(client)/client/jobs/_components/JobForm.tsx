"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import {
  ExperienceLevel,
  EmploymentType,
  WorkArrangement,
  JobUrgency,
} from "@prisma/client";
import {
  experienceLevelLabels,
  employmentTypeLabels,
  workArrangementLabels,
  jobUrgencyLabels,
  roleTypeOptions,
  commonBenefits,
  currencyOptions,
  salaryPeriodOptions,
} from "@/lib/utils";
import { TagInput } from "./TagInput";
import {
  ArrowRight,
  ArrowLeft,
  FileText,
  Code,
  MapPin,
  DollarSign,
  ClipboardList,
  CheckCircle,
} from "lucide-react";

export const jobFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  roleType: z.string().optional(),
  experienceLevel: z.nativeEnum(ExperienceLevel).optional(),
  employmentType: z.nativeEnum(EmploymentType).optional(),
  summary: z.string().max(300, "Summary must be 300 characters or less").optional(),
  requiredSkills: z.array(z.string()).default([]),
  preferredSkills: z.array(z.string()).default([]),
  frameworks: z.array(z.string()).default([]),
  databases: z.array(z.string()).default([]),
  cloud: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([]),
  techStack: z.array(z.string()).default([]),
  yearsMin: z.number().int().min(0).optional(),
  yearsMax: z.number().int().min(0).optional(),
  workArrangement: z.nativeEnum(WorkArrangement).optional(),
  location: z.string().optional(),
  timezone: z.string().optional(),
  relocation: z.boolean().default(false),
  visaSponsorship: z.boolean().default(false),
  showSalary: z.boolean().default(true),
  salaryMin: z.number().int().min(0).optional(),
  salaryMax: z.number().int().min(0).optional(),
  salaryCurrency: z.string().default("USD"),
  salaryPeriod: z.string().default("YEARLY"),
  equity: z.boolean().default(false),
  equityRange: z.string().optional(),
  bonus: z.string().optional(),
  benefits: z.array(z.string()).default([]),
  description: z.string().optional(),
  responsibilities: z.string().optional(),
  requirements: z.string().optional(),
  niceToHave: z.string().optional(),
  interviewStages: z.array(z.string()).default([]),
  interviewLength: z.string().optional(),
  headcount: z.number().int().min(1).default(1),
  urgency: z.nativeEnum(JobUrgency).default("MEDIUM"),
  startsAt: z.string().optional(),
  closesAt: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export type JobFormData = z.infer<typeof jobFormSchema>;
type JobFormInput = z.input<typeof jobFormSchema>;

const steps = [
  { title: "Basic Info", icon: FileText, description: "Title, role, and summary" },
  { title: "Requirements", icon: Code, description: "Skills and tech stack" },
  { title: "Work Setup", icon: MapPin, description: "Location and arrangement" },
  { title: "Compensation", icon: DollarSign, description: "Salary and benefits" },
  { title: "Description", icon: ClipboardList, description: "Details and interview" },
  { title: "Review", icon: CheckCircle, description: "Review and publish" },
];

const stepFields: (keyof JobFormData)[][] = [
  ["title", "roleType", "experienceLevel", "employmentType", "summary"],
  ["requiredSkills", "preferredSkills", "frameworks", "databases", "cloud", "tools", "yearsMin", "yearsMax"],
  ["workArrangement", "location", "timezone", "relocation", "visaSponsorship"],
  ["showSalary", "salaryMin", "salaryMax", "salaryCurrency", "salaryPeriod", "equity", "equityRange", "bonus", "benefits"],
  ["description", "responsibilities", "requirements", "niceToHave", "interviewStages", "interviewLength"],
  [],
];

interface JobFormProps {
  defaultValues?: Partial<JobFormData>;
  onSubmit: (data: JobFormData, publish: boolean) => void;
  isPending: boolean;
  mode: "create" | "edit";
}

export function JobForm({ defaultValues, onSubmit, isPending, mode }: JobFormProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<JobFormInput, unknown, JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: "",
      roleType: undefined,
      experienceLevel: undefined,
      employmentType: undefined,
      summary: "",
      requiredSkills: [],
      preferredSkills: [],
      frameworks: [],
      databases: [],
      cloud: [],
      tools: [],
      techStack: [],
      yearsMin: undefined,
      yearsMax: undefined,
      workArrangement: undefined,
      location: "",
      timezone: "",
      relocation: false,
      visaSponsorship: false,
      showSalary: true,
      salaryMin: undefined,
      salaryMax: undefined,
      salaryCurrency: "USD",
      salaryPeriod: "YEARLY",
      equity: false,
      equityRange: "",
      bonus: "",
      benefits: [],
      description: "",
      responsibilities: "",
      requirements: "",
      niceToHave: "",
      interviewStages: [],
      interviewLength: "",
      headcount: 1,
      urgency: "MEDIUM",
      startsAt: "",
      closesAt: "",
      tags: [],
      ...defaultValues,
    },
  });

  const formValues = watch();

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

  const doSubmit = (data: JobFormData, publish: boolean) => {
    onSubmit(data, publish);
  };

  return (
    <div className="space-y-8">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-1 overflow-x-auto pb-2">
        {steps.map((step, index) => (
          <div key={step.title} className="flex items-center">
            <button
              type="button"
              onClick={() => index < currentStep && setCurrentStep(index)}
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                index < currentStep
                  ? "bg-primary border-primary text-primary-foreground cursor-pointer"
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
            </button>
            {index < steps.length - 1 && (
              <div
                className={`w-6 h-0.5 mx-0.5 ${
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
          <form
            onSubmit={handleSubmit((data) => doSubmit(data, false))}
            className="space-y-6"
          >
            {/* Step 0: Basic Info */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    {...register("title")}
                    placeholder="e.g. Senior Frontend Engineer"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
                  )}
                </div>
                <div>
                  <Label>Role Type</Label>
                  <Select
                    value={formValues.roleType ?? ""}
                    onValueChange={(v) => setValue("roleType", v, { shouldValidate: true })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select role type" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleTypeOptions.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Experience Level</Label>
                  <Select
                    value={formValues.experienceLevel ?? ""}
                    onValueChange={(v) =>
                      setValue("experienceLevel", v as ExperienceLevel, {
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(experienceLevelLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Employment Type</Label>
                  <Select
                    value={formValues.employmentType ?? ""}
                    onValueChange={(v) =>
                      setValue("employmentType", v as EmploymentType, {
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(employmentTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="summary">Summary</Label>
                  <Textarea
                    id="summary"
                    {...register("summary")}
                    placeholder="Brief summary of the role (max 300 characters)"
                    rows={3}
                  />
                  <div className="flex justify-between mt-1">
                    {errors.summary && (
                      <p className="text-sm text-red-500">{errors.summary.message}</p>
                    )}
                    <p className="text-sm text-muted-foreground ml-auto">
                      {formValues.summary?.length ?? 0}/300
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Requirements */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label>Required Skills</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Skills candidates must have
                  </p>
                  <TagInput
                    value={formValues.requiredSkills ?? []}
                    onChange={(v) => setValue("requiredSkills", v)}
                    placeholder="e.g. React, TypeScript"
                  />
                </div>
                <div>
                  <Label>Preferred Skills</Label>
                  <p className="text-sm text-muted-foreground mb-2">Nice-to-have skills</p>
                  <TagInput
                    value={formValues.preferredSkills ?? []}
                    onChange={(v) => setValue("preferredSkills", v)}
                    placeholder="e.g. GraphQL, Next.js"
                  />
                </div>
                <div>
                  <Label>Frameworks</Label>
                  <TagInput
                    value={formValues.frameworks ?? []}
                    onChange={(v) => setValue("frameworks", v)}
                    placeholder="e.g. Next.js, Express"
                  />
                </div>
                <div>
                  <Label>Databases</Label>
                  <TagInput
                    value={formValues.databases ?? []}
                    onChange={(v) => setValue("databases", v)}
                    placeholder="e.g. PostgreSQL, MongoDB"
                  />
                </div>
                <div>
                  <Label>Cloud / Infrastructure</Label>
                  <TagInput
                    value={formValues.cloud ?? []}
                    onChange={(v) => setValue("cloud", v)}
                    placeholder="e.g. AWS, Vercel"
                  />
                </div>
                <div>
                  <Label>Tools</Label>
                  <TagInput
                    value={formValues.tools ?? []}
                    onChange={(v) => setValue("tools", v)}
                    placeholder="e.g. Docker, GitHub Actions"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="yearsMin">Min. Years Experience</Label>
                    <Input
                      id="yearsMin"
                      type="number"
                      min={0}
                      {...register("yearsMin", { valueAsNumber: true })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="yearsMax">Max. Years Experience</Label>
                    <Input
                      id="yearsMax"
                      type="number"
                      min={0}
                      {...register("yearsMax", { valueAsNumber: true })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Work Setup */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label>Work Arrangement</Label>
                  <RadioGroup
                    value={formValues.workArrangement ?? ""}
                    onValueChange={(v) =>
                      setValue("workArrangement", v as WorkArrangement, {
                        shouldValidate: true,
                      })
                    }
                    className="grid grid-cols-2 gap-3 mt-2"
                  >
                    {Object.entries(workArrangementLabels).map(([value, label]) => (
                      <div key={value} className="flex items-center space-x-2">
                        <RadioGroupItem value={value} id={`wa-${value}`} />
                        <Label htmlFor={`wa-${value}`} className="cursor-pointer">
                          {label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                {formValues.workArrangement &&
                  formValues.workArrangement !== "REMOTE_GLOBAL" && (
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        {...register("location")}
                        placeholder="e.g. San Francisco, CA"
                      />
                    </div>
                  )}
                <div>
                  <Label htmlFor="timezone">Timezone Preference</Label>
                  <Input
                    id="timezone"
                    {...register("timezone")}
                    placeholder="e.g. UTC-5 to UTC+1"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="relocation"
                      checked={formValues.relocation ?? false}
                      onCheckedChange={(c) => setValue("relocation", !!c)}
                    />
                    <Label htmlFor="relocation" className="cursor-pointer">
                      Relocation assistance available
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="visaSponsorship"
                      checked={formValues.visaSponsorship ?? false}
                      onCheckedChange={(c) => setValue("visaSponsorship", !!c)}
                    />
                    <Label htmlFor="visaSponsorship" className="cursor-pointer">
                      Visa sponsorship available
                    </Label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Compensation */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Show Salary</Label>
                  <Switch
                    checked={formValues.showSalary ?? true}
                    onCheckedChange={(c) => setValue("showSalary", c)}
                  />
                </div>
                {(formValues.showSalary ?? true) && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="salaryMin">Salary Min</Label>
                        <Input
                          id="salaryMin"
                          type="number"
                          min={0}
                          {...register("salaryMin", { valueAsNumber: true })}
                          placeholder="e.g. 80000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="salaryMax">Salary Max</Label>
                        <Input
                          id="salaryMax"
                          type="number"
                          min={0}
                          {...register("salaryMax", { valueAsNumber: true })}
                          placeholder="e.g. 120000"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Currency</Label>
                        <Select
                          value={formValues.salaryCurrency}
                          onValueChange={(v) => setValue("salaryCurrency", v)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {currencyOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Period</Label>
                        <Select
                          value={formValues.salaryPeriod}
                          onValueChange={(v) => setValue("salaryPeriod", v)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {salaryPeriodOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </>
                )}
                <div className="flex items-center justify-between">
                  <Label>Equity Offered</Label>
                  <Switch
                    checked={formValues.equity ?? false}
                    onCheckedChange={(c) => setValue("equity", c)}
                  />
                </div>
                {(formValues.equity ?? false) && (
                  <div>
                    <Label htmlFor="equityRange">Equity Range</Label>
                    <Input
                      id="equityRange"
                      {...register("equityRange")}
                      placeholder="e.g. 0.1% - 0.5%"
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="bonus">Bonus Details</Label>
                  <Input
                    id="bonus"
                    {...register("bonus")}
                    placeholder="e.g. 10-20% annual performance bonus"
                  />
                </div>
                <div>
                  <Label>Benefits</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {commonBenefits.map((benefit) => (
                      <div key={benefit} className="flex items-center space-x-2">
                        <Checkbox
                          id={`benefit-${benefit}`}
                          checked={(formValues.benefits ?? []).includes(benefit)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setValue("benefits", [...(formValues.benefits ?? []), benefit]);
                            } else {
                              setValue(
                                "benefits",
                                (formValues.benefits ?? []).filter((b) => b !== benefit)
                              );
                            }
                          }}
                        />
                        <Label htmlFor={`benefit-${benefit}`} className="text-sm cursor-pointer">
                          {benefit}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Description */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="description">Full Job Description</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Detailed description of the role, team, and project..."
                    rows={6}
                  />
                </div>
                <div>
                  <Label htmlFor="responsibilities">Key Responsibilities</Label>
                  <Textarea
                    id="responsibilities"
                    {...register("responsibilities")}
                    placeholder="What the candidate will be doing day-to-day..."
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="requirements">Requirements</Label>
                  <Textarea
                    id="requirements"
                    {...register("requirements")}
                    placeholder="Must-have qualifications..."
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="niceToHave">Nice to Have</Label>
                  <Textarea
                    id="niceToHave"
                    {...register("niceToHave")}
                    placeholder="Bonus qualifications..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Interview Stages</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Add steps in your interview process
                  </p>
                  <TagInput
                    value={formValues.interviewStages ?? []}
                    onChange={(v) => setValue("interviewStages", v)}
                    placeholder="e.g. Phone Screen, Technical Interview"
                  />
                </div>
                <div>
                  <Label htmlFor="interviewLength">Interview Process Length</Label>
                  <Input
                    id="interviewLength"
                    {...register("interviewLength")}
                    placeholder="e.g. 2-3 weeks"
                  />
                </div>
              </div>
            )}

            {/* Step 5: Review & Publish */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Job Title</p>
                    <p className="font-medium">{formValues.title}</p>
                  </div>
                  {formValues.roleType && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Role Type</p>
                      <p className="font-medium">{formValues.roleType}</p>
                    </div>
                  )}
                  {formValues.experienceLevel && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Experience</p>
                      <p className="font-medium">
                        {experienceLevelLabels[formValues.experienceLevel]}
                      </p>
                    </div>
                  )}
                  {formValues.employmentType && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Employment</p>
                      <p className="font-medium">
                        {employmentTypeLabels[formValues.employmentType]}
                      </p>
                    </div>
                  )}
                  {formValues.workArrangement && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Work Arrangement</p>
                      <p className="font-medium">
                        {workArrangementLabels[formValues.workArrangement]}
                      </p>
                    </div>
                  )}
                  {formValues.location && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Location</p>
                      <p className="font-medium">{formValues.location}</p>
                    </div>
                  )}
                </div>

                {formValues.summary && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Summary</p>
                    <p className="mt-1">{formValues.summary}</p>
                  </div>
                )}

                {(formValues.showSalary ?? true) && (formValues.salaryMin || formValues.salaryMax) && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Compensation</p>
                    <p className="font-medium">
                      {formValues.salaryCurrency}{" "}
                      {formValues.salaryMin?.toLocaleString()}
                      {formValues.salaryMax ? ` - ${formValues.salaryMax.toLocaleString()}` : ""}
                      {" / "}
                      {salaryPeriodOptions.find((o) => o.value === formValues.salaryPeriod)?.label}
                    </p>
                  </div>
                )}

                {(formValues.requiredSkills ?? []).length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Required Skills</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {(formValues.requiredSkills ?? []).map((s) => (
                        <Badge key={s} variant="secondary">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {(formValues.preferredSkills ?? []).length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Preferred Skills</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {(formValues.preferredSkills ?? []).map((s) => (
                        <Badge key={s} variant="outline">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {(formValues.benefits ?? []).length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Benefits</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {(formValues.benefits ?? []).map((b) => (
                        <Badge key={b} variant="secondary">{b}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <Label htmlFor="headcount">Headcount</Label>
                    <Input
                      id="headcount"
                      type="number"
                      min={1}
                      {...register("headcount", { valueAsNumber: true })}
                    />
                  </div>
                  <div>
                    <Label>Urgency</Label>
                    <Select
                      value={formValues.urgency}
                      onValueChange={(v) =>
                        setValue("urgency", v as JobUrgency, { shouldValidate: true })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(jobUrgencyLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="closesAt">Application Deadline</Label>
                    <Input
                      id="closesAt"
                      type="date"
                      {...register("closesAt")}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="startsAt">Expected Start Date</Label>
                  <Input
                    id="startsAt"
                    type="date"
                    {...register("startsAt")}
                    className="max-w-xs"
                  />
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
                <div className="flex gap-3">
                  <Button
                    type="submit"
                    variant="outline"
                    disabled={isPending}
                  >
                    {isPending ? "Saving..." : "Save as Draft"}
                  </Button>
                  <Button
                    type="button"
                    disabled={isPending}
                    onClick={handleSubmit((data) => doSubmit(data, true))}
                  >
                    {isPending
                      ? "Publishing..."
                      : mode === "edit"
                        ? "Save Changes"
                        : "Publish Job"}
                  </Button>
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
