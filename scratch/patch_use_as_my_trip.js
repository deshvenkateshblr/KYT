const fs = require('fs');
let content = fs.readFileSync('C:/Venkatesh/KYT/js/virtual-trips.js', 'utf8');

// Replace the success footer
const oldFooter = /<div class="sticky bottom-0 -mx-4 px-4 pb-4 pt-3 bg-gradient-to-t from-slate-50 via-slate-50\/95 to-transparent mt-4">[\s\S]*?<\/div>\s*<\/div>/;
const newFooter = `<div class="sticky bottom-0 -mx-4 px-4 pb-4 pt-3 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent mt-4">
        <div class="bg-white rounded-2xl border border-slate-200 shadow-md p-4 flex flex-col gap-3">
          <div class="flex items-center gap-2 text-sm text-slate-500">
            <i data-lucide="check-circle-2" class="w-4 h-4 text-green-500 shrink-0"></i>
            <span><strong class="text-slate-800">\${totalSteps} activities</strong> across <strong class="text-slate-800">\${totalDays} day\${totalDays > 1 ? 's' : ''}</strong> planned for <strong class="text-slate-800">\${trip.name}</strong></span>
          </div>
          <div class="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <i data-lucide="calendar" class="w-4 h-4 shrink-0"></i>
            <label class="font-bold text-slate-700" for="vt-start-date">Start Date:</label>
            <input type="date" id="vt-start-date" class="ml-auto bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          </div>
          <button onclick="KYT.virtualTrips.useAsMyTrip('\${trip.id}')"
             class="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-extrabold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-sm shadow-blue-200">
            <i data-lucide="map" class="w-4 h-4"></i>
            Use as my trip
          </button>
        </div>
      </div>`;
content = content.replace(oldFooter, newFooter);

// Add useAsMyTrip function
const funcCode = `  function useAsMyTrip(tripId) {
    const trip = vtrips.find(t => t.id === tripId);
    if (!trip || !trip.steps) return;
    
    const dateInput = document.getElementById('vt-start-date');
    let startDate = new Date(); // default today
    if (dateInput && dateInput.value) {
      startDate = new Date(dateInput.value);
    }
    
    // Set time to start of day for base calculation
    startDate.setHours(0, 0, 0, 0);

    const storeSteps = trip.steps.map((s, idx) => {
      // Calculate target time: startDate + (dayId - 1) days + hour
      const targetTime = new Date(startDate);
      targetTime.setDate(targetTime.getDate() + (s.dayId - 1));
      targetTime.setHours(s.hour || 9, 0, 0, 0);
      
      return {
        id: Date.now() + idx,
        title: s.title,
        icon: s.icon || 'map-pin',
        where: s.where || s.cityName,
        mapUrl: s.mapsUrl || '',
        notes: s.notes || '',
        targetTime: targetTime,
        status: 'todo',
        attachments: []
      };
    });

    KYT.store.setTripName(trip.name);
    KYT.store.setStepsData(storeSteps);
    KYT.store.setCurrentIndex(0);
    KYT.store.saveData();

    // Redirect to view_trip.html (Now cards)
    window.location.href = 'view_trip.html';
  }

`;
// Inject before return block
content = content.replace('return { open: openView, close: closeView, editCanvas, expandAttractionDetail, openCityDetail, addNearby };', funcCode + 'return { open: openView, close: closeView, editCanvas, expandAttractionDetail, openCityDetail, addNearby, useAsMyTrip };');

fs.writeFileSync('C:/Venkatesh/KYT/js/virtual-trips.js', content);
console.log("Patched virtual-trips.js with useAsMyTrip");

