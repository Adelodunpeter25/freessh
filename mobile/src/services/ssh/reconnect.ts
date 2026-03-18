export class ReconnectManager {
  private reconnectAttempts = 0
  private maxAttempts = 5
  private baseDelay = 1000
  private maxDelay = 30000
  private reconnectTimer: NodeJS.Timeout | null = null

  constructor(
    private onReconnect: () => Promise<void>,
    private onMaxAttemptsReached?: () => void
  ) {}

  async attemptReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxAttempts) {
      console.log('❌ Max reconnect attempts reached')
      this.onMaxAttemptsReached?.()
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(
      this.baseDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.maxDelay
    )

    console.log(`🔄 Reconnect attempt ${this.reconnectAttempts}/${this.maxAttempts} in ${delay}ms`)

    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.onReconnect()
        this.reset()
        console.log('✅ Reconnected successfully')
      } catch (error) {
        console.error('❌ Reconnect failed:', error)
        this.attemptReconnect()
      }
    }, delay)
  }

  reset(): void {
    this.reconnectAttempts = 0
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  stop(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.reconnectAttempts = 0
  }
}
