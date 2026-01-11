import { loadSidebar } from './adminSidebar.js';

const API_BASE_URL = 'http://localhost:3000/api/user';
let currentEditId = null;

// Export init function untuk dipanggil oleh router
export async function init() {
  // Load sidebar first
  await loadSidebar();
  
  // Initialize users page
  initUsersPage();
  loadUsers();
}

function initUsersPage() {
  // Form handlers
  const userForm = document.getElementById('userForm');
  const addUserBtn = document.getElementById('addUserBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const searchInput = document.getElementById('searchInput');
  const closeModalBtn = document.getElementById('closeModalBtn');

  if (userForm) {
    userForm.addEventListener('submit', handleSubmit);
  }

  if (addUserBtn) {
    addUserBtn.addEventListener('click', showCreateForm);
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', resetForm);
  }

  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
  }

  // Close modal when clicking outside
  const modal = document.getElementById('detailModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }
}

// Load users from API
async function loadUsers() {
  const tbody = document.getElementById('usersTableBody');
  
  try {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="loading">
          <div class="spinner"></div>
        </td>
      </tr>
    `;

    const response = await fetch(`${API_BASE_URL}/view`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    const data = await response.json();
    // Backend returns { message, user } or array of users
    const users = Array.isArray(data.user) ? data.user : (data.user ? [data.user] : []);
    
    renderUsersTable(users);

  } catch (error) {
    console.error('Error loading users:', error);
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; color: #e74c3c; padding: 30px;">
          <i class="fas fa-exclamation-triangle"></i><br>
          Gagal memuat data user: ${error.message}
        </td>
      </tr>
    `;
  }
}

// Render users table
function renderUsersTable(users) {
  const tbody = document.getElementById('usersTableBody');
  
  if (!users || users.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 30px; color: #7f8c8d;">
          <i class="fas fa-inbox"></i><br>
          Belum ada data user
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = users.map(user => `
    <tr data-id="${user.id}" data-email="${escapeHtml(user.email)}">
      <td>${user.id}</td>
      <td>${escapeHtml(user.name || '-')}</td>
      <td>${escapeHtml(user.email || '-')}</td>
      <td>
        <span class="status-badge ${user.role === 'admin' ? 'status-active' : 'status-inactive'}">
          ${escapeHtml(user.role || 'member')}
        </span>
      </td>
      <td>${escapeHtml(user.phone_number || '-')}</td>
      <td>${escapeHtml(user.gender || '-')}</td>
      <td>${formatDate(user.created_at)}</td>
      <td>
        <div class="actions-cell">
          <button class="action-btn view" data-id="${user.id}" data-email="${escapeHtml(user.email)}">
            <i class="fas fa-eye"></i> Lihat
          </button>
          <button class="action-btn edit" data-id="${user.id}">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="action-btn delete" data-id="${user.id}" data-email="${escapeHtml(user.email)}">
            <i class="fas fa-trash"></i> Hapus
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  // Attach event listeners
  attachActionButtons();
}

// Attach event listeners to action buttons
function attachActionButtons() {
  const viewButtons = document.querySelectorAll('.action-btn.view');
  const editButtons = document.querySelectorAll('.action-btn.edit');
  const deleteButtons = document.querySelectorAll('.action-btn.delete');

  viewButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const userId = btn.dataset.id;
      const userEmail = btn.dataset.email;
      viewUser(userId, userEmail);
    });
  });

  editButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const userId = btn.dataset.id;
      editUser(userId);
    });
  });

  deleteButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const userId = btn.dataset.id;
      const userEmail = btn.dataset.email;
      deleteUser(userId, userEmail);
    });
  });
}

// Show create form
function showCreateForm() {
  resetForm();
  document.getElementById('formTitle').textContent = 'Tambah User Baru';
  document.getElementById('password').required = true;
  
  // Scroll to form
  document.getElementById('formSection').scrollIntoView({ behavior: 'smooth' });
}

// Reset form
function resetForm() {
  const form = document.getElementById('userForm');
  form.reset();
  currentEditId = null;
  document.getElementById('userId').value = '';
  document.getElementById('formTitle').textContent = 'Tambah User Baru';
  document.getElementById('password').required = true;
}

// Handle form submit
async function handleSubmit(e) {
  e.preventDefault();
  
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';

  const formData = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    role: document.getElementById('role').value,
    phone_number: document.getElementById('phone').value || null,
    gender: document.getElementById('gender').value || null
  };

  const password = document.getElementById('password').value;
  if (password) {
    formData.password = password;
  }

  try {
    let response;
    
    if (currentEditId) {
      // Update user
      formData.id = currentEditId;
      response = await fetch(`${API_BASE_URL}/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
    } else {
      // Create user
      response = await fetch(`${API_BASE_URL}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
    }

    const result = await response.json();

    if (!response.ok) {
      // Handle validation errors
      if (result.errors) {
        const errorMessages = result.errors.map(err => err.msg).join('\n');
        throw new Error(errorMessages);
      }
      throw new Error(result.message || 'Gagal menyimpan data');
    }

    alert(currentEditId ? 'User berhasil diupdate!' : 'User berhasil ditambahkan!');
    resetForm();
    loadUsers();

  } catch (error) {
    console.error('Error saving user:', error);
    alert('Gagal menyimpan user:\n' + error.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Simpan';
  }
}

// View user detail
async function viewUser(userId, userEmail) {
  const modal = document.getElementById('detailModal');
  const content = document.getElementById('userDetailContent');

  try {
    content.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    modal.classList.add('show');

    // Backend requires either id or email as query params
    const queryParam = userId ? `id=${userId}` : `email=${userEmail}`;
    const response = await fetch(`${API_BASE_URL}/view?${queryParam}`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('User tidak ditemukan');
    }

    const data = await response.json();
    const user = data.user;
    
    content.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 15px;">
        <div>
          <strong>ID:</strong> ${user.id}
        </div>
        <div>
          <strong>Nama:</strong> ${escapeHtml(user.name)}
        </div>
        <div>
          <strong>Email:</strong> ${escapeHtml(user.email)}
        </div>
        <div>
          <strong>Role:</strong> 
          <span class="status-badge ${user.role === 'admin' ? 'status-active' : 'status-inactive'}">
            ${escapeHtml(user.role)}
          </span>
        </div>
        <div>
          <strong>Telepon:</strong> ${escapeHtml(user.phone_number || '-')}
        </div>
        <div>
          <strong>Gender:</strong> ${escapeHtml(user.gender || '-')}
        </div>
        <div>
          <strong>Tanggal Lahir:</strong> ${formatDate(user.birth_date) || '-'}
        </div>
        <div>
          <strong>Alamat:</strong> ${escapeHtml(user.address || '-')}
        </div>
        <div>
          <strong>Dibuat:</strong> ${formatDate(user.created_at)}
        </div>
        <div>
          <strong>Terakhir Update:</strong> ${formatDate(user.updated_at)}
        </div>
      </div>
    `;

  } catch (error) {
    console.error('Error viewing user:', error);
    content.innerHTML = `
      <div style="text-align: center; color: #e74c3c;">
        <i class="fas fa-exclamation-triangle"></i><br>
        ${error.message}
      </div>
    `;
  }
}

// Edit user
async function editUser(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/view?id=${userId}`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('User tidak ditemukan');
    }

    const data = await response.json();
    const user = data.user;
    
    // Fill form
    document.getElementById('userId').value = user.id;
    document.getElementById('name').value = user.name;
    document.getElementById('email').value = user.email;
    document.getElementById('role').value = user.role;
    document.getElementById('phone').value = user.phone_number || '';
    document.getElementById('gender').value = user.gender || '';

    document.getElementById('password').value = '';
    document.getElementById('password').required = false;
    
    document.getElementById('formTitle').textContent = 'Edit User';
    currentEditId = userId;

    // Scroll to form
    document.getElementById('formSection').scrollIntoView({ behavior: 'smooth' });

  } catch (error) {
    console.error('Error loading user:', error);
    alert('Gagal memuat data user: ' + error.message);
  }
}

// Delete user
async function deleteUser(userId, userEmail) {
  if (!confirm('Apakah Anda yakin ingin menghapus user ini?')) {
    return;
  }

  try {
    // Backend expects DELETE /delete/:id/:email
    const response = await fetch(`${API_BASE_URL}/delete/${userId}/${encodeURIComponent(userEmail)}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Gagal menghapus user');
    }

    alert('User berhasil dihapus!');
    loadUsers();

  } catch (error) {
    console.error('Error deleting user:', error);
    alert('Gagal menghapus user: ' + error.message);
  }
}

// Search users
function handleSearch(e) {
  const searchTerm = e.target.value.toLowerCase();
  const rows = document.querySelectorAll('#usersTableBody tr');

  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm) ? '' : 'none';
  });
}

// Close modal
function closeModal() {
  const modal = document.getElementById('detailModal');
  modal.classList.remove('show');
}

// Utility functions
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Make functions globally accessible for inline onclick handlers (if needed)
window.viewUser = viewUser;
window.editUser = editUser;
window.deleteUser = deleteUser;
window.closeModal = closeModal;