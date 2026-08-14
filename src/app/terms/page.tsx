import type { Metadata } from 'next'

import { LegalSection, LegalShell } from '@/components/legal/LegalShell'

export const metadata: Metadata = {
  title: 'Terms of Service — SoloAdventurer',
  description:
    'The terms for the SoloAdventurer waitlist and private beta: what joining means, how referrals work, and what we each commit to.',
  alternates: { canonical: '/terms' },
}

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Service" updated="14 August 2026">
      <p>
        These terms cover this website and the SoloAdventurer waitlist. They are deliberately short
        and readable. By joining the waitlist you agree to them.
      </p>

      <LegalSection heading="What SoloAdventurer is">
        <p>
          SoloAdventurer is a mobile app (iOS and Android) currently in private beta. This website
          exists to run the waitlist and tell you what we are building. The app itself is governed
          by terms you accept when you first open it.
        </p>
      </LegalSection>

      <LegalSection heading="What joining the waitlist means">
        <p>
          Joining is free and reserves you a place in line for early access. It is a reservation,
          not a guarantee: we cannot promise a launch date, that every feature described today ships
          exactly as described, or that every founding member is admitted at once. Invites go out in
          waves, with launch cities first.
        </p>
        <p>
          One signup per person. Rank on the list is determined by join order and referrals, and we
          may adjust ranks or remove entries that game the system.
        </p>
      </LegalSection>

      <LegalSection heading="Referrals">
        <p>
          When you join, you get a referral link. When someone joins through it, you move up.
          Referral codes have no monetary value, cannot be sold or traded, and exist only to rank
          early access. Share your link with people who might actually want it — mass messaging,
          posting it where it is not welcome, or any form of spam violates these terms and gets
          entries removed.
        </p>
      </LegalSection>

      <LegalSection heading="Your commitments">
        <ul className="list-disc space-y-1 pl-6">
          <li>Give us accurate information (a working email you actually check).</li>
          <li>Be 18 or older.</li>
          <li>Use the waitlist and the app lawfully and respectfully.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="Acceptable use">
        <p>
          No harassment, impersonation, hate, scraping, automated signups, or attempts to break or
          overload the service. SoloAdventurer exists to make meeting people while traveling safer;
          behavior that attacks that goal has no place here and will be removed.
        </p>
      </LegalSection>

      <LegalSection heading="Beta software disclaimer">
        <p>
          The app is in active development. Features may change, and things may break. Nothing in
          the beta is provided with warranties; where the law implies any, they are limited to the
          maximum extent permitted.
        </p>
      </LegalSection>

      <LegalSection heading="Intellectual property">
        <p>
          The SoloAdventurer name, site, and app are ours; your content stays yours. If you send us
          feedback or ideas, you let us use them to improve the product without obligation.
        </p>
      </LegalSection>

      <LegalSection heading="Limitation of liability">
        <p>
          To the extent permitted by applicable law, SoloAdventurer is not liable for indirect or
          consequential damages arising from use of the website or beta app. Nothing here limits
          liability that cannot be limited by law.
        </p>
      </LegalSection>

      <LegalSection heading="Termination">
        <p>
          You can leave the waitlist at any time by emailing us. We can remove entries that violate
          these terms.
        </p>
      </LegalSection>

      <LegalSection heading="Changes and contact">
        <p>
          We may update these terms as the product grows; material changes are announced on this
          page (see the date at the top) and, where relevant, by email. Questions:{' '}
          <a href="mailto:hello@soloadventurer.travel" className="text-brand underline">
            hello@soloadventurer.travel
          </a>
        </p>
      </LegalSection>
    </LegalShell>
  )
}
