import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { Session } from "@supabase/supabase-js";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import ProfilePage from "./profile-page";

const mockUseSession = vi.fn();
const mockLogout = vi.fn();
const mockGetCurrentProfile = vi.fn();
const mockGetProfileAvatarSignedUrl = vi.fn();
const mockUpdateCurrentProfileName = vi.fn();
const mockUpdateCurrentUserPassword = vi.fn();
const mockUpdateCurrentUserAvatarUrl = vi.fn();

vi.mock("../lib/auth/use-session", () => ({
  useSession: () => mockUseSession(),
}));

vi.mock("../lib/api/auth-api", () => ({
  logout: (...args: unknown[]) => mockLogout(...args),
}));

vi.mock("../lib/api/profile-api", () => ({
  getCurrentProfile: (...args: unknown[]) => mockGetCurrentProfile(...args),
  getProfileAvatarSignedUrl: (...args: unknown[]) => mockGetProfileAvatarSignedUrl(...args),
  updateCurrentProfileName: (...args: unknown[]) => mockUpdateCurrentProfileName(...args),
  updateCurrentUserPassword: (...args: unknown[]) => mockUpdateCurrentUserPassword(...args),
  updateCurrentUserAvatarUrl: (...args: unknown[]) => mockUpdateCurrentUserAvatarUrl(...args),
}));

function createSession(email = "pro@example.com"): Session {
  return {
    access_token: "token",
    refresh_token: "refresh",
    expires_in: 3600,
    expires_at: 1_777_700_000,
    token_type: "bearer",
    user: {
      id: "user-1",
      app_metadata: {},
      user_metadata: {},
      aud: "authenticated",
      created_at: "2026-05-01T00:00:00.000Z",
      email,
    },
  } as Session;
}

function setAuthenticatedSession() {
  const session = createSession();

  mockUseSession.mockReturnValue({
    status: "authenticated",
    session,
    user: session.user,
  });
}

function renderProfilePage() {
  render(
    <MemoryRouter initialEntries={["/profile"]}>
      <ProfilePage />
    </MemoryRouter>,
  );
}

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.clearAllMocks();
  setAuthenticatedSession();
  mockGetCurrentProfile.mockResolvedValue({
    id: "user-1",
    email: "pro@example.com",
    fullName: "Nadira peserta UTBK",
    avatarUrl: null,
    role: "pendaftar_baru",
  });
  mockGetProfileAvatarSignedUrl.mockResolvedValue("https://example.com/avatar.webp");
  mockUpdateCurrentProfileName.mockResolvedValue(undefined);
  mockUpdateCurrentUserPassword.mockResolvedValue(undefined);
  mockUpdateCurrentUserAvatarUrl.mockResolvedValue({
    avatarUrl: "/avatars/avatar-1.jpg",
  });
  mockLogout.mockResolvedValue(undefined);
});

