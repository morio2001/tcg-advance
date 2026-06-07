import React, { useState } from 'react';
import type { Role, Tournament } from '../types';
import { C } from '../theme';
import { relTime } from '../lib/format';
import { useStore } from '../store';
import { Button, Card, Icon, ICONS, Tag, TextArea } from '../components/ui';

export const ROLE_LABEL: Record<Role, string> = {
  admin: '本部',
  floor: 'フロア',
  broadcast: '配信',
  stage: 'ステージ進行',
  client: 'クライアント',
};

const AUDIENCES: Role[] = ['floor', 'broadcast', 'stage', 'client'];

export const AnnouncementsPanel: React.FC<{ t: Tournament; now: number; editable: boolean; audience?: Role }> = ({
  t,
  now,
  editable,
  audience,
}) => {
  const { dispatch } = useStore();
  const [body, setBody] = useState('');
  const [targets, setTargets] = useState<Role[]>(['floor', 'broadcast', 'stage']);

  const list = [...t.announcements]
    .filter((a) => (audience ? a.audiences.includes(audience) : true))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.at - a.at);

  const post = () => {
    if (!body.trim() || targets.length === 0) return;
    dispatch({
      type: 'ADD_ANNOUNCEMENT',
      announcement: {
        id: `an_${Date.now().toString(36)}`,
        at: Date.now(),
        by: '本部',
        body: body.trim(),
        audiences: targets,
        pinned: false,
      },
    });
    setBody('');
  };

  return (
    <Card style={{ padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Icon d={ICONS.bullhorn} size={16} color={C.accent} />
        <span style={{ fontSize: 13, fontWeight: 800 }}>アナウンス</span>
        <span style={{ fontSize: 11, color: C.textFaint }}>1回の投稿で対象ビューに共有</span>
      </div>

      {editable && (
        <div style={{ marginBottom: 14 }}>
          <TextArea rows={2} value={body} onChange={(e) => setBody(e.target.value)} placeholder="各所への連絡事項を入力…" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: C.textDim }}>共有先:</span>
            {AUDIENCES.map((r) => {
              const on = targets.includes(r);
              return (
                <button
                  key={r}
                  onClick={() => setTargets((prev) => (on ? prev.filter((x) => x !== r) : [...prev, r]))}
                  style={{
                    padding: '4px 9px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: 11,
                    fontWeight: 700,
                    border: `1px solid ${on ? C.accent : C.border}`,
                    background: on ? 'rgba(0,224,224,0.12)' : 'transparent',
                    color: on ? C.accent : C.textDim,
                  }}
                >
                  {ROLE_LABEL[r]}
                </button>
              );
            })}
            <div style={{ flex: 1 }} />
            <Button variant="primary" size="sm" onClick={post}>
              投稿
            </Button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {list.length === 0 && <div style={{ fontSize: 12, color: C.textFaint }}>アナウンスはありません。</div>}
        {list.map((a) => (
          <div
            key={a.id}
            style={{
              padding: '9px 11px',
              borderRadius: 10,
              background: a.pinned ? 'rgba(0,224,224,0.07)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${a.pinned ? `${C.accent}44` : C.border}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
              {a.pinned && <Tag color={C.accent}>固定</Tag>}
              {a.audiences.map((r) => (
                <Tag key={r} color={C.textDim}>
                  {ROLE_LABEL[r]}
                </Tag>
              ))}
              <div style={{ flex: 1 }} />
              <span style={{ fontSize: 10, color: C.textFaint }}>{relTime(a.at, now)}</span>
            </div>
            <div style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{a.body}</div>
            {editable && (
              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button onClick={() => dispatch({ type: 'TOGGLE_PIN', id: a.id })} style={{ background: 'none', border: 'none', color: C.textDim, cursor: 'pointer', fontSize: 11 }}>
                  {a.pinned ? '固定解除' : '固定'}
                </button>
                <button onClick={() => dispatch({ type: 'REMOVE_ANNOUNCEMENT', id: a.id })} style={{ background: 'none', border: 'none', color: C.textFaint, cursor: 'pointer', fontSize: 11 }}>
                  削除
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};
