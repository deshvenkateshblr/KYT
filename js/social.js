window.KYT = window.KYT || {};
window.KYT.social = (() => {
  const socialModal      = document.getElementById('social-celebration-modal');
  const btnCloseSocial   = document.getElementById('btn-close-social');
  const btnGenerateCard  = document.getElementById('btn-generate-card');
  const memoryCardView   = document.getElementById('memory-card-view');
  const memoryCardCanvas = document.getElementById('memory-card-canvas');
  const btnCloseCard     = document.getElementById('btn-close-card');
  const btnDownloadCard  = document.getElementById('btn-download-card');
  
  function showCelebrationModal() {
    if(socialModal) {
      socialModal.classList.remove('hidden');
      socialModal.classList.add('flex');
    }
    if(window.lucide) lucide.createIcons();
  }

  function hideCelebrationModal() {
    if(socialModal) {
      socialModal.classList.add('hidden');
      socialModal.classList.remove('flex');
    }
  }

  function checkCompletion() {
    const { stepsData } = KYT.store.get();
    if (stepsData.length > 0 && stepsData.every(s => s.status === 'done')) {
      showCelebrationModal();
    }
  }

  const catMap = {
    'plane': { label: 'Travel', color: '#0369A1', bg: '#E0F2FE' },
    'bed': { label: 'Stays', color: '#4338CA', bg: '#E0E7FF' },
    'utensils': { label: 'Food', color: '#C2410C', bg: '#FFEDD5' },
    'landmark': { label: 'Places', color: '#BE123C', bg: '#FFE4E6' },
    'waves': { label: 'Water', color: '#0369A1', bg: '#CFFAFE' },
    'tree-pine': { label: 'Nature', color: '#047857', bg: '#D1FAE5' },
    'ticket': { label: 'Events', color: '#A21CAF', bg: '#FAE8FF' },
    'shopping-bag': { label: 'Shop', color: '#BE185D', bg: '#FCE7F3' },
    'camera': { label: 'Sights', color: '#6D28D9', bg: '#EDE9FE' },
    'coffee': { label: 'Breaks', color: '#B45309', bg: '#FEF3C7' }
  };

  function buildPDFGrid(images) {
    if (!images || images.length === 0) return '';
    
    let imgHtml = images.map((img, i) => {
      if (images.length === 1) {
        return `
        <div class="w-full mb-6" style="page-break-inside: avoid; break-inside: avoid; display: block;">
          <img src="${img}" style="page-break-inside: avoid; break-inside: avoid; display: block;" class="rounded-2xl border border-slate-200 shadow-sm w-full h-auto max-h-[400px] object-contain object-left">
        </div>
        `;
      } else {
        const isRightCol = i % 2 !== 0;
        const mr = isRightCol ? '0px' : '24px';
        return `
        <div class="mb-6" style="width: calc(50% - 12px); margin-right: ${mr}; page-break-inside: avoid; break-inside: avoid; display: inline-block; vertical-align: top;">
          <img src="${img}" style="page-break-inside: avoid; break-inside: avoid; display: block;" class="rounded-2xl border border-slate-200 shadow-sm w-full h-auto max-h-[400px] object-contain object-left">
        </div>
        `;
      }
    }).join('');
    
    return `
      <div class="mt-6 w-full" style="font-size: 0;">
        ${imgHtml}
      </div>
    `;
  }

  async function generateMemoryCard() {
    const { tripName, tripCoverImage, stepsData } = KYT.store.get();
    
    if(memoryCardView) memoryCardView.classList.remove('hidden');
    
    if (stepsData.length === 0) {
      memoryCardCanvas.innerHTML = `
        <div class="flex flex-col items-center justify-center w-full min-h-[400px] text-center px-6">
          <i data-lucide="map" class="w-12 h-12 text-slate-300 mb-4"></i>
          <h4 class="text-xl font-bold text-slate-600 mb-2">No Steps Found</h4>
          <p class="text-sm text-slate-400 max-w-sm mx-auto">Build your itinerary first to generate a beautiful printable PDF report!</p>
        </div>`;
      if(window.lucide) lucide.createIcons({ root: memoryCardCanvas });
      return;
    }
    
    memoryCardCanvas.innerHTML = '<p class="text-center text-slate-500 w-full animate-pulse my-12">Generating PDF Layout...</p>';
    
    const sortedSteps = [...stepsData].sort((a, b) => a.targetTime - b.targetTime);
    const startDate = sortedSteps[0].targetTime;
    const endDate = sortedSteps[sortedSteps.length - 1].targetTime;
    
    const formatShort = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const formatLong = (date) => date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const dateRangeStr = startDate.toDateString() === endDate.toDateString() ? formatShort(startDate) : `${formatShort(startDate)} - ${formatShort(endDate)}`;

    const days = [];
    let currentDayDate = null;
    let currentDayGroup = null;
    let totalPhotos = 0;

    const allUniqueDates = [...new Set(sortedSteps.map(s => s.targetTime.toDateString()))];

    sortedSteps.forEach(step => {
      const dStr = step.targetTime.toDateString();
      if (dStr !== currentDayDate) {
        currentDayDate = dStr;
        const absoluteDayNum = allUniqueDates.indexOf(dStr) + 1;
        currentDayGroup = { 
          dateLongStr: formatLong(step.targetTime), 
          dayNum: absoluteDayNum, 
          steps: [] 
        };
        days.push(currentDayGroup);
      }
      currentDayGroup.steps.push(step);
      if (step.memories) totalPhotos += step.memories.length;
    });

    let html = '';

    // COVER PAGE
    html += `
      <div class="flex flex-col items-center justify-center min-h-[85vh] text-center py-12 px-4">
        <div class="flex flex-col items-center mb-8 opacity-70">
          <img src="./icons/icon.svg" class="w-12 h-12 rounded-xl mb-3 shadow-md" alt="KYT Logo">
          <p class="font-bold tracking-[0.15em] text-slate-400 text-xs uppercase">KYT &mdash; Know Your Travel</p>
        </div>
        
        <div class="w-full h-64 md:h-[450px] rounded-3xl overflow-hidden mb-12 shadow-xl border border-slate-200">
          ${tripCoverImage 
            ? `<img src="${tripCoverImage}" class="w-full h-full object-cover">` 
            : `<div class="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center"><span class="text-7xl">🌍</span></div>`
          }
        </div>
        <h4 class="text-blue-600 font-bold tracking-[0.2em] uppercase mb-4 text-sm md:text-base">Memory Journal</h4>
        <h1 class="text-4xl md:text-6xl font-extrabold text-slate-900 mb-8 leading-tight max-w-3xl">${tripName}</h1>
        <p class="text-slate-500 font-bold text-lg md:text-xl mb-12">${dateRangeStr} &nbsp;•&nbsp; ${totalPhotos} Photos</p>
        
        <div class="mt-4 flex flex-col items-center opacity-80">
          <a href="https://vividnova.com/KYT/" target="_blank" class="text-blue-500 hover:text-blue-600 font-semibold underline decoration-blue-300 underline-offset-4 text-base mb-3 transition-colors">
            https://vividnova.com/KYT/
          </a>
          <p class="text-xs text-slate-400 max-w-md text-center leading-relaxed">
            vividnova.com is home to browser based tools. Built through the collaboration of human insight and AI. No accounts, no tracking, no data leaves your browser. Your private personal apps.
          </p>
        </div>
      </div>
    `;

    // DAILY CHAPTERS (All steps included)
    days.forEach((day, index) => {
      
      let stepsHtml = '';
      day.steps.forEach(s => {
        const c = catMap[s.icon] || catMap['camera'];
        stepsHtml += `
          <div class="mb-12 pl-8 border-l-[3px] border-slate-100 relative pb-4">
            <!-- Icon Marker -->
            <div class="absolute -left-[18px] top-0 w-9 h-9 rounded-full flex items-center justify-center ring-4 ring-white shadow-sm" style="background: ${c.bg}; color: ${c.color};">
              <i data-lucide="${s.icon}" class="w-4 h-4 stroke-[2.5px]"></i>
            </div>
            
            <!-- Step Header -->
            <div class="mb-5 pt-1" style="break-inside: avoid; break-after: avoid;">
              <h3 class="text-xl md:text-2xl font-bold text-slate-900">${s.title}</h3>
              ${s.where ? `<p class="text-slate-500 font-bold mt-1.5 text-sm flex items-center gap-1.5"><i data-lucide="map-pin" class="w-3.5 h-3.5"></i> ${s.where.split(',')[0]}</p>` : ''}
              ${s.notes ? `<p class="text-slate-600 mt-3 text-sm md:text-base italic max-w-2xl">${s.notes}</p>` : ''}
            </div>
            
            <!-- Photos -->
            ${s.memories && s.memories.length > 0 ? buildPDFGrid(s.memories) : ''}
          </div>
        `;
      });

      html += `
        <div class="pt-8 md:pt-12 pb-8" style="page-break-before: always; break-before: page;">
          <div class="mb-12 border-b-2 border-slate-100 pb-6" style="break-inside: avoid; break-after: avoid;">
            <p class="text-blue-600 font-bold tracking-[0.2em] uppercase mb-2 text-sm">Day ${day.dayNum}</p>
            <h2 class="text-4xl md:text-5xl font-extrabold text-slate-900">${day.dateLongStr}</h2>
          </div>
          <div class="ml-2 md:ml-6">
            ${stepsHtml}
          </div>
        </div>
      `;
    });

    memoryCardCanvas.innerHTML = html;
    if(window.lucide) lucide.createIcons({ root: memoryCardCanvas });
  }

  if (btnCloseSocial) btnCloseSocial.addEventListener('click', hideCelebrationModal);
  if (btnGenerateCard) btnGenerateCard.addEventListener('click', generateMemoryCard);
  if (btnCloseCard) btnCloseCard.addEventListener('click', () => {
    if(memoryCardView) memoryCardView.classList.add('hidden');
  });

  if (btnDownloadCard) {
    btnDownloadCard.addEventListener('click', async () => {
      const originalText = btnDownloadCard.innerHTML;
      btnDownloadCard.innerHTML = '<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> Generating PDF...';
      btnDownloadCard.disabled = true;
      if (window.lucide) lucide.createIcons({ root: btnDownloadCard });

      // Allow UI to update before heavy synchronous PDF generation
      setTimeout(async () => {
        try {
          const data = KYT.store.get();
          
          let logoBase64 = null;
          try {
            const res = await fetch('./icons/icon-192.png');
            const blob = await res.blob();
            logoBase64 = await new Promise(resolve => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.readAsDataURL(blob);
            });
          } catch(e) { console.warn('Could not load logo for PDF', e); }

          const docDefinition = {
            pageSize: 'A4',
            pageMargins: [40, 60, 40, 60],
            info: { title: data.tripName + ' - Memory Journal' },
            footer: function(currentPage, pageCount) {
              return {
                text: 'KYT — Know Your Travel • vividnova.com/KYT/',
                alignment: 'center',
                fontSize: 9,
                color: '#94a3b8',
                margin: [0, 20, 0, 0],
                bold: true
              };
            },
            content: [],
            styles: {
              header: { fontSize: 32, bold: true, alignment: 'center', margin: [0, 20, 0, 5], color: '#0F172A' },
              subheader: { fontSize: 14, alignment: 'center', margin: [0, 0, 0, 40], color: '#64748B' },
              stepTitle: { fontSize: 18, bold: true, margin: [0, 20, 0, 5], color: '#1E293B' },
              stepMeta: { fontSize: 10, italic: true, margin: [0, 0, 0, 10], color: '#64748B' },
              stepNotes: { fontSize: 12, margin: [0, 0, 0, 15], color: '#334155' },
              dayHeader: { fontSize: 24, bold: true, margin: [0, 30, 0, 15], color: '#2563EB', alignment: 'center' }
            },
            defaultStyle: { font: 'Roboto' }
          };

          if (logoBase64) {
            docDefinition.content.push({
              image: logoBase64,
              width: 48,
              alignment: 'center',
              margin: [0, 0, 0, 10]
            });
          }
          
          docDefinition.content.push({
            text: 'KYT — KNOW YOUR TRAVEL',
            alignment: 'center',
            fontSize: 10,
            bold: true,
            color: '#94a3b8',
            margin: [0, 0, 0, 40]
          });

          if (data.tripCoverImage) {
            docDefinition.content.push({
              image: data.tripCoverImage,
              fit: [515, 300],
              alignment: 'center',
              margin: [0, 0, 0, 40]
            });
          }
          
          docDefinition.content.push({ text: data.tripName, style: 'header' });
          
          let totalPhotos = 0;
          data.stepsData.forEach(s => { if (s.memories) totalPhotos += s.memories.length; });
          docDefinition.content.push({ text: `Memory Journal • ${totalPhotos} Photos`, style: 'subheader', margin: [0, 0, 0, 40] });

          docDefinition.content.push({
            text: [
              { text: 'https://vividnova.com/KYT/\n', link: 'https://vividnova.com/KYT/', color: '#3B82F6', decoration: 'underline' },
              { text: 'vividnova.com is home to browser based tools. Built through the collaboration of human insight and AI. No accounts, no tracking, no data leaves your browser. Your private personal apps.', color: '#94a3b8', fontSize: 10, italics: true }
            ],
            alignment: 'center',
            margin: [40, 20, 40, 60]
          });

          const sortedSteps = [...data.stepsData].sort((a, b) => a.targetTime - b.targetTime);
          let currentDayStr = null;
          let isFirstDay = true;

          sortedSteps.forEach(step => {
            const dStr = step.targetTime.toDateString();
            if (dStr !== currentDayStr) {
              currentDayStr = dStr;
              const longDate = step.targetTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
              if (!isFirstDay) {
                docDefinition.content.push({ text: longDate, style: 'dayHeader', pageBreak: 'before' });
              } else {
                docDefinition.content.push({ text: longDate, style: 'dayHeader' });
                isFirstDay = false;
              }
            }
            
            let headerStack = [];
            headerStack.push({ text: step.title, style: 'stepTitle' });
            
            let meta = [];
            if (step.where) meta.push(step.where.split(',')[0]);
            meta.push(step.targetTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
            headerStack.push({ text: meta.join(' • '), style: 'stepMeta' });
            
            if (step.notes) {
              headerStack.push({ text: step.notes, style: 'stepNotes' });
            }

            if (step.memories && step.memories.length > 0) {
              if (step.memories.length === 1) {
                headerStack.push({
                  image: step.memories[0],
                  fit: [515, 400],
                  alignment: 'center',
                  margin: [0, 10, 0, 30]
                });
                docDefinition.content.push({ stack: headerStack, unbreakable: true });
              } else {
                let firstRow = { columns: [{ image: step.memories[0], fit: [250, 300], margin: [0, 0, 15, 15] }] };
                if (step.memories[1]) {
                  firstRow.columns.push({ image: step.memories[1], fit: [250, 300], margin: [0, 0, 0, 15] });
                }
                headerStack.push({ stack: [firstRow], margin: [0, 10, 0, 0] });
                docDefinition.content.push({ stack: headerStack, unbreakable: true });
                
                let remainingRows = [];
                for (let i = 2; i < step.memories.length; i += 2) {
                  let row = { columns: [{ image: step.memories[i], fit: [250, 300], margin: [0, 0, 15, 15] }] };
                  if (step.memories[i+1]) {
                    row.columns.push({ image: step.memories[i+1], fit: [250, 300], margin: [0, 0, 0, 15] });
                  }
                  remainingRows.push(row);
                }
                
                if (remainingRows.length > 0) {
                  docDefinition.content.push({ stack: remainingRows, margin: [0, 0, 0, 20] });
                } else {
                  docDefinition.content.push({ text: '', margin: [0, 0, 0, 20] });
                }
              }
            } else {
              headerStack.push({ text: '', margin: [0, 0, 0, 20] });
              docDefinition.content.push({ stack: headerStack, unbreakable: true });
            }
          });

          // Generate and open PDF
          const pdfDocGenerator = pdfMake.createPdf(docDefinition);
          
          if (navigator.userAgent.match(/iPhone|iPad|iPod|Android/i) && navigator.share) {
             pdfDocGenerator.getBlob((blob) => {
               const file = new File([blob], data.tripName.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '_journal.pdf', { type: 'application/pdf' });
               navigator.share({
                 files: [file],
                 title: data.tripName + ' - Memory Journal'
               }).catch(console.error);
             });
          } else {
             pdfDocGenerator.download(data.tripName.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '_journal.pdf');
          }

        } catch (err) {
          console.error("PDF generation failed:", err);
          alert("Failed to generate PDF: " + err.message);
        } finally {
          btnDownloadCard.innerHTML = originalText;
          btnDownloadCard.disabled = false;
          if (window.lucide) lucide.createIcons({ root: btnDownloadCard });
        }
      }, 100);
    });
  }

  return { checkCompletion, openAlbum: generateMemoryCard };
})();

