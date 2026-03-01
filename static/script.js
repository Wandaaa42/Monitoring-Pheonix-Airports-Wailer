const namaHari = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
let dbMax = 0;

function updateWaktu() {
    const sekarang = new Date();
    const jam    = sekarang.getHours().toString().padStart(2, '0');
    const menit  = sekarang.getMinutes().toString().padStart(2, '0');
    const detik  = sekarang.getSeconds().toString().padStart(2, '0');
    document.getElementById('hari-tanggal').textContent = 'Hari, Tanggal : ' + namaHari[sekarang.getDay()] + ', ' + sekarang.toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'});
    document.getElementById('jam').textContent = 'Waktu : ' + jam + ':' + menit + ':' + detik;
}
setInterval(updateWaktu, 1000);
updateWaktu();

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
    options: { 
        animation: false, // Tambahan: agar grafik tidak berat saat update tiap detik
        scales: { y: { min: 0, max: 120 } } 
    }
});

function ambilData() {
    fetch('/ambil_data')
        .then(res => res.json())
        .then(data => {
            if (data.length === 0) return;
            const terakhir = data[0];

            // --- REVISI VARIABEL AGAR COCOK DENGAN ESP32 & SERVER ---
            // Di ESP32: "db" -> Di Server masuk ke kolom: "amplitudo_db"
            // Di ESP32: "adc" -> Di Server masuk ke kolom: "nilai_adc"
            const currentDB = terakhir.amplitudo_db;
            const currentADC = terakhir.nilai_adc;

            // Status (threshold 60 dB)
            const elStatus = document.getElementById('Status');
            if (currentDB > 60) {
                elStatus.textContent = 'Status Alat : AKTIF';
                elStatus.style.color = 'red';
            } else {
                elStatus.textContent = 'Status Alat : STANDBY';
                elStatus.style.color = 'green';
            }

            document.getElementById('nilai-adc').textContent = currentADC;
            document.getElementById('db-now').textContent    = currentDB;

            if (currentDB > dbMax) {
                dbMax = currentDB;
                document.getElementById('db-max').textContent = dbMax;
            }

            // Grafik
            const dataGrafik = [...data].reverse();
            grafik.data.labels              = dataGrafik.map(d => d.waktu);
            grafik.data.datasets[0].data    = dataGrafik.map(d => d.amplitudo_db);
            grafik.update('none');
        });
}

// UBAH JADI 1 DETIK (1000ms)
setInterval(ambilData, 1000);
ambilData();
