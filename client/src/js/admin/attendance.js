import { loadSidebar } from './adminSidebar.js';

const API_BASE_URL = 'http://localhost:3000';
let allEvents = [];
let currentEvent = null;

export async function init() {
  console.log('🚀 Initializing attendance page...');
  
  try {
    // Show loading state immediately
    showLoadingState();
    
    // Load sidebar first and WAIT for it to complete
    console.log('📋 Loading sidebar...');
    await loadSidebar();
    console.log('✅ Sidebar loaded');
    
    // Small delay to ensure sidebar is fully rendered
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Initialize attendance functionality
    await initAttendance();
    
    console.log('✅ Attendance page initialized');
  } catch (error) {
    console.error('❌ Initialization error:', error);
    showMessage('Gagal menginisialisasi halaman', 'error');
  }
}

function showLoadingState() {
  const loadingState = document.getElementById('loadingState');
  if (loadingState) {
    loadingState.style.display = 'block';
  }
}

async function initAttendance() {
  // Initialize filters
  setupFilters();
  
  // Initialize modal
  setupModal();
  
  // Load events from API
  await loadEvents();
  
  // Setup export button
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportAllData);
  }
}

function setupFilters() {
  const filterEventName = document.getElementById('filterEventName');
  const filterEventType = document.getElementById('filterEventType');
  const filterDate = document.getElementById('filterDate');
  
  if (!filterEventName || !filterEventType || !filterDate) {
    console.error('Filter elements not found');
    return;
  }

  // Add event listeners
  filterEventName.addEventListener('input', filterEvents);
  filterEventType.addEventListener('change', filterEvents);
  filterDate.addEventListener('change', filterEvents);
}

function setupModal() {
  const modal = document.getElementById('attendanceModal');
  const modalClose = document.getElementById('modalClose');
  const exportEventBtn = document.getElementById('exportEventBtn');
  
  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }
  
  if (modal) {
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }
  
  if (exportEventBtn) {
    exportEventBtn.addEventListener('click', exportEventData);
  }
}

async function loadEvents() {
  const loadingState = document.getElementById('loadingState');
  const eventsGrid = document.getElementById('eventsGrid');
  const emptyState = document.getElementById('emptyState');
  
  try {
    if (loadingState) loadingState.style.display = 'block';
    if (eventsGrid) eventsGrid.innerHTML = '';
    if (emptyState) emptyState.style.display = 'none';
    
    console.log('📥 Fetching events from API...');
    console.log('API URL:', `${API_BASE_URL}/api/events/view`);
    
    const response = await fetch(`${API_BASE_URL}/api/events/view`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Response error:', errorData);
      throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch events`);
    }
    
    const data = await response.json();
    console.log('📦 Raw response data:', data);
    
    allEvents = data.data || [];
    
    console.log(`✅ Loaded ${allEvents.length} events`);
    
    if (loadingState) loadingState.style.display = 'none';
    
    if (allEvents.length === 0) {
      if (emptyState) {
        emptyState.style.display = 'block';
        emptyState.innerHTML = `
          <i class="fas fa-calendar-times"></i>
          <p>Belum ada event yang tersedia</p>
          <small>Silakan tambahkan event baru dari menu Event</small>
        `;
      }
    } else {
      renderEvents(allEvents);
    }
    
  } catch (error) {
    console.error('❌ Error loading events:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    if (loadingState) loadingState.style.display = 'none';
    
    if (emptyState) {
      emptyState.style.display = 'block';
      emptyState.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <p>Gagal memuat data event</p>
        <small>${error.message}</small>
        <br><br>
        <button class="btn" onclick="location.reload()">
          <i class="fas fa-sync"></i> Coba Lagi
        </button>
      `;
    }
    
    showMessage('Gagal memuat data event: ' + error.message, 'error');
  }
}

function renderEvents(events) {
  const eventsGrid = document.getElementById('eventsGrid');
  const emptyState = document.getElementById('emptyState');
  
  if (!eventsGrid) return;
  
  eventsGrid.innerHTML = '';
  
  if (events.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    return;
  }
  
  if (emptyState) emptyState.style.display = 'none';
  
  events.forEach(event => {
    const card = createEventCard(event);
    eventsGrid.appendChild(card);
  });
}

