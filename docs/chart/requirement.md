# Product Requirement Document (PRD)

## 1. Latar Belakang
Saat ini sistem ERP lama yang digunakan setiap toko yang berjalan secara terpisah (multi-instance), menyulitkan integrasi data terlebih untuk report seperti customer, supplier, dan barang. Dibutuhkan solusi yang untuk mengintegrasikan data antar sistem dan ingin dibuat secara modern, sehingga memudahkan pengembangan lebih lanjut.

---

## 2. Tujuan
Membangun sistem integrasi data master (customer, supplier, item, toko) lintas perusahaan, yang mampu:
- Memusatkan data barang, customer, supplier, dan dokumen dari beberapa database ERP lama ke satu sistem baru
- Menyediakan antarmuka modern dan mudah dimengerti untuk pengelolaan data
- Data lama pada ERP lama harus dapat tetap diakses 

---

## 3. Fitur Utama yang Diharapkan

### A. Backend Integrasi (Baru)
- Admin dapat menambah data customer, toko, supplier, dan barang melalui frontend
- Data yang ditambahkan akan diakses dan digunakan oleh sistem lama sesuai toko

### B. ERP Lama (Sistem Eksisting)
- Sistem ERP lama menggunakan data customer, barang dan supplier terbaru dari aplikasi yang terintegrasi

### D. Mobile Backend (Server Inhouse)
- Menyimpan data barcode masuk dan keluar dari aplikasi mobile

---

## 4. Kriteria Sukses (*Success Criteria*)
- Data master customer/supplier/item/toko dapat dibuat di frontend dan dapat diakses oleh ERP lama secara cepat
- Tidak ada duplikasi data pada sistem ERP lama setelah sinkronisasi

---

## 5. Kebutuhan Tambahan (Opsional)
- Setiap perubahan data harus memiliki audit log

---

## 6. Batasan Sistem
- Migrasi dan pengembangan sistem dijalankan secara smooth dan cepat
