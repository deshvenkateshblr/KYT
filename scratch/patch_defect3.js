const fs = require('fs');

const storePath = 'C:/Venkatesh/KYT/js/store.js';
let storeContent = fs.readFileSync(storePath, 'utf8');
if (!storeContent.includes('window.KYT.utils')) {
  const utilCode = `
window.KYT.utils = {
  escapeHTML: (str) => {
    if (!str) return '';
    return String(str).replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }
};
`;
  storeContent = storeContent.replace('window.KYT.store = (() => {', utilCode + '\nwindow.KYT.store = (() => {');
  fs.writeFileSync(storePath, storeContent);
}

const sharePath = 'C:/Venkatesh/KYT/js/share.js';
let shareContent = fs.readFileSync(sharePath, 'utf8');
if (!shareContent.includes('KYT.utils.escapeHTML')) {
  shareContent = shareContent.replace('KYT.store.setTripName(imported.tripName);', 'KYT.store.setTripName(KYT.utils.escapeHTML(imported.tripName));');
  shareContent = shareContent.replace('...s, targetTime:', '...s, title: KYT.utils.escapeHTML(s.title), where: KYT.utils.escapeHTML(s.where), notes: KYT.utils.escapeHTML(s.notes), targetTime:');
  fs.writeFileSync(sharePath, shareContent);
}

const formPath = 'C:/Venkatesh/KYT/js/step-form.js';
let formContent = fs.readFileSync(formPath, 'utf8');
if (!formContent.includes('KYT.utils.escapeHTML')) {
  formContent = formContent.replace('const title      = formStepTitle.value.trim() || \'Untitled Step\';', 'const title      = KYT.utils.escapeHTML(formStepTitle.value.trim()) || \'Untitled Step\';');
  formContent = formContent.replace('const where      = formStepWhere.value.trim();', 'const where      = KYT.utils.escapeHTML(formStepWhere.value.trim());');
  formContent = formContent.replace('const notes      = formStepNotes.value.trim();', 'const notes      = KYT.utils.escapeHTML(formStepNotes.value.trim());');
  formContent = formContent.replace('const mapUrl     = formStepMapUrl.value.trim();', 'const mapUrl     = KYT.utils.escapeHTML(formStepMapUrl.value.trim());');
  fs.writeFileSync(formPath, formContent);
}

const vtPath = 'C:/Venkatesh/KYT/js/virtual-trips.js';
let vtContent = fs.readFileSync(vtPath, 'utf8');
if (!vtContent.includes('KYT.utils.escapeHTML')) {
  vtContent = vtContent.replace(/sharedTripName \|\| 'Shared Trip'/g, "KYT.utils.escapeHTML(sharedTripName) || 'Shared Trip'");
  
  // Add confirmation dialog for shared link import
  if (!vtContent.includes('confirm(`Do you want to import')) {
    const orig = `const tasteParts = sharedTaste && sharedTaste.length === 3`;
    const rep = `if (!confirm(\`Do you want to import the shared trip: "\${KYT.utils.escapeHTML(sharedTripName) || 'Shared Trip'}"?\`)) {
            const url = new URL(window.location.href);
            url.searchParams.delete('trip');
            url.searchParams.delete('cities');
            url.searchParams.delete('taste');
            window.history.replaceState({}, '', url.toString());
            return;
          }
          const tasteParts = sharedTaste && sharedTaste.length === 3`;
    vtContent = vtContent.replace(orig, rep);
  }
  fs.writeFileSync(vtPath, vtContent);
}
console.log("Patch complete.");

