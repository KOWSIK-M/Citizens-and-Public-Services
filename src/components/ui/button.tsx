import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-normal text-center leading-snug rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 touch-target',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm',
        accent: 'bg-accent text-accent-foreground hover:bg-amber-700 shadow-sm',
        outline: 'border border-slate-500 bg-white hover:bg-surface text-body',
        secondary: 'bg-surface text-body hover:bg-slate-200 border border-slate-400',
        ghost: 'hover:bg-slate-100 hover:text-body text-body',
        link: 'text-primary underline-offset-4 hover:underline',
        danger: 'bg-danger text-white hover:bg-red-800 shadow-sm',
      },
      size: {
        default: 'min-h-[44px] px-5 py-2.5',
        sm: 'min-h-[44px] rounded-md px-3.5 py-2 text-xs',
        lg: 'min-h-[52px] rounded-md px-6 sm:px-8 py-3 text-base font-semibold',
        icon: 'min-h-[44px] min-w-[44px] p-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
