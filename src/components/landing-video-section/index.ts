/**
 * Landing video section – title and video carousel.
 * Follows Salla Twilight component conventions: strict typing, default values.
 * @see https://docs.salla.dev/doc-422580
 */
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { FALLBACK_VIDEOS } from '../../lib/fallback-data.js';

export interface VideoItem {
  src: string;
  poster?: string;
}

export interface LandingVideoSectionConfig {
  /** Section title. Default: "تجاربكم" */
  title?: string;
  /** Video items. Default: fallback set when empty */
  videos?: VideoItem[];
}

const DEFAULT_CONFIG: LandingVideoSectionConfig = { title: 'تجاربكم', videos: [] };

export default class LandingVideoSection extends LitElement {
  @property({ type: Object }) data: LandingVideoSectionConfig = DEFAULT_CONFIG;
  private _playingIndex: number | null = null;

  static styles = css`
    :host { display: block; }
    .custom-video-section {
      margin: 40px auto; padding: 0 15px; direction: rtl; font-family: inherit;
      text-align: center; max-width: 100%;
    }
    .cvs-title { font-size: 30px; font-weight: 900; margin-bottom: 30px; text-align: center; color: #000; }
    .cvs-carousel {
      display: flex; gap: 15px; overflow-x: auto; scroll-snap-type: x mandatory;
      padding-bottom: 15px; -webkit-overflow-scrolling: touch;
    }
    .cvs-carousel::-webkit-scrollbar { display: none; }
    .cvs-item {
      flex: 0 0 85%; scroll-snap-align: center; border-radius: 15px; overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08); position: relative; background: #000;
      cursor: pointer; touch-action: manipulation;
    }
    .cvs-video {
      width: 100%; height: auto; display: block; aspect-ratio: 9/16; object-fit: cover;
    }
    .cvs-play-btn {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 60px; height: 60px; background-color: rgba(255, 255, 255, 0.7);
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      transition: all 0.3s ease; pointer-events: none; z-index: 2;
    }
    .cvs-play-btn svg { width: 25px; height: 25px; fill: #000; margin-left: 3px; }
    .cvs-fullscreen-btn {
      position: absolute; bottom: 15px; left: 15px; width: 35px; height: 35px;
      background-color: rgba(0, 0, 0, 0.6); border-radius: 8px;
      display: flex; align-items: center; justify-content: center; z-index: 3;
      opacity: 0; transition: opacity 0.3s;
    }
    .cvs-fullscreen-btn svg { width: 18px; height: 18px; fill: #fff; }
    .cvs-item.is-playing .cvs-play-btn { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
    .cvs-item.is-playing .cvs-fullscreen-btn { opacity: 1; }
    @media (min-width: 768px) { .cvs-item { flex: 0 0 300px; } }
  `;

  private _togglePlay(index: number, video: HTMLVideoElement) {
    const items = this.shadowRoot!.querySelectorAll('.cvs-item');
    items.forEach((el, i) => {
      const v = el.querySelector('video');
      if (v && i !== index) {
        v.pause();
        el.classList.remove('is-playing');
      }
    });
    if (video.paused) {
      video.play();
      video.closest('.cvs-item')?.classList.add('is-playing');
      this._playingIndex = index;
    } else {
      video.pause();
      video.closest('.cvs-item')?.classList.remove('is-playing');
      this._playingIndex = null;
    }
  }

  private _requestFullScreen(video: HTMLVideoElement) {
    if (video.requestFullscreen) video.requestFullscreen();
    else if ((video as any).webkitRequestFullscreen) (video as any).webkitRequestFullscreen();
    else if ((video as any).webkitEnterFullscreen) (video as any).webkitEnterFullscreen();
  }

  render() {
    const cfg = this.data ?? DEFAULT_CONFIG;
    const title = cfg.title ?? 'تجاربكم';
    const videos = (cfg.videos?.length ? cfg.videos : FALLBACK_VIDEOS) ?? [];

    return html`
      <div class="custom-video-section">
        <h3 class="cvs-title">${title}</h3>
        <div class="cvs-carousel">
          ${videos.map((item, i) => html`
            <div class="cvs-item"
                 @click=${(e: Event) => {
                   const target = (e.target as HTMLElement);
                   const fullscreenBtn = target.closest('.cvs-fullscreen-btn');
                   const video = (e.currentTarget as HTMLElement).querySelector('video');
                   if (fullscreenBtn && video) {
                     e.preventDefault();
                     this._requestFullScreen(video);
                     return;
                   }
                   if (video) this._togglePlay(i, video);
                 }}
                 @dblclick=${(e: Event) => {
                   e.preventDefault();
                   const video = (e.currentTarget as HTMLElement).querySelector('video');
                   if (video) {
                     this._requestFullScreen(video);
                     if (video.paused) video.play();
                   }
                 }}>
              <video class="cvs-video" playsinline preload="metadata"
                     poster="${item.poster ?? ''}"
                     @ended=${(e: Event) => {
                       (e.target as HTMLVideoElement).closest('.cvs-item')?.classList.remove('is-playing');
                     }}>
                <source src="${item.src}" type="video/mp4">
              </video>
              <div class="cvs-play-btn">
                <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </div>
              <div class="cvs-fullscreen-btn">
                <svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
              </div>
            </div>
          `)}
        </div>
      </div>
    `;
  }

  static registerSallaComponent(tagName: string) {
    const Salla = (window as any).Salla;
    if (!Salla?.bundles) return Promise.reject(new Error('Salla not ready'));
    const dynamicTagName = `${tagName}-${Math.random().toString(36).substring(2, 8)}`;
    return Salla.bundles.registerComponent(tagName, { component: this, dynamicTagName });
  }
}
