'use client';

import { Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { accountError } from '@/components/auth/errors';
import { Alert, btn } from '@/components/auth/fields';
import { EmptyState } from '@/components/EmptyState';
import { api } from '@/lib/client-api';
import type { Address } from '@/lib/types';

import { AddressCard } from './AddressCard';
import { AddressForm } from './AddressForm';
import { Dialog } from './Dialog';

type Mode = { kind: 'list' } | { kind: 'add' } | { kind: 'edit'; address: Address };

const iconBtn = 'grid size-11 cursor-pointer place-items-center rounded-full text-ink-2 hover:bg-sunken hover:text-ink disabled:opacity-50';

export function AddressesManager({ initial, me }: { initial: Address[]; me: { name: string; phone: string } }) {
  const [list, setList] = useState(initial);
  const [mode, setMode] = useState<Mode>(initial.length ? { kind: 'list' } : { kind: 'add' });
  const [removing, setRemoving] = useState<Address | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // The API moves the default flag around on save/delete, so read the list back.
  const reload = async () => {
    try {
      setList(await api.get<Address[]>('addresses/me'));
    } catch {
      /* keep what we have */
    }
  };

  const saved = async (a: Address, was: Mode) => {
    setMode({ kind: 'list' });
    setNotice(was.kind === 'edit' ? 'اتحفظت التعديلات.' : `اتضاف عنوان «${a.label || 'جديد'}».`);
    setError(null);
    await reload();
  };

  const makeDefault = async (a: Address) => {
    setBusy(a.id);
    setError(null);
    try {
      await api.patch(`addresses/me/${a.id}`, { isDefault: true });
      await reload();
      setNotice(`«${a.label || 'العنوان'}» بقى العنوان الافتراضي.`);
    } catch (e) {
      setError(accountError(e));
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    if (!removing) return;
    setBusy(removing.id);
    setError(null);
    try {
      await api.delete(`addresses/me/${removing.id}`);
      setNotice('اتمسح العنوان.');
      setRemoving(null);
      await reload();
    } catch (e) {
      setError(accountError(e));
      setRemoving(null);
    } finally {
      setBusy(null);
    }
  };

  if (mode.kind !== 'list') {
    return (
      <section className="rounded-panel border border-line bg-surface p-4 sm:p-6">
        <h2 className="mb-4 text-section font-extrabold">{mode.kind === 'edit' ? 'تعديل العنوان' : 'عنوان جديد'}</h2>
        <AddressForm
          key={mode.kind === 'edit' ? mode.address.id : 'new'}
          initial={mode.kind === 'edit' ? mode.address : undefined}
          defaults={{ recipientName: me.name, phone: me.phone }}
          forceDefault={mode.kind === 'add' && !list.length}
          onSaved={(a) => void saved(a, mode)}
          onCancel={list.length ? () => setMode({ kind: 'list' }) : undefined}
        />
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {error ? <Alert title={error} /> : notice ? <Alert tone="success" title={notice} /> : null}
      {list.length ? (
        <ul className="grid gap-3 md:grid-cols-2">
          {list.map((a) => (
            <li key={a.id}>
              <AddressCard
                address={a}
                actions={
                  <>
                    {!a.isDefault ? (
                      <button type="button" onClick={() => void makeDefault(a)} disabled={busy === a.id} aria-label={`خلّي «${a.label || 'العنوان'}» الافتراضي`} title="خليه الافتراضي" className={iconBtn}>
                        <Star aria-hidden className="size-4" />
                      </button>
                    ) : null}
                    <button type="button" onClick={() => setMode({ kind: 'edit', address: a })} aria-label={`عدّل «${a.label || 'العنوان'}»`} title="تعديل" className={iconBtn}>
                      <Pencil aria-hidden className="size-4" />
                    </button>
                    <button type="button" onClick={() => setRemoving(a)} disabled={busy === a.id} aria-label={`امسح «${a.label || 'العنوان'}»`} title="مسح" className={`${iconBtn} hover:bg-danger-soft hover:text-danger`}>
                      <Trash2 aria-hidden className="size-4" />
                    </button>
                  </>
                }
              />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState art="box" title="مفيش عناوين محفوظة" body="ضيف عنوانك مرة واحدة واستخدمه في كل طلب." />
      )}
      <button type="button" onClick={() => setMode({ kind: 'add' })} className={`${btn.primary} self-start`}>
        <Plus aria-hidden className="size-5" />
        ضيف عنوان جديد
      </button>

      <Dialog
        open={!!removing}
        onClose={() => !busy && setRemoving(null)}
        title="تمسح العنوان ده؟"
        footer={
          <>
            <button type="button" onClick={() => setRemoving(null)} disabled={!!busy} className={btn.secondary}>
              رجوع
            </button>
            <button type="button" onClick={() => void remove()} disabled={!!busy} className={btn.danger}>
              {busy ? 'بنمسح...' : 'أيوه، امسحه'}
            </button>
          </>
        }
      >
        {removing ? (
          <p className="text-ui text-ink-2">
            هنمسح «{removing.label || 'العنوان'}» من عناوينك. الطلبات القديمة مش هتتأثر.
            {removing.isDefault ? ' وهنخلي آخر عنوان ضفته هو الافتراضي.' : ''}
          </p>
        ) : null}
      </Dialog>
    </div>
  );
}
