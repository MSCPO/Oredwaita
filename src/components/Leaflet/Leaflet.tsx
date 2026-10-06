import {
  Children,
  type FC,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import cx from 'clsx';
import './Leaflet.scss';

export interface LeafletPageProps {
  id: string;
  title?: string;
  navigatable?: boolean;
  children?: ReactNode;
  className?: string;
}

export const LeafletPage: FC<LeafletPageProps> = ({ children, className }) => {
  return <div className={cx('ore-leaflet-page', className)}>{children}</div>;
};

export interface LeafletProps {
  children: ReactNode;
  visiblePageId?: string;
  foldThreshold?: number;
  folded?: boolean;
  transitionType?: 'slide' | 'over' | 'under' | 'crossfade';
  className?: string;
}

export const Leaflet: FC<LeafletProps> = ({
  children,
  visiblePageId,
  foldThreshold = 650,
  folded: explicitFolded,
  transitionType = 'slide',
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [internalFolded, setInternalFolded] = useState<boolean>(false);
  const isFolded = explicitFolded !== undefined ? explicitFolded : internalFolded;

  useEffect(() => {
    if (explicitFolded !== undefined) {
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    const checkFold = (width: number) => {
      setInternalFolded(width < foldThreshold);
    };

    if (containerRef.current && typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver((entries) => {
        if (entries[0]) {
          checkFold(entries[0].contentRect.width);
        }
      });
      observer.observe(containerRef.current);

      return () => observer.disconnect();
    } else {
      const handleResize = () => {
        const width = containerRef.current ? containerRef.current.getBoundingClientRect().width : window.innerWidth;
        checkFold(width);
      };
      handleResize();
      window.addEventListener('resize', handleResize);

      return () => window.removeEventListener('resize', handleResize);
    }
  }, [foldThreshold, explicitFolded]);

  const childList = Children.toArray(children).filter(isValidElement) as ReactElement<LeafletPageProps>[];
  const activeId = visiblePageId || (childList[0]?.props?.id ?? '');
  const activeIndex = childList.findIndex((child) => child.props.id === activeId);

  return (
    <div
      ref={containerRef}
      className={cx(
        'ore-leaflet',
        `ore-leaflet--${isFolded ? 'folded' : 'unfolded'}`,
        `ore-leaflet--transition-${transitionType}`,
        className,
      )}
    >
      {childList.map((child, index) => {
        const isVisible = child.props.id === activeId || !isFolded;
        const isBefore = index < (activeIndex >= 0 ? activeIndex : 0);

        return (
          <div
            key={child.props.id || index}
            className={cx('ore-leaflet-page-wrapper', {
              'ore-leaflet-page--visible': isVisible,
              'ore-leaflet-page--hidden-left': isFolded && !isVisible && isBefore,
              'ore-leaflet-page--hidden-right': isFolded && !isVisible && !isBefore,
            })}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
};
