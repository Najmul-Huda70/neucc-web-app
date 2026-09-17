'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowUpRight,
  CalendarDays,
  Layers3,
  Megaphone,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/events', label: 'Events' },
  { href: '/dashboard/notices', label: 'Notices' },
  { href: '/dashboard/members', label: 'Members' },
  { href: '/dashboard/settings', label: 'Settings' },
];

const overviewCards = [
  { title: 'Upcoming Events', value: '12', icon: CalendarDays },
  { title: 'Published Notices', value: '08', icon: Megaphone },
  { title: 'Active Members', value: '240', icon: Users },
  { title: 'Access Control', value: 'Secure', icon: ShieldCheck },
];

const recentActivity = [
  { title: 'Annual Tech Summit', detail: 'Budget approval submitted', time: '2 hrs ago' },
  { title: 'General Membership Notice', detail: 'Published to all members', time: 'Today' },
  { title: 'Committee Review', detail: 'Executive meeting scheduled', time: 'Yesterday' },
];

const executiveActions = [
  'Review event registrations',
  'Publish committee notice',
  'Manage member approvals',
  'Review financial updates',
];

const memberActions = [
  'View member directory',
  'Review club announcements',
  'Submit membership update',
  'Access event reminders',
];

const generalSecretaryActions = [
  'Review meeting records',
  'Publish official notice',
  'Track member updates',
  'Coordinate internal communication',
];

const treasurerActions = [
  'Budget overview',
  'Record income',
  'Track expenses',
  'Review financial updates',
];

const eventCoordinatorActions = [
  'Add event',
  'Review event registrations',
  'Approve venue bookings',
  'Track volunteer roster',
];

const presidentActions = [
  'Review executive summary',
  'View attendance oversight',
  'Access financial oversight',
  'Approve governance decisions',
];

const electionActions = [
  'Review election timeline',
  'Verify candidate submissions',
  'Publish election notices',
  'Manage committee access',
];

const initialMeetingRecord = {
  title: '',
  date: '',
  summary: '',
  status: 'Pending',
};

const initialNotice = {
  title: '',
  audience: '',
  details: '',
};

const initialMemberUpdate = {
  name: '',
  memberId: '',
  status: 'Pending',
  details: '',
};

const initialCommunication = {
  recipient: '',
  title: '',
  details: '',
};

const initialIncomeEntry = {
  source: '',
  amount: '',
  status: 'Received',
};

const initialExpenseEntry = {
  title: '',
  amount: '',
  status: 'Pending',
  purpose: '',
};

const initialRegistration = {
  eventName: '',
  attendeeCount: '',
  status: 'Confirmed',
};

const initialVenueBooking = {
  venue: '',
  date: '',
  status: 'Pending',
};

const initialVolunteer = {
  name: '',
  role: '',
  availability: 'Available',
};

const initialFinanceUpdate = {
  title: '',
  amount: '',
  status: 'Pending',
  purpose: '',
};

const emptyMeetingRecords: Array<{
  title: string;
  date: string;
  summary: string;
  status: string;
  submittedBy: string;
}> = [];

const emptyNotices: Array<{
  title: string;
  audience: string;
  details: string;
  submittedBy: string;
}> = [];

const emptyMemberUpdates: Array<{
  name: string;
  memberId: string;
  status: string;
  details: string;
  submittedBy: string;
}> = [];

const emptyCommunications: Array<{
  recipient: string;
  title: string;
  details: string;
  submittedBy: string;
}> = [];

const emptyRegistrations: Array<{
  eventName: string;
  attendeeCount: string;
  status: string;
  submittedBy: string;
}> = [];

const emptyVenueBookings: Array<{
  venue: string;
  date: string;
  status: string;
  submittedBy: string;
}> = [];

const emptyVolunteerRoster: Array<{
  name: string;
  role: string;
  availability: string;
  submittedBy: string;
}> = [];

const emptyIncomeEntries: Array<{
  source: string;
  amount: string;
  status: string;
  submittedBy: string;
}> = [];

const emptyExpenseEntries: Array<{
  title: string;
  amount: string;
  status: string;
  purpose: string;
  submittedBy: string;
}> = [];

const emptyFinanceUpdates: Array<{
  title: string;
  amount: string;
  status: string;
  purpose: string;
  submittedBy: string;
}> = [];

