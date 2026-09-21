// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardShell } from './DashboardShell';

const mockSearchParams = vi.hoisted(() => ({
  role: 'EXECUTIVE_COMMITTEE',
  position: null as string | null,
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === 'role') return mockSearchParams.role;
      if (key === 'position') return mockSearchParams.position;
      return null;
    },
  }),
}));

describe('DashboardShell', () => {
  it('renders the dashboard navigation and main heading', () => {
    render(<DashboardShell />);

    expect(
      screen.getByRole('navigation', { name: /dashboard navigation/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: /dashboard overview/i }),
    ).toBeInTheDocument();

    expect(screen.getAllByText(/executive committee/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /events/i })).toBeInTheDocument();
  });

  it('uses the default executive office when a role is provided without a position', () => {
    mockSearchParams.role = 'EXECUTIVE_COMMITTEE';
    mockSearchParams.position = null;

    render(<DashboardShell />);

    expect(screen.getByText(/general secretary/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /review meeting records/i })).toBeInTheDocument();
  });

  it('allows the General Secretary to add a real meeting record', async () => {
    mockSearchParams.role = 'EXECUTIVE_COMMITTEE';
    mockSearchParams.position = 'GENERAL_SECRETARY';

    const user = userEvent.setup();
    render(<DashboardShell />);

    await user.click(screen.getByRole('button', { name: /review meeting records/i }));

    await user.click(screen.getByRole('button', { name: /add meeting record/i }));
    await user.type(screen.getByLabelText(/meeting title/i), 'Executive Budget Review');
    await user.type(screen.getByLabelText(/meeting date/i), '2026-09-20');
    await user.type(screen.getByLabelText(/summary/i), 'Reviewed the event budget and approved the next action plan.');
    await user.selectOptions(screen.getByLabelText(/status/i), 'Approved');
    await user.click(screen.getByRole('button', { name: /save record/i }));

    expect(screen.getByText(/executive budget review/i)).toBeInTheDocument();
    expect(screen.getByText(/^approved$/i)).toBeInTheDocument();
    expect(screen.getByText(/submitted by: general secretary/i)).toBeInTheDocument();
  });

  it('allows the General Secretary to publish an official notice', async () => {
    mockSearchParams.role = 'EXECUTIVE_COMMITTEE';
    mockSearchParams.position = 'GENERAL_SECRETARY';

    const user = userEvent.setup();
    render(<DashboardShell />);

    await user.click(screen.getByRole('button', { name: /publish official notice/i }));

    await user.type(screen.getByLabelText(/notice title/i), 'Annual Club Orientation');
    await user.type(screen.getByLabelText(/audience/i), 'All club members');
    await user.type(screen.getByLabelText(/notice details/i), 'The orientation session will be held on Saturday at 10:00 AM in the seminar hall.');
    await user.click(screen.getByRole('button', { name: /publish notice/i }));

    expect(screen.getByText(/annual club orientation/i)).toBeInTheDocument();
    expect(screen.getByText(/all club members/i)).toBeInTheDocument();
    expect(screen.getByText(/submitted by: general secretary/i)).toBeInTheDocument();
  });

  it('allows the General Secretary to track member updates', async () => {
    mockSearchParams.role = 'EXECUTIVE_COMMITTEE';
    mockSearchParams.position = 'GENERAL_SECRETARY';

    const user = userEvent.setup();
    render(<DashboardShell />);

    await user.click(screen.getByRole('button', { name: /track member updates/i }));

    await user.type(screen.getByLabelText(/member name/i), 'Shahrin Akter');
    await user.type(screen.getByLabelText(/member id/i), 'CSE-204');
    await user.selectOptions(screen.getByLabelText(/status/i), 'Updated');
    await user.type(screen.getByLabelText(/details/i), 'Updated attendance and event participation record.');
    await user.click(screen.getByRole('button', { name: /save update/i }));

    expect(screen.getByText(/shahrin akter/i)).toBeInTheDocument();
    expect(screen.getByText(/cse-204/i)).toBeInTheDocument();
    expect(screen.getByText(/^updated$/i)).toBeInTheDocument();
    expect(screen.getByText(/submitted by: general secretary/i)).toBeInTheDocument();
  });

  it('allows the General Secretary to coordinate internal communication', async () => {
    mockSearchParams.role = 'EXECUTIVE_COMMITTEE';
    mockSearchParams.position = 'GENERAL_SECRETARY';

    const user = userEvent.setup();
    render(<DashboardShell />);

    await user.click(screen.getByRole('button', { name: /coordinate internal communication/i }));

    await user.type(screen.getByLabelText(/recipient group/i), 'Executive Committee');
    await user.type(screen.getByLabelText(/message title/i), 'Weekly coordination update');
    await user.type(screen.getByLabelText(/message details/i), 'Please share the event attendance report before Friday noon.');
    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(screen.getByText(/weekly coordination update/i)).toBeInTheDocument();
    expect(screen.getByText(/^recipient:\s*executive committee$/i)).toBeInTheDocument();
    expect(screen.getByText(/submitted by: general secretary/i)).toBeInTheDocument();
  });

  it('allows the Treasurer to manage the full finance sector', async () => {
    mockSearchParams.role = 'EXECUTIVE_COMMITTEE';
    mockSearchParams.position = 'TREASURER';

    const user = userEvent.setup();
    render(<DashboardShell />);

    expect(screen.getByRole('button', { name: /budget overview/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /record income/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /track expenses/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /review financial updates/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /record income/i }));
    await user.type(screen.getByLabelText(/income source/i), 'Membership fee collection');
    await user.type(screen.getByLabelText(/income amount/i), '180000');
    await user.click(screen.getByRole('button', { name: /save income/i }));

    expect(screen.getByText(/membership fee collection/i)).toBeInTheDocument();
    expect(screen.getByText(/tk 180000/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /track expenses/i }));
    await user.type(screen.getByLabelText(/expense title/i), 'Club Tech Workshop');
    await user.type(screen.getByLabelText(/expense amount/i), '25000');
    await user.selectOptions(screen.getByLabelText(/expense status/i), 'Approved');
    await user.type(screen.getByLabelText(/purpose/i), 'Workshop materials and venue support.');
    await user.click(screen.getByRole('button', { name: /save expense/i }));

    expect(screen.getByText(/club tech workshop/i)).toBeInTheDocument();
    expect(screen.getByText(/tk 25000/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /review financial updates/i }));
    await user.type(screen.getByLabelText(/expense title/i), 'Club Event Budget');
    await user.type(screen.getByLabelText(/amount/i), '40000');
    await user.selectOptions(screen.getByLabelText(/finance status/i), 'Approved');
    await user.type(screen.getByLabelText(/purpose/i), 'Event materials and venue support.');
    await user.click(screen.getByRole('button', { name: /save update/i }));

    expect(screen.getByText(/club event budget/i)).toBeInTheDocument();
    expect(screen.getByText(/submitted by: treasurer/i)).toBeInTheDocument();
  });

  it('allows the Event Coordinator to manage event operations', async () => {
    mockSearchParams.role = 'EXECUTIVE_COMMITTEE';
    mockSearchParams.position = 'EVENT_COORDINATOR';

    const user = userEvent.setup();
    render(<DashboardShell />);

    expect(screen.getByRole('button', { name: /review event registrations/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /approve venue bookings/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /track volunteer roster/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /review event registrations/i }));
    await user.type(screen.getByLabelText(/event name/i), 'Campus Hackfest');
    await user.type(screen.getByLabelText(/registered attendees/i), '128');
    await user.click(screen.getByRole('button', { name: /save registration/i }));

    expect(screen.getByText(/campus hackfest/i)).toBeInTheDocument();
    expect(screen.getByText(/128 attendees/i)).toBeInTheDocument();
    expect(screen.getByText(/submitted by: event coordinator/i)).toBeInTheDocument();
  });

  it('allows the President to oversee executive approvals and governance', async () => {
    mockSearchParams.role = 'EXECUTIVE_COMMITTEE';
    mockSearchParams.position = 'PRESIDENT';

    const user = userEvent.setup();
    render(<DashboardShell />);

    expect(screen.getByRole('button', { name: /review executive summary/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view attendance oversight/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /access financial oversight/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /view attendance oversight/i }));

    expect(screen.getAllByText(/attendance oversight/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/executive committee attendance review/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /access financial oversight/i }));

    expect(screen.getAllByText(/financial oversight/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/current balance/i)).toBeInTheDocument();
  });

  it('gives the Election Commissioner a dedicated oversight workflow', async () => {
    mockSearchParams.role = 'ELECTION_COMMITTEE';
    mockSearchParams.position = 'ELECTION_COMMISSIONER';

    const user = userEvent.setup();
    render(<DashboardShell />);

    expect(screen.getByText(/election commissioner/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /review ballot eligibility/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /verify candidate submissions/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /review election timeline/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /review ballot eligibility/i }));
    expect(screen.getByText(/ballot eligibility review/i)).toBeInTheDocument();
  });

  it('supports an Executive Committee member role with member-specific actions', async () => {
    mockSearchParams.role = 'EXECUTIVE_COMMITTEE';
    mockSearchParams.position = 'MEMBER';

    const user = userEvent.setup();
    render(<DashboardShell />);

    expect(screen.getByRole('button', { name: /view member directory/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /review club announcements/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /view member directory/i }));

    expect(screen.getAllByText(/member directory/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/committee membership overview/i)).toBeInTheDocument();
  });

  it('allows every role to update registration and password details from the dashboard', async () => {
    mockSearchParams.role = 'EXECUTIVE_COMMITTEE';
    mockSearchParams.position = 'GENERAL_SECRETARY';

    const user = userEvent.setup();
    render(<DashboardShell />);

    expect(screen.getByText(/account security/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/registration number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();

    await user.clear(screen.getByLabelText(/registration number/i));
    await user.type(screen.getByLabelText(/registration number/i), '2026-7788');
    await user.type(screen.getByLabelText(/new password/i), 'newsecret123');
    await user.click(screen.getByRole('button', { name: /save credentials/i }));

    expect(screen.getByText(/credentials updated successfully/i)).toBeInTheDocument();
  });

  it('shows secretary-specific duties when the logged-in role is General Secretary', async () => {
    mockSearchParams.role = 'EXECUTIVE_COMMITTEE';
    mockSearchParams.position = 'GENERAL_SECRETARY';

    const user = userEvent.setup();
    render(<DashboardShell />);

    const reviewButton = screen.getByRole('button', { name: /review meeting records/i });
    expect(reviewButton).toBeInTheDocument();

    await user.click(reviewButton);

    expect(screen.getByText(/meeting record review panel/i)).toBeInTheDocument();
    expect(screen.getByText(/no meeting records available yet/i)).toBeInTheDocument();
    expect(screen.getByText(/publish official notice/i)).toBeInTheDocument();
  });
});
