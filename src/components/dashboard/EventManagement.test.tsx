// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EventManagement } from './EventManagement';

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => (key === 'role' ? 'EXECUTIVE_COMMITTEE' : null),
  }),
}));

describe('EventManagement', () => {
  it('opens a form when the new event button is clicked and allows saving a draft', async () => {
    const user = userEvent.setup();
    render(<EventManagement />);

    const trigger = screen.getByRole('button', { name: /new event/i });
    await user.click(trigger);

    expect(screen.getByRole('heading', { name: /create event/i })).toBeInTheDocument();

    await user.type(screen.getByLabelText(/event title/i), 'Campus Hackfest');
    await user.type(screen.getByLabelText(/start time/i), '10:00');
    await user.type(screen.getByLabelText(/end time/i), '12:30');
    await user.click(screen.getByRole('button', { name: /save event/i }));

    expect(screen.getByText(/campus hackfest/i)).toBeInTheDocument();
  });
});
