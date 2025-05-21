import { Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function MobileHeader() {
  // Get current date in Mongolian format
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const dateInMongolian = today.toLocaleDateString("mn-MN", options);

  return (
    <header className="sticky top-0 z-10 bg-white border-b p-2 sm:p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-base sm:text-xl font-bold">
            Чихрийн шижин хяналт
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {dateInMongolian}
          </p>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative h-8 w-8 sm:h-10 sm:w-10"
          >
            <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="absolute top-0 right-0 h-1.5 w-1.5 sm:h-2 sm:w-2 bg-red-500 rounded-full"></span>
          </Button>
          <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
            <AvatarImage
              src="/placeholder.svg?height=40&width=40"
              alt="Хэрэглэгч"
            />
            <AvatarFallback>ТЖ</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
