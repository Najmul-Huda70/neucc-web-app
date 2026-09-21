function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function loginUrl(): string {
  return `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/login`;
}

/** Sent to each winner when Step 6's publish-results creates their account. */
export function newAccountEmail(params: { name: string; post: string; email: string; tempPassword: string }) {
  const url = loginUrl();
  const subject = `NEUCC প্যানেল অ্যাক্সেস — ${params.post}`;
  const text = `প্রিয় ${params.name},

আপনি কম্পিউটার ক্লাবের নতুন কার্যনির্বাহী পরিষদে "${params.post}" পদে নির্বাচিত/মনোনীত হয়েছেন। আপনার প্যানেল লগইন তৈরি করা হয়েছে:

Email: ${params.email}
Temporary Password: ${params.tempPassword}

অনুগ্রহ করে লগইন করে দ্রুত পাসওয়ার্ড পরিবর্তন করুন: ${url}

ধন্যবাদ,
কম্পিউটার ক্লাব, সিএসই বিভাগ, নেত্রকোণা বিশ্ববিদ্যালয়`;

  const html = `<p>প্রিয় ${escapeHtml(params.name)},</p>
<p>আপনি কম্পিউটার ক্লাবের নতুন কার্যনির্বাহী পরিষদে <b>${escapeHtml(params.post)}</b> পদে নির্বাচিত/মনোনীত হয়েছেন। আপনার প্যানেল লগইন তৈরি করা হয়েছে:</p>
<p>Email: ${escapeHtml(params.email)}<br/>Temporary Password: <code>${escapeHtml(params.tempPassword)}</code></p>
<p>অনুগ্রহ করে <a href="${url}">এখানে লগইন করে</a> দ্রুত পাসওয়ার্ড পরিবর্তন করুন।</p>
<p>ধন্যবাদ,<br/>কম্পিউটার ক্লাব, সিএসই বিভাগ, নেত্রকোণা বিশ্ববিদ্যালয়</p>`;

  return { subject, text, html };
}

/** Sent to the Chief Election Commissioner when the President grants election-module access (Step 3). */
export function electionAccessGrantedEmail(params: { name: string }) {
  const url = loginUrl();
  const subject = 'NEUCC — Election Module Access Granted';
  const text = `প্রিয় ${params.name},

সভাপতি আপনাকে নির্বাচন মডিউল অ্যাক্সেস প্রদান করেছেন। এখন আপনি বিদায়ী কার্যনির্বাহী পরিষদ বিলুপ্ত করাসহ নির্বাচন-সংক্রান্ত কার্যক্রম পরিচালনা করতে পারবেন।

প্যানেলে লগইন করুন: ${url}

ধন্যবাদ,
কম্পিউটার ক্লাব, সিএসই বিভাগ, নেত্রকোণা বিশ্ববিদ্যালয়`;

  const html = `<p>প্রিয় ${escapeHtml(params.name)},</p>
<p>সভাপতি আপনাকে নির্বাচন মডিউল অ্যাক্সেস প্রদান করেছেন। এখন আপনি বিদায়ী কার্যনির্বাহী পরিষদ বিলুপ্ত করাসহ নির্বাচন-সংক্রান্ত কার্যক্রম পরিচালনা করতে পারবেন।</p>
<p><a href="${url}">প্যানেলে লগইন করুন</a></p>
<p>ধন্যবাদ,<br/>কম্পিউটার ক্লাব, সিএসই বিভাগ, নেত্রকোণা বিশ্ববিদ্যালয়</p>`;

  return { subject, text, html };
}
