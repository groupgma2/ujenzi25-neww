import React from 'react';


interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'secondary' | 'info';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ children, variant = 'primary', size = 'md', dot = false, className = '', ...props }, ref) => {
    const variantClasses = {
      primary: 'bg-primary-bg text-primary',
      success: 'bg-green-50 text-green-700',
      warning: 'bg-yellow-50 text-yellow-700',
      error: 'bg-red-50 text-red-700',
      secondary: 'bg-gray-100 text-gray-700',
      info: 'bg-blue-50 text-blue-700',
    };

    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-sm',
    };

    return (
      <span
        ref={ref}
        className={`inline-flex items-center gap-1.5 rounded-full font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

interface StatusBadgeProps {
  status: string;
  statusMap?: Record<string, BadgeProps['variant']>;
  className?: string;
}

export const StatusBadge = ({ status, statusMap = {}, className = '' }: StatusBadgeProps) => {
  const defaultMap: Record<string, BadgeProps['variant']> = {
    submitted: 'secondary',
    in_review: 'info',
    quoted: 'warning',
    in_progress: 'primary',
    delivered: 'success',
    revision_requested: 'warning',
    pending: 'secondary',
    confirmed: 'info',
    processing: 'primary',
    shipped: 'info',
    cancelled: 'error',
    open: 'secondary',
    completed: 'success',
    active: 'success',
    under_offer: 'warning',
    sold: 'secondary',
    draft: 'secondary',
    archived: 'secondary',
    available: 'success',
    booked: 'warning',
    occupied: 'info',
    maintenance: 'warning',
  };

  const variant = statusMap[status] || defaultMap[status] || 'secondary';
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return <Badge variant={variant} className={className}>{label}</Badge>;
};

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'busy' | 'away';
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt, name, size = 'md', status, className = '', ...props }, ref) => {
    const sizeClasses = {
      xs: 'w-6 h-6 text-xs',
      sm: 'w-8 h-8 text-sm',
      md: 'w-10 h-10 text-base',
      lg: 'w-12 h-12 text-lg',
      xl: 'w-16 h-16 text-xl',
    };

    const statusSizeClasses = {
      xs: 'w-1.5 h-1.5',
      sm: 'w-2 h-2',
      md: 'w-2.5 h-2.5',
      lg: 'w-3 h-3',
      xl: 'w-4 h-4',
    };

    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };

    const bgColors = [
      'bg-primary', 'bg-green-500', 'bg-blue-500', 'bg-yellow-500',
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
    ];

    const nameHash = name ? name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
    const bgColor = bgColors[nameHash % bgColors.length];

    return (
      <div ref={ref} className={`relative inline-flex ${className}`} {...props}>
        <div
          className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-100 flex items-center justify-center ${bgColor} text-white font-medium`}
        >
          {src ? (
            <img src={src} alt={alt || name || 'Avatar'} className="w-full h-full object-cover" />
          ) : (
            name ? getInitials(name) : '?'
          )}
        </div>
        {status && (
          <span
            className={`absolute bottom-0 right-0 rounded-full border-2 border-white ${statusSizeClasses[size]}`}
            style={{
              backgroundColor:
                status === 'online' ? '#10b981' :
                status === 'busy' ? '#ef4444' :
                status === 'away' ? '#f59e0b' :
                '#9ca3af',
            }}
            title={status}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

interface AvatarGroupProps {
  avatars: Array<{ src?: string; name: string; id: string }>;
  max?: number;
  size?: AvatarProps['size'];
  className?: string;
}

export const AvatarGroup = ({ avatars, max = 5, size = 'md', className = '' }: AvatarGroupProps) => {
  const visibleAvatars = avatars.slice(0, max);
  const remaining = avatars.length - max;

  const sizeClasses = {
    xs: '-ml-1',
    sm: '-ml-2',
    md: '-ml-3',
    lg: '-ml-4',
    xl: '-ml-5',
  };

  return (
    <div className={`flex ${className}`}>
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={avatar.id}
          src={avatar.src}
          name={avatar.name}
          size={size}
          className={index > 0 ? sizeClasses[size] : ''}
        />
      ))}
      {remaining > 0 && (
        <div
          className={`${sizeClasses[size]} rounded-full bg-gray-100 text-gray-600 text-center font-medium flex items-center justify-center border-2 border-white`}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};