const LOCAL_DATABASE_HOSTS = new Set(["127.0.0.1", "::1", "localhost"]);
const SSL_ALIASES = new Set(["prefer", "require", "verify-ca"]);
const INSECURE_SSL_MODES = new Set(["allow", "disable", "no-verify"]);

export function getDatabaseUrl(
  connectionString = process.env.DATABASE_URL,
) {
  if (!connectionString) {
    throw new Error("DATABASE_URL is required.");
  }

  const url = new URL(connectionString);

  if (url.protocol !== "postgresql:" && url.protocol !== "postgres:") {
    throw new Error("DATABASE_URL must be a PostgreSQL connection string.");
  }

  const isLocal = LOCAL_DATABASE_HOSTS.has(url.hostname);
  const sslMode = url.searchParams.get("sslmode")?.toLowerCase();

  if (!isLocal && (!sslMode || SSL_ALIASES.has(sslMode))) {
    url.searchParams.set("sslmode", "verify-full");
  }

  const normalizedSslMode = url.searchParams.get("sslmode")?.toLowerCase();

  if (!isLocal && normalizedSslMode && INSECURE_SSL_MODES.has(normalizedSslMode)) {
    throw new Error("Remote PostgreSQL connections must verify TLS certificates.");
  }

  if (process.env.NODE_ENV === "production" && normalizedSslMode !== "verify-full") {
    throw new Error("Production PostgreSQL connections require sslmode=verify-full.");
  }

  return url.toString();
}
