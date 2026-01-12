const API_BASE_URL = import.meta.env.VITE_API_URL;
let allEvents = [];
let currentEvent = null;
let allAttendanceData = [];
let currentGenderFilter = 'all';

export async function init() {
  console.log("🚀 Initializing attendance page...");

  try {
    showLoadingState();

    // Wait for DOM to be ready
    await new Promise((resolve) => setTimeout(resolve, 100));

    await initAttendance();

    console.log("Attendance page initialized");
  } catch (error) {
    console.error("Initialization error:", error);
    showMessage("Gagal menginisialisasi halaman", "error");
  }
}

function showLoadingState() {
  const loadingState = document.getElementById("loadingState");
  if (loadingState) {
    loadingState.style.display = "block";
  }
}

async function initAttendance() {
  setupFilters();
  setupModal();
  await loadEvents();

  const exportBtn = document.getElementById("exportBtn");
  if (exportBtn) {
    exportBtn.addEventListener("click", exportAllData);
  }
}

function setupFilters() {
  const filterEventName = document.getElementById("filterEventName");
  const filterEventType = document.getElementById("filterEventType");

  if (!filterEventName || !filterEventType) {
    console.error("Filter elements not found");
    return;
  }

  filterEventName.addEventListener("input", filterEvents);
  filterEventType.addEventListener("change", filterEvents);
}

function setupModal() {
  const modal = document.getElementById("attendanceModal");
  const modalClose = document.getElementById("modalClose");
  const exportEventBtn = document.getElementById("exportEventBtn");

  if (modalClose) {
    modalClose.addEventListener("click", closeModal);
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  if (exportEventBtn) {
    exportEventBtn.addEventListener("click", exportEventData);
  }

  // Setup gender filter buttons
  setupGenderFilter();
}

function setupGenderFilter() {
  const genderBtns = document.querySelectorAll('.gender-filter-btn');
  genderBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active from all buttons
      genderBtns.forEach(b => b.classList.remove('active'));
      // Add active to clicked button
      btn.classList.add('active');
      
      // Update filter
      currentGenderFilter = btn.dataset.gender;
      
      // Re-render attendance table with filter
      renderAttendanceTable(allAttendanceData, currentGenderFilter);
    });
  });
}

