import React from 'react';
import type { Match, Tournament } from '../types';
import { C } from '../theme';
import { participant, slotName } from '../lib/bracket';
import { Button, Modal } from '../components/ui';
import { MatchControls } from './MatchControls';

interface Props {
  match: Match | null;
  t: Tournament;
  now: number;
  onClose: () => void;
}

/** Status-change / operations modal opened from a bracket card's gear button. */
export const MatchSettingsModal: React.FC<Props> = ({ match: m, t, now, onClose }) => {
  if (!m) return null;
  const pa = participant(t, m.slots[0].participantId);
  const pb = participant(t, m.slots[1].participantId);

  return (
    <Modal open={!!m} onClose={onClose} width={460}>
      <div style={{ padding: '16px 18px 4px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>{m.table ? `卓${m.table} ` : ''}{m.label}</div>
          <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>
            {pa ? pa.name : slotName(m.slots[0], t)} <span style={{ color: C.textFaint }}>vs</span> {pb ? pb.name : slotName(m.slots[1], t)}
          </div>
        </div>
        <Button variant="subtle" size="sm" onClick={onClose}>閉じる</Button>
      </div>
      <div style={{ padding: '0 18px 16px' }}>
        <MatchControls m={m} t={t} now={now} />
      </div>
    </Modal>
  );
};
