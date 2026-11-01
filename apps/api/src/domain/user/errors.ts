export class UsernameTakenError extends Error {
  constructor() {
    super("That username is taken");
    this.name = "UsernameTakenError";
  }
}

export class EmailTakenError extends Error {
  constructor() {
    super("That email already has an account");
    this.name = "EmailTakenError";
  }
}

// The same message for an unknown user and a wrong password,
// so nobody can find out which usernames exist
export class InvalidCredentialsError extends Error {
  constructor() {
    super("Wrong username, email or password");
    this.name = "InvalidCredentialsError";
  }
}

// Only said after the right password, so it doesn't reveal which accounts exist
export class AccountTurnedOffError extends Error {
  constructor() {
    super("This account is turned off. Please ask an admin.");
    this.name = "AccountTurnedOffError";
  }
}

export class NotLoggedInError extends Error {
  constructor() {
    super("Please sign in");
    this.name = "NotLoggedInError";
  }
}

export class NotAllowedError extends Error {
  constructor() {
    super("Only admins can do that");
    this.name = "NotAllowedError";
  }
}

export class AccountNotFoundError extends Error {
  constructor() {
    super("That account doesn't exist");
    this.name = "AccountNotFoundError";
  }
}

// So an admin can't lock themselves out by accident
export class OwnAccessError extends Error {
  constructor() {
    super(
      "You can't change your own role, turn off your own account or set your own password here. Ask another admin.",
    );
    this.name = "OwnAccessError";
  }
}

export class LastAdminError extends Error {
  constructor() {
    super("Pila needs at least one admin who can sign in.");
    this.name = "LastAdminError";
  }
}
