import { Link } from "react-router";
import { useCurrentUser } from "../../application/auth/useAuth";
import { PilaLogo } from "../components/brand/PilaLogo";
import { ROLE_LABELS, displayName } from "../format/names";

// For now: a welcome page after signing in. The kiosk, counter, TV display and
// setup screens come in the next versions.
export function HomePage() {
  const { data: user } = useCurrentUser();

  return (
    <main className="mx-auto flex max-w-3xl flex-col items-start gap-4 px-4 py-12">
      <PilaLogo className="size-16" />
      <h1 className="text-3xl font-bold">
        Welcome{user ? `, ${user.firstName || displayName(user)}` : ""}
      </h1>
      {user && (
        <p className="text-muted">
          Signed in as @{user.username} ({ROLE_LABELS[user.role]}).
        </p>
      )}
      <p className="text-muted">
        Pila is a queue system for any place with counters: take a number, get
        called by voice, and keep every day's records.
      </p>
      {user?.role === "admin" ? (
        <Link
          to="/admin/accounts"
          className="font-semibold text-brand underline"
        >
          Manage accounts
        </Link>
      ) : (
        <p className="text-muted">
          Your counter screen is coming next. For now, there's nothing to do
          here.
        </p>
      )}
    </main>
  );
}
