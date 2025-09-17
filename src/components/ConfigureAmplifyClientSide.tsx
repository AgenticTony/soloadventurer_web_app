'use client'

import { Amplify } from 'aws-amplify'
import outputs from '../../amplify_outputs.json'

// Configure Amplify for client-side usage
Amplify.configure(outputs, { ssr: true })

export default function ConfigureAmplifyClientSide() {
  return null
}