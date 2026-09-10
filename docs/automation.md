# AnimForge automation

## Code checks

`.github/workflows/ci.yml` runs independent lint and production-build jobs on
pull requests, pushes to main, and manual dispatches. It uses Node 22 and the
committed npm lockfile. The production build includes Next.js TypeScript checks.
Failures remain visible; one failed job does not cancel the other.

The workflow has read-only repository permissions, a 15-minute limit per job,
and cancellation of superseded runs. It does not deploy or change database data.
Supabase values are deliberately non-production placeholders, not credentials.
Build artifacts are not deployed. These checks do not verify live login or database
behavior; those require a separate test environment.

After merging this workflow and seeing it run, repository rules can require
the `lint` and `build` checks before merging. Adding the file alone does not
enforce merge protection. Lint errors fail the lint check; non-blocking warnings remain visible.

## Next stages

1. Address the remaining lint warnings in focused changes and add meaningful tests
   for sign-up, project ownership and other critical behavior.
2. Connect error reports and feature requests to a reviewed task queue. An AI
   coding runner can implement selected tasks in branches and open pull requests.
   No continuous AI runner is configured by this change.
3. Inspect existing sign-up/onboarding flows, then add welcome messages with
   duplicate prevention and retry handling using an email provider.
4. Prepare promotion drafts from creator-approved showcases. Publishing requires
   connected social accounts and an approved campaign; advertising also needs an
   explicit budget.

Keep major releases, database migrations and advertising spending under owner
review. Choose the AI provider and hosting only after confirming costs and access.
