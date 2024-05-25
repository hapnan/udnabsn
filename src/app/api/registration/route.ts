"use server";

import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import type {
  AuthenticatorTransportFuture,
  CredentialDeviceType,
  Base64URLString,
  RegistrationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
} from "@simplewebauthn/types";
import { kv } from "@vercel/kv";
import { getPasskeys, getUserswithnim } from "@/action/action";

type UserModel = {
  id: number;
  nim: string;
  name: string;
  createdAt: Date;
};

/**
 * It is strongly advised that credentials get their own DB
 * table, ideally with a foreign key somewhere connecting it
 * to a specific UserModel.
 *
 * "SQL" tags below are suggestions for column data types and
 * how best to store data received during registration for use
 * in subsequent authentications.
 */
type Passkey = {
  // SQL: Store as `TEXT`. Index this column
  cread_id: Base64URLString;
  // SQL: Store raw bytes as `BYTEA`/`BLOB`/etc...
  //      Caution: Node ORM's may map this to a Buffer on retrieval,
  //      convert to Uint8Array as necessary
  publicKey: Uint8Array;
  // SQL: Foreign Key to an instance of your internal user model
  user: number;
  // SQL: Store as `TEXT`. Index this column. A UNIQUE constraint on
  //      (webAuthnUserID + user) also achieves maximum user privacy
  webauthnUserID: Base64URLString;
  // SQL: Consider `BIGINT` since some authenticators return atomic timestamps as counters
  counter: number;
  // SQL: `VARCHAR(32)` or similar, longest possible value is currently 12 characters
  // Ex: 'singleDevice' | 'multiDevice'
  deviceType: CredentialDeviceType;
  // SQL: `BOOL` or whatever similar type is supported
  backedUp: boolean;
  // SQL: `VARCHAR(255)` and store string array as a CSV string
  // Ex: ['ble' | 'cable' | 'hybrid' | 'internal' | 'nfc' | 'smart-card' | 'usb']
  transports?: AuthenticatorTransportFuture[];
};

/**
 * Human-readable title for your website
 */
const rpName = "Absensi Dinus";
/**
 * A unique identifier for your website. 'localhost' is okay for
 * local dev
 */
const rpID = "localhost";
/**
 * The URL at which registrations and authentications should occur.
 * 'http://localhost' and 'http://localhost:PORT' are also valid.
 * Do NOT include any trailing /
 */
const origin = `https://${rpID}`;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const params = searchParams.get("nim");

  if (!params) {
    Response.json("Params tidak ada", { status: 404 });
  }
  const { id, nim, name } = (await getUserswithnim(
    params!,
  )) as unknown as UserModel;
  const passkeys = (await getPasskeys(id)
    .catch((reason) => console.log(reason))
    .then((res) => {
      if (res) {
        return Object.keys(res);
      }
    })) as unknown as Passkey[];

  const username = `${nim}@${name}`;
  const options: PublicKeyCredentialCreationOptionsJSON =
    await generateRegistrationOptions({
      rpName,
      rpID,
      userName: username,
      // Don't prompt users for additional information about the authenticator
      // (Recommended for smoother UX)
      attestationType: "none",
      // todo: add when db ready for Prevent users from re-registering existing authenticators
      excludeCredentials: passkeys.map((passkey) => ({
        id: passkey.cread_id,
        // Optional
        transports: passkey.transports,
      })),
      // See "Guiding use of authenticators via authenticatorSelection" below
      authenticatorSelection: {
        // Defaults
        residentKey: "preferred",
        userVerification: "preferred",
        // Optional
        authenticatorAttachment: "cross-platform",
      },
    });
  try {
    await kv.hset(params!, { options });
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
    }
  }
  return Response.json({ options }, { status: 200 });
}

export async function POST(request: Request) {
  const data = (await request.json()) as unknown as RegistrationResponseJSON;
  const { searchParams } = new URL(request.url);
  const nim = searchParams.get("nim");

  if (!data && !nim) {
    return Response.json("Params dan body tidak ada", { status: 404 });
  }
  const { id } = (await getUserswithnim(nim!)) as unknown as UserModel;
  const currentOptions = await kv.hgetall(nim!);

  const option: PublicKeyCredentialCreationOptionsJSON =
    currentOptions as unknown as PublicKeyCredentialCreationOptionsJSON;

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: data,
      expectedChallenge: option.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return Response.json({ error });
    }
  }

  if (verification) {
    const { verified } = verification;
    const { registrationInfo } = verification;
    const {
      credentialID,
      credentialPublicKey,
      counter,
      credentialDeviceType,
      credentialBackedUp,
    } = registrationInfo!;

    const newPasskey: Passkey = {
      cread_id: credentialID,
      publicKey: credentialPublicKey,
      user: id,
      webauthnUserID: option.user.id,
      counter,
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
      transports: data.response.transports,
    };

    console.log(newPasskey);
    return Response.json({ verified });
  } else {
    return Response.json({ error: "Invalid response" });
  }
}
