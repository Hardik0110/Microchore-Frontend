# Microchore frontend — autonomous build log

Date: 2026-05-23
Scope: writer-side M1 surfaces, mocked client-side. No backend wired.

## What runs

Dev server: `cd microchore-frontend && npm run dev` → http://localhost:5173.

All 16 routes return HTTP 200. `npx tsc --noEmit` passes with zero output. Chrome headless renders cleanly. No new npm dependencies added (the build is React 19 + React Router 6 + Vite 7 + Tailwind 3 only).

## Routes shipped

| Route | What it is |
|---|---|
| `/` | Homepage (existing, brand-finalized in prior session) |
| `/signup` | Email + password + "Continue with Google" CTA |
| `/login` | Email + password, preserves existing user state |
| `/onboarding/verify-email` | 6-digit code paste, mock-verifies |
| `/onboarding/welcome` | Expectations card + Continue |
| `/onboarding/link-account` | IG / TikTok / SoundCloud picker, scrape-verify simulator with deterministic per-user verify code, credibility check with soft-warn on fail |
| `/onboarding/attest` | 3 required checkboxes (18+, no AI, T&C) |
| `/onboarding/tutorial` | 5 clickable screens with brand-consistent mockups |
| `/onboarding/first-task` | Composer with native paste tracking + attestation + URL submit, writes a starter Submission to localStorage |
| `/app` | Dashboard with three states: starter-run-in-progress, account-on-hold, real-tasks-unlocked. Stat cards + starter row list + locked real tasks + latest-approval receipt |
| `/app/marketplace` | Real-task discovery with platform filter chips, sort selector, search box, card grid |
| `/app/tasks` | Redirects to `/app/marketplace` so old links still work |
| `/app/tasks/:id` | Task detail + composer with native paste detection + attestation + URL submit. Approval auto-fires 1.2s after submit and prints an accessible Receipt modal |
| `/app/earnings` | Stat cards + approved list + embedded weekly Receipt ledger |
| `/app/profile` | Identity + total earned + linked-account snapshot + starter run summary |
| `/app/settings` | Payout method config (Airtm / PayPal / Crypto), notification toggles, sign out, dev-only reset button |

Sidebar nav: Dashboard, Marketplace, Earnings, Profile, Settings.

## File map

```
microchore-frontend/src/
├── App.tsx                     // routes + AuthProvider
├── main.tsx                    // unchanged
├── index.css                   // brand tokens + receipt CSS, unchanged this session
├── lib/
│   ├── auth.ts                 // AuthContext, userRef pattern, safe login, wizard state machine
│   ├── store.ts                // useTasks / useSubmissions / useEarnings + seeded mock catalog
│   └── ui-utils.ts             // cn, formatters, usePasteTracker (native onPaste), useLocalStorage, shortId
├── components/
│   ├── layouts.tsx             // Marketing / Auth / Onboarding (gated) / App (gated + sidebar)
│   └── ui/
│       ├── primitives.tsx      // 10 small components (no coral on UI controls)
│       ├── Receipt.tsx         // brand-locked Receipt
│       ├── Stamp.tsx           // rotation-sanitized Stamp
│       └── PlatformTag.tsx     // Instagram / TikTok / SoundCloud SVGs + PlatformTag (ReactElement-typed)
└── pages/
    ├── HomePage.tsx            // brand-finalized previously
    ├── auth.tsx                // SignupPage + LoginPage
    ├── onboarding.tsx          // VerifyEmail / Welcome / LinkAccount / Attest / Tutorial / FirstTask
    ├── app.tsx                 // Dashboard / TaskDetail (with a11y Receipt modal) / Earnings
    ├── marketplace.tsx         // MarketplacePage with filters and search
    └── account.tsx             // ProfilePage + SettingsPage
```

## Architecture choices

State management
- One `AuthContext` over `useAuthProvider()`. The provider keeps a `userRef` synced to React state so `updateUser`, `advanceWizard`, `login`, `logout` can all read the current user synchronously without re-reading localStorage. This was a council fix.
- `useTasks` / `useSubmissions` / `useEarnings` are derived hooks that read `microchore:tasks` and `microchore:submissions` from localStorage and subscribe to cross-tab `storage` events.
- No external state library. React primitives, careful memoization, and one ref.

