"use client";

import { useEffect, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { Reveal, RevealGroup, RevealItem } from './anim';

// Founder's scientific contributions — fed by the file-backed API and managed
// from /admin. Renders nothing until there's at least one entry.
export default function Contributions() {
  const { t } = useI18n();
  const [items, setItems] = useState([]);

  useEffect(() => {
    let ok = true;
    fetch('/api/contributions', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => ok && Array.isArray(d) && setItems(d))
      .catch(() => {});
    return () => { ok = false; };
  }, []);

  if (!items.length) return null;

  return (
    <div className="contrib">
      <Reveal as="p" className="eyebrow">{t('contrib.eyebrow')}</Reveal>
      <RevealGroup className="contrib-list" stagger={0.08}>
        {items.map((it) => (
          <RevealItem key={it.id} className="contrib-item" y={28}>
            <span className="contrib-year">{it.year}</span>
            <div className="contrib-body">
              <h4 className="contrib-title">{it.title}</h4>
              <span className="contrib-meta">{[it.project, it.role].filter(Boolean).join(' · ')}</span>
              {it.description && <p className="contrib-desc">{it.description}</p>}
              {it.link && (
                <a href={it.link} target="_blank" rel="noopener noreferrer" className="card-link">
                  {t('contrib.read')} <span>→</span>
                </a>
              )}
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </div>
  );
}
