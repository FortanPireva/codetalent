import { OAuth2Client } from "google-auth-library";
import * as jose from "jose";

const googleClient = new OAuth2Client();

interface GooglePayload {
  email: string;
  name: string | undefined;
  sub: string;
}

interface ApplePayload {
  email: string;
  sub: string;
}

export async function verifyGoogleToken(idToken: string): Promise<GooglePayload> {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload?.email || !payload.sub) {
    throw new Error("Invalid Google token: missing email or sub");
  }

  return {
    email: payload.email,
    name: payload.name,
    sub: payload.sub,
  };
}

export async function verifyAppleToken(idToken: string): Promise<ApplePayload> {
  const JWKS = jose.createRemoteJWKSet(
    new URL("https://appleid.apple.com/auth/keys")
  );

  const { payload } = await jose.jwtVerify(idToken, JWKS, {
    issuer: "https://appleid.apple.com",
    audience: process.env.APPLE_BUNDLE_ID ?? "net.codeks.talentflow",
  });

  if (!payload.email || !payload.sub) {
    throw new Error("Invalid Apple token: missing email or sub");
  }

  return {
    email: payload.email as string,
    sub: payload.sub,
  };
}
