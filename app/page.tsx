"use client"

import { useEffect, useState, type FormEvent } from "react"
// import { Amplify } from "aws-amplify"
import { signIn, getCurrentUser, signOut, setUpTOTP, verifyTOTPSetup, updateMFAPreference, confirmSignIn, fetchAuthSession } from "aws-amplify/auth"
import outputs from "../amplify_outputs.json"
import { QRCodeSVG } from "qrcode.react"

// Amplify.configure(outputs)

interface SignInFormElements extends HTMLFormControlsCollection {
  email: HTMLInputElement
  password: HTMLInputElement
}

interface SignInForm extends HTMLFormElement {
  readonly elements: SignInFormElements
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isTOTPQRCodeVisible, setIsTOTPQRCodeVisible] = useState(false);
  const [totpSetupUri, setTOTPSetupUri] = useState<URL | null>(null);
  const [totpCode, setTOTPCode] = useState('');

  const [requestTOTPOnLogin, setRequestTOTPOnLogin] = useState(false);
  useEffect(() => {
    async function checkUser() {
      const user = await getCurrentUser()
      const session = await fetchAuthSession();
      console.log(session.tokens?.accessToken.toString())
      if (user && user.userId) {
        setIsLoggedIn(true)
      }
    }
    checkUser()
  }, []);
  async function handleSubmit(event: FormEvent<SignInForm>) {
    event.preventDefault()
    const form = event.currentTarget
    // ... validate inputs
    const output = await signIn({
      username: form.elements.email.value,
      password: form.elements.password.value,
    });

    console.log(output)

    switch (output.nextStep.signInStep) {
      case 'CONTINUE_SIGN_IN_WITH_TOTP_SETUP':
        const totpSetupDetails = output.nextStep.totpSetupDetails;
        const appName = 'my_app_name';
        const setupUri = totpSetupDetails.getSetupUri(appName);
        console.log(totpSetupDetails)
        console.log(setupUri)
        break;
      case 'CONFIRM_SIGN_IN_WITH_TOTP_CODE':
        console.log('enabled')
        setRequestTOTPOnLogin(true);
        break;
      case 'DONE':
        setIsLoggedIn(true);
        // handle sign in completion
        break;
      default:
        break;
    }
  }

  async function logOut() {
    await signOut()
    setIsLoggedIn(false)
  }

  async function verifyTOTPOnLogin() {
    const output = await confirmSignIn({ challengeResponse: totpCode });
    if (output.isSignedIn) {
      setRequestTOTPOnLogin(false);
      setIsLoggedIn(true);
      setTOTPCode('');

    }
  }

  async function enableTOTP() {
    const totpSetupDetails = await setUpTOTP();
    const appName = 'my_app_name';
    const setupUri = totpSetupDetails.getSetupUri(appName);
    setTOTPSetupUri(setupUri);
  }

  async function verifyTOTPCodeSetup() {
    await verifyTOTPSetup({ code: totpCode });
    await updateMFAPreference({ totp: "ENABLED" });
    console.log('TOTP enabled')
    setTOTPSetupUri(null);
    setTOTPCode('');
  }

  return (
    <div>
      {isLoggedIn ? (
        <div>
          <p>Welcome!</p>
          <button onClick={logOut}>Sign Out</button>
          <button onClick={enableTOTP}>Enable TOTP</button>
          {totpSetupUri && (
            <div>
              <p>Scan the QR code below with your authenticator app:</p>
              <QRCodeSVG value={totpSetupUri.toString()} />
              <input type="number" value={totpCode} onChange={e => {
                setTOTPCode(e.target.value)
              }} placeholder="Enter the verification code" />
              <button onClick={verifyTOTPCodeSetup}>Verify</button>
            </div>
          )}
        </div>
      ) : (
        requestTOTPOnLogin ? (
          <div>
            <p>Enter OTP</p>
            <input type="number" value={totpCode} onChange={e => {
              setTOTPCode(e.target.value)
            }} placeholder="Enter the verification code" />
            <button onClick={verifyTOTPOnLogin}>Verify</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Email:</label>
            <input type="text" id="email" name="email" />
            <label htmlFor="password">Password:</label>
            <input type="password" id="password" name="password" />
            <input type="submit" />
          </form>
        )
      )}
    </div>
  )
}