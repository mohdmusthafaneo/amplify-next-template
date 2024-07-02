"use client"
import { Amplify } from "aws-amplify";
import outputs from '../../amplify_outputs_v2.json';
import { useEffect } from "react";

// Amplify.configure(outputs);

export default function AmplifyInitializer() {
  useEffect(() => {
    Amplify.configure(outputs);
  }, [])
  return null;
}