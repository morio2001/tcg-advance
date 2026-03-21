import React, { useState } from 'react';
import type { TcgEvent, BattleResult, RoundResult } from '../types';
import { OPPONENTS } from '../data/mockData';
import { IconBack, IconSwords, IconAlert } from '../components/Icons';
import { Tag } from '../components/Shared';

interface Props {
  event: TcgEvent | null;
  goBack: () => void;
}

type Phase = 'waiting' | 'matching' | 'matched' | 'battling' | 'result-entry' | 'round-complete' | 'tournament-end';
type PageTab = 'battle' | 'standing';

const MOCK_STANDINGS = [
  { rank: 1, name: 'カスミ',   initial: 'カ', color: '#4080d0', wins: 3, losses: 0, resistance: 72.5 },
  { rank: 2, name: 'タケシ',   initial: 'タ', color: '#c04040', wins: 3, losses: 0, resistance: 68.1 },
  { rank: 3, name: 'イブキ',   initial: 'イ', color: '#4060c0', wins: 2, losses: 1, resistance: 65.3 },
  { rank: 4, name: 'シロ',     initial: 'シ', color: '#00a0a0', wins: 2, losses: 1, resistance: 63.7, isMe: true },
  { rank: 5, name: 'ヒカリ',   initial: 'ヒ', color: '#9040b0', wins: 2, losses: 1, resistance: 58.4 },
  { rank: 6, name: 'コトネ',   initial: 'コ', color: '#b06020', wins: 1, losses: 2, resistance: 55.0 },
  { rank: 7, name: 'シゲル',   initial: 'シ', color: '#40a040', wins: 1, losses: 2, resistance: 51.2 },
  { rank: 8, name: 'マサト',   initial: 'マ', color: '#206080', wins: 0, losses: 3, resistance: 44.8 },
];

const resultLabel = (r: BattleResult) => r === 'win' ? '勝ち' : r === 'lose' ? '負け' : '引き分け';
const resultColor = (r: BattleResult) => r === 'win' ? '#00c878' : r === 'lose' ? '#ff5050' : '#ffc800';

