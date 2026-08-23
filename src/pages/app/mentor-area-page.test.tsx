import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import MentorAreaPage from "./mentor-area-page";

vi.mock("./use-student-shell", () => ({
  useStudentShell: () => ({
    navItems: [],
    tierLabel: "Mentor Plan",
    role: "mentor",
  }),
}));

vi.mock("../../lib/auth/use-session", () => ({
  useSession: () => ({
    status: "authenticated",
    user: { id: "mentor-1", email: "mentor@example.com" },
  }),
}));

describe("MentorAreaPage", () => {
  it("renders header and 6 mentor feature cards including management for Materi", () => {
    render(
      <MemoryRouter>
        <MentorAreaPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Area Mentor")).toBeInTheDocument();

    // Feature titles
    expect(screen.getByText("Bank Soal")).toBeInTheDocument();
    expect(screen.getByText("Event Terjadwal")).toBeInTheDocument();
    expect(screen.getByText("Kelola Materi")).toBeInTheDocument();
    expect(screen.getByText("Penyusun Soal")).toBeInTheDocument();
    expect(screen.getByText("Penyusun Flash Card")).toBeInTheDocument();

    // Access buttons
    expect(screen.getByRole("link", { name: /Pilih Kelola Materi/i })).toHaveAttribute(
      "href",
      "/app/materi-ppt?mode=manage"
    );
  });
});
