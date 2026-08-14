import type { Metadata } from 'next'

import { LegalSection, LegalShell } from '@/components/legal/LegalShell'

export const metadata: Metadata = {
  title: 'Privacy Policy — SoloAdventurer',
  description:
    'What SoloAdventurer collects when you join the waitlist, why, how long we keep it, and how to have it deleted. Analytics is opt-in only.',
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated="14 August 2026">
      <p>
        SoloAdventurer is a private-beta mobile app for solo travelers. This page explains exactly
        what we collect through this website, why, and the control you have over it. Short version:
        we collect your email to invite you to the beta, analytics only runs if you say yes, and we
        never sell or share your data.
      </p>

      <LegalSection heading="What we collect">
        <p>When you join the waitlist, you give us:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>
            <strong>Email address</strong> (required) — to send your beta invitation and product
            updates.
          </li>
          <li>
            <strong>First name and city</strong> (both optional) — to personalize your invitation
            and prioritize launch cities.
          </li>
          <li>
            <strong>Referral data</strong> — a referral code generated for you, and the code of the
            person who referred you, if any, so we can rank early access fairly.
          </li>
          <li>
            <strong>Timestamp</strong> of when you joined.
          </li>
        </ul>
        <p>That is the complete list. We do not collect anything else through this site.</p>
      </LegalSection>

      <LegalSection heading="Analytics is opt-in only">
        <p>
          We use privacy-friendly, EU-hosted analytics (PostHog) to understand how people find us.
          It is off until you press “Accept” on the consent banner. If you decline, nothing is
          measured and nothing about you is sent anywhere — your experience is identical either way.
        </p>
        <p>
          Our analytics never contains your email, name, or any other identifier — only anonymous
          events like “a waitlist signup happened.”
        </p>
      </LegalSection>

      <LegalSection heading="Emails we send">
        <p>
          Only about the beta and the product: your invitation, major milestones, and launch
          announcements. Every email includes an unsubscribe link, or you can reply to any of them
          and a human will remove you. No spam, ever.
        </p>
      </LegalSection>

      <LegalSection heading="Where your data lives">
        <p>
          Waitlist data is stored in Supabase (PostgreSQL), which acts as a data processor under a
          data processing agreement. Analytics data, when you opt in, is hosted in the European
          Union.
        </p>
      </LegalSection>

      <LegalSection heading="How long we keep it">
        <p>
          Until the waitlist winds down and you are either invited or told the beta will not happen
          — or until you ask us to delete it, whichever comes first. Deleting your entry costs you
          nothing except your place in line.
        </p>
      </LegalSection>

      <LegalSection heading="Your rights">
        <p>
          Wherever you live, we honor these: access (what we hold about you), correction, export,
          and deletion. Email{' '}
          <a href="mailto:hello@soloadventurer.travel" className="text-brand underline">
            hello@soloadventurer.travel
          </a>{' '}
          and we will respond within 30 days — usually much faster. If you are in the EU/EEA or UK,
          these mirror your GDPR/UK GDPR rights, including the right to complain to your local
          supervisory authority.
        </p>
      </LegalSection>

      <LegalSection heading="What we never do">
        <ul className="list-disc space-y-1 pl-6">
          <li>Sell or rent your data to anyone, for any reason.</li>
          <li>Share your data with advertisers or data brokers.</li>
          <li>Run analytics without your explicit consent.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="Age requirement">
        <p>SoloAdventurer is for adults. The waitlist and the app are not for anyone under 18.</p>
      </LegalSection>

      <LegalSection heading="Changes to this policy">
        <p>
          If we change this policy we will update this page and change the date at the top. For
          anything that materially affects you, we will say so in an email.
        </p>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          SoloAdventurer ·{' '}
          <a href="mailto:hello@soloadventurer.travel" className="text-brand underline">
            hello@soloadventurer.travel
          </a>
        </p>
      </LegalSection>
    </LegalShell>
  )
}
