import {
  getAttemptReviewPageData,
  listSubmittedAttemptHistory,
} from "./tryout-api";
import {
  getScheduledAttemptReviewPageData,
  listScheduledSubmittedAttemptHistory,
} from "./scheduled-tryout-api";
import {
  getTutorAttemptDetail,
  listTutorAttemptHistory,
} from "./tutor-api";

export type ReviewSource = "tryout" | "scheduled" | "tutor";

export type ReviewHistoryItem = {
  attemptId: string;
  title: string;
  submittedAt: string;
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  source: ReviewSource;
};

export async function listReviewHistory({
  userId,
}: {
  userId: string;
}): Promise<ReviewHistoryItem[]> {
  const [tryoutHistory, scheduledHistory, tutorHistory] = await Promise.all([
    listSubmittedAttemptHistory({ userId }),
    listScheduledSubmittedAttemptHistory({ userId }),
    listTutorAttemptHistory(),
  ]);

  return [
    ...tryoutHistory.map((item) => ({
      ...item,
      source: "tryout" as const,
    })),
    ...scheduledHistory,
    ...tutorHistory.map((item: any) => ({
      attemptId: item.id,
      title: item.station?.title || "Simulasi TUTOR",
      submittedAt: item.created_at,
      score: item.total_score,
      correctAnswers: 0,
      wrongAnswers: 0,
      source: "tutor" as const,
    })),
  ].sort(
    (left, right) =>
      new Date(right.submittedAt).getTime() - new Date(left.submittedAt).getTime(),
  );
}

export async function getReviewDetailData({
  attemptId,
  source = "tryout",
}: {
  attemptId: string;
  source?: ReviewSource;
}) {
  if (source === "scheduled") {
    return getScheduledAttemptReviewPageData({ attemptId });
  }

  if (source === "tutor") {
    const data = await getTutorAttemptDetail(attemptId);
    return {
      summary: {
        score: data.total_score,
        maxScore: data.max_score,
        correctAnswers: 0,
        wrongAnswers: 0,
        submittedAt: data.created_at,
        source: "tutor" as const,
      },
      items: [], // Tryout items will be empty, we will pass tutor_data directly
      tutor_data: data
    };
  }

  return getAttemptReviewPageData({ attemptId });
}
