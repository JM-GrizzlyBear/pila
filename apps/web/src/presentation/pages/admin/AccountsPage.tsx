import { Plus } from "lucide-react";
import { Link } from "react-router";
import { useAccounts } from "../../../application/accounts/useAccounts";
import { useCurrentUser } from "../../../application/auth/useAuth";
import { ErrorAlert } from "../../components/ui/ErrorAlert";
import { buttonPrimary } from "../../components/ui/styles";
import { errorMessage } from "../../format/errorMessage";
import { ROLE_LABELS, displayName } from "../../format/names";

// Admin → Accounts: everyone who can sign in to Pila
export function AccountsPage() {
  const accounts = useAccounts();
  const { data: me } = useCurrentUser();

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold">Accounts</h1>
          <p className="text-muted">
            Admins set up the place and manage accounts. Staff work the
            counters.
          </p>
        </div>
        <Link to="/admin/accounts/new" className={buttonPrimary}>
          <Plus aria-hidden="true" className="size-4" />
          Add account
        </Link>
      </div>

      {accounts.isPending && (
        <p role="status" className="text-muted">
          Loading…
        </p>
      )}
      {accounts.isError && (
        <ErrorAlert message={errorMessage(accounts.error)} />
      )}

      {accounts.data && (
        <div className="overflow-x-auto rounded-2xl border border-edge bg-white">
          <table className="w-full min-w-[640px] text-left">
            <thead className="text-sm text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Username</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {accounts.data.map((account) => (
                <tr key={account.id} className="border-t border-edge">
                  <td className="px-4 py-3">
                    <span className="flex flex-col">
                      <span className="font-semibold">
                        {displayName(account)}
                        {account.id === me?.id && (
                          <span className="ml-2 text-sm font-normal text-muted">
                            (you)
                          </span>
                        )}
                      </span>
                      <span className="text-sm text-muted">
                        {account.email}
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-3">@{account.username}</td>
                  <td className="px-4 py-3">{ROLE_LABELS[account.role]}</td>
                  <td className="px-4 py-3">
                    {account.active ? (
                      <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                        <span
                          aria-hidden="true"
                          className="size-2 rounded-full bg-emerald-600"
                        />
                        On
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 font-semibold text-muted">
                        <span
                          aria-hidden="true"
                          className="size-2 rounded-full bg-gray-400"
                        />
                        Turned off
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/admin/accounts/${account.id}`}
                      className="inline-flex min-h-11 items-center font-semibold text-brand underline"
                    >
                      Edit
                      <span className="sr-only"> {displayName(account)}</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
