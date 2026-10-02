const fs = require('fs');
let cfg = fs.readFileSync('js/config.js', 'utf8');

// We want to replace the HTML template for the step row in config.js
const oldTemplateRegex = /<div class="config-step-row flex items-center gap-3 p-4[\s\S]*?<\/div>\s*`/;

const newTemplate = `<div class="config-step-row flex items-center gap-1.5 sm:gap-3 p-3 sm:p-4 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-slate-200" draggable="true" data-index="\${index}">

          <span class="drag-handle p-1 sm:p-1.5 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing shrink-0" title="Drag to reorder">
            <i data-lucide="grip-vertical" class="w-4 h-4"></i>
          </span>

          <div class="p-2 sm:p-2.5 bg-slate-50 text-kyt-subtext rounded-xl shrink-0 hidden sm:block">
            <i data-lucide="\${step.icon}" class="w-4 h-4 sm:w-5 sm:h-5"></i>
          </div>

          <div class="flex-1 overflow-hidden min-w-0">
            <p class="text-[14px] sm:text-[15px] font-bold text-kyt-text truncate">\${step.title}</p>
            <div class="flex items-center gap-1.5 mt-0.5 min-w-0">
              <span class="text-[11px] sm:text-[12px] font-semibold text-kyt-subtext whitespace-nowrap">\${KYT.clock.formatTimeExact(step.targetTime)}</span>
              <span class="w-1 h-1 bg-slate-300 rounded-full shrink-0"></span>
              <span class="text-[11px] sm:text-[12px] text-slate-500 truncate">\${step.where || '—'}</span>
            </div>
          </div>

          <div class="flex items-center shrink-0">
            <div class="flex flex-col gap-0.5">
              <button class="p-1 text-slate-300 hover:text-kyt-accent transition-colors \${index === 0 ? 'opacity-0 pointer-events-none' : ''}" onclick="KYT.config.moveStep(\${index}, -1)" title="Move up">
                <i data-lucide="chevron-up" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i>
              </button>
              <button class="p-1 text-slate-300 hover:text-kyt-accent transition-colors \${index === stepsData.length - 1 ? 'opacity-0 pointer-events-none' : ''}" onclick="KYT.config.moveStep(\${index}, 1)" title="Move down">
                <i data-lucide="chevron-down" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i>
              </button>
            </div>
            
            <div class="w-px h-6 bg-slate-100 mx-1"></div>
            
            <div class="flex flex-col gap-0.5">
              <button class="p-1 text-slate-300 hover:text-rose-500 transition-colors" onclick="KYT.config.deleteStep(\${index})" title="Delete">
                <i data-lucide="trash-2" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i>
              </button>
              <button class="p-1 text-slate-300 hover:text-blue-500 transition-colors" onclick="KYT.stepForm.openEdit(\${index})" title="Edit">
                <i data-lucide="pencil" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i>
              </button>
            </div>
          </div>
        </div>\`;`;

cfg = cfg.replace(oldTemplateRegex, newTemplate);
fs.writeFileSync('js/config.js', cfg);
console.log('Fixed mobile UX');

