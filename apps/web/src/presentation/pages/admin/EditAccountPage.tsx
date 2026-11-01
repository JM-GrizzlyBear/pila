import { AUTH_LIMITS, type PublicUser, type Role } from "@pila/shared";
import { useId, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router";
import {
  useAccount,
  useSetAccountPassword,
  useUpdateAccount,
} from "../../../application/accounts/useAccounts";
import { useCurrentUser } from "../../../application/auth/useAuth";
import { ErrorAlert } from "../../components/ui/ErrorAlert";
import { SelectField } from "../../components/ui/SelectField";
import { TextField } from "../../components/ui/TextField";
import { buttonPrimary } from "../../components/ui/styles";
import { errorMessage, fieldError } from "../../format/errorMessage";
import { ROLE_OPTIONS, displayName } from "../../format/names";

// Admin → Accounts → Edit
export function EditAccountPage() {
  const { id } = useParams();
  const account = useAccount(id);

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      <Link
        to="/admin/accounts"
        className="text-sm font-semibold text-brand underline"
      >
        ← Accounts
      </Link>
      {account.isPending && (
        <p role="status" className="text-muted">
          Loading…
        </p>
      )}
      {account.isError && <ErrorAlert message={errorMessage(account.error)} />}
      {account.isSuccess && !account.data && (
        <ErrorAlert message="That account doesn't exist." />
      )}
      {account.data && (
        // Keyed by id, so the forms start fresh for each account
        <AccountForms key={account.data.id} account={account.data} />
      )}
    </main>
  );
}

function AccountForms({ account }: { account: PublicUser }) {
  const { data: me } = useCurrentUser();
  const isMe = me?.id === account.id;

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">{displayName(account)}</h1>
        <p className="text-muted">@{account.username}</p>
      </div>
      <DetailsForm account={account} isMe={isMe} />
      {isMe ? (
        <p className="rounded-2xl border border-edge bg-white p-6 text-muted">
          This is your account: another admin has to change your role or turn it
          off. You'll change your own password on your profile.
        </p>
      ) : (
        <PasswordForm account={account} />
      )}
    </>
  );
}

function DetailsForm({
  account,
  isMe,
}: {
  account: PublicUser;
  isMe: boolean;
}) {
  const [firstName, setFirstName] = useState(account.firstName);
  const [lastName, setLastName] = useState(account.lastName);
  const [email, setEmail] = useState(account.email);
  const [role, setRole] = useState<Role>(account.role);
  const [active, setActive] = useState(account.active);
  const [saved, setSaved] = useState(false);
  const update = useUpdateAccount(account.id);
  const activeId = useId();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaved(false);
    try {
      await update.mutateAsync({ firstName, lastName, email, role, active });
      setSaved(true);
    } catch {
      // Shown below from update.error
    }
  }

  const error = (field: string) => fieldError(update.error, field);

  return (
    <form
      onSubmit={handleSubmit}
      aria-labelledby="details-title"
      className="flex flex-col gap-5 rounded-2xl border border-edge bg-white p-6"
    >
      <h2 id="details-title" className="text-xl font-bold">
        Details and access
      </h2>
      {update.isError && <ErrorAlert message={errorMessage(update.error)} />}
      {saved && (
        <p role="status" className="font-semibold text-emerald-700">
          Saved.
        </p>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="First name"
          value={firstName}
          onChange={setFirstName}
          autoComplete="off"
          maxLength={AUTH_LIMITS.nameMax}
          required
          error={error("firstName")}
        />
        <TextField
          label="Last name"
          value={lastName}
          onChange={setLastName}
          autoComplete="off"
          maxLength={AUTH_LIMITS.nameMax}
          required
          error={error("lastName")}
        />
      </div>
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        autoComplete="off"
        required
        error={error("email")}
      />
      {isMe ? (
        <p className="text-sm text-muted">
          Role: Admin. Your role and on/off switch can only be changed by
          another admin.
        </p>
      ) : (
        <>
          <SelectField
            label="Role"
            value={role}
            onChange={setRole}
            options={ROLE_OPTIONS}
            error={error("role")}
          />
          <div className="flex items-start gap-3">
            <input
              id={activeId}
              type="checkbox"
              checked={active}
              onChange={(event) => setActive(event.target.checked)}
              className="mt-1 size-5 accent-brand"
            />
            <label htmlFor={activeId} className="flex flex-col">
              <span className="font-semibold">Account is on</span>
              <span className="text-sm text-muted">
                Turned off, the person can't sign in and is signed out
                everywhere right away.
              </span>
            </label>
          </div>
        </>
      )}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={update.isPending}
          className={buttonPrimary}
        >
          {update.isPending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

function PasswordForm({ account }: { account: PublicUser }) {
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const setNew = useSetAccountPassword(account.id);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setDone(false);
    try {
      await setNew.mutateAsync({ password });
      setPassword("");
      setDone(true);
    } catch {
      // Shown below from setNew.error
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-labelledby="password-title"
      className="flex flex-col gap-5 rounded-2xl border border-edge bg-white p-6"
    >
      <div className="flex flex-col gap-1">
        <h2 id="password-title" className="text-xl font-bold">
          Set a new password
        </h2>
        <p className="text-sm text-muted">
          For someone who forgot theirs. They're signed out everywhere, and only
          the new password works.
        </p>
      </div>
      {setNew.isError && <ErrorAlert message={errorMessage(setNew.error)} />}
      {done && (
        <p role="status" className="font-semibold text-emerald-700">
          New password set. Give it to {displayName(account)}.
        </p>
      )}
      <TextField
        label="New password"
        type="password"
        value={password}
        onChange={setPassword}
        autoComplete="new-password"
        minLength={AUTH_LIMITS.passwordMin}
        maxLength={AUTH_LIMITS.passwordMax}
        required
        error={fieldError(setNew.error, "password")}
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={setNew.isPending}
          className={buttonPrimary}
        >
          {setNew.isPending ? "Setting…" : "Set new password"}
        </button>
      </div>
    </form>
  );
}
