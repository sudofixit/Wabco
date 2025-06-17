interface LoadingSkeletonProps {
  className?: string;
  variant?: 'card' | 'text' | 'circle' | 'rectangle';
  lines?: number;
}

export function LoadingSkeleton({ 
  className = "", 
  variant = "rectangle",
  lines = 1 
}: LoadingSkeletonProps) {
  const baseClasses = "animate-pulse bg-gray-200 rounded";
  
  if (variant === 'text') {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div 
            key={i} 
            className={`${baseClasses} h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
          />
        ))}
      </div>
    );
  }

  if (variant === 'circle') {
    return <div className={`${baseClasses} rounded-full ${className}`} />;
  }

  if (variant === 'card') {
    return (
      <div className={`border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="bg-gray-200 rounded h-48 mb-4"></div>
          <div className="space-y-2">
            <div className="bg-gray-200 rounded h-4 w-3/4"></div>
            <div className="bg-gray-200 rounded h-4 w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return <div className={`${baseClasses} ${className}`} />;
}

export function ServiceCardSkeleton() {
  return (
    <div className="border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="animate-pulse">
        <div className="bg-gray-200 rounded h-48 mb-4"></div>
        <div className="bg-gray-200 rounded h-6 mb-2"></div>
        <div className="bg-gray-200 rounded h-4 w-3/4 mb-4"></div>
        <div className="bg-gray-200 rounded h-10 w-full"></div>
      </div>
    </div>
  );
}

export function LocationCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="animate-pulse">
        <div className="bg-gray-200 h-48"></div>
        <div className="p-6">
          <div className="bg-gray-200 rounded h-6 mb-2"></div>
          <div className="bg-gray-200 rounded h-4 w-2/3 mb-2"></div>
          <div className="bg-gray-200 rounded h-4 w-1/2 mb-4"></div>
          <div className="bg-gray-200 rounded h-10 w-full"></div>
        </div>
      </div>
    </div>
  );
}

export function TireCardSkeleton() {
  return (
    <div className="border border-gray-200 rounded-[20px] p-5 bg-white" style={{ width: 330, minHeight: 670 }}>
      <div className="animate-pulse">
        <div className="bg-gray-200 rounded h-6 w-20 mb-4"></div>
        <div className="bg-gray-200 rounded-lg h-60 mb-4"></div>
        <div className="bg-gray-200 rounded h-6 mb-2"></div>
        <div className="bg-gray-200 rounded h-4 w-2/3 mb-2"></div>
        <div className="bg-gray-200 rounded h-4 w-1/2 mb-4"></div>
        <div className="bg-gray-200 rounded h-10 w-full mb-4"></div>
        <div className="bg-gray-200 rounded h-8 w-full"></div>
      </div>
    </div>
  );
} 