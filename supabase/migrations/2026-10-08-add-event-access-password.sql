-- Passwortgeschützte Events: null = nicht geschützt. Klartext, weil der
-- Owner das Passwort im Einladungstext braucht (geteiltes Event-Passwort,
-- kein Konto-Passwort). Additiv - der alte Code ignoriert die Spalte.
alter table public.events add column access_password text;
