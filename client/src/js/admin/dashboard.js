// Grafik dengan Chart.js
const ctx = document.getElementById('visitorChart').getContext('2d');
const visitorChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
        datasets: [{
            label: 'Pengunjung',
            data: [120, 190, 300, 500, 200, 300, 450],
            borderColor: '#3498db',
            backgroundColor: 'rgba(52, 152, 219, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const icon = themeToggle.querySelector('i');
    if (document.body.classList.contains('dark-mode')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
});

document.querySelector('.notification-btn').addEventListener('click', () => {
    alert('Anda memiliki 3 notifikasi baru!');
});

const menuItems = document.querySelectorAll('.menu a');
menuItems.forEach(item => {
    item.addEventListener('click', function(e) {
        if(!this.classList.contains('active')) {
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        }
    });
});