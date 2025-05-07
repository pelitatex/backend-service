-- AlterTable
ALTER TABLE `nd_barang` MODIFY `jenis_barang` VARCHAR(100) NULL DEFAULT '''''';

-- AlterTable
ALTER TABLE `nd_barang_bahan` MODIFY `nama` VARCHAR(50) NOT NULL DEFAULT '',
    MODIFY `kode` VARCHAR(2) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `nd_barang_fitur` MODIFY `nama` VARCHAR(50) NOT NULL DEFAULT '',
    MODIFY `kode` VARCHAR(2) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `nd_barang_grade` MODIFY `nama` VARCHAR(50) NOT NULL DEFAULT '',
    MODIFY `kode` VARCHAR(2) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `nd_barang_sku` MODIFY `sku_id` CHAR(36) NOT NULL DEFAULT '',
    MODIFY `nama_barang` VARCHAR(100) NOT NULL DEFAULT '',
    MODIFY `nama_jual` VARCHAR(100) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `nd_barang_tipe` MODIFY `nama` VARCHAR(50) NOT NULL DEFAULT '',
    MODIFY `kode` VARCHAR(2) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `nd_customer` MODIFY `blok` VARCHAR(100) NOT NULL DEFAULT '-',
    MODIFY `no` VARCHAR(100) NULL DEFAULT '-',
    MODIFY `rt` VARCHAR(4) NOT NULL DEFAULT '000',
    MODIFY `rw` VARCHAR(4) NOT NULL DEFAULT '000',
    MODIFY `kecamatan` VARCHAR(100) NOT NULL DEFAULT '-',
    MODIFY `kelurahan` VARCHAR(100) NOT NULL DEFAULT '-';

-- AlterTable
ALTER TABLE `nd_document` MODIFY `judul` VARCHAR(100) NOT NULL DEFAULT '',
    MODIFY `dari` VARCHAR(100) NOT NULL DEFAULT '',
    MODIFY `kepada` VARCHAR(100) NOT NULL DEFAULT '',
    MODIFY `keterangan` VARCHAR(3000) NOT NULL DEFAULT '',
    MODIFY `penanggung_jawab` VARCHAR(50) NOT NULL DEFAULT '',
    MODIFY `username` VARCHAR(50) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `nd_document_control` MODIFY `tipe_dokumen` VARCHAR(50) NULL DEFAULT '';

-- AlterTable
ALTER TABLE `nd_toko` MODIFY `alias` VARCHAR(50) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `nd_user` MODIFY `time_start` TIME(0) NULL DEFAULT '07:00:00',
    MODIFY `time_end` TIME(0) NULL DEFAULT '18:00:00';

-- AlterTable
ALTER TABLE `query_log` MODIFY `table_name` VARCHAR(50) NOT NULL DEFAULT '',
    MODIFY `query` VARCHAR(500) NOT NULL DEFAULT '',
    MODIFY `params` VARCHAR(3500) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `user_log` MODIFY `activity` VARCHAR(200) NOT NULL DEFAULT '';
