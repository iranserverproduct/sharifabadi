"""Builds core/nav.js from nav.src.js, icons.json and empty-ill.svg."""
import json, os
here = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(here, 'nav.src.js'), encoding='utf-8').read()
icons = json.load(open(os.path.join(here, 'icons.json'), encoding='utf-8'))
ill = open(os.path.join(here, 'empty-ill.svg'), encoding='utf-8').read()
out = src.replace('/*ICONS*/', json.dumps(icons, ensure_ascii=False)).replace('/*EMPTY_ILL*/', json.dumps(ill, ensure_ascii=False))
open(os.path.join(here, 'nav.js'), 'w', encoding='utf-8').write(out)
print('nav.js', len(out))
