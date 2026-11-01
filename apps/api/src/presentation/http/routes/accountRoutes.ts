import {
  createAccountSchema,
  setPasswordSchema,
  updateAccountSchema,
} from "@pila/shared";
import { Router, type RequestHandler } from "express";
import type { CreateAccount } from "../../../application/account/CreateAccount.js";
import type { ListAccounts } from "../../../application/account/ListAccounts.js";
import type { SetAccountPassword } from "../../../application/account/SetAccountPassword.js";
import type { UpdateAccount } from "../../../application/account/UpdateAccount.js";
import { currentUserId } from "../middleware/requireAuth.js";
import { parseAccountId } from "../parseId.js";
import { userJson } from "../toJson.js";

// Admin → Accounts. Every route here is for admins only.
export function accountRoutes(deps: {
  requireAdmin: RequestHandler;
  listAccounts: ListAccounts;
  createAccount: CreateAccount;
  updateAccount: UpdateAccount;
  setAccountPassword: SetAccountPassword;
}) {
  const router = Router();
  router.use("/admin/accounts", deps.requireAdmin);

  router.get("/admin/accounts", async (_req, res) => {
    const accounts = await deps.listAccounts.execute();
    res.json({ accounts: accounts.map(userJson) });
  });

  router.post("/admin/accounts", async (req, res) => {
    const input = createAccountSchema.parse(req.body);
    const account = await deps.createAccount.execute(input);
    res.status(201).json({ account: userJson(account) });
  });

  router.put("/admin/accounts/:id", async (req, res) => {
    const input = updateAccountSchema.parse(req.body);
    const account = await deps.updateAccount.execute(
      currentUserId(req),
      parseAccountId(req.params.id),
      input,
    );
    res.json({ account: userJson(account) });
  });

  router.put("/admin/accounts/:id/password", async (req, res) => {
    const { password } = setPasswordSchema.parse(req.body);
    await deps.setAccountPassword.execute(
      currentUserId(req),
      parseAccountId(req.params.id),
      password,
    );
    res.status(204).end();
  });

  return router;
}
