import { AUTH_LIMITS, type Role } from "@pila/shared";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { useCreateAccount } from "../../../application/accounts/useAccounts";
import { ErrorAlert } from "../../components/ui/ErrorAlert";
import { SelectField } from "../../components/ui/SelectField";
import { TextField } from "../../components/ui/TextField";
import { buttonPrimary, buttonSecondary } from "../../components/ui/styles";
import { errorMessage, fieldError } from "../../format/errorMessage";
import { ROLE_OPTIONS } from "../../format/names";

// Admin → Accounts → Add account
export function NewAccountPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("staff");
  const [password, setPassword] = useState("");
  const create = useCreateAccount();
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      await create.mutateAsync({
        firstName,
        lastName,
        username,
        email,
        role,
        password,
      });
      navigate("/admin/accounts");
    } catch {
      // Shown below from create.error
    }
  }

  const error = (field: string) => fieldError(create.error, field);

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      <div className="flex flex-col gap-1">
        <Link
          to="/admin/accounts"
          className="text-sm font-semibold text-brand underline"
        >
          ← Accounts
        </Link>
        <h1 className="text-3xl font-bold">Add account</h1>
        <p className="text-muted">
          Give the person their username and first password. They sign in with
          either their username or their email.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 rounded-2xl border border-edge bg-white p-6"
      >
        {create.isError && <ErrorAlert message={errorMessage(create.error)} />}
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
          label="Username"
          value={username}
          onChange={setUsername}
          autoComplete="off"
          maxLength={AUTH_LIMITS.usernameMax}
          required
          error={error("username")}
        />
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="off"
          required
          error={error("email")}
        />
        <SelectField
          label="Role"
          value={role}
          onChange={setRole}
          options={ROLE_OPTIONS}
          hint="Staff work the counters. Admins can also set up the place and manage accounts."
          error={error("role")}
        />
        <TextField
          label="First password"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          minLength={AUTH_LIMITS.passwordMin}
          maxLength={AUTH_LIMITS.passwordMax}
          required
          error={error("password")}
        />
        <div className="flex flex-wrap justify-end gap-3">
          <Link to="/admin/accounts" className={buttonSecondary}>
            Cancel
          </Link>
          <button
            type="submit"
            disabled={create.isPending}
            className={buttonPrimary}
          >
            {create.isPending ? "Adding…" : "Add account"}
          </button>
        </div>
      </form>
    </main>
  );
}
