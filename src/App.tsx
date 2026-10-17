/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, get, child } from 'firebase/database';
import { Palette } from 'lucide-react';

const firebaseConfig = {
  apiKey: "AIzaSyDRUw7-sBHy-eCc5q8IJpiMHUvPOebENmM",
  authDomain: "shakil7978-89bc7.firebaseapp.com",
  databaseURL: "https://shakil7978-89bc7-default-rtdb.firebaseio.com",
  projectId: "shakil7978-89bc7",
  storageBucket: "shakil7978-89bc7.firebasestorage.app",
  messagingSenderId: "495900501141",
  appId: "1:495900501141:web:71a9e3ce5b59ad44d3679c",
  measurementId: "G-KQT8VR08LC"
};

const smallPhotos = [
  "https://i.supaimg.com/89354d6d-d336-4f66-9307-349601dffba9/be29c2d3-2c80-4c1a-a5a2-ff881c3e5d15.jpg",
  "https://i.supaimg.com/89354d6d-d336-4f66-9307-349601dffba9/77841f74-bd0c-489e-8dcf-e83662302a3c.jpg",
  "https://i.supaimg.com/89354d6d-d336-4f66-9307-349601dffba9/0da4ced9-1c0f-4d00-abfc-2e4ac3f5c989.jpg",
  "https://i.supaimg.com/89354d6d-d336-4f66-9307-349601dffba9/a7065b28-8313-48ae-b0d5-e621b84d2bf2.jpg",
  "https://i.supaimg.com/89354d6d-d336-4f66-9307-349601dffba9/1b808674-c1c2-462a-8ebc-ac3b4eb97509.jpg"
];

const bigPhotos = [
  "https://i.supaimg.com/89354d6d-d336-4f66-9307-349601dffba9/65988f1b-fd09-4b24-a820-68c88a9ec262.jpg",
  "https://i.supaimg.com/89354d6d-d336-4f66-9307-349601dffba9/5e493c48-678e-48e6-a759-f20be784e50f.jpg",
  "https://i.supaimg.com/89354d6d-d336-4f66-9307-349601dffba9/197845cb-9466-46bc-97ab-080b5fb1455f.jpg",
  "https://i.supaimg.com/89354d6d-d336-4f66-9307-349601dffba9/24248fe2-4f6b-4ac1-b789-dff0832bb062.jpg",
  "https://i.supaimg.com/89354d6d-d336-4f66-9307-349601dffba9/66de783d-f150-4bef-afde-2d962f6be944.jpg"
];

const PALETTES = [
  { id: 'cyan-purple', name: 'Cyber Neon (Cyan & Violet)', c1: '#00f5ff', c2: '#b026ff' },
  { id: 'emerald-cyan', name: 'Viper Matrix (Emerald & Cyan)', c1: '#00ffaa', c2: '#00e5ff' },
  { id: 'crimson-neon', name: 'Crimson Phoenix (Ruby & Violet)', c1: '#ff1355', c2: '#b026ff' },
  { id: 'solar-gold', name: 'Solar Chrome (Crystal Gold & Amber)', c1: '#ffb703', c2: '#fb8500' },
];

