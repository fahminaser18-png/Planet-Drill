import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, test } from "vitest";
import HomePage from "./home-page";

afterEach(() => {
  cleanup();
});

describe("Home page", () => {
  test("renders the minimalist public homepage with clear program sections and CTAs", () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    // Hero title check
    expect(screen.getByRole("heading", { name: /fokus belajar.*tembus ptn impian/i, level: 1 })).toBeInTheDocument();

    // Value proposition / subtitle
    expect(screen.getByText(/sistem drill soal cerdas, simulasi cbt akurat/i)).toBeInTheDocument();

    // Program section
    expect(screen.getByText(/senjata utama lolos ptn/i)).toBeInTheDocument();
    expect(screen.getByText(/cbt presisi/i)).toBeInTheDocument();
    expect(screen.getByText(/analitik ai/i)).toBeInTheDocument();

    // Pricing
    expect(screen.getByText(/pilih paket belajar/i)).toBeInTheDocument();
    expect(screen.getByText(/paket 30 hari/i)).toBeInTheDocument();

    // Testimonials
    expect(screen.getByText(/mengantarkan ribuan siswa ke kampus/i)).toBeInTheDocument();

    // CTA links
    const startCta = screen.getByRole("link", {
      name: /mulai belajar sekarang/i,
    });
    expect(startCta).toBeInTheDocument();
    expect(startCta).toHaveAttribute("href", "/auth/login");
  });

  test("exposes the key homepage sections and navigation anchors", () => {
    const { container } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(container.querySelector("#program")).toBeInTheDocument();
    expect(container.querySelector("#biaya")).toBeInTheDocument();
    expect(container.querySelector("#testimoni")).toBeInTheDocument();
  });
});
