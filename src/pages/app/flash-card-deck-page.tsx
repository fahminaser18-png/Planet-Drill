import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle } from "lucide-react";
import FlashCardRecallControls from "../../components/flash-cards/flash-card-recall-controls";
import FlashCardViewer from "../../components/flash-cards/flash-card-viewer";
import ProductShell from "../../components/layout/product-shell";
import { Alert, AlertTitle, AlertDescription } from "../../components/ui/alert";
import {
  getPublishedFlashCardDeck,
  saveStudentFlashCardDifficulty,
} from "../../lib/api/flash-card-api";
import { useSession } from "../../lib/auth/use-session";
import { productShellMeta } from "../../mocks/student-dashboard";
import { useStudentShell } from "./use-student-shell";
import { useParams } from "react-router";

function FlashCardDeckPage() {
  const { subtopicId = "" } = useParams();
  const { user } = useSession();
  const studentShell = useStudentShell("/app/flash-cards");
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [difficultyOverrides, setDifficultyOverrides] = useState<Record<string, "easy" | "medium" | "hard">>({});
  const [isSavingDifficulty, setIsSavingDifficulty] = useState(false);
  const deckQuery = useQuery({
    queryKey: ["flash-card-deck", subtopicId],
    enabled: subtopicId.length > 0,
    queryFn: () => getPublishedFlashCardDeck({ subtopicId }),
  });
  const activeCard = deckQuery.data?.cards.find((card) => card.id === activeCardId) ?? deckQuery.data?.cards[0] ?? null;

  async function handleDifficultySelect(difficulty: "easy" | "medium" | "hard") {
    if (!activeCard || !user?.id) {
      return;
    }

    setIsSavingDifficulty(true);

    try {
      await saveStudentFlashCardDifficulty({
        userId: user.id,
        cardId: activeCard.id,
        difficulty,
      });
      setDifficultyOverrides((current) => ({
        ...current,
        [activeCard.id]: difficulty,
      }));

      const cards = deckQuery.data?.cards ?? [];
      const currentIndex = cards.findIndex((c) => c.id === activeCard.id);
      if (currentIndex >= 0 && currentIndex < cards.length - 1) {
        setTimeout(() => {
          setActiveCardId(cards[currentIndex + 1].id);
        }, 300);
      }
    } finally {
      setIsSavingDifficulty(false);
    }
  }

  return (
    <ProductShell
      brand={productShellMeta.brand}
      navItems={studentShell.navItems}
      tierLabel={studentShell.tierLabel}
    >
      {deckQuery.isLoading ? (
        <div className="space-y-6 animate-pulse">
          <header className="mb-8 space-y-3">
            <div className="h-9 w-64 bg-muted rounded" />
            <div className="h-5 w-48 bg-muted rounded" />
            <div className="h-10 w-full max-w-2xl bg-muted rounded" />
          </header>
          <div className="mx-auto w-full max-w-2xl aspect-[3/2] bg-muted rounded-xl" />
          <div className="flex justify-center gap-4 mt-8">
            <div className="h-12 w-24 bg-muted rounded-md" />
            <div className="h-12 w-24 bg-muted rounded-md" />
            <div className="h-12 w-24 bg-muted rounded-md" />
          </div>
        </div>
      ) : deckQuery.isError || !deckQuery.data ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Set kartu belajar belum bisa dimuat</AlertTitle>
          <AlertDescription>Set kartu belajar belum bisa dimuat.</AlertDescription>
        </Alert>
      ) : (
        <section className="space-y-6">
          <header className="mb-8">
            <h1 className="text-3xl font-semibold text-foreground tracking-tight">Set Kartu Belajar</h1>
            <p className="mt-1 text-sm font-medium text-foreground">{deckQuery.data.subtopicTitle}</p>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{deckQuery.data.subtopicSummary}</p>
          </header>

          <FlashCardViewer
            cards={deckQuery.data.cards}
            onCardChange={(card) => setActiveCardId(card.id)}
          />

          <FlashCardRecallControls
            isSaving={isSavingDifficulty}
            selectedDifficulty={activeCard ? difficultyOverrides[activeCard.id] ?? activeCard.savedDifficulty : null}
            onSelect={handleDifficultySelect}
          />
        </section>
      )}
    </ProductShell>
  );
}

export default FlashCardDeckPage;
