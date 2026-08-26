import { useEffect, useRef } from 'react'
import { useAppStatus } from '../../hooks/useApi'
import { MessageItem } from './MessageItem'
import type { ChatMessage } from '../../types'

interface Props {
  messages: ChatMessage[]
  onSuggestSection: (sec: string) => void
  onLicenseUpgrade: () => void
}

export function MessageList({ messages, onSuggestSection, onLicenseUpgrade }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const { data: appStatus } = useAppStatus()
  const appName = appStatus?.appName || 'your docs'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="messages" id="messages">
      {messages.length === 0 && (
        <div className="welcome" id="welcome">
          <div className="welcome-icon">📚</div>
          <h1 className="welcome-title">Ask anything about your docs</h1>
          <p className="welcome-subtitle">
            Full access to your documentation portal.<br />Conversations are remembered across sessions.
          </p>
        </div>
      )}
      {messages.map(msg => (
        <MessageItem
          key={msg.id}
          message={msg}
          onSuggestSection={onSuggestSection}
          onLicenseUpgrade={onLicenseUpgrade}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
