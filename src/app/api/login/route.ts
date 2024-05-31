import { getPasskeys, getUserswithnim } from "@/action/action";
import {
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import type {
  AuthenticatorTransportFuture,
  CredentialDeviceType,
  Base64URLString,
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from "@simplewebauthn/types";
import { kv } from "@vercel/kv";

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
 * A unique identifier for your website. 'localhost' is okay for
 * local dev
 */
const rpID = "www.seseorang.com";
/**
 * The URL at which registrations and authentications should occur.
 * 'http://localhost' and 'http://localhost:PORT' are also valid.
 * Do NOT include any trailing /
 */
const origin = `https://${rpID}:3000`;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const params = searchParams.get("nim");

  if (!params) {
    return Response.json("Params tidak ada", { status: 404 });
  }
  const { id } = (await getUserswithnim(params)) as unknown as UserModel;

  if (!id) {
    return Response.json("User tidak ada", { status: 404 });
  }
  const passkeys = (await getPasskeys(id)
    .catch((reason) => console.log(reason))
    .then((res) => {
      if (res) {
        return Object.keys(res);
      }
    })) as unknown as Passkey[];

  const options: PublicKeyCredentialRequestOptionsJSON =
    await generateAuthenticationOptions({
      rpID,
      // Require users to use a previously-registered authenticator
      allowCredentials: passkeys.map((passkey) => ({
        id: passkey.cread_id,
        transports: passkey.transports,
      })),
    });

  try {
    await kv.hset(params, { options });
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
    }
  }
  return Response.json(options);
}

export async function POST(request: Request) {
  const body = request.json() as unknown as AuthenticationResponseJSON;
  const { searchParams } = new URL(request.url);
  const params = searchParams.get("nim");

  if (!body && !params) {
    return Response.json("Params dan body tidak ada", { status: 404 });
  }
  const { id, name } = (await getUserswithnim(params!)) as unknown as UserModel;
  const passkeys = (await getPasskeys(id, body.id).catch((reason) =>
    console.log(reason),
  )) as unknown as Passkey;

  const currentOptions = await kv.hgetall(params!);

  const option: PublicKeyCredentialCreationOptionsJSON =
    currentOptions as unknown as PublicKeyCredentialCreationOptionsJSON;

  if (!passkeys) {
    return Response.json(`Could not find passkey ${body.id} for user ${name}`, {
      status: 404,
    });
  }

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge: option.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      authenticator: {
        credentialID: passkeys.cread_id,
        credentialPublicKey: passkeys.publicKey,
        counter: passkeys.counter,
        transports: passkeys.transports,
      },
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error });
  }

  const { verified } = verification;
  return Response.json(verified);
}
