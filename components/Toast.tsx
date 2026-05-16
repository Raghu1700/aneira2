'use client';

import { useStore } from './StoreProvider';

export default function Toast() {
  const { toastMessage } = useStore();
  return (
    <div className={'toast' + (toastMessage ? ' show' : '')} id="toast">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="m3 7 3 3 5-6" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      <span id="toast-text">{toastMessage ?? 'Added to cart'}</span>
    </div>
  );
}
