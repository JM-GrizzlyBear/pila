import type {
  CreateAccountInput,
  PublicUser,
  SetPasswordInput,
  UpdateAccountInput,
} from "@pila/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAccount,
  fetchAccounts,
  setAccountPassword,
  updateAccount,
} from "../../infrastructure/api/accountsApi";
import { CURRENT_USER_KEY } from "../auth/useAuth";

const ACCOUNTS_KEY = ["accounts"] as const;

// Every account (admins only)
export function useAccounts() {
  return useQuery({
    queryKey: ACCOUNTS_KEY,
    queryFn: async () => await fetchAccounts(),
  });
}

// One account, from the same list
export function useAccount(id: string | undefined) {
  const accounts = useAccounts();
  return {
    ...accounts,
    data: accounts.data?.find((account) => account.id === id),
  };
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateAccountInput) => await createAccount(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY }),
  });
}

export function useUpdateAccount(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateAccountInput) =>
      await updateAccount(id, input),
    onSuccess: (account) => {
      // Editing your own name or email: the header shows the new one too
      const me = queryClient.getQueryData<PublicUser | null>(CURRENT_USER_KEY);
      if (me?.id === account.id)
        queryClient.setQueryData(CURRENT_USER_KEY, account);
      return queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY });
    },
  });
}

export function useSetAccountPassword(id: string) {
  return useMutation({
    mutationFn: async (input: SetPasswordInput) =>
      await setAccountPassword(id, input),
  });
}
