import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/accordion.tsx";
import type * as React from "react";
import { cn } from "#/lib/utils";

export interface FAQItem {
  id?: string;
  question: string;
  answer: React.ReactNode;
}

export interface FAQProps {
  /** Custom section headline */
  title?: React.ReactNode;
  /** Optional subtitle below the headline */
  subtitle?: React.ReactNode;
  /** Array of FAQ items */
  items?: FAQItem[];
  /** Extra CSS classes for the section wrapper */
  className?: string;
  /** ID of the item opened by default */
  defaultValue?: string;
}

export const PRE_LAUNCH_FAQS: FAQItem[] = [
  {
    id: "what-is-chipa",
    question: "What is Chipa?",
    answer:
      "Chipa is a modern cross-border financial platform built to help freelancers, remote workers, creators, and businesses receive, hold, convert, and spend money globally. With Chipa, you get multi-currency accounts (NGN, USD, EUR, GBP), virtual and physical cards, and instant utility bill payments all from one secure app.",
  },
  {
    id: "when-launching",
    question: "When is Chipa launching?",
    answer:
      "We are currently in private beta and actively preparing for our public release. We are onboarding users in rolling batches. Joining our waitlist gives you priority access as soon as your spot opens up.",
  },
  {
    id: "how-waitlist-works",
    question: "How does the waitlist work?",
    answer:
      "When you join our waitlist with your email, you secure your spot in line. We'll send you exclusive product previews, early-bird rewards, and an invitation code to set up and verify your account ahead of the general public.",
  },
  {
    id: "is-chipa-free",
    question:
      "Is Chipa free to join, and are there any account maintenance fees?",
    answer:
      "Joining the waitlist and opening your Chipa account is completely free. We do not charge monthly account maintenance fees or recurring subscriptions. All foreign exchange rates and transaction fees are shown upfront with zero hidden charges.",
  },
  {
    id: "receiving-money",
    question: "How will I be able to receive money from abroad?",
    answer:
      "Once launched and fully onboarded, you will receive dedicated foreign virtual account numbers (in USD, EUR, and GBP) and a local NGN account. This allows you to receive payments directly via ACH, Wire, SEPA, and Faster Payments, or from platforms like Upwork, Deel, Fiverr, and Remote.",
  },
  {
    id: "cards-supported",
    question: "Will Chipa provide cards for online and in-person payments?",
    answer:
      "Yes! Early waitlist members will have first access to our virtual cards for global online subscriptions and shopping.",
  },
  {
    id: "funds-security",
    question: "How does Chipa keep my money and data secure?",
    answer:
      "Security is foundational to everything we build. Chipa utilizes bank-grade 256-bit encryption, biometric authorization, and multi-factor authentication. We partner with licensed, regulated financial institutions and payment networks to ensure your funds and personal information are safeguarded at all times.",
  },
];

export default function FAQ({
  title = (
    <>
      Frequently Asked
      <br />
      Questions
    </>
  ),
  subtitle,
  items = PRE_LAUNCH_FAQS,
  className,
  defaultValue,
}: FAQProps) {
  const activeDefault = defaultValue ?? items[0]?.id ?? "faq-0";

  return (
    <section
      className={cn("page-container py-20 sm:py-28 lg:py-32", className)}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Left: Section Headline */}
        <div className="lg:col-span-5">
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-[#111111] tracking-tight leading-tight sticky top-28">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-4 text-base sm:text-lg text-[#555555] leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Right: Accordion */}
        <div className="lg:col-span-7">
          <Accordion
            type="single"
            collapsible
            defaultValue={activeDefault}
            className="w-full"
          >
            {items.map((item, index) => {
              const itemId = item.id || `faq-${index}`;
              return (
                <AccordionItem
                  key={itemId}
                  value={itemId}
                  className="border-b border-black/[0.08]"
                >
                  <AccordionTrigger className="text-left font-bold text-base sm:text-lg text-[#111111] py-5 hover:no-underline cursor-pointer">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm sm:text-base text-[#555555] leading-relaxed pb-6 pt-1">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

export { FAQ };
