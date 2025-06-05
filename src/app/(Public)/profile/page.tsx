import { ProfileTabs } from "@/components/profile/profile-tabs";

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Account</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and orders
        </p>
      </div>
      <ProfileTabs />
    </div>
  );
}
