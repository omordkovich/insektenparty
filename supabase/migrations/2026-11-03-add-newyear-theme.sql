-- New "newyear" theme (see THEME_LABELS in src/lib/theme-presets.ts): widen
-- the allowed theme keys. Additive - every existing row still passes.
alter table public.events drop constraint events_theme_check;
alter table public.events
  add constraint events_theme_check
  check (theme = any (array[
    'natur', 'ballons', 'foam', 'halloweenclay', 'halloweengraveyard',
    'halloweenkids', 'christmaskids', 'christmassnow', 'artdeco', 'disco',
    'hippie', 'newyear', 'schwarz', 'weiss', 'gruen', 'blau', 'rot', 'gelb',
    'orange', 'pink'
  ]));