function createEventCard(event) {
  const card = document.createElement('div');
  card.className = 'event-card';
  card.dataset.eventId = event.id;
  card.dataset.eventName = event.event_name.toLowerCase();
  card.dataset.eventType = event.event_type;
  
  // Get first schedule for display
  const schedule = event.schedules && event.schedules[0];
  const startTime = schedule ? new Date(schedule.start_time) : null;
  const endTime = schedule ? (schedule.end_time ? new Date(schedule.end_time) : null) : null;
  
  // Format date and time
  const dateStr = startTime ? startTime.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : 'Tanggal belum ditentukan';
  
  const timeStr = startTime ? startTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  }) : '--:--';
  
  const endTimeStr = endTime ? endTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  }) : '--:--';
  
  // TODO: Get actual attendance count from API
  const attendanceCount = 0; // Placeholder
  const totalExpected = 0; // Placeholder
  
  card.innerHTML = `
    <div class="event-card-image">
      ${event.image_url 
        ? `<img src="${API_BASE_URL}${event.image_url}" alt="${event.event_name}" />` 
        : '<i class="fas fa-calendar-alt"></i>'
      }
      <span class="event-type-badge ${event.event_type}">${event.event_type}</span>
    </div>
    <div class="event-card-body">
      <h3 class="event-card-title">${event.event_name}</h3>
      <div class="event-card-info">
        <div class="event-info-item">
          <i class="fas fa-calendar"></i>
          <span>${dateStr}</span>
        </div>
        <div class="event-info-item">
          <i class="fas fa-clock"></i>
          <span>${timeStr} - ${endTimeStr}</span>
        </div>
        <div class="event-info-item">
          <i class="fas fa-map-marker-alt"></i>
          <span>${event.place || 'Lokasi belum ditentukan'}</span>
        </div>
        ${schedule && schedule.worship_topic ? `
          <div class="event-info-item">
            <i class="fas fa-book-open"></i>
            <span>${schedule.worship_topic}</span>
          </div>
        ` : ''}
      </div>
      <div class="event-card-stats">
        <div class="stat-item">
          <span class="stat-value">${attendanceCount}</span>
          <span class="stat-label">Hadir</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">${totalExpected}</span>
          <span class="stat-label">Total</span>
        </div>
      </div>
    </div>
  `;
  
  card.addEventListener('click', () => openAttendanceModal(event));
  
  return card;
}

function filterEvents() {
  const filterEventName = document.getElementById('filterEventName');
  const filterEventType = document.getElementById('filterEventType');
  const filterDate = document.getElementById('filterDate');
  
  const nameVal = filterEventName.value.toLowerCase().trim();
  const typeVal = filterEventType.value;
  const dateVal = filterDate.value;
  
  const filtered = allEvents.filter(event => {
    let show = true;
    
    // Filter by name
    if (nameVal && !event.event_name.toLowerCase().includes(nameVal)) {
      show = false;
    }
    
    // Filter by type
    if (typeVal && event.event_type !== typeVal) {
      show = false;
    }
    
    // Filter by date
    if (dateVal && event.schedules && event.schedules.length > 0) {
      const eventDate = new Date(event.schedules[0].start_time).toISOString().split('T')[0];
      if (eventDate !== dateVal) {
        show = false;
      }
    }
    
    return show;
  });
  
  console.log(`📊 Filtered: ${filtered.length}/${allEvents.length} events`);
  renderEvents(filtered);
}

