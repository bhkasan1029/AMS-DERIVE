import { useEffect, useRef } from 'react';

const PARTICLE_COUNT = 2400;
const PER_DIGIT = PARTICLE_COUNT / 8;
const REPEL_RADIUS = 100;
const REPEL_STRENGTH = 6;
const SPRING = 0.032;
const DAMPING = 0.86;
const BG = '#1E1E1E';

let _off = null;

function timeToDigits({ days, hours, minutes, seconds }) {
  const p = (n) => String(n).padStart(2, '0');
  return (p(days) + p(hours) + p(minutes) + p(seconds)).split('').map(Number);
}

function computeLayout(W, H) {
  const fontSize = Math.min(W * 0.09, H * 0.22);
  const tmp = document.createElement('canvas').getContext('2d');
  tmp.font = `900 ${fontSize}px Georgia, serif`;
  const digitW = tmp.measureText('8').width * 1.15;
  const colonW = fontSize * 0.35;
  const groupGap = fontSize * 0.2;
  const pairW = digitW * 2;
  const sepW = groupGap + colonW + groupGap;
  const totalW = pairW * 4 + sepW * 3;
  const startX = (W - totalW) / 2;
  const cy = H * 0.54;

  const positions = [];
  const colonXs = [];
  let x = startX;

  for (let g = 0; g < 4; g++) {
    positions.push({ x: x + digitW / 2, y: cy });
    x += digitW;
    positions.push({ x: x + digitW / 2, y: cy });
    x += digitW;
    if (g < 3) {
      x += groupGap;
      colonXs.push(x + colonW / 2);
      x += colonW + groupGap;
    }
  }

  return { positions, colonXs, fontSize, cy };
}

function sampleDigitAt(digit, cx, cy, fontSize, W, H) {
  if (!_off || _off.width !== W || _off.height !== H) {
    _off = document.createElement('canvas');
    _off.width = W;
    _off.height = H;
  }
  const c = _off.getContext('2d');
  c.clearRect(0, 0, W, H);
  c.fillStyle = '#fff';
  c.font = `900 ${fontSize}px Georgia, serif`;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(String(digit), cx, cy);

  const data = c.getImageData(0, 0, W, H).data;
  const pts = [];
  const r = fontSize * 0.75;
  const x0 = Math.max(0, Math.floor(cx - r));
  const x1 = Math.min(W, Math.ceil(cx + r));
  const y0 = Math.max(0, Math.floor(cy - r));
  const y1 = Math.min(H, Math.ceil(cy + r));
  const step = fontSize < 60 ? 1 : 2;

  for (let y = y0; y < y1; y += step)
    for (let x = x0; x < x1; x += step)
      if (data[(y * W + x) * 4 + 3] > 100) pts.push({ x, y });

  for (let i = pts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pts[i], pts[j]] = [pts[j], pts[i]];
  }

  const out = [];
  for (let i = 0; i < PER_DIGIT; i++) out.push({ ...pts[i % pts.length] });
  return out;
}

function buildAllParticles(digits, layout, W, H, existing) {
  const ps = [];
  for (let i = 0; i < 8; i++) {
    const pos = layout.positions[i];
    const targets = sampleDigitAt(
      digits[i],
      pos.x,
      pos.y,
      layout.fontSize,
      W,
      H
    );
    for (let j = 0; j < PER_DIGIT; j++) {
      const idx = i * PER_DIGIT + j;
      const ex = existing[idx];
      ps.push({
        x: ex ? ex.x : Math.random() * W,
        y: ex ? ex.y : Math.random() * H,
        vx: 0,
        vy: 0,
        tx: targets[j].x,
        ty: targets[j].y,
        size: Math.random() * 1.8 + 0.5,
        alpha: Math.random() * 0.3 + 0.7,
      });
    }
  }
  return ps;
}

