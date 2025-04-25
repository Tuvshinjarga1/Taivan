import { Bell } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export default function MobileHeader() {
  return (
    <header className="sticky top-0 z-10 bg-white border-b p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Health Monitor</h1>
          <p className="text-sm text-muted-foreground">Monday, April 20</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
          </Button>
          <Avatar>
            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
