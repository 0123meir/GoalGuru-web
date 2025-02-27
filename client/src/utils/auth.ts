export function isValidToken(token: string | null) {
  if (!token) return false;

  // Example: Check if token has expired (assuming it's a JWT)
  const payload = JSON.parse(atob(token.split(".")[1])); // Decodes the JWT payload
  const expirationTime = payload.exp * 1000; // exp is in seconds, convert to milliseconds
  return expirationTime > Date.now();
}
