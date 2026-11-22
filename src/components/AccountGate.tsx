import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@clerk/react";
import { isClerkConfigured } from "../auth/clerk";

export function AccountGate({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[390px] text-center">
      <p className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-comms-accent">
        Account
      </p>
      <h1 className="mt-1 font-display text-4xl tracking-wide text-comms-text">
        {title}
      </h1>
      <p className="mt-2 font-body text-sm text-comms-muted">{body}</p>
      {action}
    </div>
  );
}

export function RequireAccount({
  title,
  signedOutBody,
  unconfiguredBody,
  children,
}: {
  title: string;
  signedOutBody: string;
  unconfiguredBody?: string;
  children: ReactNode;
}) {
  if (!isClerkConfigured()) {
    return (
      <AccountGate
        title={title}
        body={
          unconfiguredBody ??
          "Turn on Clerk sign-in to use this page."
        }
      />
    );
  }

  return (
    <RequireSignedIn title={title} signedOutBody={signedOutBody}>
      {children}
    </RequireSignedIn>
  );
}

function RequireSignedIn({
  title,
  signedOutBody,
  children,
}: {
  title: string;
  signedOutBody: string;
  children: ReactNode;
}) {
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation();

  if (!isLoaded) {
    return (
      <p className="mx-auto max-w-[390px] text-center font-body text-sm text-comms-muted">
        Loading…
      </p>
    );
  }

  if (!isSignedIn) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return (
      <AccountGate
        title={title}
        body={signedOutBody}
        action={
          <Link
            to={`/sign-in?redirect=${redirect}`}
            className="clip-angled mt-6 inline-block bg-comms-accent px-5 py-3 font-body text-sm font-semibold uppercase tracking-wide text-white"
          >
            Sign in
          </Link>
        }
      />
    );
  }

  return children;
}
