import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="h-5 w-5" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeLanguage('en')}>
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage('sw')}>
          Kiswahili
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
