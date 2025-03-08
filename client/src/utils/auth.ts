export function isValidToken(token: string | null) {
  if (!token) return false;
    try{
        const payload = JSON.parse(atob(token.split(".")[1]));
        const expirationTime = payload.exp * 1000;
        return expirationTime > Date.now();
    }
    catch (err: unknown) {
        console.log(err)
        return false;
    }
}
