import { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '../../store';
import type { ChatMessage, DiceRollEntry } from '../../types';
import GMDiceRoller from './GMDiceRoller';
import { diceTierColor } from '../../utils/diceColor';

type FeedItem =
  | { kind: 'roll'; ts: number; e: DiceRollEntry }
  | { kind: 'msg'; ts: number; m: ChatMessage };

const timeStr = (ts: number): string => {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export default function GMChat() {
  const diceLog = useStore((s) => s.diceLog);
  const chatLog = useStore((s) => s.chatLog);
  const sendChatMessage = useStore((s) => s.sendChatMessage);

  const [text, setText] = useState('');
  const logRef = useRef<HTMLDivElement>(null);

  const feed = useMemo<FeedItem[]>(() => {
    const items: FeedItem[] = [
      ...diceLog.map((e) => ({ kind: 'roll' as const, ts: e.timestamp, e })),
      ...chatLog.map((m) => ({ kind: 'msg' as const, ts: m.timestamp, m })),
    ];
    return items.sort((a, b) => a.ts - b.ts);
  }, [diceLog, chatLog]);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [feed.length]);

  function send() {
    const t = text.trim();
    if (!t) return;
    sendChatMessage(t);
    setText('');
  }

  return (
    <aside className="gm-chat">
      <div className="gm-chat-header">Chat da Campanha</div>

      <div className="gm-chat-log" ref={logRef}>
        {feed.length === 0 ? (
          <p className="roll-detail" style={{ textAlign: 'center', padding: '16px 0' }}>
            Sem mensagens ainda
          </p>
        ) : (
          feed.map((item) =>
            item.kind === 'roll' ? (
              <div key={item.e.id} className="gm-chat-row">
                <span className="gm-chat-time">{timeStr(item.ts)}</span>
                {item.e.hidden && (
                  <span style={{ color: 'var(--text2)', fontSize: 11, fontStyle: 'italic' }}>🔒 Rolagem oculta ·</span>
                )}
                <span className="gm-chat-sender">{item.e.rollerName}</span>
                <span style={{ color: 'var(--text2)' }}>{item.e.label}:</span>
                <span style={{ color: 'var(--text2)', fontSize: 11 }}>{item.e.breakdown}</span>
                <span style={{ color: 'var(--text2)' }}>=</span>
                <strong style={{ color: diceTierColor(item.e.diceSum, item.e.diceMax) }}>
                  {item.e.total}
                </strong>
              </div>
            ) : (
              <div key={item.m.id} className="gm-chat-row">
                <span className="gm-chat-time">{timeStr(item.ts)}</span>
                <span className="gm-chat-sender">{item.m.senderName}:</span>
                <span style={{ color: 'var(--text)', wordBreak: 'break-word' }}>{item.m.text}</span>
              </div>
            ),
          )
        )}
      </div>

      <div className="gm-chat-input">
        <input
          type="text"
          placeholder="Mensagem..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <button className="btn btn-secondary btn-sm" onClick={send}>
          Enviar
        </button>
      </div>

      <div className="gm-chat-roller">
        <GMDiceRoller />
      </div>
    </aside>
  );
}
