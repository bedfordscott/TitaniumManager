import { Fido2Lib } from 'fido2-lib';
import * as u2fApi from 'u2f-api';

/**
 * Hardware authentication types supported by Titanium Manager
 */
export enum HardwareKeyType {
  YUBIKEY = 'yubikey',
  TPM = 'tpm',
  WEBAUTHN = 'webauthn'
}

/**
 * Interface for credential data returned from hardware keys
 */
export interface HardwareCredential {
  id: string;
  type: HardwareKeyType;
  publicKey?: string;
  counter?: number;
  createdAt: number;
}

/**
 * Interface for hardware authentication result
 */
export interface AuthResult {
  success: boolean;
  credential?: HardwareCredential;
  message?: string;
}

/**
 * Class that manages hardware security keys for authentication
 */
export class HardwareKeyManager {
  private fido2: Fido2Lib;
  
  constructor() {
    // Initialize FIDO2 library with secure defaults
    this.fido2 = new Fido2Lib({
      timeout: 60000, // 1 minute
      rpId: window.location.hostname || 'localhost',
      rpName: 'Titanium Manager',
      rpIcon: 'https://example.com/logo.png', // Should be replaced with actual logo
      challengeSize: 128,
      attestation: 'direct',
      cryptoParams: [-7, -257], // ECDSA with P-256 and RSA-PKCS1 with SHA-256
      authenticatorAttachment: 'cross-platform', // Support both platform and cross-platform authenticators
      authenticatorRequireResidentKey: false,
      authenticatorUserVerification: 'preferred'
    });
  }
  
  /**
   * Check if WebAuthn is supported in the current browser/environment
   */
  public isWebAuthnSupported(): boolean {
    return (
      window.PublicKeyCredential !== undefined &&
      typeof window.PublicKeyCredential === 'function'
    );
  }
  
  /**
   * Check if the U2F protocol is supported (for older YubiKeys)
   */
  public async isU2FSupported(): Promise<boolean> {
    try {
      return await u2fApi.isSupported();
    } catch (error) {
      console.error('Error checking U2F support:', error);
      return false;
    }
  }
  
  /**
   * Register a new hardware key (enrollment process)
   */
  public async registerHardwareKey(
    userId: string,
    username: string,
    keyType: HardwareKeyType
  ): Promise<HardwareCredential | null> {
    try {
      if (!this.isWebAuthnSupported()) {
        throw new Error('WebAuthn is not supported in this browser or environment');
      }
      
      // Create a registration challenge
      const registrationOptions = await this.fido2.attestationOptions();
      
      // Add user information
      registrationOptions.user = {
        id: this.stringToArrayBuffer(userId),
        name: username,
        displayName: username
      };
      
      // Encode challenge to base64url format for the browser
      registrationOptions.challenge = this.base64UrlToArrayBuffer(
        this.arrayBufferToBase64Url(registrationOptions.challenge)
      );
      
      // Create a credential with the authenticator
      const credential = await navigator.credentials.create({
        publicKey: registrationOptions as PublicKeyCredentialCreationOptions
      }) as PublicKeyCredential;
      
      if (!credential) {
        throw new Error('No credential returned from authenticator');
      }
      
      // Parse and validate the attestation
      const attestationResponse = credential.response as AuthenticatorAttestationResponse;
      
      // Get the base64url encoded challenge for verification
      const challengeBase64 = this.arrayBufferToBase64Url(registrationOptions.challenge);
      
      // Verify the attestation with the server - use `as any` to bypass type checking
      // In a real implementation, we'd use proper buffers instead of string conversions
      const attestationResult = {
        id: credential.id as any,
        rawId: credential.rawId as any,
        response: {
          clientDataJSON: attestationResponse.clientDataJSON as any,
          attestationObject: attestationResponse.attestationObject as any
        }
      };
      
      const result = await this.fido2.attestationResult(attestationResult, {
        challenge: challengeBase64,
        origin: window.location.origin,
        factor: 'either' // first or second factor
      });
      
      // Create a credential record to save
      return {
        id: credential.id,
        type: keyType,
        publicKey: result.authnrData.get('credentialPublicKeyPem'),
        counter: result.authnrData.get('counter'),
        createdAt: Date.now()
      };
    } catch (error) {
      console.error('Error registering hardware key:', error);
      return null;
    }
  }
  
