export const appTheme = {
  header: {
    root: 'border-b border-default bg-default/80 shadow-sm backdrop-blur-xl',
    container: 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8',
    right: 'gap-2',
    title: 'text-lg sm:text-xl font-semibold tracking-tight',
  },
  button: {
    base: 'rounded-xl font-semibold shadow-sm',
  },
  formField: {
    label: 'text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted',
    description: 'mt-1 text-sm/6 text-muted',
    error: 'mt-2 text-sm font-medium',
  },
  input: {
    base: 'rounded-xl shadow-sm',
  },
  textarea: {
    base: 'rounded-2xl shadow-sm leading-6',
  },
  card: {
    root: 'rounded-2xl bg-default/90 shadow-sm ring ring-default',
    header: 'p-5 sm:px-6',
    title: 'text-base font-semibold tracking-tight',
    description: 'mt-1 text-sm/6 text-muted',
    body: 'p-5 sm:p-6',
    footer: 'p-5 sm:px-6',
  },
  modal: {
    overlay: 'backdrop-blur-xs',
    content: 'rounded-[1.5rem] bg-default/95 shadow-2xl ring ring-default',
    header: 'px-5 sm:px-6',
    title: 'text-lg font-semibold tracking-tight',
    description: 'text-sm/6 text-muted',
    body: 'p-5 sm:p-6',
  },
  alert: {
    root: 'rounded-2xl border border-default shadow-sm',
    title: 'text-sm font-semibold tracking-tight',
    description: 'text-sm/6',
    actions: 'mt-3',
  },
  fileUpload: {
    base: 'rounded-2xl border-dashed shadow-inner',
    wrapper: 'py-4',
    label: 'text-sm font-semibold',
    description: 'text-sm/6',
  },
} as const
