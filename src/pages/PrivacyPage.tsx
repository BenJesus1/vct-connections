import { CREATOR_X_HANDLE, CREATOR_X_URL, SITE_URL } from "../theme";

export function PrivacyPage() {
  return (
    <article className="mx-auto max-w-[390px] font-body text-sm leading-relaxed text-comms-text">
      <h1 className="font-display text-3xl tracking-wide sm:text-4xl">Privacy</h1>
      <p className="mt-3 text-comms-muted">Last updated November 23, 2026</p>

      <p className="mt-6">
        VCT COMMS ({SITE_URL}) is an unofficial fan puzzle game. This page
        explains what we collect when you play or sign in with Google.
      </p>

      <h2 className="mt-6 font-display text-xl tracking-wide">Google sign-in</h2>
      <p className="mt-2 text-comms-muted">
        If you choose Continue with Google, we use Clerk to receive your Google
        account email, name, and profile picture so we can create your VCT COMMS
        account. We do not read your Gmail, Drive, or other Google data.
      </p>

      <h2 className="mt-6 font-display text-xl tracking-wide">What we store</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-comms-muted">
        <li>Puzzle progress and stats in your browser (local storage).</li>
        <li>
          If you sign in: username, daily results, and ranks in our database,
          tied to your Clerk user id.
        </li>
      </ul>

      <h2 className="mt-6 font-display text-xl tracking-wide">How we use it</h2>
      <p className="mt-2 text-comms-muted">
        We use this only to run the game: keep your board, show ranks, and
        remember your username. We do not sell personal data or use it for ads.
      </p>

      <h2 className="mt-6 font-display text-xl tracking-wide">Contact and deletion</h2>
      <p className="mt-2 text-comms-muted">
        To ask questions or request that we delete your account data, contact{" "}
        <a
          href={CREATOR_X_URL}
          className="text-comms-accent underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          @{CREATOR_X_HANDLE}
        </a>
        .
      </p>
    </article>
  );
}
