import { type FC } from 'react';
import cx from 'clsx';
import './Avatar.scss';

export type AvatarColor = 'blue' | 'green' | 'yellow' | 'orange' | 'red' | 'purple' | 'brown';

export interface AvatarProps {
  text?: string;
  src?: string;
  size?: number;
  showInitials?: boolean;
  /** Overrides the color derived from hashing `text`. `blue` maps to the navy ramp. */
  color?: AvatarColor;
  className?: string;
}

export const Avatar: FC<AvatarProps> = ({ text = '', src, size = 40, showInitials = true, color, className }) => {
  const getInitials = (name: string) => {
    if (!name) {
      return '?';
    }
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    return name.slice(0, 2).toUpperCase();
  };

  const getColorClass = (name: string) => {
    if (color) {
      return `ore-avatar--${color}`;
    }
    if (!name) {
      return 'ore-avatar--blue';
    }
    const colors = ['blue', 'green', 'yellow', 'orange', 'red', 'purple', 'brown'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hashed = colors[Math.abs(hash) % colors.length];

    return `ore-avatar--${hashed}`;
  };

  return (
    <div
      className={cx('ore-avatar', getColorClass(text), className)}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {src ? (
        <img src={src} alt={text} className="ore-avatar__img" />
      ) : (
        showInitials && <span className="ore-avatar__initials">{getInitials(text)}</span>
      )}
    </div>
  );
};
