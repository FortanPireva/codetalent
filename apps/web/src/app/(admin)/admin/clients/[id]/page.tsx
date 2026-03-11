"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { CompanySize, ClientStatus } from "@codetalent/db";
import {
  companySizeLabels,
  clientStatusLabels,
  clientStatusColors,
  formatDate,
} from "@/lib/utils";
import {
  ArrowLeft,
  ExternalLink,
  Globe,
  MapPin,
  Mail,
  Calendar,
  User,
  Trash2,
} from "lucide-react";
import { useState } from "react";

const editSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  industry: z.string().min(2),
  size: z.nativeEnum(CompanySize),
  location: z.string().min(2),
  contactName: z.string().min(2),
  contactEmail: z.string().email(),
  website: z.string().url().or(z.literal("")),
  logo: z.string().url().or(z.literal("")),
  techStackStr: z.string(),
  status: z.nativeEnum(ClientStatus),
  notes: z.string(),
});

type EditFormData = z.infer<typeof editSchema>;

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: client, isLoading } = api.clients.getById.useQuery(
    { id: clientId },
    { enabled: !!clientId }
  );

  const updateMutation = api.clients.update.useMutation({
    onSuccess: () => {
      toast.success("Client updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = api.clients.delete.useMutation({
    onSuccess: () => {
      toast.success("Client deleted");
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
    reset,
    formState: { errors },
  } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: "",
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

  useEffect(() => {
    if (client) {
      reset({
        name: client.name,
        description: client.description,
        industry: client.industry,
        size: client.size,
        location: client.location,
        contactName: client.contactName,
        contactEmail: client.contactEmail,
        website: client.website ?? "",
        logo: client.logo ?? "",
        techStackStr: client.techStack.join(", "),
        status: client.status,
        notes: client.notes ?? "",
      });
    }
  }, [client, reset]);

  const onSubmit = (data: EditFormData) => {
    const { techStackStr, ...rest } = data;
    const techStack = techStackStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    updateMutation.mutate({
      id: clientId,
      ...rest,
      techStack,
      notes: rest.notes || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse" />
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-8 bg-gray-200 rounded w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-200 rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!client) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">Client not found</p>
          <Button asChild>
            <Link href="/admin/clients">Back to Clients</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild className="gap-2">
        <Link href="/admin/clients">
          <ArrowLeft className="h-4 w-4" />
          Back to Clients
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main edit form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Info</CardTitle>
                <CardDescription>Edit company details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name</Label>
                  <Input id="name" {...register("name")} />
                  {errors.name && (
                    <p className="text-sm text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
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
                    <Input id="industry" {...register("industry")} />
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" {...register("location")} />
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
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Contact Name</Label>
                    <Input id="contactName" {...register("contactName")} />
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
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" {...register("website")} />
                    {errors.website && (
                      <p className="text-sm text-red-500">
                        {errors.website.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="logo">Logo URL</Label>
                    <Input id="logo" {...register("logo")} />
                    {errors.logo && (
                      <p className="text-sm text-red-500">
                        {errors.logo.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="techStackStr">Tech Stack</Label>
                  <Input
                    id="techStackStr"
                    placeholder="React, Node.js, PostgreSQL"
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
                    onValueChange={(v) =>
                      setValue("status", v as ClientStatus)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(clientStatusLabels).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" rows={3} {...register("notes")} />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge className={clientStatusColors[client.status]}>
                  {clientStatusLabels[client.status]}
                </Badge>
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {client.location}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {client.contactName}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {client.contactEmail}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Added {formatDate(client.createdAt)}
                </div>
              </div>
            </CardContent>
          </Card>

          {client.website && (
            <Card>
              <CardHeader>
                <CardTitle>Links</CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={client.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Globe className="h-4 w-4" />
                  Website
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </a>
              </CardContent>
            </Card>
          )}

          {client.techStack.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tech Stack</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {client.techStack.map((tech) => (
                    <Badge key={tech} variant="secondary">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {client.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{client.notes}</p>
              </CardContent>
            </Card>
          )}

          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Client
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{client.name}&quot;? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate({ id: clientId })}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
