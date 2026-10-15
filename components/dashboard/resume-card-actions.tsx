"use client"

import { useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, MoreHorizontal, Pencil, Star, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteResume, setPrimaryResume } from "@/lib/actions/resume"

export function ResumeCardActions({ id, title, isPrimary }: { id: string; title: string; isPrimary: boolean }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const act = (fn: () => Promise<{ ok: boolean; error?: string }>, success: string) =>
    startTransition(async () => {
      const res = await fn()
      if (!res.ok) toast.error(res.error)
      else {
        toast.success(success)
        router.refresh()
      }
    })

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Actions for ${title}`} disabled={pending}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/resume/${id}`}>
              <Eye /> View & export
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/resume/${id}/edit`}>
              <Pencil /> Edit
            </Link>
          </DropdownMenuItem>
          {!isPrimary && (
            <DropdownMenuItem onSelect={() => act(() => setPrimaryResume(id), "Set as primary resume")}>
              <Star /> Use for interview prep
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <AlertDialogTrigger asChild>
            <DropdownMenuItem variant="destructive">
              <Trash2 /> Delete
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{title}”?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes the resume and its share link. Chats that used it are kept.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={() => act(() => deleteResume(id), "Resume deleted")}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
