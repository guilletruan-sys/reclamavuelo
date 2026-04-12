import { tokens } from '../../lib/theme';

export default function TypingIndicator() {
  return (
    <div
      className="fade-in"
      style={{
        display: 'flex', alignItems: 'center', gap: 4,
        background: tokens.chatBgBot,
        borderRadius: tokens.chatBubbleRadius,
        borderBottomLeftRadius: 4,
        padding: '14px 18px',
        alignSelf: 'flex-start',
        maxWidth: 80,
      }}
      aria-label="El asesor está escribiendo"
    >
      <span className="typing-dot" style={dot} />
      <span className="typing-dot" style={dot} />
      <span className="typing-dot" style={dot} />
    </div>
  );
}

const dot = {
  display: 'inline-block',
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: tokens.slate400,
};
