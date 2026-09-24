import { createFileRoute } from "@tanstack/react-router";
import LegalLayout from "../components/LegalLayout";

export const Route = createFileRoute("/privacy")({
	head: () => ({
		meta: [
			{
				title: "Privacy Policy (Pre-Launch) | Chipa",
			},
			{
				name: "description",
				content:
					"Learn how Chipa collects, protects, and handles your personal data during our pre-launch waitlist and early access phase.",
			},
		],
	}),
	component: PrivacyPage,
});

function PrivacyPage() {
	return (
		<LegalLayout
			title="Privacy Policy"
			subtitle="We are committed to transparency and safeguarding your personal information while building the future of cross-border finance."
			lastUpdated="September 24, 2026"
			activeTab="privacy"
		>
			<section className="space-y-4">
				<h2 className="font-display text-xl sm:text-2xl font-bold text-[#111111]">
					1. Introduction
				</h2>
				<p>
					Chipa (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) values your
					trust and is dedicated to protecting your personal data and privacy.
					This Pre-Launch Privacy Policy (&quot;Policy&quot;) details how we
					collect, process, store, disclose, and protect your information when
					you visit our website at{" "}
					<a
						href="https://usechipa.com"
						className="text-[#FF793F] underline font-medium"
					>
						https://usechipa.com
					</a>{" "}
					(the &quot;Site&quot;), register on our early-access waitlist,
					communicate with us, or participate in pre-release product programs
					prior to our commercial launch.
				</p>
				<p>
					By joining our waitlist or browsing the Site, you acknowledge the data
					handling practices described in this Policy.
				</p>
			</section>

			<section className="space-y-4">
				<h2 className="font-display text-xl sm:text-2xl font-bold text-[#111111]">
					2. Data Controller & Contact
				</h2>
				<p>
					Chipa is the data controller responsible for the personal data
					collected through this pre-launch Site under applicable data
					protection laws, including the{" "}
					<strong>Nigeria Data Protection Act (NDPA) 2023</strong>, the{" "}
					<strong>General Data Protection Regulation (GDPR)</strong>, and the{" "}
					<strong>UK GDPR</strong>.
				</p>
				<p>
					For any questions, rights requests, or concerns regarding your
					personal data, you may reach our Data Protection team at:{" "}
					<a
						href="mailto:hello@usechipa.com"
						className="text-[#FF793F] underline font-medium"
					>
						hello@usechipa.com
					</a>
					.
				</p>
			</section>

			<section className="space-y-4">
				<h2 className="font-display text-xl sm:text-2xl font-bold text-[#111111]">
					3. Information We Collect
				</h2>
				<p>
					Because Chipa is currently in pre-launch development, we only collect
					minimal data necessary for our waitlist and Site operation:
				</p>

				<div className="space-y-3">
					<div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
						<h3 className="font-bold text-gray-900 text-sm sm:text-base">
							A. Information You Voluntarily Provide
						</h3>
						<ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
							<li>
								<strong>Email Address:</strong> When you enter your email to
								join the Chipa waitlist or claim early access.
							</li>
							<li>
								<strong>Communications:</strong> When you send inquiries,
								feedback, or support messages to hello@usechipa.com.
							</li>
						</ul>
					</div>

					<div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
						<h3 className="font-bold text-gray-900 text-sm sm:text-base">
							B. Information Collected Automatically
						</h3>
						<ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
							<li>
								<strong>Device & Network Data:</strong> IP address, device type,
								operating system, browser brand and version, language settings,
								and rough geographic region.
							</li>
							<li>
								<strong>Usage & Engagement Data:</strong> Pages visited, dwell
								time, button click events, waitlist submission timestamps, and
								referral links (via PostHog analytics and server logs).
							</li>
							<li>
								<strong>Cookies & Local Storage:</strong> Essential client-side
								tokens (such as theme preferences and temporary session tokens)
								to ensure proper Site rendering.
							</li>
						</ul>
					</div>

					<div className="p-4 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] text-[#166534]">
						<h3 className="font-bold text-sm sm:text-base">
							C. Information We Do NOT Collect At This Stage
						</h3>
						<p className="mt-1 text-sm">
							We do <strong>not</strong> collect sensitive financial
							information, bank account numbers, credit/debit card numbers, Bank
							Verification Numbers (BVN), National Identification Numbers (NIN),
							Social Security Numbers (SSN), or government IDs on this
							pre-launch website.
						</p>
					</div>
				</div>
			</section>

			<section className="space-y-4">
				<h2 className="font-display text-xl sm:text-2xl font-bold text-[#111111]">
					4. How We Use Your Information
				</h2>
				<p>
					We process your personal information strictly for the following
					purposes:
				</p>
				<ul className="list-disc pl-6 space-y-2">
					<li>
						<strong>Waitlist Administration:</strong> To record your spot in
						line, manage batch allocations, and send you exclusive beta
						invitations and access links.
					</li>
					<li>
						<strong>Product Announcements & Updates:</strong> To inform you
						about development milestones, feature rollouts, and launch schedules
						(you may unsubscribe at any time).
					</li>
					<li>
						<strong>Platform Analytics & UX Improvement:</strong> To monitor
						landing page performance, analyze aggregate visitor interest across
						regions, and optimize user experience.
					</li>
					<li>
						<strong>Security & Abuse Prevention:</strong> To detect, prevent,
						and mitigate bot traffic, automated spam signups, and cyber threats.
					</li>
					<li>
						<strong>Legal & Regulatory Compliance:</strong> To comply with
						applicable laws, respond to legal requests, and protect our
						legitimate business interests.
					</li>
				</ul>
			</section>

			<section className="space-y-4">
				<h2 className="font-display text-xl sm:text-2xl font-bold text-[#111111]">
					5. Legal Bases for Processing
				</h2>
				<p>
					We process your personal data under the following legal frameworks:
				</p>
				<ul className="list-disc pl-6 space-y-2">
					<li>
						<strong>Consent:</strong> You give us explicit, affirmative consent
						when submitting your email address to join our waitlist and receive
						launch communications. You have the right to revoke your consent at
						any time.
					</li>
					<li>
						<strong>Legitimate Interests:</strong> We have a legitimate
						commercial interest in analyzing aggregate website usage, protecting
						our digital infrastructure against attacks, and engaging with
						prospective early users to refine our upcoming fintech offerings.
					</li>
					<li>
						<strong>Legal Obligation:</strong> Where processing or record
						retention is required by statutory regulations or binding judicial
						orders.
					</li>
				</ul>
			</section>

			<section className="space-y-4">
				<h2 className="font-display text-xl sm:text-2xl font-bold text-[#111111]">
					6. Third-Party Service Providers
				</h2>
				<p>
					We never sell, rent, or monetize your personal data. We only share
					data with trusted, enterprise-grade service providers who assist us in
					operating our pre-launch infrastructure:
				</p>
				<ul className="list-disc pl-6 space-y-2">
					<li>
						<strong>Convex Inc.:</strong> Cloud database and real-time backend
						platform used to store waitlist email entries and submission
						metadata securely.
					</li>
					<li>
						<strong>Cloudflare, Inc.:</strong> Content Delivery Network (CDN),
						edge compute, SSL/TLS certificate management, and DDoS protection
						for the Site.
					</li>
					<li>
						<strong>PostHog:</strong> Privacy-conscious product analytics
						platform used to assess aggregated user engagement and landing page
						performance.
					</li>
					<li>
						<strong>Sentry (Functional Software, Inc.):</strong> Real-time
						application error logging and performance diagnostics to identify
						technical issues.
					</li>
				</ul>
				<p>
					All third-party service providers are contractually obligated to
					safeguard your data and are prohibited from using it for their own
					independent marketing purposes.
				</p>
			</section>

			<section className="space-y-4">
				<h2 className="font-display text-xl sm:text-2xl font-bold text-[#111111]">
					7. International Data Transfers
				</h2>
				<p>
					Because Chipa leverages cloud infrastructure providers located in
					multiple regions (including the European Union and the United States),
					your information may be transferred to and processed outside of your
					country of residence.
				</p>
				<p>
					When transferring personal data internationally, we ensure that
					adequate data protection safeguards are implemented, including
					Standard Contractual Clauses (SCCs) approved by relevant data
					protection authorities, robust encryption standards, and adherence to
					international privacy principles.
				</p>
			</section>

			<section className="space-y-4">
				<h2 className="font-display text-xl sm:text-2xl font-bold text-[#111111]">
					8. Data Security Measures
				</h2>
				<p>
					We take security very seriously. We implement comprehensive technical,
					physical, and administrative measures to protect your personal data
					from unauthorized access, loss, misuse, or alteration:
				</p>
				<ul className="list-disc pl-6 space-y-2">
					<li>
						Bank-grade 256-bit Transport Layer Security (TLS/HTTPS) encryption
						for all data in transit.
					</li>
					<li>
						Restricted, role-based access control (RBAC) to our database
						environments.
					</li>
					<li>
						Continuous security patching, vulnerability monitoring, and
						anti-abuse safeguards.
					</li>
				</ul>
				<p className="text-xs text-[#777777]">
					Please note that no method of transmission over the Internet or
					electronic storage is 100% impenetrable. While we strive to use
					commercially acceptable means to protect your data, we cannot
					guarantee absolute security.
				</p>
			</section>

			<section className="space-y-4">
				<h2 className="font-display text-xl sm:text-2xl font-bold text-[#111111]">
					9. Data Retention
				</h2>
				<p>
					We retain your waitlist information only for as long as necessary to
					fulfill the purposes described in this Policy:
				</p>
				<ul className="list-disc pl-6 space-y-2">
					<li>
						<strong>Waitlist Records:</strong> Kept until the commercial launch
						and user onboarding process is complete, or until you request that
						we delete your email.
					</li>
					<li>
						<strong>Technical Logs:</strong> Anonymized server logs and session
						metrics are automatically deleted or aggregated after standard
						retention cycles (typically 30–90 days).
					</li>
				</ul>
				<p>
					If you ask to be removed from the waitlist, your email will be
					permanently expunged from our active subscriber list within seven (7)
					business days.
				</p>
			</section>

			<section className="space-y-4">
				<h2 className="font-display text-xl sm:text-2xl font-bold text-[#111111]">
					10. Your Privacy Rights
				</h2>
				<p>
					Under applicable data protection laws (including the NDPA 2023, GDPR,
					UK GDPR, and similar regulations), you are entitled to several
					fundamental rights regarding your personal information:
				</p>
				<ul className="list-disc pl-6 space-y-2">
					<li>
						<strong>Right of Access:</strong> You can request a confirmation of
						whether we process your data and receive a copy of that data.
					</li>
					<li>
						<strong>Right to Rectification:</strong> You can ask us to correct
						or update any inaccurate or incomplete personal information.
					</li>
					<li>
						<strong>
							Right to Erasure (&quot;Right to be Forgotten&quot;):
						</strong>{" "}
						You can request that we permanently delete your email address from
						our waitlist database.
					</li>
					<li>
						<strong>Right to Withdraw Consent:</strong> You may opt out of
						receiving waitlist newsletters and marketing emails at any time by
						clicking the &quot;unsubscribe&quot; link in any email or by
						contacting us.
					</li>
					<li>
						<strong>Right to Object or Restrict Processing:</strong> You may
						object to the processing of your data based on legitimate interests
						or request restrictions on certain processing activities.
					</li>
				</ul>
				<p>
					To exercise any of these rights, please email us directly at{" "}
					<a
						href="mailto:hello@usechipa.com"
						className="text-[#FF793F] underline font-medium"
					>
						hello@usechipa.com
					</a>
					. We will respond to all verified requests promptly and within
					statutory deadlines.
				</p>
			</section>

			<section className="space-y-4">
				<h2 className="font-display text-xl sm:text-2xl font-bold text-[#111111]">
					11. Children&apos;s Privacy
				</h2>
				<p>
					Our Site and waitlist are not intended for or directed toward
					individuals under eighteen (18) years of age. We do not knowingly
					collect personal data from minors. If we become aware that we have
					collected information from a child without verified parental consent,
					we will take immediate steps to delete that data from our servers.
				</p>
			</section>

			<section className="space-y-4">
				<h2 className="font-display text-xl sm:text-2xl font-bold text-[#111111]">
					12. Changes to this Privacy Policy
				</h2>
				<p>
					As Chipa continues its pre-launch development and transitions into
					commercial operation, we may update this Privacy Policy to reflect new
					regulatory requirements, partner integrations, or service offerings.
					When revisions occur, we will post the updated policy here and update
					the &quot;Effective Date&quot; at the top. We encourage you to review
					this page periodically.
				</p>
			</section>

			<section className="space-y-4">
				<h2 className="font-display text-xl sm:text-2xl font-bold text-[#111111]">
					13. Contact & Inquiries
				</h2>
				<p>
					For any questions, data protection requests, or feedback regarding our
					privacy practices, please contact us:
				</p>
				<div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-sm space-y-1">
					<p className="font-semibold text-gray-900">
						Chipa Data Protection Team
					</p>
					<p>
						Email:{" "}
						<a
							href="mailto:hello@usechipa.com"
							className="text-[#FF793F] underline"
						>
							hello@usechipa.com
						</a>
					</p>
					<p>
						Website:{" "}
						<a href="https://usechipa.com" className="text-[#FF793F] underline">
							https://usechipa.com
						</a>
					</p>
				</div>
			</section>
		</LegalLayout>
	);
}
