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
        animation: false, // Mematikan animasi agar grafik update tiap detik terasa ringan
        scales: { y: { min: 0, max: 120 } } 
    }
});

function ambilData() {
    fetch('/ambil_data')
        .then(res => res.json())
        .then(data => {
            if (!data || data.length === 0) return;
            const terakhir = data[0];

            // DISESUAIKAN: ESP32 mengirim 'db' yang oleh server disimpan ke 'amplitudo_db'
            // Jika di database kolomnya bernama 'amplitudo_db', maka kodenya tetap seperti ini:
            const valDB = terakhir.amplitudo_db;
            const valADC = terakhir.nilai_adc;

            // Status (threshold 60 dB)
            const elStatus = document.getElementById('Status');
            if (valDB > 60) {
                elStatus.textContent = 'Status Alat : AKTIF';
                elStatus.style.color = 'red';
            } else {
                elStatus.textContent = 'Status Alat : STANDBY';
                elStatus.style.color = 'green';
            }

            document.getElementById('nilai-adc').textContent = valADC;
            document.getElementById('db-now').textContent    = valDB;

            if (valDB > dbMax) {
                dbMax = valDB;
                document.getElementById('db-max').textContent = dbMax;
            }

            // Grafik: Mengambil data historis dari server
            const dataGrafik = [...data].reverse();
            grafik.data.labels              = dataGrafik.map(d => d.waktu);
            grafik.data.datasets[0].data    = dataGrafik.map(d => d.amplitudo_db);
            grafik.update('none');
        });
}

// UPDATE SETIAP 1 DETIK (1000ms)
setInterval(ambilData, 1000);
ambilData();
