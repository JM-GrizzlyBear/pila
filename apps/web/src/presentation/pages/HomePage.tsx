import { useCurrentUser } from "../../application/auth/useAuth";
import { PilaLogo } from "../components/brand/PilaLogo";

// For now: a welcome page after signing in. The kiosk, counter, TV display and
// admin screens replace it in version 1.
export function HomePage() {
  const { data: user } = useCurrentUser();

  return (
    <main className="mx-auto flex max-w-3xl flex-col items-start gap-4 px-4 py-12">
      <PilaLogo className="size-16" />
      <h1 className="text-3xl font-bold">Welcome to Pila</h1>
      <p className="text-muted">
        {user ? `Signed in as @${user.username}. ` : ""}A queue system for any
        place with counters: take a number, get called by voice, and keep every
        day's records.
      </p>
      <p className="text-muted">
        Coming next: the kiosk, the counter screen, the TV display and the
        admin.
      </p>
    </main>
  );
}
