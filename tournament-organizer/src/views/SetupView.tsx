import React, { useRef, useState } from 'react';
import type { Participant, Tournament } from '../types';
import { C } from '../theme';
import { generateSingleElim, MAX_PLAYERS } from '../lib/bracket';
import { parseFile, parsePasted, toParticipants } from '../lib/importParticipants';
import { useStore } from '../store';
import { Button, Card, Field, Icon, ICONS, Tag, TextArea, TextInput } from '../components/ui';

export const SetupView: React.FC = () => {
  const { dispatch, loadSample } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('新規トーナメント');
  const [venue, setVenue] = useState('');
  const [regulation, setRegulation] = useState('スタンダード / BO3');
  const [duration, setDuration] = useState(50);
  const [bestOf, setBestOf] = useState(3);
  const [thirdPlace, setThirdPlace] = useState(true);
  const [raw, setRaw] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [error, setError] = useState('');

  const applyParse = (text: string) => {
    const rows = parsePasted(text);
    setParticipants(toParticipants(rows));
    setError(rows.length > MAX_PLAYERS ? `${MAX_PLAYERS}名を超えた分は切り捨てられます。` : '');
  };

  const onFile = async (file?: File | null) => {
    if (!file) return;
    try {
      const rows = await parseFile(file);
      const text = rows
        .map((r) => [r.name, r.deck, r.affiliation].filter(Boolean).join(','))
        .join('\n');
      setRaw(text);
      setParticipants(toParticipants(rows));
    } catch {
      setError('ファイルの読み込みに失敗しました。CSV / XLSX を確認してください。');
    }
  };

  const create = () => {
    if (participants.length < 2) {
      setError('2名以上の参加者が必要です。');
      return;
    }
    const matches = generateSingleElim(participants, {
      defaultDurationMin: duration,
      defaultBestOf: bestOf,
      hasThirdPlace: thirdPlace,
    });
    const t: Tournament = {
      id: `t_${Date.now().toString(36)}`,
      name,
      format: 'single',
      venue,
      regulation,
      defaultDurationMin: duration,
      defaultBestOf: bestOf,
      hasThirdPlace: thirdPlace,
      participants,
      matches,
      announcements: [],
      createdAt: Date.now(),
    };
    dispatch({ type: 'CREATE', tournament: t });
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', margin: '20px 0 28px' }}>
        <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: 0.5 }}>大会情報 共有ハブ</div>
        <div style={{ fontSize: 13, color: C.textDim, marginTop: 6 }}>
          シングルエリミネーション（最大{MAX_PLAYERS}名）・1つの正を各所と共有
        </div>
        <div style={{ marginTop: 16 }}>
          <Button variant="primary" onClick={loadSample}>
            <Icon d={ICONS.grid} size={13} /> デモ大会を読み込む（16名・進行中サンプル）
          </Button>
        </div>
      </div>

      <Card style={{ padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>新規に作成</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="大会名">
            <TextInput value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="会場">
            <TextInput value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="例: 東京ビッグサイト" />
          </Field>
          <Field label="レギュレーション">
            <TextInput value={regulation} onChange={(e) => setRegulation(e.target.value)} />
          </Field>
          <Field label="試合時間（分） / BO">
            <div style={{ display: 'flex', gap: 8 }}>
              <TextInput type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} style={{ width: 90 }} />
              <TextInput type="number" value={bestOf} onChange={(e) => setBestOf(Number(e.target.value))} style={{ width: 70 }} />
            </div>
          </Field>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.textDim, marginBottom: 16, cursor: 'pointer' }}>
          <input type="checkbox" checked={thirdPlace} onChange={(e) => setThirdPlace(e.target.checked)} />
          3位決定戦を含める
        </label>

        <Field
          label="参加者インポート"
          hint="1行1名、または「名前,デッキ,所属」のCSV / TSV。並び順がシード順になります。"
        >
          <TextArea
            rows={6}
            value={raw}
            onChange={(e) => {
              setRaw(e.target.value);
              applyParse(e.target.value);
            }}
            placeholder={'カミヤ ソウタ,リザードンex,横浜CL\nタチバナ レン,ミライドンex,PALETTE\n…'}
          />
        </Field>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.xlsx,.xls,.tsv,.txt"
            style={{ display: 'none' }}
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          <Button variant="ghost" size="sm" onClick={() => fileRef.current?.click()}>
            <Icon d={ICONS.copy} size={12} /> CSV / Excel から読み込む
          </Button>
          {participants.length > 0 && <Tag color={C.accent}>{participants.length}名 検出</Tag>}
          {error && <span style={{ fontSize: 12, color: C.warn }}>{error}</span>}
        </div>

        {participants.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px,1fr))', gap: 6, marginBottom: 16, maxHeight: 180, overflowY: 'auto' }}>
            {participants.map((p) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '4px 8px', background: 'rgba(0,0,0,0.03)', borderRadius: 6 }}>
                <span style={{ color: C.textFaint, fontWeight: 800, width: 18 }}>{p.seed}</span>
                <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
              </div>
            ))}
          </div>
        )}

        <Button variant="primary" disabled={participants.length < 2} onClick={create}>
          <Icon d={ICONS.trophy} size={13} /> トーナメントを作成
        </Button>
      </Card>
    </div>
  );
};
