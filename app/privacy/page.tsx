import Link from "next/link";

import {
  ArrowLeft,
} from "lucide-react";

import {
  AnimForgeLogo,
  PageBackground,
} from "@/components/animforge/ui";

export default function PrivacyPage() {
  return (
    <PolicyPage
      title="Privacy Policy"
    >
      <p>
        Last updated: September 7, 2026
      </p>

      <h2>1. Information we collect</h2>

      <p>
        AnimForge may collect information you provide
        when creating an account or using the platform,
        including profile information, project content,
        portfolio material, messages, applications,
        characters, stories, scenes and uploaded files.
      </p>

      <h2>2. Authentication and account data</h2>

      <p>
        Account authentication and application data may
        be stored using third-party infrastructure
        providers used by AnimForge to operate the
        service.
      </p>

      <h2>3. How information is used</h2>

      <p>
        Information may be used to provide AnimForge,
        maintain accounts, enable collaboration,
        display public content where you choose to make
        it public, provide project features, improve
        reliability and protect the service.
      </p>

      <h2>4. AI features</h2>

      <p>
        Some AnimForge AI functionality may run locally
        within a supported browser. AI-generated
        material should be reviewed by the creator
        before being used or published.
      </p>

      <h2>5. Public and private projects</h2>

      <p>
        Content belonging to projects configured as
        public may be visible to other users. Private
        project content is intended to be available
        only to authorized project participants,
        subject to the platform&apos;s access controls.
      </p>

      <h2>6. Uploaded files</h2>

      <p>
        Users may upload portfolio images, avatars and
        project-related reference material. Do not
        upload material you do not have permission to
        use.
      </p>

      <h2>7. Service providers</h2>

      <p>
        AnimForge may rely on hosting, database,
        authentication, storage and other technology
        providers necessary to operate the platform.
      </p>

      <h2>8. Security</h2>

      <p>
        Reasonable technical measures are used to
        protect application data, but no internet
        service can guarantee absolute security.
      </p>

      <h2>9. Your choices</h2>

      <p>
        You should avoid making sensitive information
        public through profiles, projects, messages or
        other public areas of AnimForge.
      </p>

      <h2>10. Changes</h2>

      <p>
        This policy may be updated as AnimForge and its
        features evolve. The date shown above indicates
        the latest version.
      </p>

      <h2>11. Contact</h2>

      <p>
        A dedicated AnimForge support or privacy
        contact address will be provided as the service
        expands.
      </p>

    </PolicyPage>
  );
}

function PolicyPage({
  title,
  children,
}: {
  title: string;
  children:
    React.ReactNode;
}) {
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
          {title}
        </h1>

        <div className="mt-10 space-y-6 leading-8 text-zinc-400 [&_h2]:pt-5 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-white">
          {children}
        </div>

      </article>

    </main>
  );
}
