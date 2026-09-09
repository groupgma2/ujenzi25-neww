import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, variant = 'default', hover = false, padding = 'md', className = '', ...props }, ref) => {
    const variantClasses = {
      default: 'bg-white shadow-md border border-border',
      outlined: 'bg-white border-2 border-border',
      elevated: 'bg-white shadow-xl border-none',
    };

    const paddingClasses = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    const hoverClass = hover ? 'hover:shadow-lg transition-shadow duration-200 cursor-pointer' : '';

    return (
      <div
        ref={ref}
        className={`rounded-2xl overflow-hidden ${variantClasses[variant]} ${paddingClasses[padding]} ${hoverClass} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`mb-4 ${className}`}>{children}</div>
);

export const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-xl font-semibold text-text ${className}`}>{children}</h3>
);

export const CardDescription = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <p className={`mt-1 text-text-secondary ${className}`}>{children}</p>
);

export const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={className}>{children}</div>
);

export const CardFooter = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`mt-4 pt-4 border-t border-border ${className}`}>{children}</div>
);

export const CardMedia = ({
  src,
  alt,
  className = '',
  aspectRatio = '16/9',
}: {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
}) => (
  <div className={`relative overflow-hidden ${className}`} style={{ aspectRatio }}>
    <img
      src={src}
      alt={alt}
      onError={(event) => { event.currentTarget.src = '/section-construction.svg'; }}
      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
    />
  </div>
);