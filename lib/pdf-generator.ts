import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

// ✅ Type sesuai SCHEMA PRISMA
interface PegawaiData {
  nip: string
  nama: string
  jabatan: string
  status: string
  golongan: {
    kode: string
    nama: string
  }
  jadwalNaikPangkat?: Date
  jadwalKenaikanGaji?: Date
}

interface WBPData {
  noRegistrasi: string
  nama: string
  perkara: string
  vonisHukuman: number
  tanggalMasuk: Date
  tanggalBebas: Date | null
  statusPenahanan: string
  status: string
  jadwalSelesaiMapenaling: Date
}

interface GolonganData {
  kode: string
  golongan: string
  jumlah: number
}

interface PerkaraData {
  jenisPerkara: string
  jumlah: number
}

interface RekapPegawaiData {
  total: number
  detail: GolonganData[]
}

interface RekapWBPData {
  total: number
  detail: PerkaraData[]
}

interface RekapGabunganData {
  pegawai: number
  wbp: number
  total: number
}

type PDFDataType = 
  | PegawaiData[] 
  | WBPData[] 
  | GolonganData[] 
  | PerkaraData[]
  | RekapPegawaiData
  | RekapWBPData
  | RekapGabunganData

interface PDFOptions {
  jenis: string
  title: string
  data: PDFDataType
  periode?: string
}

interface AutoTableDoc extends jsPDF {
  lastAutoTable: {
    finalY: number
  }
}

export async function generatePDF(options: PDFOptions): Promise<Buffer> {
  const { jenis, title, data, periode } = options

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  // HEADER
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('RUTAN ENREKANG', 105, 20, { align: 'center' })

  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.text(title, 105, 28, { align: 'center' })

  if (periode) {
    doc.setFontSize(10)
    doc.text(`Periode: ${periode}`, 105, 35, { align: 'center' })
  }

  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.5)
  doc.line(20, 40, 190, 40)

  let yPosition = 48

  // ROUTING
  switch (jenis) {
    case 'pegawai-daftar':
      yPosition = renderPegawaiDaftar(doc, data as PegawaiData[], yPosition)
      break
    case 'pegawai-pangkat':
      yPosition = renderPegawaiPangkat(doc, data as PegawaiData[], yPosition)
      break
    case 'pegawai-gaji':
      yPosition = renderPegawaiGaji(doc, data as PegawaiData[], yPosition)
      break
    case 'pegawai-golongan':
      yPosition = renderPegawaiGolongan(doc, data as GolonganData[], yPosition)
      break
    case 'wbp-daftar':
      yPosition = renderWBPDaftar(doc, data as WBPData[], yPosition)
      break
    case 'wbp-bebas':
      yPosition = renderWBPBebas(doc, data as WBPData[], yPosition)
      break
    case 'wbp-mapenaling':
      yPosition = renderWBPMapenaling(doc, data as WBPData[], yPosition)
      break
    case 'wbp-perkara':
      yPosition = renderWBPPerkara(doc, data as PerkaraData[], yPosition)
      break
    case 'rekap-pegawai':
      yPosition = renderRekapPegawai(doc, data as RekapPegawaiData, yPosition)
      break
    case 'rekap-wbp':
      yPosition = renderRekapWBP(doc, data as RekapWBPData, yPosition)
      break
    case 'rekap-gabungan':
      yPosition = renderRekapGabungan(doc, data as RekapGabunganData, yPosition)
      break
    default:
      doc.setFontSize(10)
      doc.text('Jenis laporan tidak tersedia', 105, yPosition, { align: 'center' })
  }

  // FOOTER
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text(
      `Dicetak: ${new Date().toLocaleString('id-ID')} | Halaman ${i} dari ${pageCount}`,
      105,
      285,
      { align: 'center' }
    )
  }

  return Buffer.from(doc.output('arraybuffer'))
}

// ========================================
// RENDER PEGAWAI
// ========================================

function renderPegawaiDaftar(doc: jsPDF, data: PegawaiData[], y: number): number {
  const tableData = data.map((item, index) => [
    index + 1,
    item.nip,
    item.nama,
    item.jabatan,
    item.golongan.kode,
    item.status
  ])

  autoTable(doc, {
    startY: y,
    head: [['No', 'NIP', 'Nama', 'Jabatan', 'Golongan', 'Status']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2, textColor: [0, 0, 0], lineColor: [200, 200, 200], lineWidth: 0.1 },
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
    alternateRowStyles: { fillColor: [250, 250, 250] }
  })

  return (doc as AutoTableDoc).lastAutoTable.finalY + 10
}

