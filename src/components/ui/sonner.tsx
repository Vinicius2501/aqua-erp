import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-gradient-to-r group-[.toaster]:from-primary/10 group-[.toaster]:via-background group-[.toaster]:to-background group-[.toaster]:text-foreground group-[.toaster]:border-2 group-[.toaster]:border-primary/30 group-[.toaster]:shadow-2xl group-[.toaster]:shadow-primary/20 group-[.toaster]:rounded-xl",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:font-semibold",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toaster]:!bg-gradient-to-r group-[.toaster]:!from-green-500/20 group-[.toaster]:!via-green-500/10 group-[.toaster]:!to-background group-[.toaster]:!border-green-500/50 group-[.toaster]:!shadow-green-500/20 group-[.toaster]:!text-green-700 dark:group-[.toaster]:!text-green-400",
          error: "group-[.toaster]:!bg-gradient-to-r group-[.toaster]:!from-destructive/20 group-[.toaster]:!via-destructive/10 group-[.toaster]:!to-background group-[.toaster]:!border-destructive/50 group-[.toaster]:!shadow-destructive/20 group-[.toaster]:!text-destructive",
          warning: "group-[.toaster]:!bg-gradient-to-r group-[.toaster]:!from-amber-500/20 group-[.toaster]:!via-amber-500/10 group-[.toaster]:!to-background group-[.toaster]:!border-amber-500/50 group-[.toaster]:!shadow-amber-500/20 group-[.toaster]:!text-amber-700 dark:group-[.toaster]:!text-amber-400",
          info: "group-[.toaster]:!bg-gradient-to-r group-[.toaster]:!from-blue-500/20 group-[.toaster]:!via-blue-500/10 group-[.toaster]:!to-background group-[.toaster]:!border-blue-500/50 group-[.toaster]:!shadow-blue-500/20 group-[.toaster]:!text-blue-700 dark:group-[.toaster]:!text-blue-400",
        },
      }}
      {...props}
    />
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export { Toaster, toast };
