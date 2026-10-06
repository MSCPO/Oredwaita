/* eslint-disable react-refresh/only-export-components */
import { type CSSProperties, type FC, type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import cx from 'clsx';
import './Animations.scss';

export interface SpringConfig {
  stiffness?: number;
  damping?: number;
  mass?: number;
  precision?: number;
  onRest?: () => void;
}

export interface SpringState {
  value: number;
  velocity: number;
  isAnimating: boolean;
  reset: (val?: number) => void;
}

export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

export const useSpringAnimation = (targetValue: number, config: SpringConfig = {}): SpringState => {
  const { stiffness = 180, damping = 12, mass = 1, precision = 0.001, onRest } = config;

  const [value, setValue] = useState(targetValue);
  const [velocity, setVelocity] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevTarget, setPrevTarget] = useState(targetValue);

  const stateRef = useRef({ value, velocity, targetValue });

  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const reset = useCallback(
    (val?: number) => {
      const initial = val !== undefined ? val : targetValue;
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      stateRef.current.value = initial;
      stateRef.current.velocity = 0;
      setValue(initial);
      setVelocity(0);
      setIsAnimating(false);
    },
    [targetValue],
  );

  if (targetValue !== prevTarget) {
    setPrevTarget(targetValue);
    if (!isAnimating) {
      setIsAnimating(true);
    }
  }

  useEffect(() => {
    stateRef.current.targetValue = targetValue;
    lastTimeRef.current = null;

    const step = (time: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = time;
        animFrameRef.current = requestAnimationFrame(step);

        return;
      }

      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.064);
      lastTimeRef.current = time;

      const currentVal = stateRef.current.value;
      const currentVel = stateRef.current.velocity;
      const target = stateRef.current.targetValue;

      const fSpring = -stiffness * (currentVal - target);
      const fDamping = -damping * currentVel;
      const acceleration = (fSpring + fDamping) / mass;

      const nextVel = currentVel + acceleration * dt;
      const nextVal = currentVal + nextVel * dt;

      stateRef.current.value = nextVal;
      stateRef.current.velocity = nextVel;

      setValue(nextVal);
      setVelocity(nextVel);

      const displacement = Math.abs(nextVal - target);
      if (displacement < precision && Math.abs(nextVel) < precision) {
        stateRef.current.value = target;
        stateRef.current.velocity = 0;
        setValue(target);
        setVelocity(0);
        setIsAnimating(false);
        onRest?.();
        animFrameRef.current = null;
      } else {
        animFrameRef.current = requestAnimationFrame(step);
      }
    };

    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [targetValue, stiffness, damping, mass, precision, onRest]);

  return { value, velocity, isAnimating, reset };
};

export interface TimedConfig {
  duration?: number;
  easing?: (t: number) => number;
  delay?: number;
  onComplete?: () => void;
}

export interface TimedState {
  value: number;
  isAnimating: boolean;
  progress: number;
  reset: (val?: number) => void;
}

export const useTimedAnimation = (targetValue: number, config: TimedConfig = {}): TimedState => {
  const { duration = 200, easing = easeOutCubic, delay = 0, onComplete } = config;

  const [value, setValue] = useState(targetValue);
  const [progress, setProgress] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  // Bumped by reset() so the rAF effect re-schedules even when deps below are unchanged.
  const [runNonce, setRunNonce] = useState(0);

  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  });
  const startValueRef = useRef(targetValue);
  const animFrameRef = useRef<number | null>(null);

  const reset = useCallback(
    (val?: number) => {
      const initial = val !== undefined ? val : targetValue;
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      startValueRef.current = initial;
      setValue(initial);
      setProgress(1);
      setIsAnimating(false);
      setRunNonce((n) => n + 1);
    },
    [targetValue],
  );

  if (value !== targetValue && !isAnimating) {
    setIsAnimating(true);
  }

  useEffect(() => {
    const startVal = valueRef.current;
    startValueRef.current = startVal;

    if (startVal === targetValue) {
      return;
    }

    let startTime: number | null = null;

    const step = (now: number) => {
      if (startTime === null) {
        startTime = now + delay;
      }

      if (now < startTime) {
        animFrameRef.current = requestAnimationFrame(step);

        return;
      }

      const elapsed = now - startTime;
      const rawProgress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(rawProgress);
      const currentVal = startVal + (targetValue - startVal) * easedProgress;

      setValue(currentVal);
      setProgress(rawProgress);

      if (rawProgress < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        setValue(targetValue);
        setProgress(1);
        setIsAnimating(false);
        onComplete?.();
        animFrameRef.current = null;
      }
    };

    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [targetValue, duration, easing, delay, onComplete, runNonce]);

  return { value, isAnimating, progress, reset };
};

export interface AnimatedTransitionProps {
  show?: boolean;
  type?: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale';
  duration?: number;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  unmountOnExit?: boolean;
}

export const AnimatedTransition: FC<AnimatedTransitionProps> = ({
  show = true,
  type = 'fade',
  duration = 200,
  children,
  className,
  style,
  unmountOnExit = false,
}) => {
  const [shouldRender, setShouldRender] = useState(show);

  if (show && !shouldRender) {
    setShouldRender(true);
  }

  useEffect(() => {
    if (!show && unmountOnExit) {
      const timer = setTimeout(() => setShouldRender(false), duration);

      return () => clearTimeout(timer);
    }

    return undefined;
  }, [show, unmountOnExit, duration]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={cx(
        'ore-animated-transition',
        `ore-animated-transition--${type}`,
        {
          [`ore-animated-transition--${type}--hidden`]: !show,
        },
        className,
      )}
      style={
        {
          ...style,
          '--ore-animation-duration': `${duration}ms`,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
};
