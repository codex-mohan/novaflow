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
import { Paperclip, FileText, ImageIcon, Folder } from "lucide-react";

interface AttachmentMenuProps {
  onSelect: (type: string) => void;
}

export const AttachmentMenu: React.FC<AttachmentMenuProps> = ({ onSelect }) => {
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
                <Paperclip className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#313244] text-white border-[#414458]">
              <DropdownMenuItem onClick={() => onSelect("document")}>
                <FileText className="mr-2 h-4 w-4" />
                <span>Document</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSelect("image")}>
                <ImageIcon className="mr-2 h-4 w-4" />
                <span>Image</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSelect("other")}>
                <Folder className="mr-2 h-4 w-4" />
                <span>Other</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent className="bg-[#232334] text-white border border-[#414458] px-3 py-1.5 text-sm">
          Attach file
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}; 