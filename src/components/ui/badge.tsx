import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold leading-snug transition-colors focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-slate-300 bg-surface text-body',
        outline: 'text-body border-slate-400',
        success: 'border-success-border bg-success-surface text-success',
        warning: 'border-warning-border bg-warning-surface text-warning',
        danger: 'border-danger-border bg-danger-surface text-danger',
        info: 'border-info-border bg-info-surface text-info',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
