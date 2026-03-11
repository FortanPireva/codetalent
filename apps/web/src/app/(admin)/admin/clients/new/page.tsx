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
import { CompanySize, ClientStatus } from "@codetalent/db";
import { companySizeLabels, clientStatusLabels } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

const clientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
  description: z.string().min(10, "Description must be at least 10 characters"),
  industry: z.string().min(2, "Industry is required"),
  size: z.nativeEnum(CompanySize),
  location: z.string().min(2, "Location is required"),
  contactName: z.string().min(2, "Contact name is required"),
  contactEmail: z.string().email("Must be a valid email"),
  website: z.string().url("Must be a valid URL").or(z.literal("")),
  logo: z.string().url("Must be a valid URL").or(z.literal("")),
  techStackStr: z.string(),
  status: z.nativeEnum(ClientStatus),
  notes: z.string(),
});

type ClientFormData = z.infer<typeof clientSchema>;

export default function NewClientPage() {
  const router = useRouter();

  const createMutation = api.clients.create.useMutation({
    onSuccess: () => {
      toast.success("Client created successfully!");
      router.push("/admin/clients");
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
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      industry: "",
      size: CompanySize.STARTUP,
      location: "",
      contactName: "",
      contactEmail: "",
      website: "",
      logo: "",
      techStackStr: "",
      status: ClientStatus.LEAD,
      notes: "",
    },
  });

  const name = watch("name");

  const generateSlug = () => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
    setValue("slug", slug);
  };

  const onSubmit = (data: ClientFormData) => {
    const { techStackStr, ...rest } = data;
    const techStack = techStackStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    createMutation.mutate({
      ...rest,
      techStack,
      website: rest.website || "",
      logo: rest.logo || "",
      notes: rest.notes || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild className="gap-2">
        <Link href="/admin/clients">
          <ArrowLeft className="h-4 w-4" />
          Back to Clients
        </Link>
      </Button>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Client</h1>
        <p className="text-muted-foreground">
          Register a new company client
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Company Info</CardTitle>
            <CardDescription>Basic company details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name</Label>
              <Input
                id="name"
                placeholder="e.g., TechCorp Solutions"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <div className="flex gap-2">
                <Input
                  id="slug"
                  placeholder="e.g., techcorp-solutions"
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
                placeholder="Brief company description..."
                rows={3}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  placeholder="e.g., Technology"
                  {...register("industry")}
                />
                {errors.industry && (
                  <p className="text-sm text-red-500">
                    {errors.industry.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="size">Company Size</Label>
                <Select
                  value={watch("size")}
                  onValueChange={(v) => setValue("size", v as CompanySize)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
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

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., San Francisco, CA"
                {...register("location")}
              />
              {errors.location && (
                <p className="text-sm text-red-500">
                  {errors.location.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
            <CardDescription>Primary contact person</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contactName">Contact Name</Label>
                <Input
                  id="contactName"
                  placeholder="e.g., John Smith"
                  {...register("contactName")}
                />
                {errors.contactName && (
                  <p className="text-sm text-red-500">
                    {errors.contactName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="e.g., john@techcorp.com"
                  {...register("contactEmail")}
                />
                {errors.contactEmail && (
                  <p className="text-sm text-red-500">
                    {errors.contactEmail.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>Additional information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  placeholder="https://techcorp.com"
                  {...register("website")}
                />
                {errors.website && (
                  <p className="text-sm text-red-500">
                    {errors.website.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Logo URL</Label>
                <Input
                  id="logo"
                  placeholder="https://example.com/logo.png"
                  {...register("logo")}
                />
                {errors.logo && (
                  <p className="text-sm text-red-500">{errors.logo.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="techStackStr">Tech Stack</Label>
              <Input
                id="techStackStr"
                placeholder="React, Node.js, PostgreSQL (comma-separated)"
                {...register("techStackStr")}
              />
              <p className="text-xs text-muted-foreground">
                Separate technologies with commas
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={watch("status")}
                onValueChange={(v) => setValue("status", v as ClientStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(clientStatusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes..."
                rows={3}
                {...register("notes")}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/clients">Cancel</Link>
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating..." : "Create Client"}
          </Button>
        </div>
      </form>
    </div>
  );
}
