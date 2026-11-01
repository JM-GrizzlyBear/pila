import type {
  CreateAccountInput,
  PublicUser,
  SetPasswordInput,
  UpdateAccountInput,
} from "@pila/shared";
import { request } from "./http";

// Admin → Accounts (the API only answers admins)

export async function fetchAccounts() {
  const data = await request<{ accounts: PublicUser[] }>("/api/admin/accounts");
  return data.accounts;
}

export async function createAccount(input: CreateAccountInput) {
  const data = await request<{ account: PublicUser }>(
    "/api/admin/accounts",
    "POST",
    input,
  );
  return data.account;
}

export async function updateAccount(id: string, input: UpdateAccountInput) {
  const data = await request<{ account: PublicUser }>(
    `/api/admin/accounts/${id}`,
    "PUT",
    input,
  );
  return data.account;
}

export async function setAccountPassword(id: string, input: SetPasswordInput) {
  await request<void>(`/api/admin/accounts/${id}/password`, "PUT", input);
}
