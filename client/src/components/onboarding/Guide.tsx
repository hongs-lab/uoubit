import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as s from './Guide.css';
import { useDismissableLayer } from '@/hooks/useDismissableLayer';
import ulrinee from '@/assets/ulrinee/greeting.png';

const HIGHLIGHT_PADDING = 4;

const CURVE = { width: 19, height: 63 };
const CURVE_PATH =
  'M0.406516 0C0.406547 19.9051 -1.06788 43.1277 14.4138 46.4453';

const CALLOUT_MAX_WIDTH = 320;
const EDGE = 12;

const BELOW_RESERVE = 240;

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface GuideStep {
  target: string;
  title: string;
  body: ReactNode;
  placement?: 'below' | 'above';
  filled?: boolean;
}

const toRect = (el: Element | null): Rect | null => {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return null;
  return {
    top: r.top - HIGHLIGHT_PADDING,
    left: r.left - HIGHLIGHT_PADDING,
    width: r.width + HIGHLIGHT_PADDING * 2,
    height: r.height + HIGHLIGHT_PADDING * 2,
  };
};

const clampX = (left: number) =>
  Math.min(Math.max(left, EDGE), window.innerWidth - CALLOUT_MAX_WIDTH - EDGE);

const resolvePlacement = (
  rect: Rect,
  explicit: GuideStep['placement'],
): 'below' | 'above' => {
  if (explicit) return explicit;
  return rect.top + rect.height + BELOW_RESERVE > window.innerHeight
    ? 'above'
    : 'below';
};

const layout = (rect: Rect, placement: GuideStep['placement']) => {
  if (placement === 'above') {
    return {
      curve: { left: rect.left + rect.width - 24.5, top: rect.top - 63.5 },
      dot: { left: rect.left + rect.width - 28, top: rect.top - 66 },
      callout: {
        left: clampX(rect.left + rect.width - CALLOUT_MAX_WIDTH - 16),
        top: rect.top - 99,
      },
    };
  }
  const from = rect.top + rect.height;
  return {
    curve: { left: rect.left + 5, top: from - 1 },
    dot: { left: rect.left + 22.5, top: from + 59.5 },
    callout: { left: clampX(rect.left + 37), top: from + 50 },
  };
};

interface Props {
  steps: GuideStep[];
  label: string;
  greeting: ReactNode;
  onClose: () => void;
}

export default function Guide({ steps, label, greeting, onClose }: Props) {
  const [rects, setRects] = useState<(Rect | null)[]>([]);

  const previous = useRef('');

  const measure = useCallback(() => {
    const next = steps.map((step) =>
      toRect(document.querySelector(`[data-tour="${step.target}"]`)),
    );
    const key = JSON.stringify(next);
    if (key === previous.current) return;
    previous.current = key;
    setRects(next);
  }, [steps]);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    const id = setInterval(measure, 250);
    return () => clearInterval(id);
  }, [measure]);

  useDismissableLayer(onClose);

  return (
    <div
      className={s.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onClick={onClose}
    >
      {steps.map((step, index) => {
        const rect = rects[index];
        if (!rect) return null;
        const placement = resolvePlacement(rect, step.placement);
        const above = placement === 'above';
        const place = layout(rect, placement);
        return (
          <div key={step.target}>
            <span
              className={`${s.highlight} ${step.filled ? s.highlightFilled : ''}`}
              style={{
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
              }}
              aria-hidden="true"
            />
            <svg
              className={s.connector}
              style={{
                ...place.curve,
                transform: above ? 'rotate(180deg)' : undefined,
              }}
              width={CURVE.width}
              height={CURVE.height}
              viewBox="0 0 14.4911 46.8057"
              aria-hidden="true"
            >
              <path
                d={CURVE_PATH}
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </svg>
            <span className={s.dot} style={place.dot} aria-hidden="true" />
            <div
              className={s.callout}
              style={{ ...place.callout, maxWidth: CALLOUT_MAX_WIDTH }}
            >
              <p className={s.calloutTitle}>{step.title}</p>
              <p className={s.calloutBody}>{step.body}</p>
            </div>
          </div>
        );
      })}

      <div className={s.mascot}>
        <img className={s.mascotImage} src={ulrinee} alt="" />
        <p className={s.bubble}>{greeting}</p>
      </div>

      <p className={s.hint}>아무 곳이나 누르거나 Esc 를 눌러도 닫혀요</p>
      <button type="button" className={s.close} onClick={onClose} autoFocus>
        알겠어요
      </button>
    </div>
  );
}
