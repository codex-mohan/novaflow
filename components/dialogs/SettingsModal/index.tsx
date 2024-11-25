import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Moon,
  Sun,
  User,
  Bell,
  Lock,
  Settings as SettingsIcon,
  Info,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import GradientButton from "@/components/ui/GradientButton";

const settingsOptions = [
  { label: "Profile", icon: <User /> },
  { label: "Notifications", icon: <Bell /> },
  { label: "Privacy", icon: <Lock /> },
  { label: "Themes", icon: <Sun /> },
  { label: "Security", icon: <Lock /> },
  { label: "Preferences", icon: <SettingsIcon /> },
  { label: "Advanced", icon: <Info /> },
];

export function SettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState("Profile");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [notifications, setNotifications] = useState(false);
  const { setTheme } = useTheme();

  const handleSave = () => {
    console.log("Saving settings:", { username, notifications });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-screen-sm md:max-w-screen-lg bg-base-secondary">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Adjust your user settings here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-base-secondary text-font p-4 space-y-4">
            <h2 className="text-lg font-semibold">Menu</h2>
            <div className="space-y-2">
              {settingsOptions.map((option) => (
                <div
                  key={option.label}
                  className={`flex items-center space-x-2 cursor-pointer p-2 rounded transition-colors ${
                    selectedCategory === option.label
                      ? "bg-primary-light text-primary-dark"
                      : "hover:bg-primary-dark hover:text-primary-light"
                  }`}
                  onClick={() => setSelectedCategory(option.label)}
                >
                  <div>{option.icon}</div>
                  <span>{option.label}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Main Content */}
          <div className="flex-1 p-6">
            <h3 className="text-xl font-semibold">{selectedCategory}</h3>
            <div className="mt-4">
              {selectedCategory === "Profile" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="text-right">
                    Username
                  </Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="col-span-3"
                  />
                  <Label htmlFor="password" className="text-right">
                    Password
                  </Label>
                  <Input
                    id="password"
                    value={password}
                    onChange={(e) => setUsername(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              )}
              {selectedCategory === "Notifications" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="notifications"
                    className="text-right text-font"
                  >
                    Notifications
                  </Label>
                  <Switch
                    id="notifications"
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>
              )}
              {selectedCategory === "Themes" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="theme" className="text-right">
                    Theme
                  </Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Sun className="h-[1.2rem] w-[1.2rem]" />
                        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setTheme("light")}>
                        Light
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme("dark")}>
                        Dark
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme("system")}>
                        System
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            className="h-12 w-48 bg-base-secondary text-font border-font border-1 rounded-lg hover:bg-font hover:text-base-secondary"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <GradientButton
            color="text-font"
            fromColor="from-primary"
            viaColor="via-secondary"
            toColor="to-tertiary"
            type="submit"
            onClick={handleSave}
          >
            Save changes
          </GradientButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