function renderPegawaiPangkat(doc: jsPDF, data: PegawaiData[], y: number): number {
  const tableData = data.map((item, index) => [
    index + 1,
    item.nip,
    item.nama,
    item.golongan.kode,
    item.jadwalNaikPangkat ? new Date(item.jadwalNaikPangkat).toLocaleDateString('id-ID') : '-'
  ])

  autoTable(doc, {
    startY: y,
    head: [['No', 'NIP', 'Nama', 'Golongan', 'Jadwal Naik Pangkat']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2, textColor: [0, 0, 0], lineColor: [200, 200, 200], lineWidth: 0.1 },
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
    alternateRowStyles: { fillColor: [250, 250, 250] }
  })

  return (doc as AutoTableDoc).lastAutoTable.finalY + 10
}

function renderPegawaiGaji(doc: jsPDF, data: PegawaiData[], y: number): number {
  const tableData = data.map((item, index) => [
    index + 1,
    item.nip,
    item.nama,
    item.golongan.kode,
    item.jadwalKenaikanGaji ? new Date(item.jadwalKenaikanGaji).toLocaleDateString('id-ID') : '-'
  ])

  autoTable(doc, {
    startY: y,
    head: [['No', 'NIP', 'Nama', 'Golongan', 'Jadwal Kenaikan Gaji']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2, textColor: [0, 0, 0], lineColor: [200, 200, 200], lineWidth: 0.1 },
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
    alternateRowStyles: { fillColor: [250, 250, 250] }
  })

  return (doc as AutoTableDoc).lastAutoTable.finalY + 10
}

function renderPegawaiGolongan(doc: jsPDF, data: GolonganData[], y: number): number {
  const tableData = data.map((item, index) => [
    index + 1,
    item.kode,
    item.golongan,
    item.jumlah
  ])

  const total = data.reduce((sum, item) => sum + item.jumlah, 0)

  autoTable(doc, {
    startY: y,
    head: [['No', 'Kode', 'Golongan', 'Jumlah']],
    body: tableData,
    foot: [['', '', 'TOTAL', total.toString()]],
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3, textColor: [0, 0, 0], lineColor: [200, 200, 200], lineWidth: 0.1 },
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
    footStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
    alternateRowStyles: { fillColor: [250, 250, 250] }
  })

  return (doc as AutoTableDoc).lastAutoTable.finalY + 10
}

// ========================================
// RENDER WBP
// ========================================

function renderWBPDaftar(doc: jsPDF, data: WBPData[], y: number): number {
  const tableData = data.map((item, index) => [
    index + 1,
    item.noRegistrasi,
    item.nama,
    item.perkara || '-',
    `${item.vonisHukuman} bulan`,
    new Date(item.tanggalMasuk).toLocaleDateString('id-ID'),
    item.status
  ])

  autoTable(doc, {
    startY: y,
    head: [['No', 'No. Reg', 'Nama', 'Perkara', 'Vonis', 'Tgl Masuk', 'Status']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 2, textColor: [0, 0, 0], lineColor: [200, 200, 200], lineWidth: 0.1 },
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center', fontSize: 7 },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 25 },
      2: { cellWidth: 35 },
      3: { cellWidth: 30 },
      4: { halign: 'center', cellWidth: 20 },
      5: { halign: 'center', cellWidth: 22 },
      6: { halign: 'center', cellWidth: 18 }
    }
  })

  return (doc as AutoTableDoc).lastAutoTable.finalY + 10
}

function renderWBPBebas(doc: jsPDF, data: WBPData[], y: number): number {
  const tableData = data.map((item, index) => [
    index + 1,
    item.noRegistrasi,
    item.nama,
    item.perkara || '-',
    item.tanggalBebas ? new Date(item.tanggalBebas).toLocaleDateString('id-ID') : '-'
  ])

  autoTable(doc, {
    startY: y,
    head: [['No', 'No. Reg', 'Nama', 'Perkara', 'Tanggal Bebas']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2, textColor: [0, 0, 0], lineColor: [200, 200, 200], lineWidth: 0.1 },
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
    alternateRowStyles: { fillColor: [250, 250, 250] }
  })

  return (doc as AutoTableDoc).lastAutoTable.finalY + 10
}

