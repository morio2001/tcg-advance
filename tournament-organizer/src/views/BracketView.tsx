import React, { useState } from 'react';
import type { Tournament } from '../types';
import { C } from '../theme';
import { useNow } from '../store';
import { Bracket } from './Bracket';
import { MatchDetailModal } from './MatchDetailModal';

export const BracketView: React.FC<{ t: Tournament }> = ({ t }) => {
  const now = useNow();
  const [openId, setOpenId] = useState<string | null>(null);
  const match = openId ? t.matches.find((m) => m.id === openId) ?? null : null;

  return (
    <div>
      <div style={{ fontSize: 12, color: C.textDim, marginBottom: 8 }}>
        試合をクリックすると進行・結果・ペナルティを編集できます。
      </div>
      <div
        style={{
          overflowX: 'auto',
          background: '#f4f6fa',
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          minHeight: 480,
        }}
      >
        <Bracket t={t} now={now} scale={1} onMatchClick={setOpenId} />
      </div>
      <MatchDetailModal match={match} t={t} now={now} onClose={() => setOpenId(null)} />
    </div>
  );
};
