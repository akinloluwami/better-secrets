import { validateSession } from "./auth";

export async function getAuthenticatedUser(request: Request) {
  const cookies = request.headers.get("cookie") ?? "";
  const sessionId = cookies
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("session="))
    ?.split("=")[1];

  if (!sessionId) return null;
  return validateSession(sessionId);
}
