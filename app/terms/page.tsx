import Link from "next/link";

import {
  ArrowLeft,
} from "lucide-react";

import {
  AnimForgeLogo,
  PageBackground,
} from "@/components/animforge/ui";

export default function TermsPage() {
  return (
    <main className="relative min-h-screen bg-[#060608] text-white">

      <PageBackground />

      <nav className="relative z-20 border-b border-white/5">

        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-5">

          <AnimForgeLogo />

          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-zinc-400"
          >
            <ArrowLeft size={16} />
            Home
          </Link>

        </div>

      </nav>

      <article className="relative z-10 mx-auto max-w-[850px] px-6 py-20">

        <h1 className="text-5xl font-black">
          Terms of Use
        </h1>

        <div className="mt-10 space-y-6 leading-8 text-zinc-400 [&_h2]:pt-5 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-white">

          <p>
            Last updated: September 7, 2026
          </p>

          <h2>1. Using AnimForge</h2>

          <p>
            AnimForge provides tools for creative
            collaboration, animation project
            development and production management.
            Users must use the platform lawfully and
            responsibly.
          </p>

          <h2>2. Accounts</h2>

          <p>
            You are responsible for your account and
            activities performed through it. You must
            be legally permitted to use the service
            under the laws applicable to you.
          </p>

          <h2>3. Your content</h2>

          <p>
            You retain responsibility for content you
            create or upload. You must have the rights
            or permission necessary to upload, share
            or publish that material.
          </p>

          <h2>4. Collaboration</h2>

          <p>
            AnimForge may help creators connect and
            collaborate, but project participants are
            responsible for agreeing among themselves
            on ownership, payment, revenue sharing,
            credits and other collaboration terms.
          </p>

          <h2>5. AI-generated material</h2>

          <p>
            AI features may produce inaccurate,
            incomplete, repetitive or unsuitable
            material. Users must review generated
            content before relying on or publishing it.
          </p>

          <h2>6. Prohibited use</h2>

          <p>
            You may not use AnimForge to violate laws,
            infringe intellectual property rights,
            abuse or harass others, gain unauthorized
            access to systems, distribute malicious
            software or intentionally interfere with
            the service.
          </p>

          <h2>7. Availability</h2>

          <p>
            AnimForge is an evolving service.
            Features may change, become unavailable or
            contain errors, particularly during the
            early stages of the platform.
          </p>

          <h2>8. Responsibility</h2>

          <p>
            Users are responsible for decisions,
            agreements, creative work and transactions
            made through or resulting from use of the
            platform.
          </p>

          <h2>9. Changes to these terms</h2>

          <p>
            These terms may be updated as AnimForge
            develops. Continued use following an update
            may be subject to the revised terms.
          </p>

          <h2>10. Contact</h2>

          <p>
            A dedicated AnimForge support contact will
            be provided as the platform expands.
          </p>

        </div>

      </article>

    </main>
  );
}
