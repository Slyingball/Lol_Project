interface MetricBadgeProps {
    label: string;
    value: string | number;
    tone?: 'default' | 'gold' | 'hextech' | 'physical' | 'magic' | 'true' | 'success';
    helper?: string;
}

export function MetricBadge({
    label,
    value,
    tone = 'default',
    helper,
}: MetricBadgeProps) {
    return (
        <div className="metric-badge" data-tone={tone} title={helper}>
            <span className="metric-badge__value">{value}</span>
            <span className="metric-badge__label">{label}</span>
            {helper ? <span className="metric-badge__helper">{helper}</span> : null}
        </div>
    );
}
