// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from './page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => ({
    get: (key: string) => (key === 'next' ? '/dashboard' : null),
  }),
}));

describe('LoginPage', () => {
  it('shows sub-role options for executive and election committee members', () => {
    render(<LoginPage />);

    expect(screen.getByRole('button', { name: /executive committee/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /election committee/i })).toBeInTheDocument();
    expect(screen.getAllByRole('combobox', { name: /select other role/i })).toHaveLength(2);
    expect(screen.getByRole('option', { name: /president/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /general secretary/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /chief election officer/i })).toBeInTheDocument();
  });

  it('submits real email and password credentials to the backend login API', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        user: {
          role: 'EXECUTIVE_COMMITTEE',
          post: { name: 'President' },
        },
      }),
    });

    vi.stubGlobal('fetch', fetchMock);

    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), 'president@neucc.test');
    await user.type(screen.getByLabelText(/password/i), 'secret123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/auth/login',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'president@neucc.test', password: 'secret123' }),
      }),
    );

    vi.unstubAllGlobals();
  });
});
