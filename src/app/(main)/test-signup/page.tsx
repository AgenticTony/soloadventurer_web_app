'use client'

import { useState } from 'react'
import { signUp } from 'aws-amplify/auth'
import { Amplify } from 'aws-amplify'
import outputs from '../../../../amplify_outputs.json'

// Configure Amplify
Amplify.configure(outputs)

export default function TestSignupPage() {
  const [result, setResult] = useState<string>('')
  const [error, setError] = useState<string>('')

  const testSignup = async () => {
    try {
      setError('')
      setResult('Testing signup...')
      
      // Try minimal signup first
      const testEmail = `test${Date.now()}@example.com`
      const response = await signUp({
        username: testEmail,
        password: 'TestPassword123!',
        options: {
          userAttributes: {
            email: testEmail
          }
        }
      })
      
      setResult(`Signup successful: ${JSON.stringify(response, null, 2)}`)
    } catch (err) {
      console.error('Signup error:', err)
      const error = err as Error & { code?: string }
      setError(`Error: ${error.message}\nCode: ${error.code || 'N/A'}\nFull error: ${JSON.stringify(error, null, 2)}`)
    }
  }

  const testSignupWithCustom = async () => {
    try {
      setError('')
      setResult('Testing signup with custom attributes...')
      
      // Try with custom attributes
      const testEmail = `test${Date.now()}@example.com`
      const response = await signUp({
        username: testEmail,
        password: 'TestPassword123!',
        options: {
          userAttributes: {
            email: testEmail,
            given_name: 'Test',
            family_name: 'User',
            'custom:bio': 'Test bio',
            'custom:location': 'Test location'
          }
        }
      })
      
      setResult(`Signup successful: ${JSON.stringify(response, null, 2)}`)
    } catch (err) {
      console.error('Signup error:', err)
      const error = err as Error & { code?: string }
      setError(`Error: ${error.message}\nCode: ${error.code || 'N/A'}\nFull error: ${JSON.stringify(error, null, 2)}`)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Test Signup Page</h1>
      
      <div className="space-y-4">
        <button
          onClick={testSignup}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Basic Signup
        </button>
        
        <button
          onClick={testSignupWithCustom}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Test Signup with Custom Attributes
        </button>
      </div>

      {result && (
        <div className="mt-6 p-4 bg-green-100 rounded">
          <h2 className="font-bold mb-2">Success:</h2>
          <pre className="whitespace-pre-wrap text-sm">{result}</pre>
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-100 rounded">
          <h2 className="font-bold mb-2">Error:</h2>
          <pre className="whitespace-pre-wrap text-sm text-red-600">{error}</pre>
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h2 className="font-bold mb-2">Configuration:</h2>
        <pre className="text-sm">
          {JSON.stringify({
            userPoolId: outputs.auth.user_pool_id,
            region: outputs.auth.aws_region,
            clientId: outputs.auth.user_pool_client_id
          }, null, 2)}
        </pre>
      </div>
    </div>
  )
}