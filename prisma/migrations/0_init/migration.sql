-- CreateTable
CREATE TABLE `nd_barang` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `jenis_barang` VARCHAR(100) NULL DEFAULT '''''',
    `nama_jual` VARCHAR(100) NULL,
    `satuan_id` INTEGER NULL,
    `qty_warning` INTEGER NOT NULL DEFAULT 500,
    `deskripsi_info` VARCHAR(500) NULL,
    `status_aktif` INTEGER NULL DEFAULT 1,
    `tipe_qty` BOOLEAN NULL DEFAULT true,
    `grade` VARCHAR(4) NULL,
    `bahan` VARCHAR(50) NULL,
    `fitur` VARCHAR(50) NULL,
    `tipe` VARCHAR(50) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_barang_satuan`(`satuan_id`),
    INDEX `nama_jual`(`nama_jual`),
    UNIQUE INDEX `nama_unik`(`nama_jual`, `satuan_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nd_barang_bahan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(50) NOT NULL DEFAULT '',
    `kode` VARCHAR(2) NOT NULL DEFAULT '',
    `keterangan` VARCHAR(100) NULL,
    `status_aktif` TINYINT NOT NULL DEFAULT 1,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nd_barang_beli` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(100) NULL,
    `barang_id` SMALLINT NULL,
    `status_aktif` TINYINT NULL DEFAULT 1,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `nama`(`nama`, `barang_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nd_barang_fitur` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(50) NOT NULL DEFAULT '',
    `kode` VARCHAR(2) NOT NULL DEFAULT '',
    `keterangan` VARCHAR(100) NULL,
    `status_aktif` TINYINT NOT NULL DEFAULT 1,

    UNIQUE INDEX `nama`(`nama`),
    UNIQUE INDEX `kode`(`kode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nd_barang_grade` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(50) NOT NULL DEFAULT '',
    `kode` VARCHAR(2) NOT NULL DEFAULT '',
    `keterangan` VARCHAR(100) NULL,
    `status_aktif` TINYINT NOT NULL DEFAULT 1,

    UNIQUE INDEX `nama`(`nama`),
    UNIQUE INDEX `kode`(`kode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nd_barang_sku` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sku_id` CHAR(36) NOT NULL DEFAULT '',
    `nama_barang` VARCHAR(100) NOT NULL DEFAULT '',
    `nama_jual` VARCHAR(100) NOT NULL DEFAULT '',
    `barang_id` INTEGER NOT NULL DEFAULT 0,
    `warna_id` INTEGER NOT NULL DEFAULT 0,
    `satuan_id` INTEGER NOT NULL DEFAULT 0,
    `status_aktif` TINYINT NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `sku_id`(`sku_id`),
    INDEX `barang_id`(`barang_id`),
    INDEX `barang_warna_id`(`warna_id`),
    UNIQUE INDEX `barang_unik`(`barang_id`, `warna_id`, `satuan_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nd_barang_tipe` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(50) NOT NULL DEFAULT '',
    `kode` VARCHAR(2) NOT NULL DEFAULT '',
    `keterangan` VARCHAR(100) NULL,
    `status_aktif` TINYINT NOT NULL DEFAULT 1,

    UNIQUE INDEX `nama`(`nama`),
    UNIQUE INDEX `kode`(`kode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nd_customer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `customer_type_id` BOOLEAN NOT NULL DEFAULT true,
    `nama` VARCHAR(70) NULL,
    `alias` VARCHAR(300) NOT NULL,
    `alamat` VARCHAR(1000) NULL,
    `telepon` VARCHAR(200) NULL,
    `telepon1` VARCHAR(500) NULL,
    `telepon2` VARCHAR(50) NULL,
    `npwp` VARCHAR(200) NULL,
    `nik` VARCHAR(16) NULL,
    `kota` VARCHAR(200) NULL,
    `provinsi` VARCHAR(100) NULL,
    `kode_pos` VARCHAR(20) NULL,
    `email` VARCHAR(200) NULL,
    `contact_person` VARCHAR(500) NOT NULL,
    `tempo_kredit` TINYINT NULL,
    `warning_kredit` TINYINT NULL,
    `limit_warning_type` TINYINT NULL,
    `limit_amount` INTEGER NULL,
    `limit_atas` INTEGER NULL,
    `limit_warning_amount` INTEGER NULL,
    `status_aktif` BOOLEAN NOT NULL DEFAULT true,
    `img_link` VARCHAR(500) NULL,
    `npwp_link` VARCHAR(500) NULL,
    `ktp_link` VARCHAR(500) NULL,
    `medsos_link` VARCHAR(2000) NULL,
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `tipe_company` VARCHAR(3) NULL,
    `blok` VARCHAR(100) NOT NULL DEFAULT '-',
    `no` VARCHAR(100) NULL DEFAULT '-',
    `rt` VARCHAR(4) NOT NULL DEFAULT '000',
    `rw` VARCHAR(4) NOT NULL DEFAULT '000',
    `kecamatan` VARCHAR(100) NOT NULL DEFAULT '-',
    `kelurahan` VARCHAR(100) NOT NULL DEFAULT '-',
    `locked_status` BOOLEAN NOT NULL DEFAULT true,
    `jenis_pekerjaan` VARCHAR(500) NULL,
    `jenis_produk` VARCHAR(500) NULL,
    `user_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nd_department` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kode` VARCHAR(2) NOT NULL,
    `nama` VARCHAR(100) NOT NULL,
    `status_aktif` INTEGER NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `kode-nama`(`kode`, `nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nd_document` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `toko_id` INTEGER NOT NULL DEFAULT 0,
    `tanggal` DATE NULL,
    `document_control_id` INTEGER NOT NULL DEFAULT 0,
    `document_number_raw` INTEGER NULL,
    `document_number` VARCHAR(50) NULL,
    `document_status` VARCHAR(50) NOT NULL,
    `judul` VARCHAR(100) NOT NULL DEFAULT '',
    `dari` VARCHAR(100) NOT NULL DEFAULT '',
    `kepada` VARCHAR(100) NOT NULL DEFAULT '',
    `keterangan` VARCHAR(3000) NOT NULL DEFAULT '',
    `penanggung_jawab` VARCHAR(50) NOT NULL DEFAULT '',
    `username` VARCHAR(50) NOT NULL DEFAULT '',
    `status_aktif` TINYINT NOT NULL DEFAULT 1,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nd_document_control` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `department_id` INTEGER NOT NULL,
    `tipe_dokumen` VARCHAR(50) NULL DEFAULT '',
    `no_kode` SMALLINT NULL,
    `kode` VARCHAR(4) NOT NULL,
    `nama` VARCHAR(100) NOT NULL,
    `keterangan` VARCHAR(100) NULL,
    `status_aktif` INTEGER NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `department_id`(`department_id`),
    UNIQUE INDEX `kode-nama`(`kode`, `nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nd_gudang` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(70) NULL,
    `lokasi` VARCHAR(20) NULL,
    `status_default` INTEGER NOT NULL DEFAULT 0,
    `visible` BOOLEAN NOT NULL DEFAULT true,
    `gudang_group_id` SMALLINT NULL,
    `urutan` INTEGER NOT NULL,
    `status_aktif` INTEGER NOT NULL DEFAULT 1,

    UNIQUE INDEX `nama`(`nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nd_posisi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nd_satuan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(100) NULL,
    `status_aktif` INTEGER NULL DEFAULT 1,

    UNIQUE INDEX `nama`(`nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nd_supplier` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kode` VARCHAR(2) NULL,
    `nama` VARCHAR(70) NULL,
    `alamat` VARCHAR(100) NULL,
    `telepon` VARCHAR(50) NULL,
    `kota` VARCHAR(100) NULL,
    `fax` VARCHAR(50) NULL,
    `kode_pos` VARCHAR(20) NULL,
    `nama_bank` VARCHAR(200) NULL,
    `no_rek_bank` VARCHAR(200) NULL,
    `email` VARCHAR(70) NULL,
    `website` VARCHAR(50) NULL,
    `status_aktif` INTEGER NOT NULL DEFAULT 1,

    UNIQUE INDEX `kode`(`kode`),
    UNIQUE INDEX `nama`(`nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nd_toko` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(70) NULL,
    `alias` VARCHAR(50) NOT NULL DEFAULT '',
    `alamat` VARCHAR(100) NULL,
    `telepon` VARCHAR(50) NULL,
    `email` VARCHAR(100) NULL,
    `fax` VARCHAR(100) NULL,
    `kota` VARCHAR(20) NULL,
    `kode_pos` VARCHAR(20) NULL,
    `NPWP` VARCHAR(100) NULL,
    `pre_faktur` VARCHAR(2) NULL,
    `kode_toko` VARCHAR(2) NULL,
    `status_aktif` INTEGER NOT NULL DEFAULT 1,
    `nama_domain` VARCHAR(100) NULL,
    `email_pajak` VARCHAR(100) NULL,
    `index` TINYINT NULL,

    UNIQUE INDEX `nama`(`nama`),
    UNIQUE INDEX `alias`(`alias`),
    UNIQUE INDEX `NPWP`(`NPWP`),
    UNIQUE INDEX `kode_toko`(`kode_toko`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nd_toko_barang_assignment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `toko_id` INTEGER NOT NULL DEFAULT 0,
    `barang_id` INTEGER NOT NULL DEFAULT 0,
    `is_synced` TINYINT NOT NULL DEFAULT 0,
    `last_synced` DATETIME(0) NULL,
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `toko_barang`(`toko_id`, `barang_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nd_toko_user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `toko_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `user_id_creator` INTEGER NOT NULL,
    `created_at` DATETIME(0) NOT NULL,
    `updated_at` DATETIME(0) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nd_user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NULL,
    `password` VARCHAR(70) NULL,
    `roles` VARCHAR(70) NULL,
    `has_account` TINYINT NOT NULL DEFAULT 0,
    `nama` VARCHAR(70) NULL,
    `alamat` VARCHAR(100) NULL,
    `telepon` VARCHAR(50) NULL,
    `jenis_kelamin` VARCHAR(100) NULL,
    `kota_lahir` VARCHAR(100) NULL,
    `tgl_lahir` DATE NULL,
    `status_perkawinan` VARCHAR(100) NULL,
    `jumlah_anak` SMALLINT NULL,
    `agama` VARCHAR(50) NULL,
    `nik` VARCHAR(50) NULL,
    `npwp` VARCHAR(50) NULL,
    `profile_picture` VARCHAR(200) NULL,
    `ktp_picture` VARCHAR(500) NULL,
    `npwp_picture` VARCHAR(500) NULL,
    `posisi_id` INTEGER NULL,
    `time_start` TIME(0) NULL DEFAULT '07:00:00',
    `time_end` TIME(0) NULL DEFAULT '18:00:00',
    `printer_list_id` INTEGER NULL,
    `status_aktif` INTEGER NULL DEFAULT 0,
    `PIN` VARCHAR(10) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `username`(`username`),
    INDEX `fk_user_posisi`(`posisi_id`),
    UNIQUE INDEX `username ifnull`(`username`, `nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nd_warna` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `warna_beli` VARCHAR(50) NULL,
    `warna_jual` VARCHAR(50) NULL,
    `kode_warna` VARCHAR(7) NULL,
    `status_aktif` INTEGER NOT NULL DEFAULT 1,

    UNIQUE INDEX `warna_jual`(`warna_jual`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `query_log` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `table_name` VARCHAR(50) NOT NULL DEFAULT '',
    `affected_id` INTEGER NOT NULL DEFAULT 0,
    `query` VARCHAR(500) NOT NULL DEFAULT '',
    `params` VARCHAR(3500) NOT NULL DEFAULT '',
    `username` VARCHAR(100) NULL,
    `timestamp` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_log` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL DEFAULT 0,
    `activity` VARCHAR(200) NOT NULL DEFAULT '',
    `timestamp` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `nd_barang` ADD CONSTRAINT `fk_barang_satuan` FOREIGN KEY (`satuan_id`) REFERENCES `nd_satuan`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `nd_user` ADD CONSTRAINT `fk_user_posisi` FOREIGN KEY (`posisi_id`) REFERENCES `nd_posisi`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
