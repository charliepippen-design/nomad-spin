import { Moon, Monitor, Sun, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-background/50 backdrop-blur-sm border-white/10 hover:border-primary/50 transition-all duration-300"
        >
          {mounted && resolvedTheme === "light" ? (
            <Sun className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <Moon className="h-[1.2rem] w-[1.2rem]" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-md border-white/10 font-mono text-[10px] tracking-widest uppercase">
        <DropdownMenuItem
          onSelect={() => setTheme("light")}
          className="gap-2 focus:bg-primary/10 focus:text-primary transition-colors cursor-pointer"
          data-active={theme === "light" || undefined}
        >
          <Sun className="h-3 w-3" />
          Light
          {mounted && theme === "light" && <Check className="h-3 w-3 ml-auto" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => setTheme("dark")}
          className="gap-2 focus:bg-primary/10 focus:text-primary transition-colors cursor-pointer"
          data-active={theme === "dark" || undefined}
        >
          <Moon className="h-3 w-3" />
          Dark
          {mounted && theme === "dark" && <Check className="h-3 w-3 ml-auto" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => setTheme("system")}
          className="gap-2 focus:bg-primary/10 focus:text-primary transition-colors cursor-pointer"
          data-active={theme === "system" || undefined}
        >
          <Monitor className="h-3 w-3" />
          System
          {mounted && theme === "system" && <Check className="h-3 w-3 ml-auto" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