function ParticleCountdown({ time }) {
  const canvasRef = useRef(null);
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const rafRef = useRef(null);
  const stRef = useRef({
    particles: [],
    mouse: { x: -9999, y: -9999 },
    layout: null,
    W: 0,
    H: 0,
    prevDigits: null,
  });

  const digits = timeToDigits(time);
  const digitsRef = useRef(digits);
  digitsRef.current = digits;

  // Canvas setup + animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const s = stRef.current;

    function resize() {
      const W = canvas.parentElement.clientWidth;
      const H = canvas.parentElement.clientHeight;
      canvas.width = W;
      canvas.height = H;
      s.W = W;
      s.H = H;
      s.layout = computeLayout(W, H);
      s.particles = buildAllParticles(
        digitsRef.current,
        s.layout,
        W,
        H,
        s.particles
      );
      s.prevDigits = [...digitsRef.current];
    }

    function loop() {
      const { W, H, particles: ps, mouse: m, layout } = s;
      if (!W || !H) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);

      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        p.vx += (p.tx - p.x) * SPRING;
        p.vy += (p.ty - p.y) * SPRING;

        const mdx = p.x - m.x;
        const mdy = p.y - m.y;
        const dist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (dist < REPEL_RADIUS && dist > 0) {
          const force =
            ((REPEL_RADIUS - dist) / REPEL_RADIUS) * REPEL_STRENGTH;
          p.vx += (mdx / dist) * force;
          p.vy += (mdy / dist) * force;
        }

        p.vx *= DAMPING;
        p.vy *= DAMPING;
        p.x += p.vx;
        p.y += p.vy;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
        ctx.fill();
      }

      // Colons
      if (layout) {
        const dotR = Math.max(2.5, layout.fontSize * 0.045);
        const gap = layout.fontSize * 0.18;
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        for (const cx of layout.colonXs) {
          ctx.beginPath();
          ctx.arc(cx, layout.cy - gap, dotR, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(cx, layout.cy + gap, dotR, 0, Math.PI * 2);
          ctx.fill();
        }

        // Labels
        const labels = ['DAYS', 'HOURS', 'MINS', 'SECS'];
        const labelSize = Math.max(9, layout.fontSize * 0.13);
        ctx.fillStyle = '#4AAED4';
        ctx.font = `400 ${labelSize}px "PT Serif", serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        for (let g = 0; g < 4; g++) {
          const p1 = layout.positions[g * 2];
          const p2 = layout.positions[g * 2 + 1];
          const cx = (p1.x + p2.x) / 2;
          const ly = layout.cy + layout.fontSize * 0.58;
          ctx.fillText(labels[g], cx, ly);
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    resize();
    window.addEventListener('resize', resize);
    rafRef.current = requestAnimationFrame(loop);

    // Mouse events on the container
    const container = canvas.parentElement;
    function onMove(e) {
      const rect = container.getBoundingClientRect();
      s.mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      if (dotRef.current) {
        dotRef.current.style.left = e.clientX + 'px';
        dotRef.current.style.top = e.clientY + 'px';
        dotRef.current.style.opacity = '1';
      }
      if (ringRef.current) {
        ringRef.current.style.left = e.clientX + 'px';
        ringRef.current.style.top = e.clientY + 'px';
        ringRef.current.style.opacity = '1';
      }
    }
    function onLeave() {
      s.mouse = { x: -9999, y: -9999 };
      if (dotRef.current) dotRef.current.style.opacity = '0';
      if (ringRef.current) ringRef.current.style.opacity = '0';
    }

    container.addEventListener('mousemove', onMove);
    container.addEventListener('mouseleave', onLeave);

    return () => {
      window.removeEventListener('resize', resize);
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Retarget only changed digits
  const digitsKey = digits.join('');
  useEffect(() => {
    const s = stRef.current;
    if (!s.layout || !s.prevDigits || !s.particles.length) return;

    const { prevDigits, layout, W, H, particles } = s;
    for (let i = 0; i < 8; i++) {
      if (digits[i] !== prevDigits[i]) {
        const pos = layout.positions[i];
        const targets = sampleDigitAt(
          digits[i],
          pos.x,
          pos.y,
          layout.fontSize,
          W,
          H
        );
        for (let j = 0; j < PER_DIGIT; j++) {
          const p = particles[i * PER_DIGIT + j];
          p.tx = targets[j].x;
          p.ty = targets[j].y;
        }
      }
    }
    s.prevDigits = [...digits];
  }, [digitsKey]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        cursor: 'none',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.5)',
          pointerEvents: 'none',
          zIndex: 999,
          transform: 'translate(-50%,-50%)',
          opacity: 0,
        }}
      />
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.15)',
          pointerEvents: 'none',
          zIndex: 998,
          transform: 'translate(-50%,-50%)',
          opacity: 0,
        }}
      />
    </div>
  );
}

export default ParticleCountdown;
