"use client"

import { confirmSignUp, signUp } from "aws-amplify/auth"
import { useState } from "react"

export default function SignUp() {
  const [verificationCode, setVerificationCode] = useState('')
  const [isVerify, setIsVerify] = useState(false)
  const [email, setEmail] = useState('')
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const email = form.elements.email.value
    const password = form.elements.password.value
    setEmail(email)

    const { isSignUpComplete, userId, nextStep } = await signUp({
      username: email,
      password: password,
      options: {
        userAttributes: {
          email: email
        }
      }
    });

    if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
      setIsVerify(true)
    }
  }

  async function verifyCode() {
    const output = await confirmSignUp({
      username: email,
      confirmationCode: verificationCode
    });

    if (output.isSignUpComplete) {
      console.log('Sign up complete')
    }
  }
  return (
    <div>
      <h1>Sign Up</h1>

      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input type="email" id="email" name="email" />
        <label htmlFor="password">Password</label>
        <input type="password" id="password" name="password" />
        <button type="submit">Sign Up</button>
      </form>
      {isVerify && (
        <form>
          <label htmlFor="verificationCode">Verification Code</label>
          <input type="text" id="verificationCode" name="verificationCode" value={verificationCode} onChange={(event) => setVerificationCode(event.target.value)} />
          <button type="button" onClick={verifyCode}>Verify</button>
        </form>
      )}
    </div>
  )
}