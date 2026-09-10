import React from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ProductShell from "../../components/layout/product-shell";
import { productShellMeta } from "../../mocks/student-dashboard";
import { useStudentShell } from "./use-student-shell";
import { listTutorStations, deleteTutorStation } from "../../lib/api/tutor-api";
import { Button } from "../../components/ui/button";
import { Plus } from "lucide-react";

export default function TutorListPage() {
  const navigate = useNavigate();
  const studentShell = useStudentShell("/app/area-mentor");
  const queryClient = useQueryClient();

  const { data: stations, isLoading } = useQuery({
    queryKey: ["tutor-stations"],
    queryFn: listTutorStations,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTutorStation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tutor-stations"] });
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus sumber materi ini?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <ProductShell
      brand={productShellMeta.brand}
      tierLabel={studentShell.tierLabel}
      navItems={studentShell.navItems}
    >
      <div className="flex flex-col gap-10 w-full py-8 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Daftar Sumber Tutor
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl">
              Kelola daftar sumber tambahan yang tersedia untuk tutor simulasi ujian.
            </p>
          </div>
          <Button onClick={() => navigate("/app/mentor/tutor-builder")} variant="default">
            <Plus className="mr-2 h-4 w-4" /> Tambah Sumber
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12 border border-border rounded-lg bg-muted/20">
            <span className="text-sm font-medium text-muted-foreground">Memuat sumber...</span>
          </div>
        ) : !stations || stations.length === 0 ? (
          <div className="text-center p-12 bg-muted/20 rounded-lg border border-border border-dashed">
            <h3 className="text-base font-medium mb-1">Belum ada sumber tambahan</h3>
            <p className="text-sm text-muted-foreground mb-4">Mulai unggah materi sumber tambahan pertama Anda.</p>
            <Button onClick={() => navigate("/app/mentor/tutor-builder")} variant="outline">
              <Plus className="mr-2 h-4 w-4" /> Tambah Sumber
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stations.map((station) => (
              <div key={station.id} className="flex flex-col border border-border rounded-lg p-5 hover:border-foreground/20 transition-colors">
                <div className="flex-grow mb-4">
                  <h3 className="font-medium text-foreground line-clamp-2 mb-2">{station.title}</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-xs text-muted-foreground border border-border px-2 py-0.5 rounded capitalize">
                      {station.type}
                    </span>
                    <span className="text-xs text-muted-foreground border border-border px-2 py-0.5 rounded">
                      {station.duration_minutes} Menit
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {station.objective || "Tidak ada deskripsi."}
                  </p>
                </div>
                
                <div className="flex justify-end gap-2 mt-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8"
                    onClick={() => navigate(`/app/mentor/tutor-builder?id=${station.id}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(station.id)}
                    disabled={deleteMutation.isPending}
                  >
                    Hapus
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProductShell>
  );
}
