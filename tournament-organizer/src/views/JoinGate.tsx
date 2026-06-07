import React, { useState } from 'react';
import type { EventSource, Role } from '../types';
import { C } from '../theme';
import { ROLE_DESC, ROLE_LABEL, ROLES, ROLE_COLOR } from '../roles';
import { useStore } from '../store';
import { Button, Card, Icon, ICONS } from '../components/ui';

/** Lightweight "join the project" gate — name + role, saved per browser (Meet-style). */
export const JoinGate: React.FC<{ initial?: EventSource | null; onDone?: () => void }> = ({ initial, onDone }) => {
  const { dispatch } = useStore();
  const [name, setName] = useState(initial?.name ?? '');
  const [role, setRole] = useState<Role>(initial?.role ?? 'admin');

  const submit = () => {
    const nm = name.trim() || ROLE_LABEL[role];
    dispatch({ type: 'SET_IDENTITY', identity: { name: nm, role } });
    onDone?.();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <Card style={{ padding: 26, width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <Icon d={ICONS.trophy} size={26} color={C.accent} />
          <div style={{ fontSize: 20, fontWeight: 900, marginTop: 6 }}>大会情報 共有ハブ</div>
          <div style={{ fontSize: 12, color: C.textDim, marginTop: 4 }}>表示名とロールを設定して入場（この端末に保存されます）</div>
        </div>

        <div style={{ fontSize: 11, color: C.textDim, fontWeight: 600, marginBottom: 5 }}>表示名</div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例: 山田 / 配信卓1"
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          autoFocus
          style={{ width: '100%', background: '#f7f9fc', border: `1px solid ${C.border}`, borderRadius: 9, color: C.text, padding: '10px 12px', fontSize: 14, outline: 'none', marginBottom: 16 }}
        />

        <div style={{ fontSize: 11, color: C.textDim, fontWeight: 600, marginBottom: 6 }}>ロール</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
          {ROLES.map((r) => {
            const on = role === r;
            return (
              <button
                key={r}
                onClick={() => setRole(r)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 12px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  textAlign: 'left',
                  border: `1.5px solid ${on ? ROLE_COLOR[r] : C.border}`,
                  background: on ? `${ROLE_COLOR[r]}12` : '#fff',
                }}
              >
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: ROLE_COLOR[r], flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 800, color: on ? ROLE_COLOR[r] : C.text, width: 96 }}>{ROLE_LABEL[r]}</span>
                <span style={{ fontSize: 11, color: C.textDim }}>{ROLE_DESC[r]}</span>
              </button>
            );
          })}
        </div>

        <Button variant="primary" onClick={submit} style={{ width: '100%', padding: '11px' }}>
          入場する
        </Button>
        <div style={{ fontSize: 10.5, color: C.textFaint, marginTop: 10, textAlign: 'center' }}>
          ※ モックでは操作権限は全ロール共通。ロールは発信元タグとフィルタに使われます。
        </div>
      </Card>
    </div>
  );
};
