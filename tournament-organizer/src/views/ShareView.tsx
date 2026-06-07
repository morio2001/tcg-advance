import React, { useState } from 'react';
import type { Tournament } from '../types';
import { C } from '../theme';
import { STATUS_META } from '../theme';
import { champion, currentRound, maxRound, participant } from '../lib/bracket';
import { clock, hhmm, remainingMs } from '../lib/format';
import { useNow } from '../store';
import { Button, Card, Icon, ICONS } from '../components/ui';

type Audience = 'broadcast' | 'stage' | 'client';

const pname = (t: Tournament, id: string | null) => participant(t, id)?.name ?? '未定';

function buildSnapshot(t: Tournament, aud: Audience, now: number): string {
  const main = t.matches.filter((m) => m.bracket === 'main');
  const head = `【${t.name}】 ${hhmm(now)} 時点`;

  if (aud === 'broadcast') {
    const stream = t.matches.filter((m) => m.isStream);
    const lines = stream.map((m) => {
      const st = STATUS_META[m.status].label;
      const timer = m.status === 'live' || m.status === 'overtime' ? ` (残り${clock(remainingMs(m, now))})` : '';
      const pa = participant(t, m.slots[0].participantId);
      const pb = participant(t, m.slots[1].participantId);
      const score = m.status === 'done' && !m.isBye ? ` ${m.scoreA}-${m.scoreB}` : '';
      return `■ 卓${m.table ?? '-'} ${m.label} [${st}${timer}]\n  ${pa?.name ?? '未定'}（${pa?.deck ?? '?'}）${score} vs ${pb?.name ?? '未定'}（${pb?.deck ?? '?'}）${m.streamNote ? `\n  ※${m.streamNote}` : ''}`;
    });
    return `${head}\n— 配信卓 共有 —\n${lines.join('\n') || '（配信卓なし）'}`;
  }

  if (aud === 'stage') {
    const live = main.filter((m) => m.status === 'live' || m.status === 'overtime');
    const ready = main.filter((m) => m.status === 'ready');
    const fmt = (m: (typeof main)[number]) =>
      `・卓${m.table ?? '-'} ${m.label}: ${pname(t, m.slots[0].participantId)} vs ${pname(t, m.slots[1].participantId)}` +
      (m.startedAt ? ` (開始${hhmm(m.startedAt)} / 残り${clock(remainingMs(m, now))})` : '');
    return `${head}\n— 進行状況 —\n[進行中]\n${live.map(fmt).join('\n') || '（なし）'}\n[次の試合 / 待機]\n${ready.map(fmt).join('\n') || '（なし）'}`;
  }

  // client
  const mr = maxRound(t);
  const cur = currentRound(t);
  const realTotal = main.filter((m) => !m.isBye).length;
  const realDone = main.filter((m) => m.status === 'done' && !m.isBye).length;
  const progress = realTotal ? Math.round((realDone / realTotal) * 100) : 0;
  const champ = champion(t);
  const roundName = mr - cur === 0 ? '決勝' : mr - cur === 1 ? '準決勝' : mr - cur === 2 ? '準々決勝' : `${cur}回戦`;
  const recent = main
    .filter((m) => m.status === 'done' && !m.isBye)
    .slice(-5)
    .map((m) => `・${m.label}: ${pname(t, m.winner === 'a' ? m.slots[0].participantId : m.slots[1].participantId)} 勝利 (${m.scoreA}-${m.scoreB})`);
  return `${head}\n— 進捗サマリー —\n進捗: ${progress}%（${realDone}/${realTotal}試合 完了）\n現在: ${champ ? `終了・優勝 ${champ.name}` : roundName}\n[直近の結果]\n${recent.join('\n') || '（まだありません）'}`;
}

const TABS: { key: Audience; label: string }[] = [
  { key: 'broadcast', label: '配信向け' },
  { key: 'stage', label: 'ステージ進行向け' },
  { key: 'client', label: 'クライアント向け' },
];

export const ShareView: React.FC<{ t: Tournament }> = ({ t }) => {
  const now = useNow(5000);
  const [aud, setAud] = useState<Audience>('broadcast');
  const [copied, setCopied] = useState(false);
  const text = buildSnapshot(t, aud, now);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard may be unavailable */
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ fontSize: 13, color: C.textDim, marginBottom: 12 }}>
        共有先に合わせた要約テキストを生成します。Slack / LINE などにそのまま貼り付けられます。
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setAud(tab.key)}
            style={{
              padding: '7px 14px',
              borderRadius: 999,
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 700,
              border: `1px solid ${aud === tab.key ? C.accent : C.border}`,
              background: aud === tab.key ? 'rgba(0,224,224,0.12)' : 'transparent',
              color: aud === tab.key ? C.accent : C.textDim,
            }}
          >
            {tab.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <Button variant="primary" size="sm" onClick={copy}>
          <Icon d={ICONS.copy} size={12} /> {copied ? 'コピーしました' : 'コピー'}
        </Button>
      </div>
      <Card style={{ padding: 16 }}>
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 12.5, lineHeight: 1.6, color: C.text }}>
          {text}
        </pre>
      </Card>
    </div>
  );
};
