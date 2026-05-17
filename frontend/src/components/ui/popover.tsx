import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { getPortalContainer } from '@/lib/portal'
import { floatingMenuSurface } from '@/lib/floatingMenuSurface'
import { cn } from '@/lib/utils'

const Popover = PopoverPrimitive.Root
const PopoverTrigger = PopoverPrimitive.Trigger
const PopoverAnchor = PopoverPrimitive.Anchor

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = 'center', side = 'bottom', sideOffset = 4, avoidCollisions = false, style, ...props }, ref) => (
  <PopoverPrimitive.Portal container={getPortalContainer()}>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      side={side}
      sideOffset={sideOffset}
      avoidCollisions={avoidCollisions}
      className={cn(floatingMenuSurface, 'w-72 p-4', className)}
      style={{ ...style }}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
