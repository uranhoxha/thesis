'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { deleteUser } from '../actions'

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
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
} from '@/components/ui/alert-dialog'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

interface AdminDashboardProps {
  initialUsers: User[]
}

export function AdminDashboard({ initialUsers }: AdminDashboardProps) {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [globalFilter, setGlobalFilter] = useState('')
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleDelete = async (userId: string) => {
    setIsDeleting(userId)
    const result = await deleteUser(userId)

    if (result.success) {
      setUsers(users.filter((user) => user.id !== userId))
    } else {
      alert('Failed to delete user: ' + result.error)
    }
    setIsDeleting(null)
  }

  const columns: ColumnDef<User>[] = [
    {
      accessorFn: (row) => row.user_metadata?.full_name || 'N/A',
      id: 'name',
      header: 'User',
      cell: (info) => (
        <div className="font-medium">{info.getValue() as string}</div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'created_at',
      header: 'Signed Up',
      cell: (info) => new Date(info.getValue() as string).toLocaleDateString(),
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="text-right">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isDeleting === user.id}
                >
                  {isDeleting === user.id ? 'Deleting...' : 'Delete'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the user account for {user.email} and remove their data from
                    our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(user.id)}
                    className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                  >
                    Delete User
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const email = row.original.email?.toLowerCase() || ''
      const name = (row.original.user_metadata?.full_name || '').toLowerCase()
      const value = filterValue.toLowerCase()
      return email.includes(value) || name.includes(value)
    },
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  })

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Users</h1>

        <div className="w-full max-w-sm">
          <Input
            placeholder="Search by email or name..."
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full"
          />
        </div>
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
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
