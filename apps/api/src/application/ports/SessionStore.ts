// The signed-in sessions, so a use case can sign someone out everywhere
// (their account was turned off, or an admin set a new password)
export interface SessionStore {
  endAllFor(userId: string): Promise<void>;
}
