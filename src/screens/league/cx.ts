/** Joins class names, skipping the falsy ones. */
export const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(' ')