describe("ProfilePage", () => {
  test("re-fetches the live profile when the window regains focus", async () => {
    mockGetCurrentProfile
      .mockResolvedValueOnce({
        id: "user-1",
        email: "pro@example.com",
        fullName: "Nadira peserta UTBK",
        avatarUrl: null,
        role: "pendaftar_baru",
      })
      .mockResolvedValueOnce({
        id: "user-1",
        email: "pro@example.com",
        fullName: "Admin Nadira",
        avatarUrl: null,
        role: "admin",
      });

    renderProfilePage();

    expect(await screen.findByText(/pendaftar baru/i)).toBeInTheDocument();

    fireEvent(window, new Event("focus"));

    await waitFor(() => {
      expect(mockGetCurrentProfile).toHaveBeenCalledTimes(2);
    });
    expect(
      await screen.findByText(/kelola identitas akun, keamanan login, foto profil, dan logout di satu tempat/i),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/^admin$/i).length).toBeGreaterThan(0);
  });

  test("submits a valid display name change", async () => {
    renderProfilePage();

    const nameInput = await screen.findByLabelText(/^nama$/i);
    const saveNameButton = screen.getByRole("button", { name: /simpan nama/i });
    fireEvent.change(nameInput, {
      target: {
        value: "Nadira peserta UTBK Baru",
      },
    });
    fireEvent.click(saveNameButton);

    expect(saveNameButton).toHaveAttribute(
      "data-variant",
      "primary",
    );

    await waitFor(() => {
      expect(mockUpdateCurrentProfileName).toHaveBeenCalledWith({
        userId: "user-1",
        fullName: "Nadira peserta UTBK Baru",
      });
    });
    expect(await screen.findByText(/^nama tampilan berhasil diperbarui\.$/i)).toBeInTheDocument();
  });

  test("blocks password submit when confirmation does not match", async () => {
    renderProfilePage();

    const changePasswordButton = await screen.findByRole("button", { name: /ganti password/i });
    fireEvent.change(await screen.findByLabelText(/password saat ini/i), {
      target: {
        value: "password-lama",
      },
    });
    fireEvent.change(screen.getByLabelText(/^password baru$/i), {
      target: {
        value: "password-baru",
      },
    });
    fireEvent.change(screen.getByLabelText(/konfirmasi password baru/i), {
      target: {
        value: "beda-password",
      },
    });
    fireEvent.click(changePasswordButton);

    expect(changePasswordButton).toHaveAttribute(
      "data-variant",
      "primary",
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /konfirmasi password belum cocok/i,
    );
    expect(mockUpdateCurrentUserPassword).not.toHaveBeenCalled();
  });

  test("submits a valid password change with TestSprite-visible success copy", async () => {
    renderProfilePage();

    const changePasswordButton = await screen.findByRole("button", { name: /ganti password/i });
    fireEvent.change(await screen.findByLabelText(/password saat ini/i), {
      target: {
        value: "password-lama",
      },
    });
    fireEvent.change(screen.getByLabelText(/^password baru$/i), {
      target: {
        value: "password-baru-123",
      },
    });
    fireEvent.change(screen.getByLabelText(/konfirmasi password baru/i), {
      target: {
        value: "password-baru-123",
      },
    });
    fireEvent.click(changePasswordButton);

    expect(changePasswordButton).toHaveAttribute(
      "data-variant",
      "primary",
    );

    await waitFor(() => {
      expect(mockUpdateCurrentUserPassword).toHaveBeenCalledWith({
        currentPassword: "password-lama",
        nextPassword: "password-baru-123",
      });
    });
    expect(await screen.findByText(/kata sandi berhasil diubah/i)).toBeInTheDocument();
  });

  test("updates avatar on click", async () => {
    renderProfilePage();

    await screen.findByText(/Pilih foto profil/i);
    const firstAvatar = screen.getByAltText("Avatar 1");

    fireEvent.click(firstAvatar);

    await waitFor(() => {
      expect(mockUpdateCurrentUserAvatarUrl).toHaveBeenCalledWith({
        userId: "user-1",
        avatarUrl: "/avatars/avatar-1.jpg",
      });
    });

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /foto profil berhasil diperbarui/i,
    );
  });

  test("calls logout from the profile page", async () => {
    renderProfilePage();

    const logoutButton = await screen.findByRole("button", { name: /logout sekarang/i });

    expect(logoutButton).toHaveAttribute("data-variant", "destructive");
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  test("shows shorter profile descriptions and states", async () => {
    renderProfilePage();

    expect(await screen.findByText(/kelola nama, password, foto profil, dan logout akunmu/i)).toBeInTheDocument();
    expect(screen.getByText(/nama ini akan tampil di profil akunmu/i)).toBeInTheDocument();

    cleanup();

    mockGetCurrentProfile.mockImplementationOnce(() => new Promise(() => undefined));
    renderProfilePage();

    expect(await screen.findByText(/memuat profil akun/i, { selector: 'h1, h2, h3, h4, h5, h6, [data-slot="card-title"], [data-slot="alert-title"]' })).toBeInTheDocument();
    expect(screen.getByText(/profil akun sedang dimuat/i)).toBeInTheDocument();

    cleanup();

    mockGetCurrentProfile.mockRejectedValueOnce("failed");
    renderProfilePage();

    expect(await screen.findByText(/profil akun belum bisa dimuat/i, { selector: 'h1, h2, h3, h4, h5, h6, [data-slot="card-title"], [data-slot="alert-title"]' })).toBeInTheDocument();
  });
});
