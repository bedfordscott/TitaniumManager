# Titanium Manager

Titanium Manager is a secure, open-source password manager with hardware key integration. It focuses on strong encryption, usability, and transparency.

## Features

- **Strong Encryption**: Uses AES-GCM for authenticated encryption and Argon2id for key derivation
- **Hardware Security Integration**: Support for YubiKey, WebAuthn/FIDO2, and TPM
- **Cross-Platform**: Built with Electron to run on Windows, macOS, and Linux
- **Zero Knowledge**: All encryption happens locally on your device
- **Data Security**: Memory protection and secure deletion of sensitive data
- **Intuitive UI**: Clean, modern interface focused on simplicity
- **Open Source**: Fully transparent codebase that can be audited

## Security Features

- AES-GCM 256-bit encryption for the password vault
- Argon2id memory-hard key derivation function (winner of the Password Hashing Competition)
- WebAuthn/FIDO2 support for hardware key authentication
- Secure vault format with authentication tag to detect tampering
- Protection against memory scraping attacks
- Content Security Policy to mitigate XSS attacks
- Sandboxed renderer process for improved security

## Prerequisites

- Node.js 16 or later
- npm or yarn
- For hardware key functionality: compatible security keys (YubiKey, Titan Security Key, etc.)

## Development Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/titanium-manager.git
   cd titanium-manager
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Build the TypeScript files:
   ```
   npm run build
   ```

4. Start the development server:
   ```
   npm run dev
   ```

## Building for Production

To build for production:

```
npm run package
```

This will create distributables for your current platform in the `release` directory.

## Architecture

Titanium Manager uses a multi-layer architecture:

1. **UI Layer**: React-based interface in the renderer process
2. **Application Layer**: Manages the application state and business logic
3. **Crypto Layer**: Handles all cryptographic operations
4. **Storage Layer**: Manages secure storage of the encrypted vault
5. **Hardware Authentication Layer**: Integrates with hardware security devices

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## Security Audits

This project aims to undergo regular security audits. If you find a security vulnerability, please report it responsibly by emailing security@example.com.

## License

[MIT](LICENSE)

## Acknowledgements

- The Argon2 and AES-GCM implementations
- FIDO Alliance for WebAuthn standards
- Electron team for the application framework
- React team for the UI framework

## Disclaimer

While Titanium Manager is designed to be secure, no security system is perfect. Always maintain backups of your vault and use strong, unique master passwords. 