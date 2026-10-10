"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Mail, MapPin, Phone, type LucideIcon } from "lucide-react";

type ContactSponsorshipProps = {
  email?: string;
  phone?: string;
  phoneHref?: string;
  location?: string;
};

type ContactItem = {
  key: string;
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
  iconClass: string;
};

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const gridVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: EASE } },
};

export default function ContactSponsorship({
  email = "sponsorship@neu.ac.bd",
  phone = "+880 1700-000000",
  phoneHref = "+8801700000000",
  location = "CSE Dept., Netrokona University Bangladesh",
}: ContactSponsorshipProps) {
  const reduceMotion = useReducedMotion();
  const initial = reduceMotion ? "visible" : "hidden";

  const items: ContactItem[] = [
    {
      key: "email",
      icon: Mail,
      label: "Email us",
      value: email,
      href: `mailto:${email}`,
      iconClass: "bg-emerald-500/10 text-emerald-500",
    },
    {
      key: "phone",
      icon: Phone,
      label: "Call us",
      value: phone,
      href: `tel:${phoneHref}`,
      iconClass: "bg-blue-500/10 text-blue-500",
    },
    {
      key: "location",
      icon: MapPin,
      label: "Location",
      value: location,
      iconClass: "bg-purple-500/10 text-purple-500",
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 md:px-8" id="contact-us" aria-labelledby="contact-title">
      <motion.div
        variants={headerVariants}
        initial={initial}
        whileInView="visible"
        viewport={{ once: true, amount: 0.6 }}
        className="mx-auto mb-10 max-w-xl space-y-2 text-center"
      >
        <h2
          id="contact-title"
          className="text-3xl font-extrabold text-(--text-primary) md:text-4xl"
        >
          Get in Touch with Us
        </h2>
        <p className="text-sm text-(--text-secondary)">
          Have questions or want to discuss custom partnership packages? Reach out directly to
          our sponsorship team.
        </p>
      </motion.div>

      <motion.ul
        variants={gridVariants}
        initial={initial}
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        className="grid grid-cols-1 gap-6 md:grid-cols-3"
      >
        {items.map(({ key, icon: Icon, label, value, href, iconClass }) => {
          const body = (
            <>
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 ease-out group-hover:scale-110 ${iconClass}`}
              >
                <Icon size={22} aria-hidden />
              </span>
              <span className="space-y-1">
                <span className="block text-xs font-semibold tracking-wide text-(--text-muted)">
                  {label}
                </span>
                <span className="block text-sm font-semibold text-(--text-primary)">
                  {value}
                </span>
              </span>
            </>
          );

          const cardClass =
            "group flex h-full flex-col items-center gap-3 rounded-3xl border border-(--border-color) bg-(--card-bg) p-6 text-center shadow-xs transition-all duration-300 ease-out";

          return (
            <motion.li key={key} variants={cardVariants}>
              {href ? (
                <a
                  href={href}
                  className={`${cardClass} hover:-translate-y-1 hover:border-(--btn-primary-bg) hover:shadow-lg hover:shadow-teal-900/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600`}
                >
                  {body}
                </a>
              ) : (
                <div className={cardClass}>{body}</div>
              )}
            </motion.li>
          );
        })}
      </motion.ul>
    </section>
  );
}