import { cn } from "@/lib/utils";

interface AnimatedContainerProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

export function FadeIn({
  children,
  className,
  delay = 0,
  duration = 300,
}: AnimatedContainerProps) {
  return (
    <div
      className={cn("animate-in fade-in-0 duration-300", className)}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}

export function SlideUp({
  children,
  className,
  delay = 0,
  duration = 300,
}: AnimatedContainerProps) {
  return (
    <div
      className={cn(
        "animate-in slide-in-from-bottom-4 duration-300",
        className
      )}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}

export function SlideDown({
  children,
  className,
  delay = 0,
  duration = 300,
}: AnimatedContainerProps) {
  return (
    <div
      className={cn("animate-in slide-in-from-top-4 duration-300", className)}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}

export function ScaleIn({
  children,
  className,
  delay = 0,
  duration = 300,
}: AnimatedContainerProps) {
  return (
    <div
      className={cn("animate-in zoom-in-95 duration-300", className)}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 100,
}: {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  return (
    <div className={className}>
      {Array.isArray(children)
        ? children.map((child, index) => (
            <FadeIn key={index} delay={index * staggerDelay}>
              {child}
            </FadeIn>
          ))
        : children}
    </div>
  );
}