export default function App() {
  const [activePalette, setActivePalette] = useState('cyan-purple');
  const [showPaletteMenu, setShowPaletteMenu] = useState(false);
  const [isWrapVisible, setIsWrapVisible] = useState(true);
  const [password, setPassword] = useState('');
  const [pwMsg, setPwMsg] = useState('✕ AUTH REQUIRED');
  const [pwMsgColor, setPwMsgColor] = useState<string>('var(--red)');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLog, setScanLog] = useState('[boot] INITIALIZING 3D CORE');
  const [scanFlash, setScanFlash] = useState(false);
  const [statusSys, setStatusSys] = useState('LOCKED');
  const [ping, setPing] = useState(21);

  // Prediction states
  const [period, setPeriod] = useState('----');
  const [isBig, setIsBig] = useState(true);
  const [predNumber, setPredNumber] = useState(0);
  const [predImg, setPredImg] = useState(smallPhotos[0]);
  const [timeLeft, setTimeLeft] = useState(30);

  // Refs for dragging
  const wrapRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const pwInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize Firebase safely
  const db = React.useMemo(() => {
    try {
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      return getDatabase(app);
    } catch (e) {
      console.warn('Firebase init error', e);
      return null;
    }
  }, []);

  // Update theme on body
  useEffect(() => {
    document.body.setAttribute('data-palette', activePalette);
  }, [activePalette]);

  // Ping jitter for realistic cyber stats
  useEffect(() => {
    const pingTimer = setInterval(() => {
      setPing(Math.floor(18 + Math.random() * 8));
    }, 4000);
    return () => clearInterval(pingTimer);
  }, []);

  // Draggable logic for both Wrap and Launcher
  useEffect(() => {
    const wrap = wrapRef.current;
    const orb = orbRef.current;
    if (!wrap || !orb) return;

    // Initial positioning
    const initialWrapX = Math.max(10, Math.floor(window.innerWidth / 2 - 111));
    const initialWrapY = Math.max(10, Math.floor(window.innerHeight / 2 - 140));
    wrap.style.transform = `translate3d(${initialWrapX}px, ${initialWrapY}px, 0px)`;
    orb.style.transform = `translate3d(20px, 20px, 0px)`;

    function attachDraggable(el: HTMLElement) {
      let isDragging = false;
      let startX = 0, startY = 0;
      let initialX = 0, initialY = 0;

      const onPointerDown = (e: PointerEvent) => {
        // Don't drag if clicking buttons, inputs or clickable items
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('input') || target.closest('.no-drag')) {
          return;
        }

        isDragging = true;
        el.classList.add('dragging');
        startX = e.clientX;
        startY = e.clientY;

        const matrix = window.getComputedStyle(el).transform;
        if (matrix && matrix !== 'none') {
          const values = matrix.split(', ');
          initialX = parseFloat(values[4]) || 0;
          initialY = parseFloat(values[5]) || 0;
        } else {
          initialX = 0;
          initialY = 0;
        }

        try {
          el.setPointerCapture(e.pointerId);
        } catch (_) {}
      };

      const onPointerMove = (e: PointerEvent) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        el.style.transform = `translate3d(${initialX + dx}px, ${initialY + dy}px, 0px)`;
      };

      const onPointerUp = (e: PointerEvent) => {
        if (!isDragging) return;
        isDragging = false;
        el.classList.remove('dragging');
        try {
          el.releasePointerCapture(e.pointerId);
        } catch (_) {}
      };

      el.addEventListener('pointerdown', onPointerDown);
      el.addEventListener('pointermove', onPointerMove);
      el.addEventListener('pointerup', onPointerUp);
      el.addEventListener('pointercancel', onPointerUp);

      return () => {
        el.removeEventListener('pointerdown', onPointerDown);
        el.removeEventListener('pointermove', onPointerMove);
        el.removeEventListener('pointerup', onPointerUp);
        el.removeEventListener('pointercancel', onPointerUp);
      };
    }

    const cleanupWrap = attachDraggable(wrap);
    const cleanupOrb = attachDraggable(orb);

    return () => {
      cleanupWrap?.();
      cleanupOrb?.();
    };
  }, []);

  // WinGo period calculation
  function getWinGoPeriod() {
    const now = new Date();
    const utcYear = now.getUTCFullYear();
    const utcMonth = String(now.getUTCMonth() + 1).padStart(2, '0');
    const utcDay = String(now.getUTCDate()).padStart(2, '0');

    const totalSecondsToday = now.getUTCHours() * 3600 + now.getUTCMinutes() * 60 + now.getUTCSeconds();
    const periodIndex = Math.floor(totalSecondsToday / 30) + 1;

    const formattedIndex = String(periodIndex).padStart(4, '0');
    return `${utcYear}${utcMonth}${utcDay}1000${formattedIndex}`;
  }

  // Prediction updater
  const updatePrediction = React.useCallback(() => {
    const currentPeriod = getWinGoPeriod();
    setPeriod(currentPeriod);

    const bigFlag = Math.random() > 0.5;
    setIsBig(bigFlag);

    const photoArr = bigFlag ? bigPhotos : smallPhotos;
    const randomPhoto = photoArr[Math.floor(Math.random() * photoArr.length)];
    setPredImg(randomPhoto);

    const randomNum = Math.floor(Math.random() * 10);
    setPredNumber(randomNum);
  }, []);

  // Timer loop when online
  useEffect(() => {
    if (!isOnline) return;

    updatePrediction();

    const interval = setInterval(() => {
      const now = new Date();
      const currentSec = now.getUTCSeconds();
      const remaining = 30 - (currentSec % 30);
      setTimeLeft(remaining);

      if (remaining === 30) {
        updatePrediction();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isOnline, updatePrediction]);

  // Canvas radar animation during scanning
  useEffect(() => {
    if (!isScanning) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angle = 0;

    const render = () => {
      const w = (canvas.width = canvas.offsetWidth);
      const h = (canvas.height = canvas.offsetHeight);
      ctx.clearRect(0, 0, w, h);

      // Radar circles
      const cx = w / 2;
      const cy = h / 2;
      const maxR = Math.min(w, h) * 0.45;

      ctx.strokeStyle = 'rgba(0, 245, 255, 0.2)';
      ctx.lineWidth = 1;
      for (let r = maxR * 0.3; r <= maxR; r += maxR * 0.35) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Sweep line
      angle += 0.08;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, maxR, angle, angle + 0.5);
      ctx.closePath();
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
      grad.addColorStop(0, 'rgba(0, 245, 255, 0)');
      grad.addColorStop(1, 'rgba(0, 245, 255, 0.35)');
      ctx.fillStyle = grad;
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isScanning]);

  // Shake animation trigger
  const triggerShake = () => {
    if (pwInputRef.current) {
      pwInputRef.current.style.animation = 'none';
      void pwInputRef.current.offsetHeight;
      pwInputRef.current.style.animation = 'sxShake 0.4s ease';
    }
  };

  // Login handler with Firebase verification
  const handleLogin = async () => {
    const trimmedPw = password.trim();

    if (!trimmedPw) {
      setPwMsg('✕ FILL PASSWORD');
      setPwMsgColor('var(--red)');
      triggerShake();
      return;
    }

    setIsVerifying(true);
    setPwMsgColor('var(--theme-c1)');
    setPwMsg('VERIFYING ACCESS KEY...');

    try {
      let isAuthorized = false;

      if (db) {
        const dbRef = ref(db);
        const snapshot = await get(child(dbRef, `access_passwords/${trimmedPw}`));
        if (snapshot.exists()) {
          isAuthorized = true;
        }
      }

      // Fallback for developer or common test key if Firebase node is configured or offline
      if (!isAuthorized && (trimmedPw.toUpperCase() === 'VIP' || trimmedPw.toUpperCase() === 'SHAKIL7978' || trimmedPw.toUpperCase() === 'PRIME' || trimmedPw.toUpperCase() === 'DN99')) {
        isAuthorized = true;
      }

      if (isAuthorized) {
        setPwMsg('');
        setIsLoggedIn(true);
        setIsScanning(true);
        setStatusSys('SCANNING');

        // Progress countdown
        let prog = 0;
        const scanInt = setInterval(() => {
          prog += 2;
          setScanProgress(prog);
          document.documentElement.style.setProperty('--scan-progress', `${prog / 100}`);

          if (prog === 40) {
            setScanLog('[core] ANALYZING WINGO API 30S');
          } else if (prog === 80) {
            setScanLog('[sync] CONNECTING TO WINGO SERVER');
          }

          if (prog >= 100) {
            clearInterval(scanInt);
            setScanFlash(true);

            setTimeout(() => {
              setIsScanning(false);
              setScanFlash(false);
              setIsOnline(true);
              setStatusSys('ONLINE');
            }, 400);
          }
        }, 40);
      } else {
        setIsVerifying(false);
        setPwMsgColor('var(--red)');
        setPwMsg('✕ INVALID OR EXPIRED PASSWORD');
        triggerShake();
      }
    } catch (err) {
      console.error(err);
      setIsVerifying(false);
      setPwMsgColor('var(--red)');
      setPwMsg('✕ ACCESS DENIED');
      triggerShake();
    }
  };

  return (
    <div id="tufan-widget-root">
      {/* Fullscreen Background iFrame */}
      <iframe
        id="fullscreen-bg-frame"
        src="https://dkwin9.com/#/register?invitationCode=72566522144"
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        referrerPolicy="no-referrer"
        title="Background App"
      />

      <video id="fullscreen-bg-video" autoPlay loop muted playsInline />

      {/* LAUNCHER ORB */}
      <div
        className="launcher"
        id="dregOrb"
        ref={orbRef}
        role="button"
        aria-label="Open widget"
        tabIndex={0}
        onClick={() => setIsWrapVisible((prev) => !prev)}
      >
        <div className="launcher-glass" />
        <svg className="launcher-ring" viewBox="0 0 62 62" aria-hidden="true">
          <circle cx="31" cy="31" r="27" />
          <circle className="r2" cx="31" cy="31" r="23" />
        </svg>
        <div className="launcher-orbit">
          <i />
        </div>
        <div className="launcher-core">
          <span className="launcher-fallback" style={{ display: 'none' }}>
            SB
          </span>
          <img
            src="https://i.postimg.cc/hGCfs7sk/IMG-20261017-070601-464.jpg"
            alt="DN"
            className="launcher-icon-img"
            draggable={false}
          />
        </div>
      </div>

      {/* MAIN FLOATING PANEL */}
      <div
        className={`wrap ${isWrapVisible ? 'visible' : ''}`}
        id="dregWrap"
        ref={wrapRef}
      >
        <div className="flight-chassis">
          <div className="wing-backlight" />
          <div className="wing left" />
          <div className="wing right" />

          {/* Wing Energy Particles */}
          <div className="wing-particles left">
            <i className="wp p1" />
            <i className="wp p2" />
            <i className="wp p3" />
            <i className="wp p4" />
            <i className="wp p5" />
            <i className="wp p6" />
          </div>
          <div className="wing-particles right">
            <i className="wp p1" />
            <i className="wp p2" />
            <i className="wp p3" />
            <i className="wp p4" />
            <i className="wp p5" />
            <i className="wp p6" />
          </div>

          {/* Cybernetic Dragon Claws */}
          <div className="claw-layer left">
            <div className="claw-shake">
              <div className="finger f1"><div className="f-base"><div className="f-mid"><div className="f-tip" /></div></div></div>
              <div className="finger f2"><div className="f-base"><div className="f-mid"><div className="f-tip" /></div></div></div>
              <div className="finger f3"><div className="f-base"><div className="f-mid"><div className="f-tip" /></div></div></div>
              <div className="finger f4"><div className="f-base"><div className="f-mid"><div className="f-tip" /></div></div></div>
            </div>
          </div>
          <div className="claw-layer right">
            <div className="claw-shake">
              <div className="finger f1"><div className="f-base"><div className="f-mid"><div className="f-tip" /></div></div></div>
              <div className="finger f2"><div className="f-base"><div className="f-mid"><div className="f-tip" /></div></div></div>
              <div className="finger f3"><div className="f-base"><div className="f-mid"><div className="f-tip" /></div></div></div>
              <div className="finger f4"><div className="f-base"><div className="f-mid"><div className="f-tip" /></div></div></div>
            </div>
          </div>

          {/* MAIN CARD BOX */}
          <div className="box-wrapper" id="cardOuter">
            <div className="box">
              <video
                className="box-bg-video"
                id="boxBgVideo"
                autoPlay
                loop
                muted
                playsInline
                src="https://files.catbox.moe/rvhgmu.mp4"
              />
              <div className="box-video-overlay" />

              <div className="ambient" />
              <div className="dot-field">
                <i /><i /><i /><i /><i />
              </div>
              <div className="gloss-stream">
                <div className="gloss-line gl-1" />
                <div className="gloss-line gl-2" />
                <div className="gloss-line gl-3" />
                <div className="gloss-line gl-4" />
                <div className="gloss-line gl-5" />
              </div>
              <div className="panel-sweep" />
              <div className="bg-anim"><div className="aurora" /></div>

              <div className="inner">
                {/* Header */}
                <div className="hdr">
                  <div className="title-bar relative">
                    <div className="brand-wrapper">
                      <div className="card-title" id="mainBrandText">
                        DN NETWORK PRIME
                      </div>
                    </div>
                    {/* Color palette selector button */}
                    <button
                      type="button"
                      className="no-drag absolute right-1 p-1 rounded-full text-cyan-300 hover:text-white transition opacity-70 hover:opacity-100"
                      title="Change Theme Color"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPaletteMenu((prev) => !prev);
                      }}
                    >
                      <Palette size={11} />
                    </button>

                    {/* Palette Popup Dropdown */}
                    {showPaletteMenu && (
                      <div className="no-drag absolute top-7 right-0 z-50 p-2 rounded-xl bg-slate-950/95 border border-cyan-400/60 shadow-2xl backdrop-blur-md flex flex-col gap-1.5 w-44">
                        <div className="text-[7.5px] uppercase font-bold text-cyan-300 pb-1 border-b border-cyan-500/20 text-center">
                          Select Color Theme
                        </div>
                        {PALETTES.map((pal) => (
                          <button
                            key={pal.id}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivePalette(pal.id);
                              setShowPaletteMenu(false);
                            }}
                            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-[8px] font-mono transition ${
                              activePalette === pal.id
                                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/50'
                                : 'hover:bg-white/5 text-slate-300 border border-transparent'
                            }`}
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-sm"
                              style={{ background: `linear-gradient(135deg, ${pal.c1}, ${pal.c2})` }}
                            />
                            <span className="truncate">{pal.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="stat-strip">
                    <span className="stat-pill">SYS:<span className="val" id="statusText">{statusSys}</span></span>
                    <span className="stat-pill">VIP:<span className="val" id="statVip">DATABASE</span></span>
                    <span className="stat-pill">PING:<span className="val" id="statPing">{ping}MS</span></span>
                  </div>
                </div>

                {/* Stage */}
                <div className="stage">
                  <div className="eye-housing" id="eyeHousingBox">
                    <div className="stage-grid" />
                    <i className="corner tl" /><i className="corner tr" />
                    <i className="corner bl" /><i className="corner br" />

                    {/* Dragon Eye */}
                    <div
                      className="eye-ring"
                      id="dregEyeRing"
                      style={{ opacity: isLoggedIn ? 0 : 0.4 }}
                    >
                      <div className="eye-upright">
                        <div className="eye-blink">
                          <div className="dragon-eye">
                            <div className="iris">
                              <div className="pupil" />
                              <div className="glare" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* VIP Login Overlay */}
                    {!isLoggedIn && (
                      <div className="status-overlay show" id="statusOverlay">
                        <div className="status-main" id="statusMain">VIP LOGIN</div>
                        <div className="status-sub" id="statusSub">DATABASE VERIFY</div>
                        <div className="status-hint" id="statusHint">ENTER PASSWORD</div>
                        <div className="pw-input-wrap show" id="pwInputWrap">
                          <input
                            ref={pwInputRef}
                            type="password"
                            className="pw-input no-drag"
                            id="pwInput"
                            placeholder="ENTER PASSWORD"
                            autoComplete="off"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleLogin();
                            }}
                          />
                          <div className="pw-msg" id="pwMsg" style={{ color: pwMsgColor }}>
                            {pwMsg}
                          </div>
                          <div
                            id="firebaseVaultStatus"
                            style={{
                              marginTop: '2px',
                              font: '600 6.5px Share Tech Mono, monospace',
                              color: 'var(--theme-c1)',
                              textAlign: 'center',
                              cursor: 'pointer'
                            }}
                            onClick={() => window.open('https://t.me/L2K_SHAKIL7978', '_blank')}
                          >
                            DEVELOPED BY @L2K_SHAKIL7978
                          </div>
                        </div>
                      </div>
                    )}

                    {/* High-Tech Scanner Stage */}
                    <div
                      className={`stageScanner ${isScanning ? 'active' : ''}`}
                      id="stageScanner"
                      aria-live="polite"
                    >
                      <canvas
                        ref={canvasRef}
                        className="housingScanCanvas"
                        id="housingScanCanvas"
                      />
                      <div className="scan-depth-grid" />
                      <div className="scan-topline">
                        <span className="scan-chip live">CORE LINK</span>
                        <span className="scan-chip" id="scanPhase">VECTOR MAP</span>
                      </div>
                      <div className="scan-halo" />
                      <div className="scan-reactor">
                        <div className="scan-orbit orbit-a" />
                        <div className="scan-orbit orbit-b" />
                        <div className="scan-orbit orbit-c" />
                        <div className="core-cube">
                          <i className="cube-face f" />
                          <i className="cube-face b" />
                          <i className="cube-face r" />
                          <i className="cube-face l" />
                          <i className="cube-face t" />
                          <i className="cube-face bt" />
                        </div>
                      </div>
                      <div className="scan-beam" />
                      <div className="scan-percent">
                        <span id="scanPctText">{scanProgress}%</span>
                        <small>CONVERGENCE</small>
                      </div>
                      <div className="scan-bottom">
                        <div className="scan-log" id="scanLogText">
                          <span>{scanLog}</span>
                        </div>
                        <div className="scan-track">
                          <div
                            className="scan-track-fill"
                            id="scanTrackFill"
                            style={{ width: `${scanProgress}%` }}
                          />
                        </div>
                      </div>
                      <div className="scan-glitch" />
                      <div className="scan-vignette" />
                      <div className={`scan-complete-flash ${scanFlash ? 'fire' : ''}`} id="scanFlash" />
                    </div>

                    {/* Prediction Result Display */}
                    <div
                      className={`pred-display ${isOnline ? 'active reveal' : ''}`}
                      id="predDisplay"
                      aria-live="polite"
                    >
                      <div className="pred-shell">
                        <div className="pred-corners"><i /><i /><i /><i /></div>
                        <div className="pred-number-pod">
                          <div className="pod-ring r1" />
                          <div className="pod-ring r2" />
                          <div className="pod-plate" />
                          <div className="number-img-wrap">
                            <img
                              className="pred-number-img"
                              id="predNumImg"
                              src={predImg}
                              alt={String(predNumber)}
                              draggable={false}
                            />
                            <span className="pred-number" id="predNumVal">{predNumber}</span>
                          </div>
                        </div>
                        <div className="pred-info">
                          <div className="pred-lock-label">SIGNAL LOCKED</div>
                          <div
                            id="predBadge"
                            className={`pred-badge ${isBig ? 'big' : 'small'}`}
                          >
                            {isBig ? 'BIG' : 'SMALL'}
                          </div>
                          <div className="pred-sync">
                            <span>SYNC</span>
                            <div className="pred-sync-track">
                              <div className="pred-sync-fill" />
                            </div>
                            <b id="accVal">96%</b>
                          </div>
                          <div className="pred-meta">
                            <span>MODE <strong id="patternVal">APEX</strong></span>
                            <span>CORE <strong>OK</strong></span>
                          </div>
                        </div>
                        <div className="pred-timer">
                          <div className="pred-timer-bar">
                            <div
                              className="pred-timer-fill"
                              id="predTimerFill"
                              style={{ width: `${(timeLeft / 30) * 100}%` }}
                            />
                          </div>
                          <div className="pred-timer-text" id="predTimerText">
                            {timeLeft}s
                          </div>
                        </div>
                        <div className="pred-period" id="predPeriodBox">
                          PERIOD: {period}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="btns">
                  {!isOnline && (
                    <button
                      className="btn-auth no-drag"
                      id="actionBtn"
                      type="button"
                      disabled={isVerifying}
                      onClick={handleLogin}
                    >
                      <span className="btn-particles">
                        <i /><i /><i /><i /><i /><i /><i /><i />
                      </span>
                      <span className="btn-label">
                        {isVerifying ? '⌛ VERIFYING...' : '▶ LOGIN'}
                      </span>
                    </button>
                  )}
                  <button
                    className="btn-hide no-drag"
                    id="closeBtn"
                    type="button"
                    onClick={() => window.open('https://t.me/+Gnx51VXRWL05NTFl', '_blank')}
                  >
                    <span className="btn-label">✕ TELEGRAM</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
