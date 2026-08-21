import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MaterialUploaderForm } from './MaterialUploaderForm';
import { toast } from 'sonner';

const mockInsert = vi.fn();
const mockFrom = vi.fn(() => ({
  insert: mockInsert,
}));

vi.mock('../../../lib/supabase/browser-client', () => ({
  getSupabaseBrowserClient: () => ({
    from: mockFrom,
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('MaterialUploaderForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders form elements correctly', () => {
    render(<MaterialUploaderForm />);
    expect(screen.getByText('Upload Materi Knowledge Base')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Judul Materi (Misal: Rumus Cepat Kuantitatif)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Isi Materi / Teks Referensi')).toBeInTheDocument();
    
    const button = screen.getByRole('button', { name: 'Unggah Materi' });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it('enables button when title and content are provided', () => {
    render(<MaterialUploaderForm />);
    const titleInput = screen.getByPlaceholderText('Judul Materi (Misal: Rumus Cepat Kuantitatif)');
    const contentInput = screen.getByPlaceholderText('Isi Materi / Teks Referensi');
    const button = screen.getByRole('button', { name: 'Unggah Materi' });

    fireEvent.change(titleInput, { target: { value: 'Materi Test' } });
    fireEvent.change(contentInput, { target: { value: 'Konten Test' } });

    expect(button).not.toBeDisabled();
  });

  it('submits form successfully and clears inputs', async () => {
    mockInsert.mockResolvedValueOnce({ error: null });

    render(<MaterialUploaderForm />);
    const titleInput = screen.getByPlaceholderText('Judul Materi (Misal: Rumus Cepat Kuantitatif)') as HTMLInputElement;
    const contentInput = screen.getByPlaceholderText('Isi Materi / Teks Referensi') as HTMLTextAreaElement;
    const button = screen.getByRole('button', { name: 'Unggah Materi' });

    fireEvent.change(titleInput, { target: { value: 'Materi Fisika' } });
    fireEvent.change(contentInput, { target: { value: 'Rumus Kecepatan' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith('tutor_materials');
      expect(mockInsert).toHaveBeenCalledWith({
        title: 'Materi Fisika',
        content_text: 'Rumus Kecepatan',
      });
      expect(toast.success).toHaveBeenCalledWith('Materi berhasil diunggah');
      expect(titleInput.value).toBe('');
      expect(contentInput.value).toBe('');
    });
  });

  it('shows error toast when upload fails', async () => {
    mockInsert.mockResolvedValueOnce({ error: new Error('Upload error') });

    render(<MaterialUploaderForm />);
    const titleInput = screen.getByPlaceholderText('Judul Materi (Misal: Rumus Cepat Kuantitatif)');
    const contentInput = screen.getByPlaceholderText('Isi Materi / Teks Referensi');
    const button = screen.getByRole('button', { name: 'Unggah Materi' });

    fireEvent.change(titleInput, { target: { value: 'Materi Fisika' } });
    fireEvent.change(contentInput, { target: { value: 'Rumus Kecepatan' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith('tutor_materials');
      expect(mockInsert).toHaveBeenCalledWith({
        title: 'Materi Fisika',
        content_text: 'Rumus Kecepatan',
      });
      expect(toast.error).toHaveBeenCalledWith('Gagal mengunggah materi');
    });
  });
});
