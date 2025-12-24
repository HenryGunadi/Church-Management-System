// Konfigurasi API
const API_BASE_URL = 'http://localhost:3000/api';
const API_URL = `${API_BASE_URL}/user`;

// Check Authentication
const checkAuth = async () => {
    try {
        const response = await fetch("http://localhost:3000/api/auth/verify", {
        credentials: "include",
    });

        const data = await response.json();

    if (!response.ok || !data.authenticated) {
        window.location.href = "../user/login.html";
        return false;
    }

        console.log(`Authenticated as ${data.user.email} (${data.user.role})`);
        return true;
    } catch (error) {
        console.error("Auth check failed:", error);
        window.location.href = "../user/login.html";
        return false;
    }
};


// User Management Class
class UserManager {
    constructor() {
        this.currentUser = null;
        this.users = [];
        this.init();
    }

    async init() {
        if (!checkAuth()) return;
        await this.loadUsers();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('userForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Search input
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filterUsers(e.target.value);
        });
    }

    async loadUsers(id = null, email = null) {
        try {
            this.showLoading(true);

            let url = `${API_URL}/view`;
            if (id || email) {
                const params = new URLSearchParams();
                if (id) params.append("id", id);
                    if (email) params.append("email", email);
                        url += `?${params.toString()}`;
            }
            
            const response = await fetch(`${API_URL}/view?id=${id}&email=${email}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (response.status === 401) {
                alert('Session expired. Please login again.');
                window.location.href = '../user/login.html';
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            this.users = Array.isArray(data.user) ? data.user : [data.user];
            this.renderUsers();
        } catch (error) {
            console.error('Error loading users:', error);
            this.showError('Gagal memuat data user. Silakan coba lagi.');
        } finally {
            this.showLoading(false);
        }
    }

    async createUser(userData) {
        try {
            const response = await fetch(`${API_URL}/create`, {
                method: 'POST',
                credentials: 'include',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to create user');
            }

            return data;
        } catch (error) {
            throw error;
        }
    }

    async updateUser(userData) {
        try {
            const response = await fetch(`${API_URL}/update`, {
                method: 'PATCH',
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to update user');
            }

            return data;
        } catch (error) {
            throw error;
        }
    }

    async deleteUser(id, email) {
        try {
            const response = await fetch(`${API_URL}/delete/${id}/${email}`, {
                method: 'DELETE',
                credentials: "include"
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete user');
            }

            return data;
        } catch (error) {
            throw error;
        }
    }

    async getUserDetail(id, email) {
        try {
            const response = await fetch(`${API_URL}/view/${id}/${email}`, {
                method: 'GET',
                credentials: "include"
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to get user detail');
            }

            return data.user;
        } catch (error) {
            throw error;
        }
    }

    async handleSubmit() {
        const form = document.getElementById('userForm');
        const submitBtn = document.getElementById('submitBtn');
        const userId = document.getElementById('userId').value;
        
        const userData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            role: document.getElementById('role').value,
            phone: document.getElementById('phone').value || null
        };

        // Add password only if provided
        const password = document.getElementById('password').value;
        if (password) {
            userData.password = password;
        }

        // Add ID for update
        if (userId) {
            userData.id = parseInt(userId);
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';

        try {
            let result;
            if (userId) {
                result = await this.updateUser(userData);
                this.showSuccess('User berhasil diperbarui!');
            } else {
                result = await this.createUser(userData);
                this.showSuccess('User berhasil dibuat!');
            }

            // Reload users
            await this.loadUsers();
            
            // Reset form
            this.resetForm();
        } catch (error) {
            console.error('Error saving user:', error);
            this.showError(error.message || 'Gagal menyimpan user');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Simpan';
        }
    }

    editUser(user) {
        document.getElementById('formTitle').textContent = 'Edit User';
        document.getElementById('userId').value = user.id;
        document.getElementById('name').value = user.name || '';
        document.getElementById('email').value = user.email || '';
        document.getElementById('role').value = user.role || '';
        document.getElementById('phone').value = user.phone || '';
        document.getElementById('password').value = '';
        
        // Scroll to form
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
    }

    async viewUserDetail(id, email) {
        try {
            const user = await this.getUserDetail(id, email);
            this.showUserDetail(user);
        } catch (error) {
            console.error('Error viewing user:', error);
            this.showError('Gagal memuat detail user');
        }
    }

    async confirmDelete(user) {
        const confirmed = confirm(`Apakah Anda yakin ingin menghapus user "${user.name}" (${user.email})?`);
        
        if (confirmed) {
            try {
                await this.deleteUser(user.id, user.email);
                this.showSuccess('User berhasil dihapus!');
                await this.loadUsers();
            } catch (error) {
                console.error('Error deleting user:', error);
                this.showError(error.message || 'Gagal menghapus user');
            }
        }
    }

    showUserDetail(user) {
        const detailContent = `
            <div class="user-detail">
                <div class="detail-item">
                    <strong>ID:</strong> ${user.id}
                </div>
                <div class="detail-item">
                    <strong>Nama:</strong> ${user.name}
                </div>
                <div class="detail-item">
                    <strong>Email:</strong> ${user.email}
                </div>
                <div class="detail-item">
                    <strong>Role:</strong> <span class="status-badge status-active">${user.role}</span>
                </div>
                <div class="detail-item">
                    <strong>Telepon:</strong> ${user.phone || '-'}
                </div>
                <div class="detail-item">
                    <strong>Dibuat:</strong> ${new Date(user.created_at || Date.now()).toLocaleDateString('id-ID')}
                </div>
                <div class="detail-item">
                    <strong>Diperbarui:</strong> ${user.updated_at ? new Date(user.updated_at).toLocaleDateString('id-ID') : '-'}
                </div>
            </div>
            <div style="margin-top: 20px; display: flex; gap: 10px;">
                <button class="action-btn edit" onclick="userManager.editUser(${JSON.stringify(user).replace(/"/g, '&quot;')}); closeModal();">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="action-btn delete" onclick="userManager.confirmDelete(${JSON.stringify(user).replace(/"/g, '&quot;')}); closeModal();">
                    <i class="fas fa-trash"></i> Hapus
                </button>
            </div>
        `;
        
        document.getElementById('userDetailContent').innerHTML = detailContent;
        document.getElementById('detailModal').style.display = 'flex';
    }

    filterUsers(searchTerm) {
        const filteredUsers = this.users.filter(user => {
            const searchLower = searchTerm.toLowerCase();
            return (
                (user.name && user.name.toLowerCase().includes(searchLower)) ||
                (user.email && user.email.toLowerCase().includes(searchLower)) ||
                (user.role && user.role.toLowerCase().includes(searchLower)) ||
                (user.phone && user.phone.includes(searchTerm))
            );
        });
        
        this.renderUsers(filteredUsers);
    }

    renderUsers(usersToRender = this.users) {
        const tbody = document.getElementById('usersTableBody');
        
        if (usersToRender.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px;">
                        <i class="fas fa-users-slash" style="font-size: 2rem; color: #bdc3c7; margin-bottom: 10px; display: block;"></i>
                        <p>Tidak ada data user</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = usersToRender.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>
                    <strong>${user.name}</strong>
                    ${user.role === 'admin' ? '<br><small style="color: #e74c3c;">Administrator</small>' : ''}
                </td>
                <td>${user.email}</td>
                <td>
                    <span class="status-badge ${user.role === 'admin' ? 'status-active' : 'status-inactive'}">
                        ${user.role}
                    </span>
                </td>
                <td>${user.phone || '-'}</td>
                <td>${new Date(user.created_at || Date.now()).toLocaleDateString('id-ID')}</td>
                <td class="actions-cell">
                    <button class="action-btn view" onclick="userManager.viewUserDetail(${user.id}, '${user.email}')">
                        <i class="fas fa-eye"></i> Lihat
                    </button>
                    <button class="action-btn edit" onclick="userManager.editUser(${JSON.stringify(user).replace(/"/g, '&quot;')})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn delete" onclick="userManager.confirmDelete(${JSON.stringify(user).replace(/"/g, '&quot;')})">
                        <i class="fas fa-trash"></i> Hapus
                    </button>
                </td>
            </tr>
        `).join('');
    }

    resetForm() {
        document.getElementById('userForm').reset();
        document.getElementById('userId').value = '';
        document.getElementById('formTitle').textContent = 'Tambah User Baru';
        document.getElementById('password').placeholder = 'Biarkan kosong jika tidak ingin mengganti';
    }

    showLoading(show) {
        const tbody = document.getElementById('usersTableBody');
        if (show) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="loading">
                        <div class="spinner"></div>
                    </td>
                </tr>
            `;
        }
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#2ecc71' : '#e74c3c'};
            color: white;
            padding: 15px 20px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Global Functions
function showCreateForm() {
    userManager.resetForm();
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

function resetForm() {
    userManager.resetForm();
}

function closeModal() {
    document.getElementById('detailModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('detailModal');
    if (event.target === modal) {
        closeModal();
    }
};

// Initialize User Manager
let userManager;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    userManager = new UserManager();
    
    // Check authentication on page load
    if (!checkAuth()) {
        return;
    }
});