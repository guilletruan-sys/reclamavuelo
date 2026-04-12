import { tokens } from '../../lib/theme';

// role: 'bot' | 'user' | 'system'
export default function Message({ role = 'bot', children, avatar, compact = false }) {
  const isUser = role === 'user';
  const isSystem = role === 'system';

  if (isSystem) {
    return (
      <div className="fade-in" style={{
        alignSelf: 'center',
        background: tokens.slate50,
        border: `1px solid ${tokens.slate200}`,
        borderRadius: tokens.r2,
        padding: `${tokens.s3}px ${tokens.s4}px`,
        fontSize: 13,
        color: tokens.slate500,
        maxWidth: 520,
        textAlign: 'center',
      }}>
        {children}
      </div>
    );
  }

  return (
    <div
      className="fade-in"
      style={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
        gap: tokens.s2,
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '85%',
      }}
    >
      {!isUser && avatar && (
        <div style={{
          width: 32, height: 32, borderRadius: tokens.rPill,
          background: tokens.navy900, color: tokens.white,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, flexShrink: 0,
          boxShadow: tokens.shadowSm,
        }}>
          {avatar}
        </div>
      )}
      <div style={{
        background: isUser ? tokens.chatBgUser : tokens.chatBgBot,
        color: isUser ? tokens.white : tokens.navy900,
        borderRadius: tokens.chatBubbleRadius,
        borderBottomLeftRadius: isUser ? tokens.chatBubbleRadius : 4,
        borderBottomRightRadius: isUser ? 4 : tokens.chatBubbleRadius,
        padding: compact ? '8px 14px' : '12px 16px',
        fontSize: 15,
        lineHeight: 1.5,
        boxShadow: isUser ? `0 4px 12px ${tokens.chatBgUser}33` : 'none',
        wordBreak: 'break-word',
      }}>
        {children}
      </div>
    </div>
  );
}
