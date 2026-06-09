# 🚀 FoundLoka 
Platform digital yang menghubungkan UMKM dengan investor untuk menciptakan ekosistem pendanaan yang lebih transparan, mudah diakses, dan berkelanjutan.



## 📖 Deskripsi
Found Loka adalah platform berbasis web yang dirancang untuk mempertemukan pelaku UMKM yang membutuhkan pendanaan dengan investor yang ingin menanamkan modal pada usaha yang potensial. Melalui platform ini, UMKM dapat membuat profil usaha, mengajukan proposal pendanaan, dan mempresentasikan perkembangan bisnis mereka. Investor dapat menelusuri berbagai UMKM, menganalisis proposal yang tersedia, dan melakukan investasi berdasarkan informasi yang transparan.


## 🚀 Isi FoundLoka

### Semua Pengguna
- Melihat landing page dan informasi platform
- Melihat daftar kampanye aktif yang sudah diverifikasi
- Mencari kampanye berdasarkan nama, deskripsi, atau lokasi
- Filter kampanye berdasarkan kategori
- Filter kampanye berdasarkan radius 5km dari lokasi pengguna
- Melihat detail kampanye (deskripsi, progress dana, jumlah investor)
- Melihat peta interaktif lokasi seluruh UMKM
- Melihat ulasan/review publik di halaman kampanye
- Registrasi akun (sebagai Owner atau Investor)
- Login ke akun

### Owner / UMKM
- Dashboard Overview — ringkasan kampanye aktif, total dana terkumpul, dan riwayat transaksi
- Buat kampanye pendanaan baru (judul, deskripsi, target dana, lokasi, kategori)
- Lihat daftar kampanye milik sendiri beserta statusnya (pending / aktif / terdanai)
- Upload bukti penggunaan dana kampanye
- Dashboard Dana & Kewajiban — melihat dan membayar cicilan bulanan pengembalian dana ke investor
- Menerima notifikasi reminder cicilan yang jatuh tempo
- Update profil (nama, nomor telepon, alamat)
- Ubah kata sandi

### Investor
- Dashboard Overview — ringkasan portofolio dan transaksi terbaru
- Telusuri kampanye aktif langsung dari dashboard
- Investasi ke kampanye pilihan dengan nominal minimum Rp 100.000
- Proses pembayaran via Midtrans (Snap)
- Melihat portofolio investasi lengkap (semua kampanye yang pernah didanai)
- Melihat riwayat transaksi pembayaran
- Memberikan ulasan dan rating bintang pada kampanye yang didanai
- Update profil dan ubah kata sandi

### Admin
- Dashboard statistik — total kampanye, investasi, kampanye disetujui/ditolak
- Melihat semua kampanye dari semua status (pending, aktif, terdanai, ditolak, dana cair)
- Filter kampanye berdasarkan status
- Approve kampanye yang diajukan UMKM → kampanye jadi aktif dan bisa didanai investor
- Reject kampanye yang tidak memenuhi syarat → kampanye hilang dari dashboard UMKM
- Disburse (cairkan) dana ke UMKM setelah target tercapai
- Setiap aksi dilengkapi konfirmasi modal sebelum dieksekusi



## ⚙️ Arsitektur Sistem
Frontend -> REST API -> Backend Server -> Database
Sistem menggunakan arsitektur client-server dimana frontend berkomunikasi dengan backend melalui REST API dan seluruh data disimpan pada database.



## ⚙️ Tech Stack

### Frontend
React.js, React Router DOM, Axios, React Leaflet, Vite

### Backend
Node.js, Express.js, JWT, bcryptjs, Multer, Nodemailer, Node-Cron, dotenv

### Database
PostgreSQL, pg (node-postgres)

### Payment Gateway
Midtrans (Snap)



## ⚙️ Clone Repository

```bash
git clone https://github.com/[username]/foundLoka.git
```


## ⚙️ Implementasi keamanan yang digunakan:

- JWT Authentication
- Password Hashing (bcrypt)
- Role Based Access Control (RBAC)
- Input Validation
- Protected Routes
- Environment Variables Protection



## 👨‍💻 Tim Pengembang

### Kelompok [Maradu_Pengen_Juara]

- Christian De Midro Nainggolan
- Maradu Winner Laurensius

