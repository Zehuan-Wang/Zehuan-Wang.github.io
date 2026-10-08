'use client';

import { createElement, useEffect } from 'react';

const ASCII_REST_SCRIPT = 'https://ascii.rest/ascii.js';
const SCRIPT_ATTR = 'data-ascii-rest';

function ensureAsciiRestScript() {
  if (typeof document === 'undefined') {
    return;
  }

  if (
    customElements.get('ascii-art') ||
    document.querySelector(`script[${SCRIPT_ATTR}]`)
  ) {
    return;
  }

  const script = document.createElement('script');
  script.type = 'module';
  script.src = ASCII_REST_SCRIPT;
  script.setAttribute(SCRIPT_ATTR, '');
  document.head.appendChild(script);
}

export default function AsciiCampfire() {
  useEffect(() => {
    ensureAsciiRestScript();
  }, []);

  return (
    <section className="bg-background py-2">
      <div className="mx-auto w-fit text-accent opacity-90 font-mono text-[10px] leading-[1.2] select-none">
        {createElement('ascii-art', {
          piece: 'campfire',
          label: 'Campfire ASCII animation',
        })}
      </div>
    </section>
  );
}
