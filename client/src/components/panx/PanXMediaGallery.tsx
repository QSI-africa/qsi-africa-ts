import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react';

export interface PanXMediaItem {
  url: string;
  type: 'image' | 'video';
}

export interface PanXMediaViewerState {
  media: PanXMediaItem[];
  initialIndex: number;
}

export const PanXMediaGallery = ({ media, onOpen }: { media: PanXMediaItem[]; onOpen: (index: number) => void }) => {
  const visibleMedia = media.slice(0, 4);

  return (
    <div className={`panx-media-grid panx-media-grid--${Math.min(media.length, 4)}`} onClick={event => event.stopPropagation()}>
      {visibleMedia.map((item, index) => (
        <button
          key={`${item.url}-${index}`}
          type="button"
          className="panx-media-tile"
          onClick={() => onOpen(index)}
          aria-label={`Open attachment ${index + 1} of ${media.length}`}
        >
          {item.type === 'video' ? (
            <>
              <video src={item.url} muted playsInline preload="metadata" />
              <span className="panx-media-play"><Play size={17} fill="currentColor" /></span>
            </>
          ) : (
            <img src={item.url} alt="" loading="lazy" />
          )}
          {index === 3 && media.length > 4 && <span className="panx-media-more">+{media.length - 4}</span>}
        </button>
      ))}
    </div>
  );
};

export const PanXMediaViewer = ({ state, onClose }: { state: PanXMediaViewerState | null; onClose: () => void }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const pointerStartX = useRef<number | null>(null);
  const activeMedia = state?.media[activeIndex];
  const hasMultiple = (state?.media.length || 0) > 1;

  useEffect(() => {
    if (!state) return;
    setActiveIndex(Math.min(state.initialIndex, state.media.length - 1));
  }, [state]);

  useEffect(() => {
    if (!state) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') setActiveIndex(index => Math.max(0, index - 1));
      if (event.key === 'ArrowRight') setActiveIndex(index => Math.min(state.media.length - 1, index + 1));
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [state, onClose]);

  if (!state || !activeMedia) return null;

  const move = (direction: -1 | 1) => {
    setActiveIndex(index => Math.max(0, Math.min(state.media.length - 1, index + direction)));
  };

  return createPortal(
    <div className="panx-media-viewer" role="dialog" aria-modal="true" aria-label="Post media viewer" onClick={onClose}>
      <div className="panx-media-viewer__topbar">
        <span>{activeIndex + 1} / {state.media.length}</span>
        <button type="button" onClick={onClose} aria-label="Close media viewer"><X size={22} /></button>
      </div>

      <div
        className="panx-media-viewer__stage"
        onClick={event => event.stopPropagation()}
        onPointerDown={event => { pointerStartX.current = event.clientX; }}
        onPointerUp={event => {
          if (pointerStartX.current === null) return;
          const distance = event.clientX - pointerStartX.current;
          if (Math.abs(distance) > 55) move(distance > 0 ? -1 : 1);
          pointerStartX.current = null;
        }}
      >
        {activeMedia.type === 'video' ? (
          <video key={activeMedia.url} src={activeMedia.url} controls autoPlay playsInline />
        ) : (
          <img src={activeMedia.url} alt={`Attachment ${activeIndex + 1}`} />
        )}
      </div>

      {hasMultiple && activeIndex > 0 && (
        <button className="panx-media-viewer__arrow is-left" type="button" onClick={event => { event.stopPropagation(); move(-1); }} aria-label="Previous attachment">
          <ChevronLeft size={24} />
        </button>
      )}
      {hasMultiple && activeIndex < state.media.length - 1 && (
        <button className="panx-media-viewer__arrow is-right" type="button" onClick={event => { event.stopPropagation(); move(1); }} aria-label="Next attachment">
          <ChevronRight size={24} />
        </button>
      )}

      {hasMultiple && (
        <div className="panx-media-viewer__rail" onClick={event => event.stopPropagation()}>
          {state.media.map((item, index) => (
            <button key={`${item.url}-${index}`} className={index === activeIndex ? 'is-active' : ''} type="button" onClick={() => setActiveIndex(index)} aria-label={`View attachment ${index + 1}`}>
              {item.type === 'video' ? <video src={item.url} muted preload="metadata" /> : <img src={item.url} alt="" />}
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body
  );
};
