"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from "axios";
import { toast } from "react-toastify";
import { useUser } from "src/store/useUser";
import { useCallback } from "react";
import CONFIGURATIONS from "@/configurations/configurations";
import { Loader2 } from "lucide-react";

// Add this constant at the top of the file after imports
const DEFAULT_AVATAR_PATH = "/images/default-user-avatar.png";

// Add form validation schema
const accountFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  profileImage: z.string().optional(),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

export function AccountForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { user, updateUser } = useUser();

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      profileImage: "",
    },
  });

  // Update form values when user data is available
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: `https://skybird-saas-boilerplate.s3.us-east-1.amazonaws.com/${user.profileImage}`,
      });
    }
  }, [user, form.reset]);

  const handleSubmit = async (data: AccountFormValues) => {
    if (!user?.id) {
      toast.error("User ID not found");
      return;
    }

    setIsLoading(true);
    try {
      // Create FormData
      const formData = new FormData();
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);

      const response = await axios.put(`/api/user/${user.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        updateUser(response.data);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Failed to update profile"
        );
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Create FormData
      const formData = new FormData();
      formData.append("file", file);
      formData.append("firstName", form.getValues("firstName"));
      formData.append("lastName", form.getValues("lastName"));

      if (user) {
        const response = await axios.put(`/api/user/${user.id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.status === 200) {
          updateUser(response.data);
          toast.success("Profile updated successfully");
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Failed to update profile"
        );
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) {
    return null; // or loading state or redirect to login
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-24 w-24">
            <AvatarImage
              src={form.watch("profileImage") || DEFAULT_AVATAR_PATH}
              alt="Profile"
            />
            <AvatarFallback>
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <Button
            variant="outline"
            type="button"
            onClick={() => document.getElementById("profileImage")?.click()}
            disabled={isUploading || isLoading}
          >
            <input
              id="profileImage"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading || isLoading}
            />
            {isUploading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin" /> Uploading...
              </div>
            ) : (
              "Change Avatar"
            )}
          </Button>
        </div>
        <Separator />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              {...form.register("firstName")}
              placeholder="Enter your first name"
              disabled={isLoading || isUploading}
            />
            {form.formState.errors.firstName && (
              <p className="text-sm text-red-500">
                {form.formState.errors.firstName.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              {...form.register("lastName")}
              placeholder="Enter your last name"
              disabled={isLoading || isUploading}
            />
            {form.formState.errors.lastName && (
              <p className="text-sm text-red-500">
                {form.formState.errors.lastName.message}
              </p>
            )}
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user.email}
              disabled
              placeholder="Enter your email"
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading || isUploading}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin" /> Saving...
            </div>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
}
