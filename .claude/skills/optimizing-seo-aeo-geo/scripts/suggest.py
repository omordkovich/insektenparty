"""Real German search questions from Google autocomplete (the data
AnswerThePublic is built on). Usage:
    python -X utf8 suggest.py "kindergeburtstag" "einladung kindergeburtstag"
Prints question-like suggestions per keyword, deduplicated."""
import json, re, sys, time, urllib.parse, urllib.request

URL = "https://suggestqueries.google.com/complete/search?client=firefox&hl=de&gl=de&ie=utf-8&oe=utf-8&q="
PREFIXES = ["wie", "wann", "was", "wer", "wie viele", "wie früh", "wie lange", "kann man", "muss man"]
SUFFIXES = ["einladung", "einladen", "planen", "wie viele"]
QUESTION = re.compile(r"^(wie|wann|was|wer|wo|warum|kann|muss|darf|sollte|welche|ab wann|bis wann)\b")


def suggest(query):
    with urllib.request.urlopen(URL + urllib.parse.quote(query), timeout=10) as response:
        return json.loads(response.read().decode("utf-8"))[1]


for keyword in sys.argv[1:]:
    seen = []
    for query in [f"{p} {keyword}" for p in PREFIXES] + [f"{keyword} {s}" for s in SUFFIXES]:
        try:
            for s in suggest(query):
                if s not in seen:
                    seen.append(s)
        except Exception as error:  # network hiccup: keep going
            print(f"!! {query}: {error}", file=sys.stderr)
        time.sleep(0.4)  # be gentle
    print(f"## {keyword}")
    for s in seen:
        if QUESTION.match(s) or "einlad" in s:
            print(f"  - {s}")
