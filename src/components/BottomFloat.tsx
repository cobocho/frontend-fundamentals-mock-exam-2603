import { css } from '@emotion/react';
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

export type BottomFloatProps = {
  children: ReactNode | ((state: { isKeyboardOpen: boolean }) => ReactNode);
  style?: CSSProperties;
  className?: string;
};

export function BottomFloat({ children, style, className }: BottomFloatProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const update = useCallback(() => {
    if (!ref.current) return;
    const viewport = window.visualViewport;
    if (!viewport) return;

    const bottom = window.innerHeight - viewport.height - viewport.offsetTop;
    const offset = Math.max(0, bottom);
    ref.current.style.transform = `translateY(${-offset}px)`;
    setIsKeyboardOpen(offset > 0);
  }, []);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    viewport.addEventListener('resize', update);
    viewport.addEventListener('scroll', update);

    return () => {
      viewport.removeEventListener('resize', update);
      viewport.removeEventListener('scroll', update);
    };
  }, [update]);

  return (
    <div ref={ref} css={rootStyle} className={className} style={style}>
      {typeof children === 'function' ? children({ isKeyboardOpen }) : children}
    </div>
  );
}

const rootStyle = css`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
`;
