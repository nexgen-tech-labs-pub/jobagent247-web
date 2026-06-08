'use client'

import { useEffect, useRef } from 'react'
import { initializePaddle, type Paddle } from '@paddle/paddle-js'

let paddleInstance: Paddle | undefined

export function usePaddleCheckout() {
  const initialized = useRef(false)

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN
    if (!token || initialized.current) return
    initialized.current = true

    initializePaddle({
      environment: (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT ?? 'sandbox') as 'sandbox' | 'production',
      token,
    }).then((paddle) => {
      paddleInstance = paddle
    })
  }, [])

  return {
    openCheckout: (transactionId: string) => {
      paddleInstance?.Checkout.open({ transactionId })
    },
  }
}
