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
  it('does not show committee role selectors', () => {
    render(<LoginPage />);

    expect(screen.queryByText('Executive Committee')).not.toBeInTheDocument();
    expect(screen.queryByText('Election Committee')).not.toBeInTheDocument();
    expect(screen.queryAllByRole('combobox')).toHaveLength(0);
  });

  it('submits registration number and password to the backend login API', async () => {
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

    await user.type(screen.getByLabelText(/registration number/i), '2024-12345');
    await user.type(screen.getByLabelText(/password/i), '123456');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/auth/login',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationNumber: '2024-12345',
          password: '123456',
        }),
      }),
    );

    vi.unstubAllGlobals();
  });
});
