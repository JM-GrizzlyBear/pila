import { LogOut } from "lucide-react";
import { Link, NavLink } from "react-router";
import { useCurrentUser, useLogOut } from "../../../application/auth/useAuth";
import { ROLE_LABELS, displayName, initials } from "../../format/names";
import { PilaLogo } from "../brand/PilaLogo";
import { buttonSecondary } from "../ui/styles";

export function AppHeader() {
  const { data: user } = useCurrentUser();
  const logOut = useLogOut();

  return (
    <header className="border-b border-edge bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold">
            <PilaLogo className="size-8" />
            Pila
          </Link>
          {user?.role === "admin" && (
            <nav aria-label="Admin">
              <NavLink
                to="/admin/accounts"
                className={({ isActive }) =>
                  `inline-flex min-h-11 items-center font-semibold ${isActive ? "text-brand underline underline-offset-4" : "text-muted hover:text-brand"}`
                }
              >
                Accounts
              </NavLink>
            </nav>
          )}
        </div>
        {user && (
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="flex size-8 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-brand"
              >
                {initials(user)}
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-sm font-semibold">
                  {displayName(user)}
                </span>
                <span className="text-xs text-muted">
                  {ROLE_LABELS[user.role]}
                </span>
              </span>
            </span>
            <button
              type="button"
              onClick={() => logOut.mutate()}
              disabled={logOut.isPending}
              className={buttonSecondary}
            >
              <LogOut aria-hidden="true" className="size-4" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