async function loadEvents() {
  const loadingState = document.getElementById("loadingState");
  const eventsGrid = document.getElementById("eventsGrid");
  const emptyState = document.getElementById("emptyState");

  try {
    if (loadingState) loadingState.style.display = "block";
    if (eventsGrid) eventsGrid.innerHTML = "";
    if (emptyState) emptyState.style.display = "none";

    console.log("📥 Fetching events from API...");

    const response = await fetch(`${API_BASE_URL}/events/view`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("📡 Response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP ${response.status}: Failed to fetch events`
      );
    }

    const data = await response.json();
    allEvents = data.data || [];

    console.log(`Loaded ${allEvents.length} events`);

    if (loadingState) loadingState.style.display = "none";

    if (allEvents.length === 0) {
      if (emptyState) {
        emptyState.style.display = "block";
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
    console.error("Error loading events:", error);

    if (loadingState) loadingState.style.display = "none";

    if (emptyState) {
      emptyState.style.display = "block";
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

    showMessage("Gagal memuat data event: " + error.message, "error");
  }
}

function renderEvents(events) {
  const eventsGrid = document.getElementById("eventsGrid");
  const emptyState = document.getElementById("emptyState");

  if (!eventsGrid) return;

  eventsGrid.innerHTML = "";

  if (events.length === 0) {
    if (emptyState) emptyState.style.display = "block";
    return;
  }

  if (emptyState) emptyState.style.display = "none";

  events.forEach((event) => {
    const card = createEventCard(event);
    eventsGrid.appendChild(card);
  });
}

function createEventCard(event) {
  const card = document.createElement("div");
  card.className = "event-card";
  card.dataset.eventId = event.id;
  card.dataset.eventName = event.event_name.toLowerCase();
  card.dataset.eventType = event.event_type;

  const schedule = event.schedules && event.schedules[0];
  const startTime = schedule ? new Date(schedule.start_time) : null;
  const endTime = schedule && schedule.end_time ? new Date(schedule.end_time) : null;

  const timeStr = startTime
    ? startTime.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--:--";

  const endTimeStr = endTime
    ? endTime.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--:--";

  // Placeholder for attendance count
  const attendanceCount = 0;
  const totalExpected = event.event_type === 'worship' ? 'All Members' : 'Registered';

  card.innerHTML = `
    <div class="event-card-image">
      ${
        event.image_url
          ? `<img src="${event.image_url.startsWith("http") ? event.image_url : API_BASE_URL.replace("/api", "") + event.image_url}" alt="${event.event_name}" />`
          : '<i class="fas fa-calendar-alt"></i>'
      }
      <span class="event-type-badge ${event.event_type}">${event.event_type}</span>
    </div>
    <div class="event-card-body">
      <h3 class="event-card-title">${event.event_name}</h3>
      <div class="event-card-info">
        <div class="event-info-item">
          <i class="fas fa-clock"></i>
          <span>${timeStr} - ${endTimeStr}</span>
        </div>
        <div class="event-info-item">
          <i class="fas fa-map-marker-alt"></i>
          <span>${event.place || "Lokasi belum ditentukan"}</span>
        </div>
        ${
          schedule && schedule.worship_topic
            ? `
          <div class="event-info-item">
            <i class="fas fa-book-open"></i>
            <span>${schedule.worship_topic}</span>
          </div>
        `
            : ""
        }
      </div>
      <div class="event-card-stats">
        <div class="stat-item">
          <span class="stat-value">${attendanceCount}</span>
          <span class="stat-label">Hadir</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">${totalExpected}</span>
          <span class="stat-label">${event.event_type === 'worship' ? 'Tipe' : 'Tipe'}</span>
        </div>
      </div>
    </div>
  `;

  card.addEventListener("click", () => openAttendanceModal(event));

  return card;
}

function filterEvents() {
  const filterEventName = document.getElementById("filterEventName");
  const filterEventType = document.getElementById("filterEventType");

  const nameVal = filterEventName.value.toLowerCase().trim();
  const typeVal = filterEventType.value;

  const filtered = allEvents.filter((event) => {
    let show = true;

    if (nameVal && !event.event_name.toLowerCase().includes(nameVal)) {
      show = false;
    }

    if (typeVal && event.event_type !== typeVal) {
      show = false;
    }

    return show;
  });

  console.log(`📊 Filtered: ${filtered.length}/${allEvents.length} events`);
  renderEvents(filtered);
}

async function openAttendanceModal(event) {
  currentEvent = event;
  currentGenderFilter = 'all'; // Reset filter
  
  const modal = document.getElementById("attendanceModal");
  const modalEventName = document.getElementById("modalEventName");
  const genderFilterContainer = document.getElementById("genderFilterContainer");

  if (!modal) return;

  if (modalEventName) {
    modalEventName.textContent = event.event_name;
  }

  // Show/hide gender filter based on event type
  if (genderFilterContainer) {
    if (event.event_type === 'worship') {
      genderFilterContainer.style.display = 'block';
    } else {
      genderFilterContainer.style.display = 'none';
    }
  }

  // Reset gender filter buttons
  const genderBtns = document.querySelectorAll('.gender-filter-btn');
  genderBtns.forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.gender === 'all') {
      btn.classList.add('active');
    }
  });

  renderEventInfo(event);
  await loadAttendanceData(event);

  modal.classList.add("show");
  document.body.style.overflow = "hidden";
}

