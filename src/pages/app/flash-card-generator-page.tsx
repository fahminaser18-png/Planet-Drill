import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import ProductShell from "../../components/layout/product-shell";
import { Button, getButtonStyleProps } from "../../components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "../../components/ui/alert";
import ConfirmDialog from "../../components/ui/confirm-dialog";
import { Loader2, AlertCircle, Trash2 } from "lucide-react";
import { listMentorFlashCardMaterials, deleteFlashCardMaterial } from "../../lib/api/flash-card-api";
import { productShellMeta } from "../../mocks/student-dashboard";
import { useStudentShell } from "./use-student-shell";

function FlashCardGeneratorPage() {
  const studentShell = useStudentShell("/app/flash-card-generator");
  const queryClient = useQueryClient();
  const [materialToDelete, setMaterialToDelete] = useState<{ id: string; title: string } | null>(null);

  const materialsQuery = useQuery({
    queryKey: ["mentor-flash-card-materials"],
    queryFn: () => listMentorFlashCardMaterials(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFlashCardMaterial({ materialId: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentor-flash-card-materials"] });
      setMaterialToDelete(null);
    },
    onError: (error) => {
      alert(error instanceof Error ? error.message : "Gagal menghapus materi.");
      setMaterialToDelete(null);
    },
  });

  return (
    <ProductShell
      brand={productShellMeta.brand}
      navItems={studentShell.navItems}
      tierLabel={studentShell.tierLabel}
    >
      <section className="space-y-6">
        <header className="space-y-3">
          <p className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-primary">
            Area mentor
          </p>
          <h1 className="text-3xl font-semibold leading-tight text-foreground">Penyusun Flash Card</h1>
          <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
            Unggah transkrip dan slide, cek hasilnya, lalu terbitkan untuk siswa.
          </p>
          <Link
            {...getButtonStyleProps({
              variant: "primary",
            })}
            to="/app/flash-card-generator/new"
          >
            Buat materi baru
          </Link>
        </header>

        {materialsQuery.isLoading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Daftar materi sedang dimuat...</p>
          </div>
        ) : materialsQuery.isError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Daftar materi belum bisa dimuat</AlertTitle>
            <AlertDescription>Coba lagi sebentar.</AlertDescription>
          </Alert>
        ) : (
          <div className="flex flex-col border-t border-border/40">
            {materialsQuery.data?.map((item) => (
              <div
                key={item.materialId}
                className="group relative flex items-start justify-between gap-4 border-b border-border/40 py-6 hover:bg-muted/30"
              >
                <Link to={`/app/flash-card-generator/${item.materialId}`} className="block flex-1 px-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    {item.academicGroupLabel}
                  </p>
                  <h2 className="mt-2 text-xl font-medium text-foreground">{item.title}</h2>
                  <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{item.statusLabel}</span>
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/30"></span>
                    <span>{item.subtopicCount} submateri / {item.cardCount} kartu</span>
                  </div>
                  {item.processingError ? (
                    <p className="mt-2 text-sm text-destructive">{item.processingError}</p>
                  ) : null}
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mr-2 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                  onClick={(e) => {
                    e.preventDefault();
                    setMaterialToDelete({ id: item.materialId, title: item.title });
                  }}
                >
                  <Trash2 className="h-5 w-5" />
                  <span className="sr-only">Hapus materi</span>
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <ConfirmDialog
        open={materialToDelete !== null}
        title="Hapus Materi"
        description={
          materialToDelete
            ? `Apakah Anda yakin ingin menghapus materi "${materialToDelete.title}"? Semua dokumen sumber (PDF/Transkrip) dan data flash card di dalamnya akan terhapus secara permanen.`
            : ""
        }
        confirmLabel="Hapus Permanen"
        pendingLabel="Menghapus..."
        isPending={deleteMutation.isPending}
        onClose={() => setMaterialToDelete(null)}
        onConfirm={() => {
          if (materialToDelete) {
            deleteMutation.mutate(materialToDelete.id);
          }
        }}
      />
    </ProductShell>
  );
}

export default FlashCardGeneratorPage;
