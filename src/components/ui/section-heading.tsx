import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
};

function SectionHeading({
  title,
  description,
  eyebrow,
  actions,
  className,
  as: Component = "h1",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "ui-section-heading flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="max-w-3xl">
        {eyebrow ? (
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-6 bg-primary/50"></div>
            <span className="text-sm font-semibold tracking-wide text-primary">
              {eyebrow}
            </span>
          </div>
        ) : null}
        <Component className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
          {title}
        </Component>
        {description ? (
          <p className="mt-3 text-lg leading-relaxed text-muted-foreground max-w-2xl">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="w-full shrink-0 sm:w-auto">{actions}</div> : null}
    </div>
  );
}

export default SectionHeading;