Data layer
- Three localStorage keys: `microchore:user`, `microchore:tasks` (seeded once), `microchore:submissions`. ISO 8601 timestamps throughout.
- When the backend lands, swap the body of `useAuth`, `useTasks`, and `useSubmissions` for real API calls. Components above them do not change.

Components
- Brand primitives bundled in `primitives.tsx` for tree-locality. `Receipt`, `Stamp`, `PlatformTag` are their own files because each carries a distinct brand contract.
- `Stamp` clamps any non-negative rotation to `-2.5°` so a stamp cannot accidentally appear upright or clockwise.
- `HeadlineWithAccent` takes `text` and `accents`; the regex split renders matched substrings in Instrument Serif italic coral. Whole-headline italicization is impossible.
- `PlatformTag` replaces the generic `RowTag` for every platform indicator. Outline SVGs at 1.5px stroke, ink-2 color, no fills, per brand §9.

Composer
- `usePasteTracker(value)` was reworked after the council review. Char-typed count comes from the value diff (any positive delta counts as typing, including IME composition and mobile autocorrect). Paste detection comes from the native `onPaste` clipboard event attached to the textarea, which captures the actual pasted string length and decrements the over-counted typed chars. This makes the signal robust for international writers.
- Submissions persist the full stat block so the backend can rebuild AI-detection signal layer 1 from history.

Routing and gating
- `WIZARD_ROUTES` in `components/layouts.tsx` maps every `WizardStep` to a route. Adding a step is a one-place change.
- `OnboardingLayout` and `AppLayout` both gate on the user's `wizardStep` and redirect mid-flow to the correct route.

Brand rules respected
- Zero em-dashes or en-dashes in `src/` (grep returns no matches).
- No emoji in product UI. The stamp glyphs, accent dot, perforated edge, and dashed rule carry the visual punctuation.
- No "end-to-end encryption" claim. Approved trust line: "Encrypted in transit and at rest. No payment credentials stored. We don't sell your data."
- Counter-clockwise stamp rotation only (sanitized in `Stamp.tsx`).
- Coral `#FF5B27` is used only as italic-serif accent text, never on buttons, checkboxes, the required-field asterisk, the progress bar fill, or any UI control. (This was a council fix.)
- Receipt mode shows up only in three places, per brand §8: latest-approval card on the dashboard, embedded ledger on the earnings page, and the approval modal that prints after a real-task approval. Never wallpaper.
- No code comments anywhere in `src/`.

Accessibility
- The Receipt modal on the task detail page is a proper dialog: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing at a visually-hidden title, focus jumps to the dismiss button on open, Tab cycles inside the dialog, Escape closes, and focus returns to the trigger on close.
- All inputs label their controls. Errors use `role="alert"`. The required asterisk is `aria-hidden`.
- The segmented progress bar reports `role="progressbar"` with `aria-valuemin/max/now` and `aria-label`.

## What is mocked vs real

- Auth is localStorage-only. Signing up persists a `User` record. Signing in preserves any existing user record instead of overwriting it (council fix — the original `login()` could destroy in-progress wizard state).
- A dev-only `Auto-review starter run` button sits on the dashboard while the starter run is pending. It is wrapped in `import.meta.env.DEV` so it does not render in a production build.
- Real-task review fires automatically 1.2 seconds after submission. The timer is tracked in a ref and cleared on unmount, and the reviewed submission is passed directly into the modal (no race against React state).
- The dev-only "Reset preview data" button on Settings is wrapped in `import.meta.env.DEV` so a real writer cannot wipe themselves.

When the Django backend lands, the swap surface is small: replace the body of `useAuth`, `useTasks`, and `useSubmissions` with real API calls. The components above them stay.

## Out of scope (not in this build)

- Real OAuth (the Google button creates a demo user).
- Real social-account scrape verification (we simulate 850ms verify + pseudo-random follower / post / age numbers seeded from the typed handle).
- Real comment-URL fetching, 24 / 48h survival checks, AI classifier pass.
- Reviewer interface (Django Admin covers M1 per `docs/architecture.md`).
- Company portal (Django Admin covers M1).
- Multi-language, dark mode, native mobile.
- Submissions lifted into context (each component that calls `useSubmissions` subscribes independently for now; deferred until backend lands).
- Versioned tasks localStorage key (bump to `microchore:tasks:v2` when the seeded catalog changes).
- Settings payout writes routed through `useAuth().updateUser` (currently writes directly; functionally fine but architecturally not ideal).