function renderEventInfo(event) {
  const eventInfo = document.getElementById("eventInfo");
  if (!eventInfo) return;

  const schedule = event.schedules && event.schedules[0];
  const startTime = schedule ? new Date(schedule.start_time) : null;
  const endTime = schedule && schedule.end_time ? new Date(schedule.end_time) : null;

  const timeStr = startTime
    ? `${startTime.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      })} - ${
        endTime
          ? endTime.toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Selesai"
      }`
    : "-";

  const attendanceTypeText = event.event_type === 'worship' 
    ? 'Semua Member (Auto-added)' 
    : 'Hanya yang Register';

  eventInfo.innerHTML = `
    <div class="event-info-row">
      <div class="event-info-item">
        <span class="event-info-label">Tipe Event</span>
        <span class="event-info-value">${event.event_type}</span>
      </div>
      <div class="event-info-item">
        <span class="event-info-label">Tipe Absensi</span>
        <span class="event-info-value">${attendanceTypeText}</span>
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

async function loadAttendanceData(event) {
  const attendanceTableBody = document.getElementById("attendanceTableBody");
  const emptyAttendance = document.getElementById("emptyAttendance");
  const attendanceStats = document.getElementById("attendanceStats");

  try {
    console.log(`📥 Loading attendance for event ${event.id}...`);

    let attendanceData = [];

    // Pastikan event punya schedule
    if (!event.schedules || event.schedules.length === 0) {
      throw new Error('No schedule found for this event');
    }

    const scheduleId = event.schedules[0].id;
    console.log("🎯 Schedule ID:", scheduleId);

    // Fetch attendance records dari database
    const attendanceResponse = await fetch(`${API_BASE_URL}/attendance/schedule/${scheduleId}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });


    if (!attendanceResponse.ok) {
      throw new Error('Failed to fetch attendance records');
    }

    // ✅ Perbaikan di sini: akses data array dari attendanceRecords.data
    const attendanceRecords = await attendanceResponse.json();
    const checkedInMembers = Array.isArray(attendanceRecords?.data)
      ? attendanceRecords.data
      : [];

    console.log(`✅ Found ${checkedInMembers.length} attendance records`);

    // LOGIC BERBEDA UNTUK WORSHIP vs EVENT
    if (event.event_type === 'worship') {
      // WORSHIP: Ambil SEMUA member dari database
      console.log('📥 Fetching all members for worship event...');
      
      const membersResponse = await fetch(`${API_BASE_URL}/user/view`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!membersResponse.ok) {
        throw new Error('Failed to fetch members');
      }

      const membersData = await membersResponse.json();
      const allMembers = Array.isArray(membersData.user)
        ? membersData.user
        : [membersData.user];
      
      console.log(`✅ Loaded ${allMembers.length} members`);

      // Create attendance data for ALL members
      attendanceData = allMembers.map(member => {
        const checkedIn = checkedInMembers.find(a => a.user_id === member.id);
        
        return {
          user_id: member.id,
          user_name: member.name,
          gender: member.gender || 'Unknown',
          check_in_time: checkedIn ? checkedIn.scanned_at : null,
          status: checkedIn ? 'hadir' : 'tidak hadir',
        };
      });

    } else {
      // EVENT: Ambil dari attendance records (yang sudah register dan scan)
      console.log('📥 Processing event attendance...');
      
      attendanceData = checkedInMembers.map(record => ({
        user_id: record.user_id,
        user_name: record.user_name || `User ${record.user_id}`,
        gender: record.user_gender || 'Unknown',
        check_in_time: record.scanned_at,
        status:
          record.status === 'Present'
            ? 'hadir'
            : record.status === 'Registered'
            ? 'terdaftar'
            : 'tidak hadir',
      }));
      
      console.log(`✅ Processed ${attendanceData.length} event attendance records`);
    }

    // ✅ Render hasil ke tabel
    if (attendanceData.length === 0) {
      if (attendanceTableBody) attendanceTableBody.innerHTML = "";
      if (emptyAttendance) emptyAttendance.style.display = "block";
      updateStats([], attendanceStats);
      return;
    }

    if (emptyAttendance) emptyAttendance.style.display = "none";
    renderAttendanceTable(attendanceData, "all");
    updateStats(attendanceData, attendanceStats);

  } catch (error) {
    console.error("❌ Error loading attendance:", error);
    if (emptyAttendance) {
      emptyAttendance.style.display = "block";
      emptyAttendance.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <p>Gagal memuat data absensi</p>
        <small>${error.message}</small>
      `;
    }
  }
}


function renderAttendanceTable(attendanceData, genderFilter = 'all') {
  const attendanceTableBody = document.getElementById("attendanceTableBody");
  
  if (!attendanceTableBody) return;

  // Filter by gender
  let filteredData = attendanceData;
  if (genderFilter === 'male') {
    filteredData = attendanceData.filter(record => 
      record.gender && record.gender.toLowerCase() === 'male'
    );
  } else if (genderFilter === 'female') {
    filteredData = attendanceData.filter(record => 
      record.gender && record.gender.toLowerCase() === 'female'
    );
  }

  console.log(`📊 Rendering ${filteredData.length}/${attendanceData.length} records (filter: ${genderFilter})`);

  attendanceTableBody.innerHTML = filteredData
    .map((record, index) => {
      const checkInTime = record.check_in_time 
        ? new Date(record.check_in_time).toLocaleString("id-ID")
        : '-';
      
      const genderIcon = record.gender && record.gender.toLowerCase() === 'male' 
        ? '<i class="fas fa-mars" style="color: #3498db;"></i>'
        : record.gender && record.gender.toLowerCase() === 'female'
        ? '<i class="fas fa-venus" style="color: #e91e63;"></i>'
        : '<i class="fas fa-question" style="color: #95a5a6;"></i>';

      return `
        <tr>
          <td data-label="No">${index + 1}</td>
          <td data-label="Nama">${record.user_name}</td>
          <td data-label="Gender">${genderIcon} ${record.gender || 'Unknown'}</td>
          <td data-label="Waktu Check-in">${checkInTime}</td>
          <td data-label="Status">
            <span class="status-badge ${record.status === 'hadir' ? 'hadir' : 'absent'}">
              ${record.status === 'hadir' ? 'Hadir' : 'Tidak Hadir'}
            </span>
          </td>
        </tr>
      `;
    })
    .join("");

  // Update stats with filtered data
  const attendanceStats = document.getElementById("attendanceStats");
  updateStats(filteredData, attendanceStats);
}

function updateStats(attendanceData, statsContainer) {
  if (!statsContainer) return;

  const presentCount = attendanceData.filter(r => r.status === "hadir").length;
  const absentCount = attendanceData.length - presentCount;
  
  const maleCount = attendanceData.filter(r => 
    r.gender && r.gender.toLowerCase() === 'male'
  ).length;
  
  const femaleCount = attendanceData.filter(r => 
    r.gender && r.gender.toLowerCase() === 'female'
  ).length;

  statsContainer.innerHTML = `
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
    <div class="stat-box male">
      <div class="stat-box-value">${maleCount}</div>
      <div class="stat-box-label"><i class="fas fa-mars"></i> Laki-laki</div>
    </div>
    <div class="stat-box female">
      <div class="stat-box-value">${femaleCount}</div>
      <div class="stat-box-label"><i class="fas fa-venus"></i> Perempuan</div>
    </div>
  `;
}

function closeModal() {
  const modal = document.getElementById("attendanceModal");
  if (modal) {
    modal.classList.remove("show");
    document.body.style.overflow = "auto";
  }
  currentEvent = null;
  allAttendanceData = [];
  currentGenderFilter = 'all';
}

function exportAllData() {
  console.log("📥 Exporting all events data...");

  if (allEvents.length === 0) {
    showMessage("Tidak ada data untuk diekspor!", "error");
    return;
  }

  let csv = "Event Name,Event Type,Time,Location,Attendance Count\n";

  allEvents.forEach((event) => {
    const schedule = event.schedules && event.schedules[0];
    const startTime = schedule ? new Date(schedule.start_time) : null;

    const timeStr = startTime
      ? startTime.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

    csv += `"${event.event_name}","${event.event_type}","${timeStr}","${event.place}",0\n`;
  });

  downloadCSV(csv, `all_events_${new Date().toISOString().split("T")[0]}.csv`);
  showMessage("Data berhasil diekspor!", "success");
}

function exportEventData() {
  if (!currentEvent) {
    showMessage("Tidak ada event yang dipilih!", "error");
    return;
  }

  console.log("📥 Exporting event attendance...");

  let csv = "No,Nama,Gender,Waktu Check-in,Status\n";
  
  allAttendanceData.forEach((record, index) => {
    const checkInTime = record.check_in_time 
      ? new Date(record.check_in_time).toLocaleString("id-ID")
      : '-';
    
    csv += `${index + 1},"${record.user_name}","${record.gender || 'Unknown'}","${checkInTime}","${record.status}"\n`;
  });

  downloadCSV(
    csv,
    `attendance_${currentEvent.event_name.replace(/\s+/g, "_")}_${
      new Date().toISOString().split("T")[0]
    }.csv`
  );
  showMessage("Data absensi berhasil diekspor!", "success");
}

function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function showMessage(text, type) {
  const message = document.createElement("div");
  message.textContent = text;
  message.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    background: ${type === "success" ? "#d4edda" : "#f8d7da"};
    color: ${type === "success" ? "#155724" : "#721c24"};
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-weight: 600;
    animation: slideIn 0.3s ease;
  `;

  document.body.appendChild(message);

  setTimeout(() => {
    message.style.animation = "slideOut 0.3s ease";
    setTimeout(() => {
      document.body.removeChild(message);
    }, 300);
  }, 3000);
}

const style = document.createElement("style");
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