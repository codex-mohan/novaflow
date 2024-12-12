import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ImageIcon, User2, LogOut } from "lucide-react";

interface UserMenuProps {
  onSelect: (type: string) => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ onSelect }) => {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 hover:bg-[#313244]"
              >
                <User2 className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#313244] text-white border-[#414458]">
              <DropdownMenuItem onClick={() => onSelect("change-user")}>
                <User2 className="mr-2 h-4 w-4" />
                <span>Change User</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSelect("change-icon")}>
                <ImageIcon className="mr-2 h-4 w-4" />
                <span>Change user Icon</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSelect("logout")}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent className="bg-[#232334] text-white border border-[#414458] px-3 py-1.5 text-sm">
          User Menu
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