export function DashboardShell() {
  const searchParams = useSearchParams();
  const selectedRole = searchParams.get('role') ?? 'EXECUTIVE_COMMITTEE';
  const rawPosition = searchParams.get('position');
  const defaultPosition =
    selectedRole === 'ELECTION_COMMITTEE' ? 'CHIEF_ELECTION_OFFICER' : 'GENERAL_SECRETARY';
  const selectedPosition = rawPosition ?? defaultPosition;
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [showMemberUpdateForm, setShowMemberUpdateForm] = useState(false);
  const [showCommunicationForm, setShowCommunicationForm] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showVenueForm, setShowVenueForm] = useState(false);
  const [showVolunteerForm, setShowVolunteerForm] = useState(false);
  const [showBudgetOverview, setShowBudgetOverview] = useState(false);
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showFinanceForm, setShowFinanceForm] = useState(false);
  const [recordDraft, setRecordDraft] = useState(initialMeetingRecord);
  const [noticeDraft, setNoticeDraft] = useState(initialNotice);
  const [memberUpdateDraft, setMemberUpdateDraft] = useState(initialMemberUpdate);
  const [communicationDraft, setCommunicationDraft] = useState(initialCommunication);
  const [registrationDraft, setRegistrationDraft] = useState(initialRegistration);
  const [venueDraft, setVenueDraft] = useState(initialVenueBooking);
  const [volunteerDraft, setVolunteerDraft] = useState(initialVolunteer);
  const [incomeDraft, setIncomeDraft] = useState(initialIncomeEntry);
  const [expenseDraft, setExpenseDraft] = useState(initialExpenseEntry);
  const [financeDraft, setFinanceDraft] = useState(initialFinanceUpdate);
  const [meetingRecords, setMeetingRecords] = useState(emptyMeetingRecords);
  const [notices, setNotices] = useState(emptyNotices);
  const [memberUpdates, setMemberUpdates] = useState(emptyMemberUpdates);
  const [communications, setCommunications] = useState(emptyCommunications);
  const [registrations, setRegistrations] = useState(emptyRegistrations);
  const [venueBookings, setVenueBookings] = useState(emptyVenueBookings);
  const [volunteerRoster, setVolunteerRoster] = useState(emptyVolunteerRoster);
  const [incomeEntries, setIncomeEntries] = useState(emptyIncomeEntries);
  const [expenseEntries, setExpenseEntries] = useState(emptyExpenseEntries);
  const [financeUpdates, setFinanceUpdates] = useState(emptyFinanceUpdates);
  const roleLabel =
    selectedRole === 'ELECTION_COMMITTEE' ? 'Election Committee' : 'Executive Committee';
  const positionLabel = selectedPosition
    ? selectedPosition
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase())
    : null;
  const quickActions =
    selectedRole === 'ELECTION_COMMITTEE'
      ? electionActions
      : selectedPosition === 'GENERAL_SECRETARY'
        ? generalSecretaryActions
        : selectedPosition === 'TREASURER'
          ? treasurerActions
          : selectedPosition === 'EVENT_COORDINATOR'
            ? eventCoordinatorActions
            : selectedPosition === 'PRESIDENT'
              ? presidentActions
              : selectedPosition === 'MEMBER'
                ? memberActions
                : executiveActions;

  const showMeetingRecords =
    selectedPosition === 'GENERAL_SECRETARY' && activeAction === 'Review meeting records';

  const totalIncome = incomeEntries.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  const totalExpenses = expenseEntries.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  const currentBalance = totalIncome - totalExpenses;

  const handleRecordDraftChange = (field: keyof typeof initialMeetingRecord, value: string) => {
    setRecordDraft((current) => ({ ...current, [field]: value }));
  };

  const handleSaveMeetingRecord = () => {
    if (!recordDraft.title.trim() || !recordDraft.date || !recordDraft.summary.trim()) {
      return;
    }

    setMeetingRecords((current) => [
      ...current,
      {
        ...recordDraft,
        title: recordDraft.title.trim(),
        summary: recordDraft.summary.trim(),
        submittedBy: 'General Secretary',
      },
    ]);
    setRecordDraft(initialMeetingRecord);
    setShowRecordForm(false);
  };

  const handleNoticeDraftChange = (field: keyof typeof initialNotice, value: string) => {
    setNoticeDraft((current) => ({ ...current, [field]: value }));
  };

  const handlePublishNotice = () => {
    if (!noticeDraft.title.trim() || !noticeDraft.audience.trim() || !noticeDraft.details.trim()) {
      return;
    }

    setNotices((current) => [
      ...current,
      {
        ...noticeDraft,
        title: noticeDraft.title.trim(),
        audience: noticeDraft.audience.trim(),
        details: noticeDraft.details.trim(),
        submittedBy: 'General Secretary',
      },
    ]);
    setNoticeDraft(initialNotice);
    setShowNoticeForm(false);
  };

  const handleMemberUpdateDraftChange = (field: keyof typeof initialMemberUpdate, value: string) => {
    setMemberUpdateDraft((current) => ({ ...current, [field]: value }));
  };

  const handleSaveMemberUpdate = () => {
    if (!memberUpdateDraft.name.trim() || !memberUpdateDraft.memberId.trim() || !memberUpdateDraft.details.trim()) {
      return;
    }

    setMemberUpdates((current) => [
      ...current,
      {
        ...memberUpdateDraft,
        name: memberUpdateDraft.name.trim(),
        memberId: memberUpdateDraft.memberId.trim(),
        details: memberUpdateDraft.details.trim(),
        submittedBy: 'General Secretary',
      },
    ]);
    setMemberUpdateDraft(initialMemberUpdate);
    setShowMemberUpdateForm(false);
  };

  const handleRegistrationDraftChange = (field: keyof typeof initialRegistration, value: string) => {
    setRegistrationDraft((current) => ({ ...current, [field]: value }));
  };

  const handleSaveRegistration = () => {
    if (!registrationDraft.eventName.trim() || !registrationDraft.attendeeCount.trim()) {
      return;
    }

    setRegistrations((current) => [
      ...current,
      {
        ...registrationDraft,
        eventName: registrationDraft.eventName.trim(),
        attendeeCount: registrationDraft.attendeeCount.trim(),
        submittedBy: 'Event Coordinator',
      },
    ]);
    setRegistrationDraft(initialRegistration);
    setShowRegistrationForm(false);
  };

  const handleVenueDraftChange = (field: keyof typeof initialVenueBooking, value: string) => {
    setVenueDraft((current) => ({ ...current, [field]: value }));
  };

  const handleSaveVenueBooking = () => {
    if (!venueDraft.venue.trim() || !venueDraft.date.trim()) {
      return;
    }

    setVenueBookings((current) => [
      ...current,
      {
        ...venueDraft,
        venue: venueDraft.venue.trim(),
        date: venueDraft.date.trim(),
        submittedBy: 'Event Coordinator',
      },
    ]);
    setVenueDraft(initialVenueBooking);
    setShowVenueForm(false);
  };

  const handleVolunteerDraftChange = (field: keyof typeof initialVolunteer, value: string) => {
    setVolunteerDraft((current) => ({ ...current, [field]: value }));
  };

  const handleSaveVolunteer = () => {
    if (!volunteerDraft.name.trim() || !volunteerDraft.role.trim()) {
      return;
    }

    setVolunteerRoster((current) => [
      ...current,
      {
        ...volunteerDraft,
        name: volunteerDraft.name.trim(),
        role: volunteerDraft.role.trim(),
        submittedBy: 'Event Coordinator',
      },
    ]);
    setVolunteerDraft(initialVolunteer);
    setShowVolunteerForm(false);
  };

  const handleIncomeDraftChange = (field: keyof typeof initialIncomeEntry, value: string) => {
    setIncomeDraft((current) => ({ ...current, [field]: value }));
  };

  const handleSaveIncome = () => {
    if (!incomeDraft.source.trim() || !incomeDraft.amount.trim()) {
      return;
    }

    setIncomeEntries((current) => [
      ...current,
      {
        ...incomeDraft,
        source: incomeDraft.source.trim(),
        amount: incomeDraft.amount.trim(),
        submittedBy: 'Treasurer',
      },
    ]);
    setIncomeDraft(initialIncomeEntry);
    setShowIncomeForm(false);
  };

  const handleExpenseDraftChange = (field: keyof typeof initialExpenseEntry, value: string) => {
    setExpenseDraft((current) => ({ ...current, [field]: value }));
  };

  const handleSaveExpense = () => {
    if (!expenseDraft.title.trim() || !expenseDraft.amount.trim() || !expenseDraft.purpose.trim()) {
      return;
    }

    setExpenseEntries((current) => [
      ...current,
      {
        ...expenseDraft,
        title: expenseDraft.title.trim(),
        amount: expenseDraft.amount.trim(),
        purpose: expenseDraft.purpose.trim(),
        submittedBy: 'Treasurer',
      },
    ]);
    setExpenseDraft(initialExpenseEntry);
    setShowExpenseForm(false);
  };

  const handleFinanceDraftChange = (field: keyof typeof initialFinanceUpdate, value: string) => {
    setFinanceDraft((current) => ({ ...current, [field]: value }));
  };

  const handleSaveFinanceUpdate = () => {
    if (!financeDraft.title.trim() || !financeDraft.amount.trim() || !financeDraft.purpose.trim()) {
      return;
    }

    setFinanceUpdates((current) => [
      ...current,
      {
        ...financeDraft,
        title: financeDraft.title.trim(),
        amount: financeDraft.amount.trim(),
        purpose: financeDraft.purpose.trim(),
        submittedBy: 'Treasurer',
      },
    ]);
    setFinanceDraft(initialFinanceUpdate);
    setShowFinanceForm(false);
  };

  const handleCommunicationDraftChange = (field: keyof typeof initialCommunication, value: string) => {
    setCommunicationDraft((current) => ({ ...current, [field]: value }));
  };

  const handleSendCommunication = () => {
    if (!communicationDraft.recipient.trim() || !communicationDraft.title.trim() || !communicationDraft.details.trim()) {
      return;
    }

    setCommunications((current) => [
      ...current,
      {
        ...communicationDraft,
        recipient: communicationDraft.recipient.trim(),
        title: communicationDraft.title.trim(),
        details: communicationDraft.details.trim(),
        submittedBy: 'General Secretary',
      },
    ]);
    setCommunicationDraft(initialCommunication);
    setShowCommunicationForm(false);
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-background text-text-main">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <aside
          aria-label="Dashboard navigation"
          className="hidden w-72 shrink-0 rounded-2xl border border-border bg-surface p-4 shadow-sm lg:block"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Layers3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-text-muted">NEUCC</p>
              <h2 className="font-heading text-lg font-bold">Dashboard</h2>
            </div>
          </div>

          <nav aria-label="Dashboard navigation" className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  item.label === 'Overview'
                    ? 'bg-primary text-white'
                    : 'text-text-muted hover:bg-surface hover:text-text-main'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 space-y-6 rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Overview</p>
              <h1 className="mt-2 font-heading text-3xl font-bold">Dashboard Overview</h1>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                {roleLabel}
              </div>
              {positionLabel && (
                <div className="rounded-full border border-border bg-background px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-text-muted">
                  {positionLabel}
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {overviewCards.map(({ title, value, icon: Icon }) => (
              <div key={title} className="rounded-xl border border-border bg-stat-surface p-4">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm text-text-muted">{title}</p>
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <p className="font-heading text-2xl font-bold">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
            <section className="rounded-xl border border-border bg-background p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-heading text-xl font-bold">Quick actions</h2>
                <Sparkles className="h-5 w-5 text-primary" />
              </div>

              <div className="space-y-3">
                {quickActions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setActiveAction(item);

                      if (item === 'Review meeting records') {
                        setShowRecordForm(false);
                        setShowNoticeForm(false);
                      }

                      if (item === 'Publish official notice') {
                        setShowNoticeForm(true);
                        setShowRecordForm(false);
                        setShowMemberUpdateForm(false);
                      }

                      if (item === 'Track member updates') {
                        setShowMemberUpdateForm(true);
                        setShowNoticeForm(false);
                        setShowRecordForm(false);
                        setShowCommunicationForm(false);
                      }

                      if (item === 'Coordinate internal communication') {
                        setShowCommunicationForm(true);
                        setShowMemberUpdateForm(false);
                        setShowNoticeForm(false);
                        setShowRecordForm(false);
                        setShowFinanceForm(false);
                      }

                      if (item === 'Budget overview') {
                        setShowBudgetOverview(true);
                        setShowIncomeForm(false);
                        setShowExpenseForm(false);
                        setShowFinanceForm(false);
                        setShowCommunicationForm(false);
                        setShowMemberUpdateForm(false);
                        setShowNoticeForm(false);
                        setShowRecordForm(false);
                      }

                      if (item === 'Record income') {
                        setShowIncomeForm(true);
                        setShowBudgetOverview(false);
                        setShowExpenseForm(false);
                        setShowFinanceForm(false);
                        setShowCommunicationForm(false);
                        setShowMemberUpdateForm(false);
                        setShowNoticeForm(false);
                        setShowRecordForm(false);
                      }

                      if (item === 'Track expenses') {
                        setShowExpenseForm(true);
                        setShowIncomeForm(false);
                        setShowBudgetOverview(false);
                        setShowFinanceForm(false);
                        setShowCommunicationForm(false);
                        setShowMemberUpdateForm(false);
                        setShowNoticeForm(false);
                        setShowRecordForm(false);
                      }

                      if (item === 'Add event') {
                        setShowRegistrationForm(false);
                        setShowVenueForm(false);
                        setShowVolunteerForm(false);
                        setShowFinanceForm(false);
                        setShowExpenseForm(false);
                        setShowIncomeForm(false);
                        setShowBudgetOverview(false);
                        setShowCommunicationForm(false);
                        setShowMemberUpdateForm(false);
                        setShowNoticeForm(false);
                        setShowRecordForm(false);
                      }

                      if (item === 'Review event registrations') {
                        setShowRegistrationForm(true);
                        setShowVenueForm(false);
                        setShowVolunteerForm(false);
                        setShowFinanceForm(false);
                        setShowExpenseForm(false);
                        setShowIncomeForm(false);
                        setShowBudgetOverview(false);
                        setShowCommunicationForm(false);
                        setShowMemberUpdateForm(false);
                        setShowNoticeForm(false);
                        setShowRecordForm(false);
                      }

                      if (item === 'Approve venue bookings') {
                        setShowVenueForm(true);
                        setShowRegistrationForm(false);
                        setShowVolunteerForm(false);
                        setShowFinanceForm(false);
                        setShowExpenseForm(false);
                        setShowIncomeForm(false);
                        setShowBudgetOverview(false);
                        setShowCommunicationForm(false);
                        setShowMemberUpdateForm(false);
                        setShowNoticeForm(false);
                        setShowRecordForm(false);
                      }

                      if (item === 'Track volunteer roster') {
                        setShowVolunteerForm(true);
                        setShowVenueForm(false);
                        setShowRegistrationForm(false);
                        setShowFinanceForm(false);
                        setShowExpenseForm(false);
                        setShowIncomeForm(false);
                        setShowBudgetOverview(false);
                        setShowCommunicationForm(false);
                        setShowMemberUpdateForm(false);
                        setShowNoticeForm(false);
                        setShowRecordForm(false);
                      }

                      if (item === 'Review financial updates') {
                        setShowFinanceForm(true);
                        setShowExpenseForm(false);
                        setShowIncomeForm(false);
                        setShowBudgetOverview(false);
                        setShowCommunicationForm(false);
                        setShowMemberUpdateForm(false);
                        setShowNoticeForm(false);
                        setShowRecordForm(false);
                      }

                      if (item === 'Review executive summary') {
                        setShowFinanceForm(false);
                        setShowExpenseForm(false);
                        setShowIncomeForm(false);
                        setShowBudgetOverview(false);
                        setShowCommunicationForm(false);
                        setShowMemberUpdateForm(false);
                        setShowNoticeForm(false);
                        setShowRecordForm(false);
                      }

                      if (item === 'View member directory' || item === 'Review club announcements' || item === 'Submit membership update' || item === 'Access event reminders') {
                        setShowFinanceForm(false);
                        setShowExpenseForm(false);
                        setShowIncomeForm(false);
                        setShowBudgetOverview(false);
                        setShowCommunicationForm(false);
                        setShowMemberUpdateForm(false);
                        setShowNoticeForm(false);
                        setShowRecordForm(false);
                        setShowRegistrationForm(false);
                        setShowVenueForm(false);
                        setShowVolunteerForm(false);
                      }
                    }}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm text-text-main transition ${
                      activeAction === item
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-surface hover:border-primary/60'
                    }`}
                  >
                    <span>{item}</span>
                    <ArrowUpRight className="h-4 w-4 text-text-muted" />
                  </button>
                ))}
              </div>

              {showMeetingRecords && (
                <div className="mt-6 rounded-xl border border-border bg-surface p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="font-heading text-lg font-bold">Meeting Record Review Panel</h3>
                    <button
                      type="button"
                      onClick={() => setShowRecordForm((current) => !current)}
                      className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
                    >
                      {showRecordForm ? 'Close form' : 'Add meeting record'}
                    </button>
                  </div>

                  {showRecordForm && (
                    <div className="mb-4 rounded-xl border border-border bg-background p-4">
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="space-y-2 text-sm text-text-main">
                          <span>Meeting title</span>
                          <input
                            aria-label="Meeting title"
                            value={recordDraft.title}
                            onChange={(event) => handleRecordDraftChange('title', event.target.value)}
                            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                            placeholder="Executive Budget Review"
                          />
                        </label>

                        <label className="space-y-2 text-sm text-text-main">
                          <span>Meeting date</span>
                          <input
                            aria-label="Meeting date"
                            type="date"
                            value={recordDraft.date}
                            onChange={(event) => handleRecordDraftChange('date', event.target.value)}
                            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                          />
                        </label>
                      </div>

                      <label className="mt-3 block space-y-2 text-sm text-text-main">
                        <span>Summary</span>
                        <textarea
                          aria-label="Summary"
                          value={recordDraft.summary}
                          onChange={(event) => handleRecordDraftChange('summary', event.target.value)}
                          className="min-h-[100px] w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                          placeholder="Summarize the key discussion and outcome."
                        />
                      </label>

                      <label className="mt-3 block space-y-2 text-sm text-text-main">
                        <span>Status</span>
                        <select
                          aria-label="Status"
                          value={recordDraft.status}
                          onChange={(event) => handleRecordDraftChange('status', event.target.value)}
                          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Approved">Approved</option>
                          <option value="Actioned">Actioned</option>
                        </select>
                      </label>

                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={handleSaveMeetingRecord}
                          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
                        >
                          Save record
                        </button>
                      </div>
                    </div>
                  )}

                  {meetingRecords.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border bg-background p-5 text-sm text-text-muted">
                      <p className="font-medium text-text-main">No meeting records available yet.</p>
                      <p className="mt-2">
                        This office can review approved meeting notes and future records once they are added.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {meetingRecords.map((record) => (
                        <div key={`${record.title}-${record.date}`} className="rounded-xl border border-border bg-background p-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-medium text-text-main">{record.title}</p>
                            <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                              {record.status}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-text-muted">{record.date}</p>
                          <p className="mt-2 text-sm text-text-main">{record.summary}</p>
                          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-text-muted">
                            Submitted by: {record.submittedBy}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedPosition === 'GENERAL_SECRETARY' && activeAction === 'Publish official notice' && (
                <div className="mt-6 rounded-xl border border-border bg-surface p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="font-heading text-lg font-bold">Official Notice Panel</h3>
                    <button
                      type="button"
                      onClick={() => setShowNoticeForm((current) => !current)}
                      className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
                    >
                      {showNoticeForm ? 'Close form' : 'Publish official notice'}
                    </button>
                  </div>

                  {showNoticeForm && (
                    <div className="mb-4 rounded-xl border border-border bg-background p-4">
                      <label className="block space-y-2 text-sm text-text-main">
                        <span>Notice title</span>
                        <input
                          aria-label="Notice title"
                          value={noticeDraft.title}
                          onChange={(event) => handleNoticeDraftChange('title', event.target.value)}
                          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                          placeholder="Annual Club Orientation"
                        />
                      </label>

                      <label className="mt-3 block space-y-2 text-sm text-text-main">
                        <span>Audience</span>
                        <input
                          aria-label="Audience"
                          value={noticeDraft.audience}
                          onChange={(event) => handleNoticeDraftChange('audience', event.target.value)}
                          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                          placeholder="All club members"
                        />
                      </label>

                      <label className="mt-3 block space-y-2 text-sm text-text-main">
                        <span>Notice details</span>
                        <textarea
                          aria-label="Notice details"
                          value={noticeDraft.details}
                          onChange={(event) => handleNoticeDraftChange('details', event.target.value)}
                          className="min-h-[120px] w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                          placeholder="Write the official announcement details."
                        />
                      </label>

                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={handlePublishNotice}
                          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
                        >
                          Publish notice
                        </button>
                      </div>
                    </div>
                  )}

                  {notices.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border bg-background p-5 text-sm text-text-muted">
                      <p className="font-medium text-text-main">No official notices published yet.</p>
                      <p className="mt-2">
                        Create a notice for members, committee updates, or event announcements.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notices.map((notice) => (
                        <div key={`${notice.title}-${notice.audience}`} className="rounded-xl border border-border bg-background p-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-medium text-text-main">{notice.title}</p>
                            <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                              Published
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-text-muted">Audience: {notice.audience}</p>
                          <p className="mt-2 text-sm text-text-main">{notice.details}</p>
                          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-text-muted">
                            Submitted by: {notice.submittedBy}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedPosition === 'GENERAL_SECRETARY' && activeAction === 'Track member updates' && (
                <div className="mt-6 rounded-xl border border-border bg-surface p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="font-heading text-lg font-bold">Member Update Tracker</h3>
                    <button
                      type="button"
                      onClick={() => setShowMemberUpdateForm((current) => !current)}
                      className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
                    >
                      {showMemberUpdateForm ? 'Close form' : 'Add update'}
                    </button>
                  </div>

                  {showMemberUpdateForm && (
                    <div className="mb-4 rounded-xl border border-border bg-background p-4">
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="space-y-2 text-sm text-text-main">
                          <span>Member name</span>
                          <input
                            aria-label="Member name"
                            value={memberUpdateDraft.name}
                            onChange={(event) => handleMemberUpdateDraftChange('name', event.target.value)}
                            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                            placeholder="Shahrin Akter"
                          />
                        </label>

                        <label className="space-y-2 text-sm text-text-main">
                          <span>Member ID</span>
                          <input
                            aria-label="Member ID"
                            value={memberUpdateDraft.memberId}
                            onChange={(event) => handleMemberUpdateDraftChange('memberId', event.target.value)}
                            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                            placeholder="CSE-204"
                          />
                        </label>
                      </div>

                      <label className="mt-3 block space-y-2 text-sm text-text-main">
                        <span>Status</span>
                        <select
                          aria-label="Status"
                          value={memberUpdateDraft.status}
                          onChange={(event) => handleMemberUpdateDraftChange('status', event.target.value)}
                          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Updated">Updated</option>
                          <option value="Verified">Verified</option>
                        </select>
                      </label>

                      <label className="mt-3 block space-y-2 text-sm text-text-main">
                        <span>Details</span>
                        <textarea
                          aria-label="Details"
                          value={memberUpdateDraft.details}
                          onChange={(event) => handleMemberUpdateDraftChange('details', event.target.value)}
                          className="min-h-[100px] w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                          placeholder="Describe the member update."
                        />
                      </label>

                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={handleSaveMemberUpdate}
                          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
                        >
                          Save update
                        </button>
                      </div>
                    </div>
                  )}

                  {memberUpdates.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border bg-background p-5 text-sm text-text-muted">
                      <p className="font-medium text-text-main">No member updates recorded yet.</p>
                      <p className="mt-2">
                        Track attendance, participation, and membership status changes here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {memberUpdates.map((update) => (
                        <div key={`${update.memberId}-${update.name}`} className="rounded-xl border border-border bg-background p-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-medium text-text-main">{update.name}</p>
                            <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                              {update.status}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-text-muted">Member ID: {update.memberId}</p>
                          <p className="mt-2 text-sm text-text-main">{update.details}</p>
                          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-text-muted">
                            Submitted by: {update.submittedBy}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedPosition === 'GENERAL_SECRETARY' && activeAction === 'Coordinate internal communication' && (
                <div className="mt-6 rounded-xl border border-border bg-surface p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="font-heading text-lg font-bold">Internal Communication Board</h3>
                    <button
                      type="button"
                      onClick={() => setShowCommunicationForm((current) => !current)}
                      className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
                    >
                      {showCommunicationForm ? 'Close form' : 'Send message'}
                    </button>
                  </div>

                  {showCommunicationForm && (
                    <div className="mb-4 rounded-xl border border-border bg-background p-4">
                      <label className="block space-y-2 text-sm text-text-main">
                        <span>Recipient group</span>
                        <input
                          aria-label="Recipient group"
                          value={communicationDraft.recipient}
                          onChange={(event) => handleCommunicationDraftChange('recipient', event.target.value)}
                          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                          placeholder="Executive Committee"
                        />
                      </label>

                      <label className="mt-3 block space-y-2 text-sm text-text-main">
                        <span>Message title</span>
                        <input
                          aria-label="Message title"
                          value={communicationDraft.title}
                          onChange={(event) => handleCommunicationDraftChange('title', event.target.value)}
                          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                          placeholder="Weekly coordination update"
                        />
                      </label>

                      <label className="mt-3 block space-y-2 text-sm text-text-main">
                        <span>Message details</span>
                        <textarea
                          aria-label="Message details"
                          value={communicationDraft.details}
                          onChange={(event) => handleCommunicationDraftChange('details', event.target.value)}
                          className="min-h-[120px] w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                          placeholder="Write the internal communication message."
                        />
                      </label>

                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={handleSendCommunication}
                          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
                        >
                          Send message
                        </button>
                      </div>
                    </div>
                  )}

                  {communications.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border bg-background p-5 text-sm text-text-muted">
                      <p className="font-medium text-text-main">No internal communication sent yet.</p>
                      <p className="mt-2">
                        Coordinate updates, meeting reminders, and notice handoffs with your team here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {communications.map((message) => (
                        <div key={`${message.recipient}-${message.title}`} className="rounded-xl border border-border bg-background p-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-medium text-text-main">{message.title}</p>
                            <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                              Sent
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-text-muted">Recipient: {message.recipient}</p>
                          <p className="mt-2 text-sm text-text-main">{message.details}</p>
                          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-text-muted">
                            Submitted by: {message.submittedBy}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedPosition === 'EVENT_COORDINATOR' && activeAction === 'Add event' && (
                <div className="mt-6 rounded-xl border border-border bg-surface p-4">
                  <h3 className="font-heading text-lg font-bold">Event Management Workspace</h3>
                  <p className="mt-2 text-sm text-text-muted">
                    This office creates and manages the event calendar for club activities.
                  </p>
                  <div className="mt-4 flex justify-start">
                    <Link
                      href="/dashboard/events"
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
                    >
                      Open event management
                    </Link>
                  </div>
                </div>
              )}

              {selectedPosition === 'EVENT_COORDINATOR' && activeAction === 'Review event registrations' && (
                <div className="mt-6 rounded-xl border border-border bg-surface p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="font-heading text-lg font-bold">Event Registration Board</h3>
                    <button
                      type="button"
                      onClick={() => setShowRegistrationForm((current) => !current)}
                      className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
                    >
                      {showRegistrationForm ? 'Close form' : 'Add registration'}
                    </button>
                  </div>

                  {showRegistrationForm && (
                    <div className="mb-4 rounded-xl border border-border bg-background p-4">
                      <label className="block space-y-2 text-sm text-text-main">
                        <span>Event name</span>
                        <input
                          aria-label="Event name"
                          value={registrationDraft.eventName}
                          onChange={(event) => handleRegistrationDraftChange('eventName', event.target.value)}
                          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                          placeholder="Campus Hackfest"
                        />
                      </label>

                      <label className="mt-3 block space-y-2 text-sm text-text-main">
                        <span>Registered attendees</span>
                        <input
                          aria-label="Registered attendees"
                          value={registrationDraft.attendeeCount}
                          onChange={(event) => handleRegistrationDraftChange('attendeeCount', event.target.value)}
                          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                          placeholder="128"
                        />
                      </label>

                      <label className="mt-3 block space-y-2 text-sm text-text-main">
                        <span>Status</span>
                        <select
                          aria-label="Status"
                          value={registrationDraft.status}
                          onChange={(event) => handleRegistrationDraftChange('status', event.target.value)}
                          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                        >
                          <option value="Confirmed">Confirmed</option>
                          <option value="Pending">Pending</option>
                          <option value="Review">Review</option>
                        </select>
                      </label>

                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={handleSaveRegistration}
                          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
                        >
                          Save registration
                        </button>
                      </div>
                    </div>
                  )}

                  {registrations.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border bg-background p-5 text-sm text-text-muted">
                      <p className="font-medium text-text-main">No registrations recorded yet.</p>
                      <p className="mt-2">Track attendance and sign-up counts for upcoming events here.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {registrations.map((registration) => (
                        <div key={`${registration.eventName}-${registration.attendeeCount}`} className="rounded-xl border border-border bg-background p-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-medium text-text-main">{registration.eventName}</p>
                            <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                              {registration.status}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-text-muted">{registration.attendeeCount} attendees</p>
                          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-text-muted">
                            Submitted by: {registration.submittedBy}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedPosition === 'EVENT_COORDINATOR' && activeAction === 'Approve venue bookings' && (
                <div className="mt-6 rounded-xl border border-border bg-surface p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="font-heading text-lg font-bold">Venue Booking Approvals</h3>
                    <button
                      type="button"
                      onClick={() => setShowVenueForm((current) => !current)}
                      className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
                    >
                      {showVenueForm ? 'Close form' : 'Add venue'}
                    </button>
                  </div>

                  {showVenueForm && (
                    <div className="mb-4 rounded-xl border border-border bg-background p-4">
                      <label className="block space-y-2 text-sm text-text-main">
                        <span>Venue</span>
                        <input
                          aria-label="Venue"
                          value={venueDraft.venue}
                          onChange={(event) => handleVenueDraftChange('venue', event.target.value)}
                          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                          placeholder="Seminar Hall"
                        />
                      </label>

                      <label className="mt-3 block space-y-2 text-sm text-text-main">
                        <span>Date</span>
                        <input
                          aria-label="Venue date"
                          type="date"
                          value={venueDraft.date}
                          onChange={(event) => handleVenueDraftChange('date', event.target.value)}
                          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                        />
                      </label>

                      <label className="mt-3 block space-y-2 text-sm text-text-main">
                        <span>Status</span>
                        <select
                          aria-label="Venue status"
                          value={venueDraft.status}
                          onChange={(event) => handleVenueDraftChange('status', event.target.value)}
                          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Approved">Approved</option>
                          <option value="Booked">Booked</option>
                        </select>
                      </label>

                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={handleSaveVenueBooking}
                          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
                        >
                          Save booking
                        </button>
                      </div>
                    </div>
                  )}

                  {venueBookings.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border bg-background p-5 text-sm text-text-muted">
                      <p className="font-medium text-text-main">No venue bookings to review yet.</p>
                      <p className="mt-2">Approve hall and room availability for club events.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {venueBookings.map((booking) => (
                        <div key={`${booking.venue}-${booking.date}`} className="rounded-xl border border-border bg-background p-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-medium text-text-main">{booking.venue}</p>
                            <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                              {booking.status}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-text-muted">{booking.date}</p>
                          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-text-muted">
                            Submitted by: {booking.submittedBy}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedPosition === 'EVENT_COORDINATOR' && activeAction === 'Track volunteer roster' && (
                <div className="mt-6 rounded-xl border border-border bg-surface p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="font-heading text-lg font-bold">Volunteer Roster</h3>
                    <button
                      type="button"
                      onClick={() => setShowVolunteerForm((current) => !current)}
                      className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
                    >
                      {showVolunteerForm ? 'Close form' : 'Add volunteer'}
                    </button>
                  </div>

                  {showVolunteerForm && (
                    <div className="mb-4 rounded-xl border border-border bg-background p-4">
                      <label className="block space-y-2 text-sm text-text-main">
                        <span>Volunteer name</span>
                        <input
                          aria-label="Volunteer name"
                          value={volunteerDraft.name}
                          onChange={(event) => handleVolunteerDraftChange('name', event.target.value)}
                          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                          placeholder="Nusrat Jahan"
                        />
                      </label>

                      <label className="mt-3 block space-y-2 text-sm text-text-main">
                        <span>Role</span>
                        <input
                          aria-label="Volunteer role"
                          value={volunteerDraft.role}
                          onChange={(event) => handleVolunteerDraftChange('role', event.target.value)}
                          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                          placeholder="Registration desk"
                        />
                      </label>

                      <label className="mt-3 block space-y-2 text-sm text-text-main">
                        <span>Availability</span>
                        <select
                          aria-label="Availability"
                          value={volunteerDraft.availability}
                          onChange={(event) => handleVolunteerDraftChange('availability', event.target.value)}
                          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                        >
                          <option value="Available">Available</option>
                          <option value="Booked">Booked</option>
                          <option value="Unavailable">Unavailable</option>
                        </select>
                      </label>

                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={handleSaveVolunteer}
                          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
                        >
                          Save volunteer
                        </button>
                      </div>
                    </div>
                  )}

                  {volunteerRoster.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border bg-background p-5 text-sm text-text-muted">
                      <p className="font-medium text-text-main">No volunteers assigned yet.</p>
                      <p className="mt-2">Manage event staff availability and responsibilities here.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {volunteerRoster.map((volunteer) => (
                        <div key={`${volunteer.name}-${volunteer.role}`} className="rounded-xl border border-border bg-background p-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-medium text-text-main">{volunteer.name}</p>
                            <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                              {volunteer.availability}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-text-muted">{volunteer.role}</p>
                          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-text-muted">
                            Submitted by: {volunteer.submittedBy}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedPosition === 'MEMBER' && activeAction === 'View member directory' && (
                <div className="mt-6 rounded-xl border border-border bg-surface p-4">
                  <h3 className="font-heading text-lg font-bold">Member Directory</h3>
                  <p className="mt-2 text-sm text-text-muted">Committee membership overview</p>
                  <div className="mt-4 space-y-3">
                    {[
                      { name: 'Rafiul Islam', role: 'Programming Team Member', status: 'Active' },
                      { name: 'Nusrat Jahan', role: 'Event Team Member', status: 'Active' },
                      { name: 'Mahmudul Hasan', role: 'Finance & Outreach Member', status: 'Active' },
                    ].map((member) => (
                      <div key={member.name} className="rounded-xl border border-border bg-background p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium text-text-main">{member.name}</p>
                          <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                            {member.status}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-text-muted">{member.role}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedPosition === 'MEMBER' && activeAction === 'Review club announcements' && (
                <div className="mt-6 rounded-xl border border-border bg-surface p-4">
                  <h3 className="font-heading text-lg font-bold">Club Announcements</h3>
                  <div className="mt-4 space-y-3">
                    {[
                      { title: 'New workshop registration open', detail: 'Registration is open for the upcoming CTF preparation workshop.' },
                      { title: 'General meeting reminder', detail: 'All members are invited to the general executive update this Friday.' },
                    ].map((item) => (
                      <div key={item.title} className="rounded-xl border border-border bg-background p-3">
                        <p className="font-medium text-text-main">{item.title}</p>
                        <p className="mt-2 text-sm text-text-main">{item.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedPosition === 'MEMBER' && activeAction === 'Submit membership update' && (
                <div className="mt-6 rounded-xl border border-border bg-surface p-4">
                  <h3 className="font-heading text-lg font-bold">Membership Update</h3>
                  <div className="mt-4 rounded-xl border border-border bg-background p-4 text-sm text-text-main">
                    Member submissions are reviewed by the General Secretary and office coordinators before updates are approved.
                  </div>
                </div>
              )}

              {selectedPosition === 'MEMBER' && activeAction === 'Access event reminders' && (
                <div className="mt-6 rounded-xl border border-border bg-surface p-4">
                  <h3 className="font-heading text-lg font-bold">Event Reminders</h3>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-xl border border-border bg-background p-3 text-sm text-text-main">
                      Tech meetup registration closes in 2 days.
                    </div>
                    <div className="rounded-xl border border-border bg-background p-3 text-sm text-text-main">
                      Orientation session for new members is scheduled for Saturday morning.
                    </div>
                  </div>
                </div>
              )}

              {selectedPosition === 'PRESIDENT' && activeAction === 'Review executive summary' && (
                <div className="mt-6 rounded-xl border border-border bg-surface p-4">
                  <h3 className="font-heading text-lg font-bold">Executive Summary</h3>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-xl border border-border bg-background p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Active events</p>
                      <p className="mt-2 font-heading text-2xl font-bold">12</p>
                    </div>
                    <div className="rounded-xl border border-border bg-background p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Pending approvals</p>
                      <p className="mt-2 font-heading text-2xl font-bold">04</p>
                    </div>
                    <div className="rounded-xl border border-border bg-background p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Committee status</p>
                      <p className="mt-2 font-heading text-2xl font-bold">Stable</p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-xl border border-border bg-background p-3 text-sm text-text-main">
                    Executive committee decisions remain aligned with the current club plan and governance schedule.
                  </div>
                </div>
              )}

              {selectedPosition === 'PRESIDENT' && activeAction === 'View attendance oversight' && (
                <div className="mt-6 rounded-xl border border-border bg-surface p-4">
                  <h3 className="font-heading text-lg font-bold">Attendance Oversight</h3>
                  <p className="mt-2 text-sm text-text-muted">Executive Committee Attendance Review</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-xl border border-border bg-background p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Verified members</p>
                      <p className="mt-2 font-heading text-2xl font-bold">218</p>
                    </div>
                    <div className="rounded-xl border border-border bg-background p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Pending reviews</p>
                      <p className="mt-2 font-heading text-2xl font-bold">09</p>
                    </div>
                    <div className="rounded-xl border border-border bg-background p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Compliance</p>
                      <p className="mt-2 font-heading text-2xl font-bold">94%</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedPosition === 'PRESIDENT' && activeAction === 'Access financial oversight' && (
                <div className="mt-6 rounded-xl border border-border bg-surface p-4">
                  <h3 className="font-heading text-lg font-bold">Financial Oversight</h3>
                  <p className="mt-2 text-sm text-text-muted">Current balance</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-xl border border-border bg-background p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Income</p>
                      <p className="mt-2 font-heading text-2xl font-bold">Tk {totalIncome}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-background p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Expenses</p>
                      <p className="mt-2 font-heading text-2xl font-bold">Tk {totalExpenses}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-background p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Balance</p>
                      <p className="mt-2 font-heading text-2xl font-bold">Tk {currentBalance}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedPosition === 'PRESIDENT' && activeAction === 'Approve governance decisions' && (
                <div className="mt-6 rounded-xl border border-border bg-surface p-4">
                  <h3 className="font-heading text-lg font-bold">Governance Approvals</h3>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-xl border border-border bg-background p-3 text-sm text-text-main">
                      Policy review is scheduled for the next executive meeting.
                    </div>
                    <div className="rounded-xl border border-border bg-background p-3 text-sm text-text-main">
                      Committee restructuring remains pending final approval by the President office.
                    </div>
                  </div>
                </div>
              )}

              {selectedPosition === 'TREASURER' && activeAction === 'Budget overview' && showBudgetOverview && (
                <div className="mt-6 rounded-xl border border-border bg-surface p-4">
                  <h3 className="font-heading text-lg font-bold">Budget Overview</h3>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-xl border border-border bg-background p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Income</p>
                      <p className="mt-2 font-heading text-2xl font-bold">Tk {totalIncome}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-background p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Expenses</p>
                      <p className="mt-2 font-heading text-2xl font-bold">Tk {totalExpenses}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-background p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Balance</p>
                      <p className="mt-2 font-heading text-2xl font-bold">Tk {currentBalance}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedPosition === 'TREASURER' && activeAction === 'Record income' && (
                <div className="mt-6 rounded-xl border border-border bg-surface p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="font-heading text-lg font-bold">Income Register</h3>
                    <button
                      type="button"
                      onClick={() => setShowIncomeForm((current) => !current)}
                      className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
                    >
                      {showIncomeForm ? 'Close form' : 'Add income'}
                    </button>
                  </div>

                  {showIncomeForm && (
                    <div className="mb-4 rounded-xl border border-border bg-background p-4">
                      <label className="block space-y-2 text-sm text-text-main">
                        <span>Income source</span>
                        <input
                          aria-label="Income source"
                          value={incomeDraft.source}
                          onChange={(event) => handleIncomeDraftChange('source', event.target.value)}
                          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                          placeholder="Membership fee collection"
                        />
                      </label>

                      <label className="mt-3 block space-y-2 text-sm text-text-main">
                        <span>Income amount</span>
                        <input
                          aria-label="Income amount"
                          value={incomeDraft.amount}
                          onChange={(event) => handleIncomeDraftChange('amount', event.target.value)}
                          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                          placeholder="180000"
                        />
                      </label>

                      <label className="mt-3 block space-y-2 text-sm text-text-main">
                        <span>Income status</span>
                        <select
                          aria-label="Income status"
                          value={incomeDraft.status}
                          onChange={(event) => handleIncomeDraftChange('status', event.target.value)}
                          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                        >
                          <option value="Received">Received</option>
                          <option value="Pending">Pending</option>
                          <option value="Verified">Verified</option>
                        </select>
                      </label>

                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={handleSaveIncome}
                          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
                        >
                          Save income
                        </button>
                      </div>
                    </div>
                  )}

                  {incomeEntries.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border bg-background p-5 text-sm text-text-muted">
                      <p className="font-medium text-text-main">No income recorded yet.</p>
                      <p className="mt-2">Add membership, sponsorship, and fundraising collections here.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {incomeEntries.map((entry) => (
                        <div key={`${entry.source}-${entry.amount}`} className="rounded-xl border border-border bg-background p-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-medium text-text-main">{entry.source}</p>
                            <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                              {entry.status}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-text-muted">Tk {entry.amount}</p>
                          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-text-muted">
                            Submitted by: {entry.submittedBy}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedPosition === 'TREASURER' && activeAction === 'Track expenses' && (
                <div className="mt-6 rounded-xl border border-border bg-surface p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="font-heading text-lg font-bold">Expense Tracker</h3>
                    <button
                      type="button"
                      onClick={() => setShowExpenseForm((current) => !current)}
                      className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
                    >
                      {showExpenseForm ? 'Close form' : 'Add expense'}
                    </button>
                  </div>

                  {showExpenseForm && (
                    <div className="mb-4 rounded-xl border border-border bg-background p-4">
                      <label className="block space-y-2 text-sm text-text-main">
                        <span>Expense title</span>
                        <input
                          aria-label="Expense title"
                          value={expenseDraft.title}
                          onChange={(event) => handleExpenseDraftChange('title', event.target.value)}
                          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                          placeholder="Club Tech Workshop"
                        />
                      </label>

                      <label className="mt-3 block space-y-2 text-sm text-text-main">
                        <span>Expense amount</span>
                        <input
                          aria-label="Expense amount"
                          value={expenseDraft.amount}
                          onChange={(event) => handleExpenseDraftChange('amount', event.target.value)}
                          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                          placeholder="25000"
                        />
                      </label>

                      <label className="mt-3 block space-y-2 text-sm text-text-main">
                        <span>Expense status</span>
                        <select
                          aria-label="Expense status"
                          value={expenseDraft.status}
                          onChange={(event) => handleExpenseDraftChange('status', event.target.value)}
                          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Approved">Approved</option>
                          <option value="Reviewed">Reviewed</option>
                        </select>
                      </label>

                      <label className="mt-3 block space-y-2 text-sm text-text-main">
                        <span>Purpose</span>
                        <textarea
                          aria-label="Purpose"
                          value={expenseDraft.purpose}
                          onChange={(event) => handleExpenseDraftChange('purpose', event.target.value)}
                          className="min-h-[100px] w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                          placeholder="Describe the expense purpose."
                        />
                      </label>

                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={handleSaveExpense}
                          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
                        >
                          Save expense
                        </button>
                      </div>
                    </div>
                  )}

                  {expenseEntries.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border bg-background p-5 text-sm text-text-muted">
                      <p className="font-medium text-text-main">No expenses recorded yet.</p>
                      <p className="mt-2">Track approved and pending club spending here.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {expenseEntries.map((entry) => (
                        <div key={`${entry.title}-${entry.amount}`} className="rounded-xl border border-border bg-background p-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-medium text-text-main">{entry.title}</p>
                            <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                              {entry.status}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-text-muted">Tk {entry.amount}</p>
                          <p className="mt-2 text-sm text-text-main">{entry.purpose}</p>
                          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-text-muted">
                            Submitted by: {entry.submittedBy}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedPosition === 'TREASURER' && activeAction === 'Review financial updates' && (
                <div className="mt-6 rounded-xl border border-border bg-surface p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="font-heading text-lg font-bold">Finance Update Panel</h3>
                    <button
                      type="button"
                      onClick={() => setShowFinanceForm((current) => !current)}
                      className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
                    >
                      {showFinanceForm ? 'Close form' : 'Add update'}
                    </button>
                  </div>

                  {showFinanceForm && (
                    <div className="mb-4 rounded-xl border border-border bg-background p-4">
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="space-y-2 text-sm text-text-main">
                          <span>Expense title</span>
                          <input
                            aria-label="Expense title"
                            value={financeDraft.title}
                            onChange={(event) => handleFinanceDraftChange('title', event.target.value)}
                            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                            placeholder="Club Tech Workshop"
                          />
                        </label>

                        <label className="space-y-2 text-sm text-text-main">
                          <span>Amount</span>
                          <input
                            aria-label="Amount"
                            value={financeDraft.amount}
                            onChange={(event) => handleFinanceDraftChange('amount', event.target.value)}
                            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                            placeholder="25000"
                          />
                        </label>
                      </div>

                      <label className="mt-3 block space-y-2 text-sm text-text-main">
                        <span>Finance status</span>
                        <select
                          aria-label="Finance status"
                          value={financeDraft.status}
                          onChange={(event) => handleFinanceDraftChange('status', event.target.value)}
                          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Approved">Approved</option>
                          <option value="Reviewed">Reviewed</option>
                        </select>
                      </label>

                      <label className="mt-3 block space-y-2 text-sm text-text-main">
                        <span>Purpose</span>
                        <textarea
                          aria-label="Purpose"
                          value={financeDraft.purpose}
                          onChange={(event) => handleFinanceDraftChange('purpose', event.target.value)}
                          className="min-h-[100px] w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                          placeholder="Describe the expense purpose."
                        />
                      </label>

                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={handleSaveFinanceUpdate}
                          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
                        >
                          Save update
                        </button>
                      </div>
                    </div>
                  )}

                  {financeUpdates.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border bg-background p-5 text-sm text-text-muted">
                      <p className="font-medium text-text-main">No financial updates recorded yet.</p>
                      <p className="mt-2">
                        Track approved and pending club expenses with the Treasurer office here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {financeUpdates.map((entry) => (
                        <div key={`${entry.title}-${entry.amount}`} className="rounded-xl border border-border bg-background p-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-medium text-text-main">{entry.title}</p>
                            <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                              {entry.status}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-text-muted">Tk {entry.amount}</p>
                          <p className="mt-2 text-sm text-text-main">{entry.purpose}</p>
                          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-text-muted">
                            Submitted by: {entry.submittedBy}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>

            <section className="rounded-xl border border-border bg-background p-5">
              <h2 className="mb-4 font-heading text-xl font-bold">Recent activity</h2>
              <div className="space-y-4">
                {recentActivity.map((item) => (
                  <div key={item.title} className="rounded-xl border border-border bg-surface p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-text-main">{item.title}</p>
                        <p className="mt-1 text-sm text-text-muted">{item.detail}</p>
                      </div>
                      <span className="text-xs text-text-muted">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
