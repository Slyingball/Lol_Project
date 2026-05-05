import type { HTMLAttributes, ReactNode } from 'react';

type PanelTone = 'default' | 'hero';
type PanelTag = 'section' | 'aside' | 'div';

interface PanelProps extends HTMLAttributes<HTMLElement> {
    as?: PanelTag;
    tone?: PanelTone;
    compact?: boolean;
}

interface PanelHeaderProps {
    eyebrow?: string;
    title: ReactNode;
    subtitle?: ReactNode;
    aside?: ReactNode;
}

export function Panel({
    as = 'section',
    tone = 'default',
    compact = false,
    className,
    children,
    ...props
}: PanelProps) {
    const Tag = as;
    const classes = [
        'panel',
        tone === 'hero' ? 'panel--hero' : '',
        compact ? 'panel--compact' : '',
        className ?? '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <Tag className={classes} {...props}>
            {children}
        </Tag>
    );
}

export function PanelHeader({ eyebrow, title, subtitle, aside }: PanelHeaderProps) {
    return (
        <header className="panel-header">
            <div className="panel-header__body">
                {eyebrow ? <span className="panel-header__eyebrow">{eyebrow}</span> : null}
                <div className="panel-header__title-row">
                    <h2 className="panel-header__title">{title}</h2>
                    {aside ? <div className="panel-header__aside">{aside}</div> : null}
                </div>
                {subtitle ? <p className="panel-header__subtitle">{subtitle}</p> : null}
            </div>
        </header>
    );
}
