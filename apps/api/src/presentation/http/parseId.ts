import { z } from "zod";
import { AccountNotFoundError } from "../../domain/user/errors.js";

const uuid = z.uuid();

// An account id from the URL. Anything that isn't a valid id simply doesn't exist (404).
export function parseAccountId(value: string | string[] | undefined) {
  const parsed = uuid.safeParse(value);
  if (!parsed.success) throw new AccountNotFoundError();
  return parsed.data;
}
