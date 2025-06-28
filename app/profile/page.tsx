import { ProfileForm } from "./ProfileForm";
import { getUser } from "@/lib/auth";

export default async function ProfilePage() {
  const user = await getUser();
  return (
    <div className="min-h-screen flex justify-center items-start py-8">
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground">
              Manage your account information
            </p>
          </div>
        </div>
        <ProfileForm user={user} />
      </div>
    </div>
  );
}