async function openAttendanceModal(event) {
  currentEvent = event;
  const modal = document.getElementById('attendanceModal');
  const modalEventName = document.getElementById('modalEventName');
  
  if (!modal) return;
  
  // Set event name
  if (modalEventName) {
    modalEventName.textContent = event.event_name;
  }
  
  // Render event info
  renderEventInfo(event);
  
  // Load attendance data
  await loadAttendanceData(event.id);
  
  // Show modal
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function renderEventInfo(event) {
  const eventInfo = document.getElementById('eventInfo');
  if (!eventInfo) return;
  
  const schedule = event.schedules && event.schedules[0];
  const startTime = schedule ? new Date(schedule.start_time) : null;
  const endTime = schedule ? (schedule.end_time ? new Date(schedule.end_time) : null) : null;
  
  const dateStr = startTime ? startTime.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : '-';
  
  const timeStr = startTime ? `${startTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  })} - ${endTime ? endTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  }) : 'Selesai'}` : '-';
  
  eventInfo.innerHTML = `
    <div class="event-info-row">
      <div class="event-info-item">
        <span class="event-info-label">Tipe Event</span>
        <span class="event-info-value">${event.event_type}</span>
      </div>
      <div class="event-info-item">
        <span class="event-info-label">Tanggal</span>
        <span class="event-info-value">${dateStr}</span>
      </div>
      <div class="event-info-item">
        <span class="event-info-label">Waktu</span>
        <span class="event-info-value">${timeStr}</span>
      </div>
      <div class="event-info-item">
        <span class="event-info-label">Lokasi</span>
        <span class="event-info-value">${event.place}</span>
      </div>
    </div>
  `;
}

async function loadAttendanceData(eventId) {
  const attendanceTableBody = document.getElementById('attendanceTableBody');
  const emptyAttendance = document.getElementById('emptyAttendance');
  const attendanceStats = document.getElementById('attendanceStats');
  
  try {
    console.log(`📥 Loading attendance for event ${eventId}...`);
    
    // TODO: Replace with actual API call when attendance endpoint is ready
    // const response = await fetch(`${API_BASE_URL}/api/attendance/event/${eventId}`, {
    //   credentials: 'include'
    // });
    
    // Placeholder data - replace with actual API call
    const attendanceData = [];
    
    if (attendanceData.length === 0) {
      if (attendanceTableBody) attendanceTableBody.innerHTML = '';
      if (emptyAttendance) emptyAttendance.style.display = 'block';
      if (attendanceStats) attendanceStats.innerHTML = `
        <div class="stat-box total">
          <div class="stat-box-value">0</div>
          <div class="stat-box-label">Total</div>
        </div>
        <div class="stat-box present">
          <div class="stat-box-value">0</div>
          <div class="stat-box-label">Hadir</div>
        </div>
        <div class="stat-box absent">
          <div class="stat-box-value">0</div>
          <div class="stat-box-label">Tidak Hadir</div>
        </div>
      `;
      return;
    }
    
    if (emptyAttendance) emptyAttendance.style.display = 'none';
    
    // Render attendance table
    if (attendanceTableBody) {
      attendanceTableBody.innerHTML = attendanceData.map((record, index) => `
        <tr>
          <td data-label="No">${index + 1}</td>
          <td data-label="Nama">${record.user_name}</td>
          <td data-label="Waktu Check-in">${new Date(record.check_in_time).toLocaleString('id-ID')}</td>
          <td data-label="Status">
            <span class="status-badge ${record.status === 'hadir' ? 'hadir' : 'absent'}">
              ${record.status === 'hadir' ? 'Hadir' : 'Tidak Hadir'}
            </span>
          </td>
        </tr>
      `).join('');
    }
    
    // Update stats
    const presentCount = attendanceData.filter(r => r.status === 'hadir').length;
    const absentCount = attendanceData.length - presentCount;
    
    if (attendanceStats) {
      attendanceStats.innerHTML = `
        <div class="stat-box total">
          <div class="stat-box-value">${attendanceData.length}</div>
          <div class="stat-box-label">Total</div>
        </div>
        <div class="stat-box present">
          <div class="stat-box-value">${presentCount}</div>
          <div class="stat-box-label">Hadir</div>
        </div>
        <div class="stat-box absent">
          <div class="stat-box-value">${absentCount}</div>
          <div class="stat-box-label">Tidak Hadir</div>
        </div>
      `;
    }
    
  } catch (error) {
    console.error('❌ Error loading attendance:', error);
    if (emptyAttendance) {
      emptyAttendance.style.display = 'block';
      emptyAttendance.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <p>Gagal memuat data absensi</p>
        <small>${error.message}</small>
      `;
    }
  }
}

function closeModal() {
  const modal = document.getElementById('attendanceModal');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
  }
  currentEvent = null;
}

function exportAllData() {
  console.log('📥 Exporting all events data...');
  
  if (allEvents.length === 0) {
    showMessage('Tidak ada data untuk diekspor!', 'error');
    return;
  }
  
  // Prepare CSV data
  let csv = 'Event Name,Event Type,Date,Time,Location,Attendance Count\n';
  
  allEvents.forEach(event => {
    const schedule = event.schedules && event.schedules[0];
    const startTime = schedule ? new Date(schedule.start_time) : null;
    
    const dateStr = startTime ? startTime.toLocaleDateString('id-ID') : '-';
    const timeStr = startTime ? startTime.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    }) : '-';
    
    csv += `"${event.event_name}","${event.event_type}","${dateStr}","${timeStr}","${event.place}",0\n`;
  });
  
  downloadCSV(csv, `all_events_${new Date().toISOString().split('T')[0]}.csv`);
  showMessage('Data berhasil diekspor!', 'success');
}

function exportEventData() {
  if (!currentEvent) {
    showMessage('Tidak ada event yang dipilih!', 'error');
    return;
  }
  
  console.log('📥 Exporting event attendance...');
  
  // TODO: Get actual attendance data
  let csv = 'No,Nama,Waktu Check-in,Status\n';
  csv += '1,Sample User,2025-01-10 08:00:00,Hadir\n';
  
  downloadCSV(csv, `attendance_${currentEvent.event_name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
  showMessage('Data absensi berhasil diekspor!', 'success');
}

function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function showMessage(text, type) {
  const message = document.createElement('div');
  message.textContent = text;
  message.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    background: ${type === 'success' ? '#d4edda' : '#f8d7da'};
    color: ${type === 'success' ? '#155724' : '#721c24'};
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-weight: 600;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(message);
  
  setTimeout(() => {
    message.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      document.body.removeChild(message);
    }, 300);
  }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);