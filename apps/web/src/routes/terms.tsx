import { createFileRoute } from "@tanstack/react-router";
import LegalLayout from "../components/LegalLayout";

export const Route = createFileRoute("/terms")({
	head: () => ({
		meta: [
			{
				title: "Terms & Conditions (Pre-Launch) | Chipa",
			},
			{
				name: "description",
				content:
					"Read the pre-launch terms and conditions governing the Chipa website, early waitlist registration, and preview programs.",
			},
		],
	}),
	component: TermsPage,
});

function TermsPage() {
	return (
		<LegalLayout
			title="Terms and Conditions"
			subtitle="These terms govern your visit to our website, registration on our waitlist, and participation in any pre-launch preview programs."
			lastUpdated="September 24, 2026"
			activeTab="terms"
		>
			<section className="space-y-4">
				<h2 className="font-display text-xl sm:text-2xl font-bold text-[#111111]">
					1. Introduction & Acceptance
				</h2>
				<p>
					Welcome to Chipa (&quot;Chipa&quot;, &quot;we&quot;, &quot;us&quot;,
					or &quot;our&quot;). These Pre-Launch Terms and Conditions
					(&quot;Terms&quot;) set forth the legally binding terms governing your
					access to and use of our website located at{" "}
					<a
						href="https://usechipa.com"
						className="text-[#FF793F] underline font-medium"
					>
						https://usechipa.com
					</a>{" "}
					(the &quot;Site&quot;), including waitlist submission, promotional
					materials, early-access communications, and any pre-release software
					testing programs.
				</p>
				<p>
					By accessing or using our Site, or by submitting your email to join
					the waitlist, you acknowledge that you have read, understood, and
					agree to be bound by these Terms and our Privacy Policy. If you do not
					agree with any part of these Terms, you must immediately cease using
					the Site and refrain from submitting any personal information.
				</p>
			</section>

			<section className="space-y-4">
				<h2 className="font-display text-xl sm:text-2xl font-bold text-[#111111]">
					2. Pre-Launch & Development Status
				</h2>
				<div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-sm">
					<p className="font-semibold text-gray-900">
						Chipa is currently in pre-launch development. The Site is strictly
						for informational, waitlist registration, and early community
						onboarding purposes.
					</p>
				</div>
				<p>You understand and acknowledge that:</p>
				<ul className="list-disc pl-6 space-y-2">
					<li>
						<strong>No Active Financial Accounts:</strong> You cannot open,
						deposit funds into, or withdraw funds from a bank account, wallet,
						or payment facility through this Site at this time.
					</li>
					<li>
						<strong>Informational Showcase:</strong> Visual graphics, software
						previews, calculators, and feature descriptions displayed on the
						Site illustrate product functionality under active development and
						do not represent a currently functioning commercial service.
					</li>
					<li>
						<strong>Waitlist Submission:</strong> Entering your email address on
						our waitlist constitutes an expression of interest to receive
						product updates and potential early-access beta invitations. It does
						not establish a contractual banking, fiduciary, or financial
						services relationship.
					</li>
				</ul>
			</section>

			<section className="space-y-4">
				<h2 className="font-display text-xl sm:text-2xl font-bold text-[#111111]">
					3. Fintech Entity Disclosure & Regulated Partners
				</h2>
				<p>
					<strong>
						Chipa is a financial technology company, not a bank or licensed
						depository institution.
					</strong>
				</p>
				<p>
					Upon commercial rollout, all banking services, domestic and foreign
					virtual account numbers (including USD, EUR, GBP, and NGN accounts),
					payment routing, currency conversions, and card issuance (virtual and
					physical Visa and Mastercard payment cards) will be provided
					exclusively through licensed, authorized, and regulated partner banks
					and payment solution service providers in their respective
					jurisdictions.
				</p>
				<p>
					Nothing displayed on this Site shall be construed as a claim or
					representation that Chipa directly holds deposits, conducts
					unauthorized banking activities, or provides insurance or underwriting
					services independently.
				</p>
			</section>

			<section className="space-y-4">
				<h2 className="font-display text-xl sm:text-2xl font-bold text-[#111111]">
					4. Waitlist Registration & Eligibility
				</h2>
				<p>
					To join the Chipa waitlist or participate in our early access
					programs, you represent and warrant that:
				</p>
				<ul className="list-disc pl-6 space-y-2">
					<li>
						You are at least eighteen (18) years of age and possess the legal
						capacity to enter into a binding agreement.
					</li>
					<li>
						The email address you submit is accurate, current, and belongs to
						you.
					</li>
					<li>
						You are not subject to sanctions administered by the Nigerian
						Financial Intelligence Unit (NFIU), the U.S. Treasury Office of
						Foreign Assets Control (OFAC), the UK HM Treasury, or the European
						Union.
					</li>
				</ul>
				<p>
					<strong>No Guarantee of Admission:</strong> Joining the waitlist does
					not guarantee that you will be admitted into any beta program, issued
					an early-access invite, or approved for an account upon launch. Chipa
					reserves the absolute discretion to determine the timing, geographic
					availability, batch sizes, and criteria for onboarding waitlist
					participants.
				</p>
				<p>
					<strong>Mandatory Identity Verification (KYC):</strong> Prior to
					accessing any live financial products upon launch, all users will be
					required to successfully complete full Customer Due Diligence (CDD),
					Identity Verification (KYC), and Anti-Money Laundering (AML) screening
					mandated by applicable regulations.
				</p>
			</section>

			<section className="space-y-4">
				<h2 className="font-display text-xl sm:text-2xl font-bold text-[#111111]">
					5. Prospective Product Features & Roadmaps
				</h2>
				<p>
					Information on the Site regarding future offerings—including
					multi-currency wallets, foreign exchange rates, local transfers,
					airtime/data top-ups, cable TV/electricity bill settlement, and card
					spending limits—represents our product roadmap and design ambitions.
				</p>
				<p>
					Chipa reserves the right to modify, replace, suspend, or discontinue
					any feature, product tier, supported jurisdiction, fee schedule, or
					timeline at any time prior to or following launch without prior notice
					or liability to waitlist registrants.
				</p>
			</section>

			<section className="space-y-4">
				<h2 className="font-display text-xl sm:text-2xl font-bold text-[#111111]">
					6. Intellectual Property Rights
				</h2>
				<p>
					All content, software, graphics, user interface designs, logos, trade
					names, slogans (&quot;Get paid globally. Live locally.&quot;,
					&quot;Your money, without border&quot;), illustrations, icons, and
					source code displayed on or underlying the Site are the proprietary
					property of Chipa or its licensors and are protected by international
					copyright, trademark, patent, and trade secret laws.
				</p>
				<p>
					You are granted a limited, revocable, non-exclusive, non-transferable
					license to view the Site for personal, non-commercial use. You may not
					copy, reproduce, scrape, reverse engineer, decompile, modify, or
					distribute any part of the Site without our express prior written
					permission.
				</p>
			</section>

			<section className="space-y-4">
				<h2 className="font-display text-xl sm:text-2xl font-bold text-[#111111]">
					7. Acceptable Use & Prohibited Conduct
				</h2>
				<p>When interacting with the Site, you agree not to:</p>
				<ul className="list-disc pl-6 space-y-2">
					<li>
						Submit fraudulent, deceptive, disposable, or automated email
						addresses to artificially inflate or manipulate waitlist rankings.
					</li>
					<li>
						Use any automated device, bot, spider, scraper, or deep-link to
						monitor, index, or extract data from the Site.
					</li>
					<li>
						Interfere with, breach, or attempt to probe the security or
						authentication of any server, network, or database connected to the
						Site.
					</li>
					<li>
						Introduce viruses, trojans, worms, logic bombs, or any malicious or
						harmful code.
					</li>
					<li>
						Misrepresent your identity or affiliation with any person or
						organization.
					</li>
				</ul>
				<p>
					Chipa reserves the right to immediately invalidate, ban, or remove any
					waitlist registration suspected of violating these rules.
				</p>
			</section>

			<section className="space-y-4">
				<h2 className="font-display text-xl sm:text-2xl font-bold text-[#111111]">
					8. Beta Testing & User Feedback
				</h2>
				<p>
					If you are selected to participate in any early beta testing or
					preview releases:
				</p>
				<ul className="list-disc pl-6 space-y-2">
					<li>
						<strong>Confidentiality:</strong> Features, screenshots, non-public
						software builds, and performance metrics shared with you are
						confidential until publicly announced by Chipa.
					</li>
					<li>
						<strong>Feedback:</strong> Any suggestions, ideas, bug reports, or
						feedback you submit to Chipa regarding the product shall become the
						exclusive property of Chipa. We may freely use, implement, and
						exploit your feedback without restriction, credit, or financial
						compensation.
					</li>
				</ul>
			</section>

			<section className="space-y-4">
				<h2 className="font-display text-xl sm:text-2xl font-bold text-[#111111]">
					9. Disclaimers of Warranties
				</h2>
				<p>
					THE SITE, THE WAITLIST, AND ALL MATERIALS ARE PROVIDED ON AN{" "}
					<strong>&quot;AS IS&quot;</strong> AND{" "}
					<strong>&quot;AS AVAILABLE&quot;</strong> BASIS, WITHOUT WARRANTIES OF
					ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMISSIBLE
					UNDER APPLICABLE LAW, CHIPA DISCLAIMS ALL WARRANTIES, EXPRESS OR
					IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF
					MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND
					NON-INFRINGEMENT.
				</p>
				<p>
					CHIPA DOES NOT WARRANT THAT THE SITE WILL BE UNINTERRUPTED, TIMELY,
					SECURE, OR ERROR-FREE, NOR DOES CHIPA GUARANTEE ANY SPECIFIC LAUNCH
					DATE OR COMMERCIAL AVAILABILITY.
				</p>
			</section>

			<section className="space-y-4">
				<h2 className="font-display text-xl sm:text-2xl font-bold text-[#111111]">
					10. Limitation of Liability
				</h2>
				<p>
					TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL CHIPA, ITS
					DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, OR AFFILIATES BE LIABLE FOR
					ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES
					(INCLUDING LOSS OF PROFITS, DATA, USE, GOODWILL, OR BUSINESS
					OPPORTUNITY) ARISING FROM OR RELATED TO YOUR ACCESS TO OR INABILITY TO
					ACCESS THE SITE, YOUR WAITLIST POSITION, OR ANY MODIFICATION OR
					CANCELLATION OF FUTURE SERVICES.
				</p>
				<p>
					IN ALL CIRCUMSTANCES, CHIPA&apos;S TOTAL AGGREGATE LIABILITY FOR ANY
					CLAIM ARISING OUT OF OR IN CONNECTION WITH THESE PRE-LAUNCH TERMS
					SHALL NOT EXCEED TEN THOUSAND NIGERIAN NAIRA (NGN 10,000) OR THE
					EQUIVALENT OF TEN UNITED STATES DOLLARS (USD $10.00).
				</p>
			</section>

			<section className="space-y-4">
				<h2 className="font-display text-xl sm:text-2xl font-bold text-[#111111]">
					11. Modifications to Terms
				</h2>
				<p>
					We may update or revise these Terms at our discretion as our product
					evolves and approaches full commercial release. When we make
					revisions, we will update the &quot;Effective Date&quot; at the top of
					this document. Your continued access to the Site after any changes
					indicates your acceptance of the revised Terms.
				</p>
			</section>

			<section className="space-y-4">
				<h2 className="font-display text-xl sm:text-2xl font-bold text-[#111111]">
					12. Governing Law & Dispute Resolution
				</h2>
				<p>
					These Terms shall be governed by, and construed in accordance with,
					the laws of the Federal Republic of Nigeria, without giving effect to
					any principles of conflicts of law.
				</p>
				<p>
					Any dispute, controversy, or claim arising out of or relating to these
					Terms or the breach thereof shall first be settled through amicable
					informal negotiation. If the dispute cannot be resolved informally
					within thirty (30) days, it shall be submitted to the exclusive
					jurisdiction of the competent courts in Nigeria.
				</p>
			</section>

			<section className="space-y-4">
				<h2 className="font-display text-xl sm:text-2xl font-bold text-[#111111]">
					13. Contact Information
				</h2>
				<p>
					If you have questions, feedback, or legal inquiries concerning these
					Terms, please contact our legal and compliance desk at:
				</p>
				<div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-sm space-y-1">
					<p className="font-semibold text-gray-900">
						Chipa Legal & Compliance
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
