"use client";

import { Badge } from "@/components/ui/badge";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";
import { z } from "zod";
import { cn } from "@/lib/utils";

// Validation schema for shipping address
const shippingAddressSchema = z.object({
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State/Province is required"),
  country: z.string().min(1, "Country is required"),
  postalCode: z
    .string()
    .min(1, "Postal code is required")
    .regex(
      /^[A-Za-z0-9\s-]{3,10}$/,
      "Postal code must be 3-10 characters (letters, numbers, spaces, hyphens)"
    ),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .refine(
      (val) => /^\+?[1-9]\d{1,14}$/.test(val.replace(/[\s-()]/g, "")),
      "Phone number must be 10-15 digits with optional + prefix"
    ),
  isDefault: z.boolean(),
});

type ShippingAddressFormData = z.infer<typeof shippingAddressSchema>;

interface ShippingAddress extends ShippingAddressFormData {
  id: string;
}

export function ShippingDetails() {
  const { data: session } = useSession();
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ShippingAddress | null>(
    null
  );
  const [formData, setFormData] = useState<ShippingAddressFormData>({
    street: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    phone: "",
    isDefault: false,
  });
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof ShippingAddressFormData, string>>
  >({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
  const [touchedFields, setTouchedFields] = useState<
    Set<keyof ShippingAddressFormData>
  >(new Set());

  // Fetch addresses on component mount
  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/shipping-address");
      if (!response.ok) throw new Error("Failed to fetch addresses");
      const data = await response.json();
      setAddresses(data);
    } catch (error) {
      toast.error("Failed to load addresses");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const validateField = (
    field: keyof ShippingAddressFormData,
    value: any
  ): string | undefined => {
    try {
      shippingAddressSchema.shape[field].parse(value);
      return undefined;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0].message;
      }
      return undefined;
    }
  };

  const handleInputChange = (
    field: keyof ShippingAddressFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setTouchedFields((prev) => new Set(prev).add(field));

    // Real-time validation for phone and postal code
    if (field === "phone" || field === "postalCode") {
      const error = validateField(field, value);
      setFormErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleBlur = (field: keyof ShippingAddressFormData) => {
    setTouchedFields((prev) => new Set(prev).add(field));
    const error = validateField(field, formData[field]);
    setFormErrors((prev) => ({ ...prev, [field]: error }));
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "");

    // Format as: +1 (XXX) XXX-XXXX
    if (digits.length <= 0) return "";
    if (digits.length <= 3) return `+${digits}`;
    if (digits.length <= 6) return `+${digits.slice(0, 3)} (${digits.slice(3)}`;
    if (digits.length <= 10)
      return `+${digits.slice(0, 3)} (${digits.slice(3, 6)}) ${digits.slice(
        6
      )}`;
    return `+${digits.slice(0, 3)} (${digits.slice(3, 6)}) ${digits.slice(
      6,
      10
    )}-${digits.slice(10, 14)}`;
  };

  const formatPostalCode = (value: string) => {
    // Convert to uppercase and remove invalid characters
    return value.toUpperCase().replace(/[^A-Z0-9\s-]/g, "");
  };

  const resetForm = () => {
    setFormData({
      street: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      phone: "",
      isDefault: false,
    });
    setEditingAddress(null);
    setShowAddForm(false);
  };

  const validateAllFields = () => {
    const errors: Partial<Record<keyof ShippingAddressFormData, string>> = {};
    let hasErrors = false;

    // Mark all fields as touched
    const allFields: (keyof ShippingAddressFormData)[] = [
      "street",
      "city",
      "state",
      "country",
      "postalCode",
      "phone",
      "isDefault",
    ];
    setTouchedFields(new Set(allFields));

    // Validate each field
    allFields.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
        hasErrors = true;
      }
    });

    setFormErrors(errors);
    return !hasErrors;
  };

  const handleSave = async () => {
    if (!validateAllFields()) {
      // Scroll to the first error
      const firstErrorField = document.querySelector(".border-red-500");
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
      };

      const endpoint = editingAddress
        ? `/api/shipping-address/${editingAddress.id}`
        : "/api/shipping-address";

      const method = editingAddress ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save address");
      }

      toast.success(
        `Address ${editingAddress ? "updated" : "added"} successfully!`
      );
      resetForm();
      fetchAddresses();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save address"
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (address: ShippingAddress) => {
    setEditingAddress(address);
    setFormData({
      street: address.street,
      city: address.city,
      state: address.state || "",
      country: address.country,
      postalCode: address.postalCode,
      phone: address.phone || "",
      isDefault: address.isDefault,
    });
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    setAddressToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!addressToDelete) return;

    try {
      const response = await fetch(`/api/shipping-address/${addressToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete address");

      toast.success("Address deleted successfully!");
      fetchAddresses();
    } catch (error) {
      toast.error("Failed to delete address");
      console.error(error);
    }
  };

  const handleCountryChange = (value: string) => {
    handleInputChange("country", value);
    // Clear country error immediately when a valid country is selected
    if (value) {
      setFormErrors((prev) => ({ ...prev, country: undefined }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Shipping Addresses</h3>
        {!showAddForm && (
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Address
          </Button>
        )}
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingAddress ? "Edit Address" : "Add New Address"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                value={formData.street}
                onChange={(e) => handleInputChange("street", e.target.value)}
                onBlur={() => handleBlur("street")}
                className={cn(
                  "transition-colors",
                  touchedFields.has("street") && formErrors.street
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                )}
                required
              />
              {touchedFields.has("street") && formErrors.street && (
                <p className="text-sm text-red-500 mt-1">{formErrors.street}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  onBlur={() => handleBlur("city")}
                  className={cn(
                    "transition-colors",
                    touchedFields.has("city") && formErrors.city
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  )}
                  required
                />
                {touchedFields.has("city") && formErrors.city && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.city}</p>
                )}
              </div>
              <div>
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  onBlur={() => handleBlur("state")}
                  className={cn(
                    "transition-colors",
                    touchedFields.has("state") && formErrors.state
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  )}
                  required
                />
                {touchedFields.has("state") && formErrors.state && (
                  <p className="text-sm text-red-500 mt-1">
                    {formErrors.state}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) =>
                    handleInputChange(
                      "postalCode",
                      formatPostalCode(e.target.value)
                    )
                  }
                  onBlur={() => handleBlur("postalCode")}
                  className={cn(
                    "transition-colors",
                    touchedFields.has("postalCode") && formErrors.postalCode
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  )}
                  placeholder="e.g., 12345 or A1A 1A1"
                  required
                />
                {touchedFields.has("postalCode") && formErrors.postalCode && (
                  <p className="text-sm text-red-500 mt-1">
                    {formErrors.postalCode}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Select
                  value={formData.country}
                  onValueChange={handleCountryChange}
                >
                  <SelectTrigger
                    className={cn(
                      "transition-colors",
                      touchedFields.has("country") && formErrors.country
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    )}
                  >
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                    <SelectItem value="UK">United Kingdom</SelectItem>
                  </SelectContent>
                </Select>
                {touchedFields.has("country") && formErrors.country && (
                  <p className="text-sm text-red-500 mt-1">
                    {formErrors.country}
                  </p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  handleInputChange("phone", formatPhoneNumber(e.target.value))
                }
                onBlur={() => handleBlur("phone")}
                className={cn(
                  "transition-colors",
                  touchedFields.has("phone") && formErrors.phone
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                )}
                placeholder="+1 (555) 123-4567"
                required
              />
              {touchedFields.has("phone") && formErrors.phone && (
                <p className="text-sm text-red-500 mt-1">{formErrors.phone}</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) =>
                  handleInputChange("isDefault", e.target.checked)
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="isDefault">Set as default address</Label>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleSave}>
                {editingAddress ? "Update Address" : "Save Address"}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {addresses.map((address) => (
          <Card key={address.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {address.isDefault && (
                      <Badge variant="secondary">Default</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {address.street}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {address.city}, {address.state} {address.postalCode}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {address.country}
                  </p>
                  {address.phone && (
                    <p className="text-sm text-muted-foreground">
                      Phone: {address.phone}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(address)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(address.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {addresses.length === 0 && !showAddForm && (
          <p className="text-center text-muted-foreground">
            No shipping addresses found
          </p>
        )}
      </div>

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            setAddressToDelete(null);
          }
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Address"
        description="Are you sure you want to delete this address? This action cannot be undone."
      />
    </div>
  );
}
