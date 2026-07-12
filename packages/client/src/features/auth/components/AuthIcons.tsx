import { AUTH_ICONS } from '@network/shared';

const cls = 'w-[1.06rem] h-[1.06rem] shrink-0';

export const GoogleIcon = () => (
  <svg className={cls} viewBox={AUTH_ICONS.GOOGLE.VIEWBOX} aria-hidden="true">
    <path fill={AUTH_ICONS.GOOGLE.FILL} d={AUTH_ICONS.GOOGLE.PATH} />
  </svg>
);

export const EmailIcon = () => (
  <svg
    className={cls}
    viewBox={AUTH_ICONS.EMAIL.VIEWBOX}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect
      x={AUTH_ICONS.EMAIL.RECT.x}
      y={AUTH_ICONS.EMAIL.RECT.y}
      width={AUTH_ICONS.EMAIL.RECT.width}
      height={AUTH_ICONS.EMAIL.RECT.height}
      rx={AUTH_ICONS.EMAIL.RECT.rx}
    />
    <path d={AUTH_ICONS.EMAIL.PATH} />
  </svg>
);
