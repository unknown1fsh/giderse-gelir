// This file exports the generic variant names and standard colors 
// that we use across our Centralized UI Architecture, acting as a single source of truth 
// for the available options in our shared components.

export type ThemeVariant =
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
    | 'premium'
    | 'glow'
    | 'success';

export type ComponentSize = 'default' | 'sm' | 'lg' | 'xl' | 'icon';

export const THEME_COLORS = {
    background: 'var(--mosaic-bg)',
    foreground: 'var(--mosaic-text)',
    primary: 'var(--mosaic-accent)',
    success: 'var(--mosaic-success)',
    danger: 'var(--mosaic-danger)',
    warning: 'var(--mosaic-warning)',
    border: 'var(--mosaic-border)',
    card: 'var(--mosaic-card)',
    muted: 'var(--mosaic-text-muted)'
};

export const Z_INDEX = {
    base: 1,
    dropdown: 40,
    sticky: 40,
    fixed: 50,
    modalBackdrop: 50,
    modal: 50,
    popover: 50,
    tooltip: 50,
};