## Council review pass

After the build I ran the `/council` skill with three subagent voices (Skeptic, Pragmatist, Critic) on the codebase. The verdict was "polish first, then demo. Do not rebuild." The pass surfaced these and they were fixed:

- P0.1 Dashboard "Demo helper" label visible in production → renamed to "Preview build" and wrapped in `import.meta.env.DEV`.
- P0.2 Settings "Reset demo data" button visible to real writers → wrapped in `import.meta.env.DEV`.
- P0.3 Em-dashes in HomePage, app.tsx, account.tsx → all replaced with middle-dot or rewritten.
- P0.4 Coral on Checkbox accent, required asterisk, ProgressBar segment → replaced with ink.
- P0.5 `updateUser` re-read localStorage on every call, producing races under concurrent updates → refactored to use a `userRef` and a shared `commit` helper.
- P0.6 ApprovalReceiptModal had no dialog role, no focus trap, no labeled title, no autofocus → all fixed.
- P0.7 Modal opened on `submissions.find(...).status === 'approved'`, which could be stale → modal now receives the freshly reviewed submission directly via state.
- P0.7b setTimeout for auto-review had no cleanup on unmount → timer stored in ref, cleaned in unmount effect, also gated by a mounted ref.
- P0.8 `login()` fabricated a fully-onboarded user over any existing one → preserves existing user instead.
- P1.1 Paste tracker mis-flagged IME composition as paste → rewritten to use native `onPaste` clipboard event for paste detection while diffs only count typing.
- P1.3 Dead code: `platformLabel`, `TasksPage`, unused `cadence` const → removed.
- P1.4 `JSX.Element` typing in PlatformTag → `ReactElement` from `react`.
- P1.6 Hardcoded verification code `3F-9K-2X` in LinkAccountStep → derived deterministically from `user.id`.

## How to walk the full flow

1. Open http://localhost:5173/ and click "Start earning".
2. Sign up with any email + 8+ char password (or click "Continue with Google" for a one-tap demo user).
3. Verify-email: any 6 digits.
4. Welcome screen, Continue.
5. Link-account: pick a platform, type any handle, click "Verify ownership". Most random handles pass. Try a 2-character handle to see the soft-warn. Continue.
6. Attest: tick all three boxes. Continue.
7. Tutorial: 5 screens, Next through.
8. First task: type a comment (at least 24 chars), paste any URL like `https://instagram.com/p/test/c/abc`, tick the box, Submit. Pasting the URL fires the real `onPaste` and the counter increments correctly.
9. Land on `/app` dashboard. "Starter run · 1 of 5 submitted" with 4 more tasks at the top and (in dev) a "Preview build / Auto-review starter run" button up top.
10. Click "Auto-review starter run" to fast-forward. If 3 or more pass, real tasks unlock and `/app/marketplace` opens up.
11. Open `/app/marketplace`, filter by Instagram, sort by Highest pay, click a card, Open brief.
12. Write a comment, paste a URL, Submit. After ~1.2 seconds the Receipt modal prints over the page. Tab and Shift+Tab stay inside the dialog. Escape closes.
13. Open `/app/earnings` to see the weekly Receipt ledger build up.
14. Open `/app/profile` to see your linked-account snapshot and starter run results.
15. Open `/app/settings` to set a payout method or sign out.

To reset and replay, run this in the browser console:

```js
Object.keys(localStorage).filter(k => k.startsWith('microchore:')).forEach(k => localStorage.removeItem(k))
location.href = '/'
```

In dev, there is also a "Reset preview data" button on Settings that does the same thing.

## Image prompts

No additional Gemini image prompts were needed for product UI. Per `docs/brand.md` §9 the brand intentionally does not use bitmap icons in product surfaces. Every mockup inside the tutorial is built in HTML + CSS using the same brand primitives that ship in the app. The 6 images you generated for the PRD cover the marketing deliverable. If you want a hero illustration on the marketing homepage in a later pass, I can extend `docs/exports/images/gemini-prompts.md` with a matching prompt.

## Where to go next

- Walk through the flow yourself and flag anything that does not feel right.
- After that, the natural next layer is the Django backend so the data layer becomes real instead of mocked.
- M1 stress test launch on or around 2026-05-25 still needs a deployed Vercel build, a deployed Railway backend, 20-30 real users invited, and PRD section 7 populated from observation.
