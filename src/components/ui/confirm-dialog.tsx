import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
  cancelLabel?: string;
  confirmLabel: string;
  description: React.ReactNode;
  isPending?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  open: boolean;
  pendingLabel?: string;
  title: React.ReactNode;
  confirmVariant?: "default" | "destructive" | "primary" | "outline" | "secondary" | "ghost" | "link";
};

function ConfirmDialog({
  cancelLabel = "Batal",
  confirmLabel,
  description,
  isPending = false,
  onClose,
  onConfirm,
  open,
  pendingLabel = "Memproses...",
  title,
  confirmVariant = "destructive",
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && !isPending && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isPending}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            disabled={isPending}
            loading={isPending}
            loadingLabel={pendingLabel}
          >
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default ConfirmDialog;
