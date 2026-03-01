from flask import Flask, request, jsonify, render_template
import sqlite3
import os
from datetime import datetime, timedelta

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE  = os.path.join(BASE_DIR, 'monitoring.db')

THRESHOLD = 60.0  

def init_db():
    conn = sqlite3.connect(DB_FILE)
    conn.execute('''CREATE TABLE IF NOT EXISTS log_aktivitas 
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                  tanggal TEXT, waktu TEXT, status TEXT, 
                  amplitudo_db REAL, nilai_adc INTEGER)''')
    conn.commit()
    conn.close()

# Dipanggil saat app dimuat (bukan hanya saat __main__)
init_db()

@app.route('/')
def dashboard():
    return render_template('index.html')

@app.route('/data', methods=['POST'])
def terima_data():
    try:
        content = request.json
        waktu_wita = datetime.utcnow() + timedelta(hours=8)
        db  = float(content.get('db', 0))
        adc = int(content.get('adc', 0))
        status = "AKTIF" if db > THRESHOLD else "STANDBY"

        conn = sqlite3.connect(DB_FILE)
        conn.execute("INSERT INTO log_aktivitas (tanggal, waktu, status, amplitudo_db, nilai_adc) VALUES (?, ?, ?, ?, ?)",
                     (waktu_wita.strftime('%d/%m/%Y'), waktu_wita.strftime('%H:%M:%S'), status, db, adc))
        conn.commit()
        conn.close()
        return jsonify({"status": "success"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/ambil_data')
def ambil_data():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    rows = conn.execute("SELECT * FROM log_aktivitas ORDER BY id DESC LIMIT 50").fetchall()
    conn.close()
    return jsonify([dict(ix) for ix in rows])

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
