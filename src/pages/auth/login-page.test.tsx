import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, test, vi } from "vitest";
import LoginPage from "./login-page";

vi.mock("../../lib/api/auth-api", () => ({
  loginWithPassword: vi.fn(),
  requestPasswordReset: vi.fn(),
}));

afterEach(() => {
  cleanup();
});

describe("Login page", () => {
  test("keeps the active email login controls and Lupa password triggers reset", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByText(/selamat datang/i, { selector: 'h1, h2, h3, h4, h5, h6, [data-slot="card-title"], [data-slot="alert-title"]' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/kata sandi/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /masuk dengan email/i,
      }),
    ).toBeInTheDocument();
    
    const forgotPasswordBtn = screen.getByRole("button", { name: /lupa password/i });
    expect(forgotPasswordBtn).toBeInTheDocument();

    expect(
      screen.queryByText(/masuk dengan email dan kata sandi supabase-mu/i),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/belum punya akun/i)).toBeInTheDocument();
  });
});
