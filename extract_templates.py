import re
import os

def extract_and_remove(html, pattern):
    match = re.search(pattern, html, flags=re.DOTALL)
    if match:
        extracted = match.group(0)
        html = html.replace(extracted, '')
        return html, extracted
    return html, None

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

html, explore_html = extract_and_remove(html, r'<!-- EXPLORE VIEW.*?<aside id="explore-view".*?</aside>')
html, virtual_trips_html = extract_and_remove(html, r'<!-- VIRTUAL TRIPS VIEW -->\s*<aside id="virtual-trips-view".*?</aside>')

# Also let's extract the config view, step form, file viewer, social modal, memory card to simplify index.html? The user said "simplify index.html because it has become a tangled mess of hidden <aside> tags".
# We can create a new file js/templates.js and inject them.
# Let's extract them all.
html, config_html = extract_and_remove(html, r'<!-- \S+\s+CONFIG VIEW.*?<aside id="config-view".*?</aside>')
html, step_form_html = extract_and_remove(html, r'<!-- \S+\s+STEP FORM VIEW.*?<aside id="step-form-view".*?</aside>')
html, social_modal_html = extract_and_remove(html, r'<!-- \S+\s+PHASE 2: SOCIAL.*?<input type="file" id="memory-upload-input"[^>]*>.*?<div id="social-celebration-modal".*?</div>\s*</div>')
html, memory_card_html = extract_and_remove(html, r'<!-- Memory Card Render View -->\s*<div id="memory-card-view".*?</div>\s*</div>')
html, file_viewer_html = extract_and_remove(html, r'<!-- \S+\s+FILE VIEWER VIEW.*?<aside id="file-viewer-view".*?</aside>')

templates = {
    'explore': explore_html,
    'virtualTrips': virtual_trips_html,
    'config': config_html,
    'stepForm': step_form_html,
    'socialModal': social_modal_html,
    'memoryCard': memory_card_html,
    'fileViewer': file_viewer_html
}

# Write a templates.js
js_code = "window.KYT_TEMPLATES = {};\n\n"
for k, v in templates.items():
    if v:
        # escape backticks and $
        v = v.replace('`', '\\`').replace('$', '\\$')
        js_code += f"window.KYT_TEMPLATES['{k}'] = `{v}`;\n\n"

with open('js/templates.js', 'w', encoding='utf-8') as f:
    f.write(js_code)

# Add template.js to index.html before app.js
html = html.replace('<script src="./js/app.js?v=4"></script>', '<script src="./js/templates.js"></script>\n  <script src="./js/app.js?v=4"></script>')

# Add Welcome Screen HTML directly to index.html
welcome_screen_html = """
  <!-- WELCOME SCREEN -->
  <aside id="welcome-view" class="fixed inset-0 bg-white z-[100] flex flex-col justify-center items-center p-6 hidden">
    <div class="text-center mb-8">
      <div class="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-blue-100">
        <i data-lucide="plane-takeoff" class="w-10 h-10"></i>
      </div>
      <h1 class="text-3xl font-black text-slate-800 mb-2">Welcome to KYT</h1>
      <p class="text-slate-500 font-medium">How would you like to get started today?</p>
    </div>
    
    <div class="space-y-4 w-full max-w-sm">
      <button id="btn-welcome-virtual" class="w-full py-4 bg-blue-600 text-white font-extrabold rounded-2xl shadow-lg hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
        <i data-lucide="compass" class="w-6 h-6"></i>
        Build Virtual Trip
      </button>
      
      <button id="btn-welcome-config" class="w-full py-4 bg-white text-slate-800 border-2 border-slate-200 font-extrabold rounded-2xl shadow-sm hover:bg-slate-50 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
        <i data-lucide="settings-2" class="w-6 h-6 text-slate-500"></i>
        Configure Upcoming Trip
      </button>
    </div>
  </aside>
"""

html = html.replace('</main>', '</main>\n' + welcome_screen_html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