function renderWBPMapenaling(doc: jsPDF, data: WBPData[], y: number): number {
  const tableData = data.map((item, index) => [
    index + 1,
    item.noRegistrasi,
    item.nama,
    item.statusPenahanan || '-',
    new Date(item.jadwalSelesaiMapenaling).toLocaleDateString('id-ID')
  ])

  autoTable(doc, {
    startY: y,
    head: [['No', 'No. Reg', 'Nama', 'Status Penahanan', 'Selesai Mapenaling']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2, textColor: [0, 0, 0], lineColor: [200, 200, 200], lineWidth: 0.1 },
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
    alternateRowStyles: { fillColor: [250, 250, 250] }
  })

  return (doc as AutoTableDoc).lastAutoTable.finalY + 10
}

function renderWBPPerkara(doc: jsPDF, data: PerkaraData[], y: number): number {
  const tableData = data.map((item, index) => [
    index + 1,
    item.jenisPerkara,
    item.jumlah
  ])

  const total = data.reduce((sum, item) => sum + item.jumlah, 0)

  autoTable(doc, {
    startY: y,
    head: [['No', 'Jenis Perkara', 'Jumlah WBP']],
    body: tableData,
    foot: [['', 'TOTAL', total.toString()]],
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3, textColor: [0, 0, 0], lineColor: [200, 200, 200], lineWidth: 0.1 },
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
    footStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
    alternateRowStyles: { fillColor: [250, 250, 250] }
  })

  return (doc as AutoTableDoc).lastAutoTable.finalY + 10
}

// ========================================
// RENDER REKAPITULASI
// ========================================

function renderRekapPegawai(doc: jsPDF, data: RekapPegawaiData, y: number): number {
  doc.setFillColor(240, 240, 240)
  doc.rect(20, y, 170, 15, 'F')
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text(`TOTAL PEGAWAI: ${data.total} Orang`, 105, y + 10, { align: 'center' })

  y += 20

  const tableData = data.detail.map((item, index) => [
    index + 1,
    item.kode,
    item.golongan,
    item.jumlah
  ])

  autoTable(doc, {
    startY: y,
    head: [['No', 'Kode', 'Golongan', 'Jumlah']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3, textColor: [0, 0, 0], lineColor: [200, 200, 200], lineWidth: 0.1 },
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
    alternateRowStyles: { fillColor: [250, 250, 250] }
  })

  return (doc as AutoTableDoc).lastAutoTable.finalY + 10
}

function renderRekapWBP(doc: jsPDF, data: RekapWBPData, y: number): number {
  doc.setFillColor(240, 240, 240)
  doc.rect(20, y, 170, 15, 'F')
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text(`TOTAL WBP: ${data.total} Orang`, 105, y + 10, { align: 'center' })

  y += 20

  const tableData = data.detail.map((item, index) => [
    index + 1,
    item.jenisPerkara,
    item.jumlah
  ])

  autoTable(doc, {
    startY: y,
    head: [['No', 'Jenis Perkara', 'Jumlah WBP']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3, textColor: [0, 0, 0], lineColor: [200, 200, 200], lineWidth: 0.1 },
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
    alternateRowStyles: { fillColor: [250, 250, 250] }
  })

  return (doc as AutoTableDoc).lastAutoTable.finalY + 10
}

function renderRekapGabungan(doc: jsPDF, data: RekapGabunganData, y: number): number {
  const boxHeight = 20
  const boxWidth = 50
  const spacing = 10
  const startX = (210 - (boxWidth * 3 + spacing * 2)) / 2

  doc.setFillColor(240, 240, 240)
  doc.rect(startX, y, boxWidth, boxHeight, 'F')
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('PEGAWAI', startX + boxWidth / 2, y + 8, { align: 'center' })
  doc.setFontSize(14)
  doc.text(data.pegawai.toString(), startX + boxWidth / 2, y + 16, { align: 'center' })

  doc.setFillColor(240, 240, 240)
  doc.rect(startX + boxWidth + spacing, y, boxWidth, boxHeight, 'F')
  doc.setFontSize(10)
  doc.text('WBP', startX + boxWidth + spacing + boxWidth / 2, y + 8, { align: 'center' })
  doc.setFontSize(14)
  doc.text(data.wbp.toString(), startX + boxWidth + spacing + boxWidth / 2, y + 16, { align: 'center' })

  doc.setFillColor(220, 220, 220)
  doc.rect(startX + (boxWidth + spacing) * 2, y, boxWidth, boxHeight, 'F')
  doc.setFontSize(10)
  doc.text('TOTAL', startX + (boxWidth + spacing) * 2 + boxWidth / 2, y + 8, { align: 'center' })
  doc.setFontSize(14)
  doc.text(data.total.toString(), startX + (boxWidth + spacing) * 2 + boxWidth / 2, y + 16, { align: 'center' })

  return y + boxHeight + 10
}