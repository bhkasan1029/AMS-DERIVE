import { cn } from '@/lib/utils';

function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-sm shadow-lg',
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 p-6 pb-4', className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }) {
  return (
    <h3
      className={cn('text-2xl font-bold leading-none tracking-tight', className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }) {
  return (
    <p
      className={cn('text-sm text-zinc-400', className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }) {
  return (
    <div className={cn('p-6 pt-0', className)} {...props} />
  );
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent };
