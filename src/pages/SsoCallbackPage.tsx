import { AuthenticateWithRedirectCallback } from "@clerk/react";
import { Navigate } from "react-router-dom";
import { isClerkConfigured } from "../auth/clerk";

export function SsoCallbackPage() {
  if (!isClerkConfigured()) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="mx-auto max-w-[390px] py-16 text-center">
      <p className="font-body text-sm text-comms-muted">Finishing sign-in…</p>
      <AuthenticateWithRedirectCallback
        signInFallbackRedirectUrl="/"
        signUpFallbackRedirectUrl="/"
      />
    </div>
  );
}
