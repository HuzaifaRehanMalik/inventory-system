// Shared password policy used by both the server (zod) and client resolvers.
// Keep this file free of server-only imports so it can ship to the browser.

export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 128;

// Base words that appear at the core of the most commonly breached passwords.
// A password is rejected when, after removing decoration (digits, symbols,
// leetspeak substitutions), nothing but one of these words is left. This
// catches "Password123!", "P@ssw0rd2024!", "Qwerty123456!", "Welcome2025!!".
const COMMON_PASSWORD_CORES = new Set([
  "",
  "a",
  "aa",
  "aaa",
  "aaaa",
  "ab",
  "abc",
  "abcd",
  "abcde",
  "abcdef",
  "abcdefg",
  "abcdefgh",
  "abcabc",
  "q",
  "qw",
  "qwe",
  "qwer",
  "qwert",
  "qwerty",
  "qwertz",
  "qwertyu",
  "qwertyui",
  "qwertyuiop",
  "azerty",
  "asdf",
  "asdfg",
  "asdfgh",
  "asdfghjkl",
  "zxcv",
  "zxcvb",
  "zxcvbn",
  "zxcvbnm",
  "qaz",
  "qazwsx",
  "qazwsxedc",
  "qazwsxedcrfv",
  "wsx",
  "zaq",
  "zaqxsw",
  "zaqwsx",
  "pass",
  "passw",
  "passwd",
  "passwor",
  "password",
  "passwort",
  "passpass",
  "passwordpassword",
  "mypassword",
  "newpassword",
  "secret",
  "topsecret",
  "letmein",
  "welcome",
  "welcomeback",
  "hello",
  "helloworld",
  "hi",
  "admin",
  "administrator",
  "root",
  "toor",
  "login",
  "user",
  "username",
  "guest",
  "test",
  "tester",
  "testing",
  "demo",
  "default",
  "changeme",
  "access",
  "master",
  "iloveyou",
  "loveyou",
  "love",
  "lovely",
  "monkey",
  "dragon",
  "sunshine",
  "princess",
  "shadow",
  "superman",
  "batman",
  "spiderman",
  "starwars",
  "pokemon",
  "football",
  "baseball",
  "basketball",
  "soccer",
  "hockey",
  "liverpool",
  "chelsea",
  "arsenal",
  "trustno",
  "whatever",
  "freedom",
  "mustang",
  "ferrari",
  "michael",
  "jordan",
  "charlie",
  "jessica",
  "ashley",
  "daniel",
  "thomas",
  "computer",
  "internet",
  "samsung",
  "google",
  "apple",
  "iphone",
  "microsoft",
  "windows",
  "summer",
  "winter",
  "spring",
  "autumn",
  "fall",
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
  "monday",
  "friday",
  "pakistan",
  "india",
  "america",
  "london",
  "killer",
  "hunter",
  "ninja",
  "matrix",
  "cheese",
  "chocolate",
  "cookie",
  "flower",
  "money",
  "company",
  "business",
  "office",
  "work",
  "inventory",
  "stock",
  "stockeyfy",
  "correcthorsebatterystaple",
  "correcthorse",
]);

const LEET_SUBSTITUTIONS: Record<string, string> = {
  "@": "a",
  "4": "a",
  "8": "b",
  "(": "c",
  "3": "e",
  "6": "g",
  "9": "g",
  "#": "h",
  "1": "i",
  "!": "i",
  "|": "l",
  "0": "o",
  "$": "s",
  "5": "s",
  "7": "t",
  "+": "t",
  "2": "z",
};

function passwordCores(password: string) {
  const lower = password.toLowerCase();
  const lettersOnly = lower.replace(/[^a-z]/g, "");
  // Strip leading/trailing decoration ("!1" + word + "2024!"), undo leetspeak
  // inside the word, then drop anything that is still not a letter.
  const trimmed = lower.replace(/^[^a-z]+/, "").replace(/[^a-z]+$/, "");
  const deLeeted = Array.from(trimmed)
    .map((character) => LEET_SUBSTITUTIONS[character] ?? character)
    .join("")
    .replace(/[^a-z]/g, "");

  return [lettersOnly, deLeeted];
}

export function isCommonPassword(password: string) {
  return passwordCores(password).some((core) => {
    if (COMMON_PASSWORD_CORES.has(core)) {
      return true;
    }

    // Repeated common words: "passwordpassword", "qwertyqwerty".
    for (let size = 1; size <= core.length / 2; size += 1) {
      if (core.length % size === 0) {
        const unit = core.slice(0, size);

        if (
          unit.repeat(core.length / size) === core &&
          COMMON_PASSWORD_CORES.has(unit)
        ) {
          return true;
        }
      }
    }

    return false;
  });
}

export type PasswordRule = {
  label: string;
  message: string;
  test: (password: string) => boolean;
};

export const PASSWORD_RULES: PasswordRule[] = [
  {
    label: `${PASSWORD_MIN_LENGTH}+ characters`,
    message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`,
    test: (password) => password.length >= PASSWORD_MIN_LENGTH,
  },
  {
    label: "Upper & lowercase",
    message: "Include at least one uppercase and one lowercase letter.",
    test: (password) => /[a-z]/.test(password) && /[A-Z]/.test(password),
  },
  {
    label: "Number",
    message: "Include at least one number.",
    test: (password) => /[0-9]/.test(password),
  },
  {
    label: "Special character",
    message: "Include at least one special character.",
    test: (password) => /[^A-Za-z0-9]/.test(password),
  },
  {
    label: "Not a common password",
    message:
      "This password is too common or easy to guess. Choose something less predictable.",
    test: (password) => password.length > 0 && !isCommonPassword(password),
  },
];

export function getPasswordPolicyError(password: string): string | undefined {
  if (password.length > PASSWORD_MAX_LENGTH) {
    return `Password must be at most ${PASSWORD_MAX_LENGTH} characters.`;
  }

  return PASSWORD_RULES.find((rule) => !rule.test(password))?.message;
}
