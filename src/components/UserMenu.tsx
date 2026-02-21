import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut, User } from "firebase/auth";
import { auth, db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User as UserIcon, Settings, Loader2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserProfile {
  name?: string;
  avatar_url?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

// ─── Component ────────────────────────────────────────────────────────────────

export default function UserMenu() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Subscribe to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (!firebaseUser) {
        setProfile(null);
        return;
      }

      // Fetch Firestore profile — check both founders and investors collections
      try {
        let profileSnap = await getDoc(doc(db, "founders", firebaseUser.uid));
        if (!profileSnap.exists()) {
          profileSnap = await getDoc(doc(db, "investors", firebaseUser.uid));
        }
        if (profileSnap.exists()) {
          setProfile(profileSnap.data() as UserProfile);
        }
      } catch {
        // Profile fetch failing shouldn't break the menu — fall back to Auth data
      }
    });

    return unsubscribe;
  }, []);

  if (!user) return null;

  const displayName =
    profile?.name ||
    user.displayName ||
    user.email?.split("@")[0] ||
    "User";

  const displayEmail = user.email || "";
  const avatarUrl = profile?.avatar_url || user.photoURL || undefined;
  const initials = getInitials(displayName);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await firebaseSignOut(auth);
    window.location.href = "/login";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {initials || <UserIcon className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">{displayEmail}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem disabled className="text-muted-foreground">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings (coming soon)</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="text-destructive focus:text-destructive cursor-pointer"
        >
          {isSigningOut
            ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            : <LogOut className="mr-2 h-4 w-4" />
          }
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}