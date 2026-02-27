const namaHari = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
let dbMax = 0;

// Update Jam Real-time
function updateWaktu() {
    const sekarang = new Date();
    const jam = sekarang.getHours().toString().padStart(2, '0');
    const menit = sekarang.getMinutes().toString().padStart(2, '0');
    const detik = sekarang.getSeconds().toString().padStart(2, '0');

    document.getElementById('hari-tanggal').textContent = 'Hari, Tanggal : ' + namaHari[sekarang.getDay()] + ', ' + sekarang.toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'});
    document.getElementById('jam').textContent = 'Waktu : ' + jam + ':' + menit + ':' + detik;
}
setInterval(updateWaktu, 1000);

// Grafik (Asli)
const grafik = new Chart(document.getElementById('Grafik'), {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Intensitas Bunyi (dB)',
            data: [],
            borderColor: 'darkslateblue',
            fill: false
        }]
    },
    options: { scales: { y: { min: 0, max: 120 } } }
});

function ambilData() {
    fetch('/ambil_data')
        .then(res => res.json())
        .then(data => {
            if (data.length === 0) return;
            const terakhir = data[0];

            // Update Status Alat & dB
            const elStatus = document.getElementById('Status');
            if (terakhir.amplitudo_db > 95) {
                elStatus.textContent = 'Status Alat : AKTIF';
                elStatus.style.color = 'red';
            } else {
                elStatus.textContent = 'Status Alat : STANDBY';
                elStatus.style.color = 'green';
            }

            document.getElementById('db-now').textContent = terakhir.amplitudo_db;
            if (terakhir.amplitudo_db > dbMax) {
                dbMax = terakhir.amplitudo_db;
                document.getElementById('db-max').textContent = dbMax;
            }

            // Update Grafik
            const dataGrafik = [...data].reverse();
            grafik.data.labels = dataGrafik.map(d => d.waktu);
            grafik.data.datasets[0].data = dataGrafik.map(d => d.amplitudo_db);
            grafik.update('none');

            // Tampilkan Tabel
            const tbody = document.getElementById('data-log');
            tbody.innerHTML = data.map((d, i) => `
                <tr>
                    <td>${data.length - i}</td>
                    <td>${d.tanggal}</td>
                    <td>${d.waktu}</td>
                    <td>${d.nilai_adc}</td>
                    <td>${d.amplitudo_db} dB</td>
                </tr>
            `).join('');
        });
}

setInterval(ambilData, 2000);
ambilData();