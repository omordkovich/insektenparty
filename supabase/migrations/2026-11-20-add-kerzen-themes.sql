-- Allow the new "kerzenweiss" and "kerzenschwarz" (flowers and candles) event themes.
alter table public.events drop constraint if exists events_theme_check;

alter table public.events
  add constraint events_theme_check
  check (theme = any (array[
    'natur', 'ballons', 'foam', 'halloweenclay', 'halloweengraveyard',
    'halloweenkids', 'christmaskids', 'christmassnow', 'artdeco', 'disco',
    'hippie', 'newyear', 'birthdaypresents', 'birthdayprincess', 'penandpaper',
    'magic', 'pirates', 'pirateskids', 'teddy', 'cinema', 'tarot', 'karnaval',
    'pride', 'dinosaurier', 'weltall', 'einschulung', 'ninja', 'fussball',
    'toycars', 'hochzeit', 'brettspiele', 'bowling', 'hawaii', 'gaming',
    'kerzenweiss', 'kerzenschwarz',
    'schwarz', 'weiss', 'gruen', 'blau', 'rot', 'gelb', 'orange', 'pink'
  ]::text[]));
