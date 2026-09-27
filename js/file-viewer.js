/**
 * file-viewer.js — In-app attachment viewer (images, PDFs, generic files)
 */

window.KYT = window.KYT || {};

window.KYT.fileViewer = (() => {
  const fileViewerView  = document.getElementById('file-viewer-view');
  const viewerTitle     = document.getElementById('viewer-title');
  const viewerContent   = document.getElementById('viewer-content');
  const btnDownloadFile = document.getElementById('btn-download-file');
  const btnCloseViewer  = document.getElementById('btn-close-viewer');

  function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    return new Blob([ab], { type: mimeString });
  }

  function open(e, stepIndex, attIndex) {
    e.preventDefault();
    const { stepsData } = KYT.store.get();
    const att = stepsData[stepIndex].attachments[attIndex];

    viewerTitle.textContent = att.name;
    viewerContent.innerHTML = '';

    const isImage = att.data.startsWith('data:image');
    const isPdf   = att.data.startsWith('data:application/pdf');
    let fileUrl   = att.data;

    if (!isImage) {
      try { fileUrl = URL.createObjectURL(dataURItoBlob(att.data)); }
      catch (err) { console.error('Blob conversion failed:', err); }
    }

    if (isImage) {
      viewerContent.innerHTML = `<img src="${att.data}" class="max-w-full max-h-full object-contain p-4" />`;
    } else if (isPdf) {
      viewerContent.innerHTML = `
        <div class="flex flex-col items-center justify-center w-full h-full p-6 text-center">
          <i data-lucide="file-text" class="w-16 h-16 text-rose-500 mb-4"></i>
          <p class="text-slate-800 font-bold mb-2">PDF Document</p>
          <p class="text-slate-500 text-sm mb-8 max-w-[250px] truncate">${att.name}</p>
          <a href="${fileUrl}" target="_blank"
             class="px-6 py-3 bg-kyt-accent text-white font-extrabold rounded-xl shadow-md hover:bg-blue-600 transition-all flex items-center gap-2">
            <i data-lucide="external-link" class="w-5 h-5"></i> Open in Viewer
          </a>
        </div>`;
      lucide.createIcons();
    } else {
      viewerContent.innerHTML = `
        <div class="text-center p-6">
          <i data-lucide="file-question" class="w-16 h-16 text-slate-400 mx-auto mb-4"></i>
          <p class="text-slate-600 font-medium">Preview not available.</p>
        </div>`;
      lucide.createIcons();
    }

    btnDownloadFile.onclick = () => {
      const a = document.createElement('a');
      a.href = fileUrl; a.download = att.name;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    };

    fileViewerView.classList.remove('hidden');
  }

  btnCloseViewer.addEventListener('click', () => {
    fileViewerView.classList.add('hidden');
    viewerContent.innerHTML = '';
  });

  return { open };
})();

