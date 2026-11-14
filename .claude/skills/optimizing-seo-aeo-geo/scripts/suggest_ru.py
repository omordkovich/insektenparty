"""Russian variant of suggest.py (Russian occasion pages, src/lib/occasions-ru/):
real Russian search questions from Google autocomplete (hl=ru), asked for two
regions - Russia (gl=ru) and Germany (gl=de) - because the pages address
Russian speakers worldwide, including those living in Germany.

Usage: python -X utf8 suggest_ru.py "день рождения ребенка" "свадьба"
"""
import json, re, sys, time, urllib.parse, urllib.request

URL = "https://suggestqueries.google.com/complete/search?client=firefox&hl=ru&gl={gl}&ie=utf-8&oe=utf-8&q="
REGIONS = ["ru", "de"]
PREFIXES = ["как", "когда", "что", "сколько", "за сколько", "кого", "как пригласить на", "можно ли", "нужно ли"]
SUFFIXES = ["приглашение", "пригласить", "как организовать", "идеи"]
QUESTION = re.compile(r"^(как|когда|что|сколько|за сколько|кого|где|почему|зачем|можно ли|нужно ли|стоит ли|какой|какие|кто)\b")


def suggest(query, gl):
    with urllib.request.urlopen(URL.format(gl=gl) + urllib.parse.quote(query), timeout=10) as response:
        return json.loads(response.read().decode("utf-8", "replace"))[1]


for keyword in sys.argv[1:]:
    seen = {}
    for gl in REGIONS:
        for query in [f"{p} {keyword}" for p in PREFIXES] + [f"{keyword} {s}" for s in SUFFIXES]:
            try:
                for s in suggest(query, gl):
                    seen.setdefault(s, set()).add(gl)
            except Exception as error:
                print(f"!! {query} ({gl}): {error}", file=sys.stderr)
            time.sleep(0.3)
    print(f"## {keyword}", flush=True)
    for s, regions in seen.items():
        if QUESTION.match(s) or "приглаш" in s:
            print(f"  - {s}  [{','.join(sorted(regions))}]", flush=True)
