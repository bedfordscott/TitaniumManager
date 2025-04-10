// Type definitions for WebAuthn and Fido2Lib

import * as fido2 from 'fido2-lib';

declare module 'fido2-lib' {
  interface AttestationResult {
    id?: string | ArrayBuffer;
    rawId?: string | ArrayBuffer;
    response?: {
      clientDataJSON?: string | ArrayBuffer;
      attestationObject?: string | ArrayBuffer;
    };
  }

  interface AssertionResult {
    id?: string | ArrayBuffer;
    rawId?: string | ArrayBuffer;
    response?: {
      clientDataJSON?: string | ArrayBuffer;
      authenticatorData?: string | ArrayBuffer;
      signature?: string | ArrayBuffer;
      userHandle?: string | ArrayBuffer | undefined | null;
    };
  }
} 