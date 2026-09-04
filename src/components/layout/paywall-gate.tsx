import { useNavigate } from "react-router";
import { Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import Button from "../ui/button";
import ProductShell from "./product-shell";

type PaywallGateProps = {
  brand: string;
  tierLabel: string;
  navItems: any[];
};

export function PaywallGate({ brand, tierLabel, navItems }: PaywallGateProps) {
  const navigate = useNavigate();

  return (
    <ProductShell brand={brand} tierLabel={tierLabel} navItems={navItems}>
      <Dialog open={true} onOpenChange={(open) => { if (!open) navigate(-1); }}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-center text-xl">Fitur terkunci</DialogTitle>
            <DialogDescription className="text-center">
              Silahkan upgrade ke Pro untuk mengakses fitur ini.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center mt-4">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Batal
            </Button>
            <Button variant="primary" onClick={() => navigate("/subscription")}>
              Upgrade ke Pro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProductShell>
  );
}

type PaywallModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PaywallModal({ open, onOpenChange }: PaywallModalProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">Fitur terkunci</DialogTitle>
          <DialogDescription className="text-center">
            Silahkan upgrade ke Pro untuk mengakses fitur ini.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button variant="primary" onClick={() => navigate("/subscription")}>
            Upgrade ke Pro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
