// @vitest-environment jsdom

'use client';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from './ThemeToggle';

const mockSetTheme = vi.fn();

vi.mock('next-themes', () => ({
  useTheme: () => ({
    resolvedTheme: 'dark',
    setTheme: mockSetTheme,
  }),
}));

describe('ThemeToggle', () => {
  beforeEach(() => {
    mockSetTheme.mockClear();
  });

  it('renders dark mode toggle and toggles to light theme when clicked', async () => {
    const user = userEvent.setup();

    render(<ThemeToggle />);

    const button = screen.getByRole('button', { name: /switch to light theme/i });
    expect(button).toBeInTheDocument();

    await user.click(button);

    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });
});