  /**
   * Authenticate using a hardware key
   */
  public async authenticateWithHardwareKey(
    credentialIds: string[],
    keyType: HardwareKeyType
  ): Promise<AuthResult> {
    try {
      if (!this.isWebAuthnSupported()) {
        return {
          success: false,
          message: 'WebAuthn is not supported in this browser or environment'
        };
      }
      
      // Create an authentication challenge
      const authOptions = await this.fido2.assertionOptions();
      
      // Add allowed credential IDs
      authOptions.allowCredentials = credentialIds.map(id => ({
        type: 'public-key',
        id: this.base64UrlToArrayBuffer(id),
        transports: ['usb', 'nfc', 'ble', 'internal']
      }));
      
      // Get the base64url encoded challenge for verification
      const challengeBase64 = this.arrayBufferToBase64Url(authOptions.challenge);
      
      // Update the challenge to be in the correct format for the browser
      authOptions.challenge = this.base64UrlToArrayBuffer(challengeBase64);
      
      // Request the credential from the authenticator
      const credential = await navigator.credentials.get({
        publicKey: authOptions as PublicKeyCredentialRequestOptions
      }) as PublicKeyCredential;
      
      if (!credential) {
        return {
          success: false,
          message: 'No credential returned from authenticator'
        };
      }
      
      // Verify the assertion with the server
      const assertionResponse = credential.response as AuthenticatorAssertionResponse;
      
      // In a proper implementation we would retrieve these from storage
      const publicKey = ''; // Placeholder for stored public key
      const prevCounter = 0; // Placeholder for stored counter
      
      // Use `as any` to bypass type checking for the assertion result
      // In a real implementation, we'd use proper buffers instead of string conversions
      const assertionResult = {
        id: credential.id as any,
        rawId: credential.rawId as any,
        response: {
          clientDataJSON: assertionResponse.clientDataJSON as any,
          authenticatorData: assertionResponse.authenticatorData as any,
          signature: assertionResponse.signature as any,
          userHandle: assertionResponse.userHandle 
            ? (assertionResponse.userHandle as any)
            : undefined
        }
      };
      
      await this.fido2.assertionResult(assertionResult, {
        challenge: challengeBase64,
        origin: window.location.origin,
        factor: 'either',
        publicKey,
        prevCounter,
        userHandle: null
      });
      
      return {
        success: true,
        credential: {
          id: credential.id,
          type: keyType,
          createdAt: Date.now()
        }
      };
    } catch (error: unknown) {
      console.error('Error authenticating with hardware key:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: `Authentication failed: ${errorMessage}`
      };
    }
  }
  
  /**
   * Authenticate using TPM (Trusted Platform Module)
   * This is a placeholder for actual TPM integration
   */
  public async authenticateWithTPM(): Promise<AuthResult> {
    // In a real implementation, this would use platform-specific APIs
    // to interact with the TPM
    return {
      success: false,
      message: 'TPM authentication not yet implemented'
    };
  }
  
  /**
   * Helper methods for base64url and ArrayBuffer conversions
   */
  private arrayBufferToBase64Url(buffer: ArrayBuffer): string {
    const base64 = Buffer.from(new Uint8Array(buffer)).toString('base64');
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }
  
  private base64UrlToArrayBuffer(base64url: string): ArrayBuffer {
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const binary = Buffer.from(base64, 'base64');
    return new Uint8Array(binary).buffer;
  }
  
  private stringToArrayBuffer(str: string): ArrayBuffer {
    const buffer = Buffer.from(str, 'utf-8');
    return new Uint8Array(buffer).buffer;
  }
} 