export const TournamentPage: React.FC<Props> = ({ event, goBack }) => {
  const [phase, setPhase] = useState<Phase>('waiting');
  const [round, setRound] = useState(1);
  const [opponent, setOpponent] = useState<{ name: string; table: string } | null>(null);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<BattleResult | null>(null);
  const [wasFirst, setWasFirst] = useState<boolean | null>(null);
  const totalRounds = 4;

  if (!event) return null;

  const doMatch = () => {
    setPhase('matching');
    setTimeout(() => {
      setOpponent(OPPONENTS[(round - 1) % OPPONENTS.length]);
      setPhase('matched');
    }, 1500);
  };

  const submitResult = () => {
    if (selectedResult === null || wasFirst === null) return;
    setResults(prev => [...prev, { round, opponent: opponent!.name, result: selectedResult, first: wasFirst }]);
    setPhase(round >= totalRounds ? 'tournament-end' : 'round-complete');
  };

  const nextRound = () => {
    setRound(r => r + 1);
    setOpponent(null);
    setSelectedResult(null);
    setWasFirst(null);
    setPhase('waiting');
  };

  const [pageTab, setPageTab] = useState<PageTab>('battle');
  const wins = results.filter(r => r.result === 'win').length;
  const losses = results.filter(r => r.result === 'lose').length;
  const draws = results.filter(r => r.result === 'draw').length;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px' }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', color: '#00e0e0', cursor: 'pointer', padding: '4px' }}><IconBack /></button>
        <span style={{ fontSize: '16px', fontWeight: 700, flex: 1 }}>大会進行</span>
        <Tag color="orange">LIVE</Tag>
      </div>

      {/* Page tabs */}
      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '4px' }}>
        {([['battle', '⚔️ 対戦'], ['standing', '📋 スタンディング']] as const).map(([val, label]) => (
          <button key={val} onClick={() => setPageTab(val)} style={{
            flex: 1, padding: '10px', border: 'none', cursor: 'pointer',
            background: 'none', fontFamily: 'inherit',
            color: pageTab === val ? '#00e0e0' : '#445566',
            fontSize: '12px', fontWeight: 700,
            borderBottom: pageTab === val ? '2px solid #00e0e0' : '2px solid transparent',
            transition: 'all 0.2s',
          }}>{label}</button>
        ))}
      </div>

      {/* Standings tab */}
      {pageTab === 'standing' && (
        <div style={{ padding: '12px 16px' }}>
          <div style={{ fontSize: '11px', color: '#445566', marginBottom: '10px' }}>ラウンド{Math.min(results.length + 1, 4)} 終了時点 · {MOCK_STANDINGS.length}名参加</div>
          {/* Header */}
          <div style={{ display: 'flex', padding: '4px 10px', marginBottom: '4px' }}>
            <span style={{ width: '28px', fontSize: '9px', color: '#334455' }}>#</span>
            <span style={{ flex: 1, fontSize: '9px', color: '#334455' }}>プレイヤー</span>
            <span style={{ width: '32px', textAlign: 'center', fontSize: '9px', color: '#334455' }}>勝</span>
            <span style={{ width: '32px', textAlign: 'center', fontSize: '9px', color: '#334455' }}>負</span>
            <span style={{ width: '44px', textAlign: 'right', fontSize: '9px', color: '#334455' }}>抵抗値</span>
          </div>
          {MOCK_STANDINGS.map(p => (
            <div key={p.rank} style={{
              display: 'flex', alignItems: 'center',
              padding: '8px 10px', marginBottom: '4px', borderRadius: '10px',
              background: p.isMe ? 'rgba(0,224,224,0.07)' : 'rgba(255,255,255,0.03)',
              border: p.isMe ? '1px solid rgba(0,224,224,0.2)' : '1px solid rgba(255,255,255,0.05)',
            }}>
              <span style={{ width: '28px', fontSize: '12px', fontWeight: 700, color: p.rank <= 4 ? '#ffc800' : '#445566' }}>{p.rank}</span>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>{p.initial}</div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: p.isMe ? '#00e0e0' : '#d0d8e0' }}>
                  {p.name}{p.isMe && <span style={{ fontSize: '9px', color: '#00e0e0', marginLeft: '4px' }}>YOU</span>}
                </span>
              </div>
              <span style={{ width: '32px', textAlign: 'center', fontSize: '13px', fontWeight: 800, color: '#00c878' }}>{p.wins}</span>
              <span style={{ width: '32px', textAlign: 'center', fontSize: '13px', fontWeight: 800, color: '#ff5050' }}>{p.losses}</span>
              <span style={{ width: '44px', textAlign: 'right', fontSize: '11px', color: '#556677' }}>{p.resistance}%</span>
            </div>
          ))}
          <div style={{ marginTop: '10px', padding: '8px', background: 'rgba(255,200,0,0.06)', border: '1px solid rgba(255,200,0,0.15)', borderRadius: '8px', fontSize: '10px', color: '#665500', textAlign: 'center' }}>
            上位4名が決勝トーナメント進出
          </div>
        </div>
      )}

      {pageTab === 'battle' && (

      <div style={{ padding: '0 16px 100px' }}>
        {/* Event summary */}
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '10px 12px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '12px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#f0f0f0' }}>{event.name}</div>
          <div style={{ fontSize: '11px', color: '#556677', marginTop: '2px' }}>{event.venue} · {event.regulation}</div>
        </div>

        {/* Round progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
          {Array.from({ length: totalRounds }, (_, i) => {
            const r = results[i];
            const isCurrent = i + 1 === round && phase !== 'tournament-end';
            return (
              <div key={i} style={{
                flex: 1, height: '6px', borderRadius: '3px',
                background: r ? resultColor(r.result) : isCurrent ? 'rgba(0,224,224,0.5)' : 'rgba(255,255,255,0.1)',
                transition: 'all 0.3s',
              }} />
            );
          })}
        </div>
        <div style={{ textAlign: 'center', fontSize: '12px', color: '#8899aa', marginBottom: '16px' }}>
          {phase !== 'tournament-end' ? `第${round}ラウンド / 全${totalRounds}ラウンド` : '大会終了'}
          {results.length > 0 && <span style={{ marginLeft: '8px' }}>({wins}勝{losses}敗{draws > 0 ? `${draws}分` : ''})</span>}
        </div>

        {/* Waiting */}
        {phase === 'waiting' && (
          <div style={{ textAlign: 'center', animation: 'fadeIn 0.3s' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚔️</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#e0e8f0', marginBottom: '6px' }}>第{round}ラウンド</div>
            <div style={{ fontSize: '12px', color: '#556677', marginBottom: '20px' }}>マッチングを待っています...</div>
            <button onClick={doMatch} style={{
              padding: '14px 40px', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg, #00c0c0, #00a0ff)', color: '#fff',
              fontSize: '14px', fontWeight: 700, cursor: 'pointer',
            }}>マッチング確認</button>
          </div>
        )}

        {/* Matching animation */}
        {phase === 'matching' && (
          <div style={{ textAlign: 'center', animation: 'fadeIn 0.3s' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px', animation: 'pulse 1s infinite' }}>🔄</div>
            <div style={{ fontSize: '14px', color: '#00e0e0', fontWeight: 600 }}>対戦相手を検索中...</div>
          </div>
        )}

        {/* Matched */}
        {phase === 'matched' && opponent && (
          <div style={{ animation: 'matchReveal 0.5s ease-out' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(0,224,224,0.08), rgba(160,100,255,0.06))',
              borderRadius: '14px', padding: '20px', border: '1px solid rgba(0,224,224,0.2)',
              textAlign: 'center', marginBottom: '16px',
            }}>
              <div style={{ fontSize: '11px', color: '#8899aa', marginBottom: '8px' }}>第{round}ラウンド 対戦相手</div>
              <div style={{
                width: '60px', height: '60px', borderRadius: '50%', margin: '0 auto 10px',
                background: 'linear-gradient(135deg, #a064ff, #ff64a0)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px', fontWeight: 800, color: '#fff',
              }}>{opponent.name[0]}</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#f0f0f0', marginBottom: '4px' }}>{opponent.name}</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
                <Tag color="cyan">テーブル {opponent.table}</Tag>
              </div>
            </div>
            <button onClick={() => setPhase('battling')} style={{
              width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg, #ff6040, #ff4080)', color: '#fff',
              fontSize: '15px', fontWeight: 800, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}>
              <IconSwords /> 対戦開始
            </button>
          </div>
        )}

        {/* Battling */}
        {phase === 'battling' && opponent && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(255,96,64,0.1), rgba(255,64,128,0.06))',
              borderRadius: '14px', padding: '20px', border: '1px solid rgba(255,96,64,0.2)',
              textAlign: 'center', marginBottom: '16px',
            }}>
              <Tag color="red">対戦中</Tag>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#f0f0f0', marginTop: '10px' }}>vs. {opponent.name}</div>
              <div style={{ fontSize: '11px', color: '#556677', marginTop: '4px' }}>テーブル {opponent.table}</div>
            </div>
            <button onClick={() => { setSelectedResult(null); setWasFirst(null); setPhase('result-entry'); }} style={{
              width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg, #ffc800, #ffa000)', color: '#0a0e1a',
              fontSize: '15px', fontWeight: 800, cursor: 'pointer',
            }}>対戦結果を入力</button>
          </div>
        )}

        {/* Result Entry */}
        {phase === 'result-entry' && opponent && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#c0d0e0', marginBottom: '4px' }}>第{round}ラウンド 結果入力</div>
              <div style={{ fontSize: '12px', color: '#556677', marginBottom: '14px' }}>vs. {opponent.name}</div>

              <div style={{ fontSize: '11px', color: '#8899aa', marginBottom: '6px' }}>対戦結果</div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {([
                  { val: 'win' as const, label: '勝ち', color: '#00c878', bg: 'rgba(0,200,120,0.15)', bd: 'rgba(0,200,120,0.4)' },
                  { val: 'lose' as const, label: '負け', color: '#ff5050', bg: 'rgba(255,80,80,0.15)', bd: 'rgba(255,80,80,0.4)' },
                  { val: 'draw' as const, label: '引き分け', color: '#ffc800', bg: 'rgba(255,200,0,0.15)', bd: 'rgba(255,200,0,0.4)' },
                ]).map(opt => (
                  <button key={opt.val} onClick={() => setSelectedResult(opt.val)} style={{
                    flex: 1, padding: '12px 8px', borderRadius: '10px', cursor: 'pointer', fontFamily: 'inherit',
                    border: `2px solid ${selectedResult === opt.val ? opt.bd : 'rgba(255,255,255,0.08)'}`,
                    background: selectedResult === opt.val ? opt.bg : 'rgba(255,255,255,0.04)',
                    color: selectedResult === opt.val ? opt.color : '#8899aa',
                    fontSize: '14px', fontWeight: 700, transition: 'all 0.2s',
                  }}>{opt.label}</button>
                ))}
              </div>

              <div style={{ fontSize: '11px', color: '#8899aa', marginBottom: '6px' }}>先攻・後攻</div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {[{ val: true, label: '先攻' }, { val: false, label: '後攻' }].map(opt => (
                  <button key={String(opt.val)} onClick={() => setWasFirst(opt.val)} style={{
                    flex: 1, padding: '10px 8px', borderRadius: '10px', cursor: 'pointer', fontFamily: 'inherit',
                    border: `2px solid ${wasFirst === opt.val ? 'rgba(0,224,224,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    background: wasFirst === opt.val ? 'rgba(0,224,224,0.15)' : 'rgba(255,255,255,0.04)',
                    color: wasFirst === opt.val ? '#00e0e0' : '#8899aa',
                    fontSize: '13px', fontWeight: 600, transition: 'all 0.2s',
                  }}>{opt.label}</button>
                ))}
              </div>

              <button disabled={selectedResult === null || wasFirst === null} onClick={submitResult} style={{
                width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
                background: (selectedResult !== null && wasFirst !== null) ? 'linear-gradient(135deg, #00c0c0, #00a0ff)' : 'rgba(255,255,255,0.1)',
                color: (selectedResult !== null && wasFirst !== null) ? '#fff' : '#556677',
                fontSize: '14px', fontWeight: 700, cursor: (selectedResult !== null && wasFirst !== null) ? 'pointer' : 'default',
              }}>結果を送信</button>
            </div>
          </div>
        )}

        {/* Round Complete */}
        {phase === 'round-complete' && results.length > 0 && (
          <div style={{ textAlign: 'center', animation: 'fadeIn 0.3s' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>{results[results.length - 1].result === 'win' ? '🎉' : results[results.length - 1].result === 'lose' ? '😤' : '🤝'}</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: resultColor(results[results.length - 1].result), marginBottom: '6px' }}>
              {resultLabel(results[results.length - 1].result)}！
            </div>
            <div style={{ fontSize: '12px', color: '#556677', marginBottom: '20px' }}>
              第{round}ラウンド完了 · 現在の成績: {wins}勝{losses}敗{draws > 0 ? `${draws}分` : ''}
            </div>
            <button onClick={nextRound} style={{
              padding: '14px 40px', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg, #00c0c0, #00a0ff)', color: '#fff',
              fontSize: '14px', fontWeight: 700, cursor: 'pointer',
            }}>次のラウンドへ</button>
          </div>
        )}

        {/* Tournament End */}
        {phase === 'tournament-end' && (
          <div style={{ textAlign: 'center', animation: 'fadeIn 0.3s' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏆</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#ffc800', marginBottom: '6px' }}>大会終了！</div>
            <div style={{ fontSize: '14px', color: '#c0d0e0', marginBottom: '20px' }}>最終成績: {wins}勝{losses}敗{draws > 0 ? `${draws}分` : ''}</div>
            <div style={{ textAlign: 'left' }}>
              {results.map((r, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '10px 12px',
                  marginBottom: '6px', border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: resultColor(r.result), display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: 800, color: '#0a0e1a', flexShrink: 0,
                  }}>R{r.round}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#e0e8f0' }}>vs. {r.opponent}</div>
                    <div style={{ fontSize: '10px', color: '#556677' }}>{r.first ? '先攻' : '後攻'}</div>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: resultColor(r.result) }}>{resultLabel(r.result)}</div>
                </div>
              ))}
            </div>
            <button onClick={goBack} style={{
              width: '100%', padding: '12px', borderRadius: '10px', border: 'none', marginTop: '16px',
              background: 'rgba(255,255,255,0.1)', color: '#c0d0e0',
              fontSize: '14px', fontWeight: 700, cursor: 'pointer',
            }}>イベントトップに戻る</button>
          </div>
        )}

        {/* Support during tournament */}
        {['battling', 'waiting', 'matched'].includes(phase) && pageTab === 'battle' && (
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '14px', border: '1px solid rgba(255,255,255,0.08)', marginTop: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '10px', color: '#c0d0e0' }}>お問い合わせ・サポート</div>
            {[
              { label: 'ルール・対戦に関する質問', target: 'ジャッジ' },
              { label: 'テンポ・進行に関する報告', target: '主催者' },
              { label: 'その他のお問い合わせ', target: '運営' },
            ].map((item, i) => (
              <button key={i} style={{
                width: '100%', padding: '10px 12px', borderRadius: '8px', marginBottom: i < 2 ? '6px' : 0,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                color: '#e0e8f0', fontSize: '12px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'inherit', textAlign: 'left',
              }}>
                <IconAlert /> <span style={{ flex: 1 }}>{item.label}</span>
                <span style={{ fontSize: '10px', color: '#556677', whiteSpace: 'nowrap' }}>→ {item.target}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      )}
    </div>
  );
};
