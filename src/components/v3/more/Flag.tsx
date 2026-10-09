import React from 'react';
import Svg, { Rect, Circle, Polygon, Path } from 'react-native-svg';
import { more } from '../../../theme/v3/colors';

type Emblem = { kind: 'crescent-star' | 'star' | 'disc' | 'wheel' | 'triangle'; color: string; on: string };
type Spec = { dir: 'h' | 'v'; bands: string[]; emblem?: Emblem };

const RED = '#CE1126';
const GREEN = '#007A3D';
const BLACK = '#111111';
const WHITE = '#F4F8F5';
const GOLD = '#D9AE5F';

const FLAGS: Record<string, Spec> = {
  iq: { dir: 'h', bands: [RED, WHITE, BLACK], emblem: { kind: 'star', color: GREEN, on: WHITE } },
  eg: { dir: 'h', bands: [RED, WHITE, BLACK], emblem: { kind: 'disc', color: GOLD, on: WHITE } },
  sy: { dir: 'h', bands: [RED, WHITE, BLACK], emblem: { kind: 'star', color: GREEN, on: WHITE } },
  ye: { dir: 'h', bands: [RED, WHITE, BLACK] },
  sd: { dir: 'h', bands: [RED, WHITE, BLACK], emblem: { kind: 'triangle', color: GREEN, on: RED } },
  ir: { dir: 'h', bands: [GREEN, WHITE, RED], emblem: { kind: 'disc', color: RED, on: WHITE } },
  in: { dir: 'h', bands: ['#FF9933', WHITE, '#138808'], emblem: { kind: 'wheel', color: '#1F3C88', on: WHITE } },
  uz: { dir: 'h', bands: ['#1EB53A', WHITE, '#0099B5'], emblem: { kind: 'crescent-star', color: WHITE, on: '#0099B5' } },
  ly: { dir: 'h', bands: [RED, BLACK, GREEN], emblem: { kind: 'crescent-star', color: WHITE, on: BLACK } },
  af: { dir: 'v', bands: [BLACK, RED, GREEN], emblem: { kind: 'disc', color: WHITE, on: RED } },
  sn: { dir: 'v', bands: ['#00853F', '#FDEF42', '#E31B23'], emblem: { kind: 'star', color: '#00853F', on: '#FDEF42' } },
  dz: { dir: 'v', bands: [GREEN, WHITE], emblem: { kind: 'crescent-star', color: RED, on: WHITE } },
  ng: { dir: 'v', bands: ['#008751', WHITE, '#008751'] },
  pk: { dir: 'v', bands: [WHITE, '#01411C', '#01411C'], emblem: { kind: 'crescent-star', color: WHITE, on: '#01411C' } },
  tr: { dir: 'h', bands: [RED], emblem: { kind: 'crescent-star', color: WHITE, on: RED } },
  ma: { dir: 'h', bands: [RED], emblem: { kind: 'star', color: GREEN, on: RED } },
  kz: { dir: 'h', bands: ['#00AFCA'], emblem: { kind: 'disc', color: '#FEC50C', on: '#00AFCA' } },
  sa: { dir: 'h', bands: ['#165D31'], emblem: { kind: 'disc', color: WHITE, on: '#165D31' } },
};

const W = 30;
const H = 20;

function starPoints(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.42;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(' ');
}

function Emblematic({ e }: { e: Emblem }) {
  const cx = W / 2;
  const cy = H / 2;
  switch (e.kind) {
    case 'crescent-star':
      return (
        <>
          <Circle cx={cx - 2.4} cy={cy} r={5} fill={e.color} />
          <Circle cx={cx - 0.8} cy={cy} r={4.1} fill={e.on} />
          <Polygon points={starPoints(cx + 5.2, cy, 2.6)} fill={e.color} />
        </>
      );
    case 'star':
      return <Polygon points={starPoints(cx, cy, 4.4)} fill={e.color} />;
    case 'disc':
      return <Circle cx={cx} cy={cy} r={3.6} fill={e.color} />;
    case 'wheel':
      return (
        <>
          <Circle cx={cx} cy={cy} r={3.6} fill="none" stroke={e.color} strokeWidth={1} />
          <Circle cx={cx} cy={cy} r={1} fill={e.color} />
        </>
      );
    case 'triangle':
      return <Path d={`M0 0 L${W * 0.42} ${H / 2} L0 ${H} Z`} fill={e.color} />;
  }
}

export default function Flag({ country }: { country: string }) {
  const spec = FLAGS[country];
  return (
    <Svg width={W} height={H} pointerEvents="none">
      <Rect x={0} y={0} width={W} height={H} rx={4} fill={more.raised} />
      {spec &&
        spec.bands.map((c, i) => {
          const n = spec.bands.length;
          return spec.dir === 'h' ? (
            <Rect key={i} x={0} y={(H / n) * i} width={W} height={H / n + 0.4} fill={c} />
          ) : (
            <Rect key={i} x={(W / n) * i} y={0} width={W / n + 0.4} height={H} fill={c} />
          );
        })}
      {spec?.emblem && <Emblematic e={spec.emblem} />}
      <Rect x={0.5} y={0.5} width={W - 1} height={H - 1} rx={3.5} fill="none" stroke={more.strong} strokeWidth={1} />
    </Svg>
  );
}
