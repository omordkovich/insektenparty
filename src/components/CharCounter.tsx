type CharCounterProps = {
  length: number;
  max: number;
};

// Small "noch 245 Zeichen" right under a text field with a length limit.
// Type styles are reset because some fields sit inside large headings.
export function CharCounter({ length, max }: CharCounterProps) {
  return (
    <span className="mt-1 block text-right font-sans text-xs font-normal tracking-normal normal-case text-muted">
      noch {Math.max(0, max - length)} Zeichen
    </span>
  );
}
