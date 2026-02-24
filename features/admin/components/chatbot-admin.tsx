'use client'

import { useState } from 'react'
import {
  deleteDailyPick,
  createDailyPick,
  updateDailyPick,
  getAdminDailyPicks,
} from '../actions'

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DailyPickData } from '../types'

interface ChatbotAdminProps {
  initialPicks: DailyPickData[]
}

export function ChatbotAdmin({ initialPicks }: ChatbotAdminProps) {
  const [picks, setPicks] = useState<DailyPickData[]>(initialPicks)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    category: 'savory' as 'savory' | 'snack' | 'dessert',
    content: '',
  })

  const resetForm = () => {
    setFormData({ title: '', category: 'savory', content: '' })
    setEditingId(null)
  }

  const openEditModal = (pick: DailyPickData) => {
    setFormData({
      title: pick.title,
      category: pick.category,
      content: pick.content,
    })
    setEditingId(pick.id)
    setIsOpen(true)
  }

  const handleDelete = async (id: number) => {
    setIsDeleting(id)
    const result = await deleteDailyPick(id)

    if (result.success) {
      setPicks(picks.filter((pick) => pick.id !== id))
    } else {
      alert('Failed to delete pick: ' + result.error)
    }
    setIsDeleting(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const action = editingId
      ? () => updateDailyPick(editingId, formData)
      : () => createDailyPick(formData)

    const result = await action()

    if (result.success) {
      setIsOpen(false)
      resetForm()
      const updatedPicks = await getAdminDailyPicks()
      setPicks(updatedPicks)
    } else {
      alert('Failed to save pick: ' + result.error)
    }

    setIsSubmitting(false)
  }

  const columns: ColumnDef<DailyPickData>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: (info) => (
        <span className="capitalize">{info.getValue() as string}</span>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Created At',
      cell: (info) => new Date(info.getValue() as string).toLocaleDateString(),
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const pick = row.original
        return (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openEditModal(pick)}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(pick.id)}
              disabled={isDeleting === pick.id}
            >
              {isDeleting === pick.id ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: picks,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Chatbot Daily Picks</h1>

        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>Create New Pick</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Edit Daily Pick' : 'Add Daily Pick'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  required
                  value={formData.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="E.g. Mushroom Risotto"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={formData.category}
                  onValueChange={(val: 'savory' | 'snack' | 'dessert') =>
                    setFormData({ ...formData, category: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="savory">Savory</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                    <SelectItem value="dessert">Dessert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Content (Recipe)</label>
                <Textarea
                  required
                  rows={8}
                  value={formData.content}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Ingredients and Instructions..."
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Pick'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No daily picks found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
