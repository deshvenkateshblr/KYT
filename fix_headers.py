import re
import os

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Fix </header>
html = re.sub(r'(<header[^>]*>.*?)(</div>)(\s*<div)', r'\1</header>\3', html, flags=re.DOTALL)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
