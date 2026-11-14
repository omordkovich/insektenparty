"""English variant of suggest.py (English occasion pages, src/lib/occasions-en.ts):
real English search questions from Google autocomplete (hl=en, gl=gb)."""
import json, re, sys, time, urllib.parse, urllib.request

URL = "https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=gb&ie=utf-8&oe=utf-8&q="
PREFIXES = ["how", "when", "what", "who", "how many", "how far in advance", "how long", "can you", "do you", "should you"]
SUFFIXES = ["invitation", "invite", "ideas", "rsvp"]
QUESTION = re.compile(r"^(how|when|what|who|where|why|can|do|does|should|is|are|which)\b")


def suggest(query):
    with urllib.request.urlopen(URL + urllib.parse.quote(query), timeout=10) as response:
        return json.loads(response.read().decode("utf-8", "replace"))[1]


for keyword in sys.argv[1:]:
    seen = []
    for query in [f"{p} {keyword}" for p in PREFIXES] + [f"{keyword} {s}" for s in SUFFIXES]:
        try:
            for s in suggest(query):
                if s not in seen:
                    seen.append(s)
        except Exception as error:
            print(f"!! {query}: {error}", file=sys.stderr)
        time.sleep(0.4)
    print(f"## {keyword}", flush=True)
    for s in seen:
        if QUESTION.match(s) or "invit" in s:
            print(f"  - {s}", flush=True)
