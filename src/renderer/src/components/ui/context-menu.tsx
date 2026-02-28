import { forwardRef, ElementRef, ComponentPropsWithoutRef, HTMLAttributes } from "react"
import { Root, Trigger, Group, Portal, Sub, RadioGroup, SubTrigger, SubContent, Content, Item, CheckboxItem, ItemIndicator, RadioItem, Label, Separator } from "@radix-ui/react-context-menu"
import { Check, ChevronRight, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const ContextMenu = Root
const ContextMenuTrigger = Trigger
const ContextMenuGroup = Group
const ContextMenuPortal = Portal
const ContextMenuSub = Sub
const ContextMenuRadioGroup = RadioGroup

const ContextMenuSubTrigger = forwardRef<
  ElementRef<typeof SubTrigger>,
  ComponentPropsWithoutRef<typeof SubTrigger> & { inset?: boolean }
>(({ className, inset, children, ...props }, ref) => (
  <SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center gap-3 rounded-md px-3 py-2 text-sm font-medium outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground dark:focus:bg-accent dark:data-[highlighted]:bg-accent dark:data-[state=open]:bg-accent",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </SubTrigger>
))
ContextMenuSubTrigger.displayName = SubTrigger.displayName

const ContextMenuSubContent = forwardRef<
  ElementRef<typeof SubContent>,
  ComponentPropsWithoutRef<typeof SubContent>
>(({ className, ...props }, ref) => (
  <SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[9rem] overflow-hidden rounded-xl border bg-popover/80 backdrop-blur-md p-1.5 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-context-menu-content-transform-origin]",
      className
    )}
    {...props}
  />
))
ContextMenuSubContent.displayName = SubContent.displayName

const ContextMenuContent = forwardRef<
  ElementRef<typeof Content>,
  ComponentPropsWithoutRef<typeof Content>
>(({ className, ...props }, ref) => (
  <Portal>
    <Content
      ref={ref}
      className={cn(
        "z-50 max-h-[--radix-context-menu-content-available-height] min-w-[11rem] overflow-y-auto overflow-x-hidden rounded-xl border border-border/50 bg-popover/80 backdrop-blur-md p-1.5 text-popover-foreground shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-context-menu-content-transform-origin]",
        className
      )}
      {...props}
    />
  </Portal>
))
ContextMenuContent.displayName = Content.displayName

const ContextMenuItem = forwardRef<
  ElementRef<typeof Item>,
  ComponentPropsWithoutRef<typeof Item> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center gap-3 rounded-md px-3 py-2 text-sm font-medium outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground dark:focus:bg-accent dark:data-[highlighted]:bg-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-9",
      className
    )}
    {...props}
  />
))
ContextMenuItem.displayName = Item.displayName

const ContextMenuCheckboxItem = forwardRef<
  ElementRef<typeof CheckboxItem>,
  ComponentPropsWithoutRef<typeof CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center gap-3 rounded-md py-2 pl-9 pr-3 text-sm font-medium outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground dark:focus:bg-accent dark:data-[highlighted]:bg-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ItemIndicator>
        <Check className="h-4 w-4" />
      </ItemIndicator>
    </span>
    {children}
  </CheckboxItem>
))
ContextMenuCheckboxItem.displayName = CheckboxItem.displayName

const ContextMenuRadioItem = forwardRef<
  ElementRef<typeof RadioItem>,
  ComponentPropsWithoutRef<typeof RadioItem>
>(({ className, children, ...props }, ref) => (
  <RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center gap-3 rounded-md py-2 pl-9 pr-3 text-sm font-medium outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground dark:focus:bg-accent dark:data-[highlighted]:bg-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ItemIndicator>
        <Circle className="h-4 w-4 fill-current" />
      </ItemIndicator>
    </span>
    {children}
  </RadioItem>
))
ContextMenuRadioItem.displayName = RadioItem.displayName

const ContextMenuLabel = forwardRef<
  ElementRef<typeof Label>,
  ComponentPropsWithoutRef<typeof Label> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <Label
    ref={ref}
    className={cn("px-3 py-2 text-sm font-semibold text-foreground", inset && "pl-9", className)}
    {...props}
  />
))
ContextMenuLabel.displayName = Label.displayName

const ContextMenuSeparator = forwardRef<
  ElementRef<typeof Separator>,
  ComponentPropsWithoutRef<typeof Separator>
>(({ className, ...props }, ref) => (
  <Separator ref={ref} className={cn("-mx-1.5 my-1.5 h-px bg-border", className)} {...props} />
))
ContextMenuSeparator.displayName = Separator.displayName

const ContextMenuShortcut = ({ className, ...props }: HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn("ml-auto text-xs font-bold tracking-widest text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-md", className)} {...props} />
)
ContextMenuShortcut.displayName = "ContextMenuShortcut"

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
}
