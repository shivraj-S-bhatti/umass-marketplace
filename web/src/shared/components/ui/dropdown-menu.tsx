import * as React from 'react'
import {
  DropdownMenu as RadixDropdownMenu,
  DropdownMenuTrigger as RadixDropdownMenuTrigger,
  DropdownMenuContent as RadixDropdownMenuContent,
  DropdownMenuItem as RadixDropdownMenuItem,
  DropdownMenuPortal as RadixDropdownMenuPortal,
  DropdownMenuSeparator as RadixDropdownMenuSeparator,
  DropdownMenuLabel as RadixDropdownMenuLabel,
} from "@radix-ui/react-dropdown-menu"
import { cn } from '@/shared/lib/utils/utils'

export const DropdownMenu = RadixDropdownMenu
export const DropdownMenuTrigger = RadixDropdownMenuTrigger

export const DropdownMenuContent = React.forwardRef<
  React.ComponentRef<typeof RadixDropdownMenuContent>,
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenuContent>
>(({ className, ...props }, ref) => (
  <RadixDropdownMenuPortal>
    <RadixDropdownMenuContent
      ref={ref}
      sideOffset={4}
      className={cn('z-50 bg-card border border-border rounded-lg shadow-lg p-1 min-w-[10rem]', className)}
      {...props}
    />
  </RadixDropdownMenuPortal>
))
DropdownMenuContent.displayName = 'DropdownMenuContent'

export const DropdownMenuItem = React.forwardRef<
  React.ComponentRef<typeof RadixDropdownMenuItem>,
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenuItem>
>(({ className, ...props }, ref) => (
  <RadixDropdownMenuItem
    ref={ref}
    className={cn(
      'relative flex cursor-pointer select-none items-center rounded-md px-3 py-2 text-sm outline-none transition-colors hover:bg-secondary focus:bg-secondary data-[highlighted]:bg-secondary',
      className
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = 'DropdownMenuItem'

export const DropdownMenuSeparator = React.forwardRef<
  React.ComponentRef<typeof RadixDropdownMenuSeparator>,
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenuSeparator>
>(({ className, ...props }, ref) => (
  <RadixDropdownMenuSeparator
    ref={ref}
    className={cn('my-1 h-px bg-border', className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator'

export const DropdownMenuLabel = React.forwardRef<
  React.ComponentRef<typeof RadixDropdownMenuLabel>,
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenuLabel>
>(({ className, ...props }, ref) => (
  <RadixDropdownMenuLabel
    ref={ref}
    className={cn('px-3 py-2 text-sm font-semibold', className)}
    {...props}
  />
))
DropdownMenuLabel.displayName = 'DropdownMenuLabel'
