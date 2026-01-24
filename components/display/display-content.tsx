// components/display/display-content.tsx
'use client'

import { useEffect, useState, useCallback } from "react"
import { getDisplayData } from "@/actions/display"
import DisplayCard from "./display-card"
import { TrendingUp, ArrowUp, UserCheck, Users, AlertTriangle, ShieldAlert } from "lucide-react"
import Image from "next/image"
type DisplayData = Awaited<ReturnType<typeof getDisplayData>>

export default function DisplayContent({ initialData }: { initialData: DisplayData }) {
  const [data, setData] = useState(initialData)
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slides, setSlides] = useState<string[]>([])
  const [fadeIn, setFadeIn] = useState(true)

  // ✅ AUTO REFRESH DATA
  useEffect(() => {
    if (!data.success || !data.settings) return

    const interval = setInterval(async () => {
      const newData = await getDisplayData()
      if (newData.success) {
        setData(newData)
      }
    }, (data.settings.refreshInterval || 30) * 1000)

    return () => clearInterval(interval)
  }, [data])

  // ✅ UPDATE JAM SETIAP DETIK
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // ✅ GENERATE SLIDES
  const generateSlides = useCallback(() => {
    if (!data.success || !data.settings) return []

    const activeSlides: string[] = []

    // NOTE: Agenda belum ada komponen rendernya di kode awal Anda, kita lewati.
    if (data.settings.showKenaikanGaji && data.data.kenaikanGaji.length > 0) activeSlides.push('gaji')
    if (data.settings.showKenaikanPangkat && data.data.kenaikanPangkat.length > 0) activeSlides.push('pangkat')
    if (data.settings.showPembebasan && data.data.pembebasan.length > 0) activeSlides.push('bebas')
    if (data.settings.showMapenaling && data.data.mapenaling.length > 0) activeSlides.push('mapenaling')

    return activeSlides
  }, [data])

  useEffect(() => {
    setSlides(generateSlides())
  }, [generateSlides])

  // ✅ REVISI 3: SMART CAROUSEL (Waktu tunggu disesuaikan dengan jumlah data yang bergulir)
  // 1. Hitung durasi dengan "Optional Chaining (?.)" agar TypeScript aman saat data.data belum siap
  const currentSlideKey = slides[currentSlide] || '';
  let currentDataLength = 0;
  if (currentSlideKey === 'gaji') currentDataLength = data.data?.kenaikanGaji.length || 0;
  if (currentSlideKey === 'pangkat') currentDataLength = data.data?.kenaikanPangkat.length || 0;
  if (currentSlideKey === 'bebas') currentDataLength = data.data?.pembebasan.length || 0;
  if (currentSlideKey === 'mapenaling') currentDataLength = data.data?.mapenaling.length || 0;
  if (currentSlideKey === 'pengumuman') currentDataLength = data.data?.pengumuman.length || 0;

  // Rumus: Jika data banyak > 4, tunggu sampai scroll selesai. Jika sedikit, standar 10 detik.
  const slideDuration = currentDataLength > 4 
    ? (currentDataLength * 3.5) * 1000 
    : 10000;

  // 2. Efek Carousel
  useEffect(() => {
    if (!data.settings || data.settings.layoutMode !== 'CAROUSEL' || slides.length === 0) return;

    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setFadeIn(true);
      }, 300);
    }, slideDuration);

    return () => clearInterval(interval);

  // 👇 PERHATIKAN: Tambahkan baris komentar ini untuk mematikan peringatan ESLint (Aman untuk Vercel)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideDuration, slides.length]);

  if (!data.success || !data.settings) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-linear-to-br from-slate-900 to-purple-900">
        <div className="text-center text-white">
          <div className="text-8xl mb-6">🚫</div>
          <h2 className="text-6xl font-bold mb-4">Display Tidak Tersedia</h2>
          <p className="text-3xl opacity-80">{data.error || "Terjadi kesalahan"}</p>
        </div>
      </div>
    )
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getDaysLeft = (targetDate: Date | string | null) => {
    if (!targetDate) return Infinity
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(targetDate)
    target.setHours(0, 0, 0, 0)
    return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  // ✅ REVISI 2: HILANGKAN KEDIP (Menghapus animate-pulse dari sini)
  const getRowStyle = (targetDate: Date | string | null) => {
    const daysLeft = getDaysLeft(targetDate)
    if (daysLeft <= 0) return "border-red-500 bg-red-900/40 shadow-[0_0_20px_rgba(220,38,38,0.4)]" // TIDAK KEDIP
    if (daysLeft <= 7) return "border-orange-500 bg-orange-900/40 shadow-[0_0_20px_rgba(234,88,12,0.4)]" // TIDAK KEDIP
    if (daysLeft <= 30) return "border-yellow-500/50 bg-yellow-900/30"
    return "border-white/20 bg-linear-to-r from-white/10 to-transparent"
  }

  const getWarningBadge = (targetDate: Date | string | null, normalClass: string) => {
    const daysLeft = getDaysLeft(targetDate)
    if (daysLeft <= 0) return "bg-red-600 text-white shadow-lg"
    if (daysLeft <= 7) return "bg-orange-600 text-white shadow-lg"
    if (daysLeft <= 30) return "bg-yellow-500 text-black shadow-lg"
    return normalClass
  }

  const getDynamicFontSize = (count: number, type: 'title' | 'text' | 'small') => {
    if (count <= 2) return type === 'title' ? 'text-2xl' : type === 'text' ? 'text-lg' : 'text-base'
    if (count <= 4) return type === 'title' ? 'text-xl' : type === 'text' ? 'text-base' : 'text-sm'
    return type === 'title' ? 'text-lg' : type === 'text' ? 'text-sm' : 'text-xs'
  }

  // ✅ LOGIKA SMART SCROLL 
  const getScrollProps = (dataLength: number) => {
    const isOverflowing = dataLength > 4;
    const duration = dataLength * 3.5;
    return {
      isOverflowing,
      containerClass: isOverflowing ? "animate-vertical-scroll hover:pause-scroll" : "",
      style: isOverflowing ? { animationDuration: `${duration}s` } : {}
    }
  }

  // ==============================================================
  // ✅ RENDER FUNCTIONS
  // ==============================================================
  const renderMapenaling = () => {
    const dataList = data.data.mapenaling;
    const { isOverflowing, containerClass, style } = getScrollProps(dataList.length);
    const displayData = isOverflowing ? [...dataList, ...dataList] : dataList;

    const titleSize = getDynamicFontSize(dataList.length, 'title');
    const smallSize = getDynamicFontSize(dataList.length, 'small');

    return (
      <DisplayCard title="WBP Mapenaling" color="cyan" icon={<Users />}>
        <div className="h-full overflow-hidden relative">
          <div className={`w-full h-max space-y-3 flex flex-col ${containerClass}`} style={style}>
            {displayData.map((wbp, idx) => {
              const rowClass = getRowStyle(wbp.jadwalSelesaiMapenaling)
              const badgeClass = getWarningBadge(wbp.jadwalSelesaiMapenaling, "bg-cyan-600")

              return (
                <div key={`${wbp.id}-${idx}`} className={`group relative overflow-hidden backdrop-blur-sm border-2 rounded-lg p-4 transition-all shrink-0 ${rowClass}`}>
                  <div className="relative flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className={`font-extrabold mb-1 truncate text-white ${titleSize}`}>{wbp.nama}</p>
                      <p className={`text-white/80 font-medium truncate ${smallSize}`}>{wbp.noRegistrasi}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`px-4 py-1.5 rounded-lg mb-1.5 font-bold ${badgeClass}`}>
                        {formatDate(wbp.jadwalSelesaiMapenaling)}
                        {getDaysLeft(wbp.jadwalSelesaiMapenaling) <= 7 && <AlertTriangle className="inline-block ml-1.5 h-4 w-4" />}
                      </div>
                      <span className={`inline-block px-3 py-1 bg-white/20 text-white rounded-md font-bold ${smallSize}`}>
                        {wbp.durasiMapenaling} Hari
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </DisplayCard>
    )
  }

  const renderKenaikanGaji = () => {
    const dataList = data.data.kenaikanGaji;
    const { isOverflowing, containerClass, style } = getScrollProps(dataList.length);
    const displayData = isOverflowing ? [...dataList, ...dataList] : dataList;

    const titleSize = getDynamicFontSize(dataList.length, 'title')
    const smallSize = getDynamicFontSize(dataList.length, 'small')

    return (
      <DisplayCard title="Kenaikan Gaji Berkala" color="green" icon={<TrendingUp />}>
        <div className="h-full overflow-hidden relative">
          <div className={`w-full h-max space-y-3 flex flex-col ${containerClass}`} style={style}>
            {displayData.map((pegawai, idx) => {
              const rowClass = getRowStyle(pegawai.jadwalKenaikanGaji)
              const badgeClass = getWarningBadge(pegawai.jadwalKenaikanGaji, "bg-green-600")

              return (
                <div key={`${pegawai.id}-${idx}`} className={`group relative overflow-hidden backdrop-blur-sm border-2 rounded-lg p-4 transition-all shrink-0 ${rowClass}`}>
                  <div className="relative flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className={`font-extrabold mb-1 truncate text-white ${titleSize}`}>{pegawai.nama}</p>
                      <p className={`text-white/80 font-medium truncate ${smallSize}`}>{pegawai.nip}</p>
                      <p className={`text-white/60 truncate ${smallSize}`}>{pegawai.jabatan}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`px-4 py-1.5 rounded-lg mb-1.5 font-bold ${badgeClass}`}>
                        {formatDate(pegawai.jadwalKenaikanGaji)}
                        {getDaysLeft(pegawai.jadwalKenaikanGaji) <= 7 && <AlertTriangle className="inline-block ml-1.5 h-4 w-4" />}
                      </div>
                      <span className={`inline-block px-3 py-1 bg-white/20 text-white rounded-md font-bold ${smallSize}`}>
                        {pegawai.golongan.kode}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </DisplayCard>
    )
  }

  const renderKenaikanPangkat = () => {
    const dataList = data.data.kenaikanPangkat;
    const { isOverflowing, containerClass, style } = getScrollProps(dataList.length);
    const displayData = isOverflowing ? [...dataList, ...dataList] : dataList;

    const titleSize = getDynamicFontSize(dataList.length, 'title')
    const smallSize = getDynamicFontSize(dataList.length, 'small')

    return (
      <DisplayCard title="Kenaikan Pangkat" color="purple" icon={<ArrowUp />}>
        <div className="h-full overflow-hidden relative">
          <div className={`w-full h-max space-y-3 flex flex-col ${containerClass}`} style={style}>
            {displayData.map((pegawai, idx) => {
              const rowClass = getRowStyle(pegawai.jadwalNaikPangkat)
              const badgeClass = getWarningBadge(pegawai.jadwalNaikPangkat, "bg-purple-600")

              return (
                <div key={`${pegawai.id}-${idx}`} className={`group relative overflow-hidden backdrop-blur-sm border-2 rounded-lg p-4 transition-all shrink-0 ${rowClass}`}>
                  <div className="relative flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className={`font-extrabold mb-1 truncate text-white ${titleSize}`}>{pegawai.nama}</p>
                      <p className={`text-white/80 font-medium truncate ${smallSize}`}>{pegawai.nip}</p>
                      <p className={`text-white/60 truncate ${smallSize}`}>{pegawai.jabatan}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`px-4 py-1.5 rounded-lg mb-1.5 font-bold ${badgeClass}`}>
                        {formatDate(pegawai.jadwalNaikPangkat)}
                        {getDaysLeft(pegawai.jadwalNaikPangkat) <= 7 && <AlertTriangle className="inline-block ml-1.5 h-4 w-4" />}
                      </div>
                      <span className={`inline-block px-3 py-1 bg-white/20 text-white rounded-md font-bold ${smallSize}`}>
                        {pegawai.golongan.kode}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </DisplayCard>
    )
  }

  const renderPembebasan = () => {
    const dataList = data.data.pembebasan;
    const { isOverflowing, containerClass, style } = getScrollProps(dataList.length);
    const displayData = isOverflowing ? [...dataList, ...dataList] : dataList;

    const titleSize = getDynamicFontSize(dataList.length, 'title')
    const smallSize = getDynamicFontSize(dataList.length, 'small')

    return (
      <DisplayCard title="Jadwal Pembebasan WBP" color="orange" icon={<UserCheck />}>
        <div className="h-full overflow-hidden relative">
          <div className={`w-full h-max space-y-3 flex flex-col ${containerClass}`} style={style}>
            {displayData.map((wbp, idx) => {
              const rowClass = getRowStyle(wbp.tanggalBebas)
              const badgeClass = getWarningBadge(wbp.tanggalBebas, "bg-orange-600")

              return (
                <div key={`${wbp.id}-${idx}`} className={`group relative overflow-hidden backdrop-blur-sm border-2 rounded-lg p-4 transition-all shrink-0 ${rowClass}`}>
                  <div className="relative flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className={`font-extrabold mb-1 truncate text-white ${titleSize}`}>{wbp.nama}</p>
                      <p className={`text-white/80 font-medium truncate ${smallSize}`}>{wbp.noRegistrasi}</p>
                      <p className={`text-white/60 truncate ${smallSize}`}>{wbp.jenisPidana}</p>
                    </div>
                    <div className="text-right shrink-0">
                      {wbp.tanggalBebas && (
                        <>
                          <div className={`px-4 py-1.5 rounded-lg mb-1.5 font-bold ${badgeClass}`}>
                            {formatDate(wbp.tanggalBebas)}
                            {getDaysLeft(wbp.tanggalBebas) <= 7 && <AlertTriangle className="inline-block ml-1.5 h-4 w-4" />}
                          </div>
                          <span className={`inline-block px-3 py-1 bg-white/20 text-white rounded-md font-bold ${smallSize}`}>
                            {wbp.vonisHukuman} Bln
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </DisplayCard>
    )
  }

  const activeComponents: React.ReactNode[] = [];
  if (data.settings.showMapenaling && data.data.mapenaling.length > 0) activeComponents.push(renderMapenaling());
  if (data.settings.showKenaikanGaji && data.data.kenaikanGaji.length > 0) activeComponents.push(renderKenaikanGaji());
  if (data.settings.showKenaikanPangkat && data.data.kenaikanPangkat.length > 0) activeComponents.push(renderKenaikanPangkat());
  if (data.settings.showPembebasan && data.data.pembebasan.length > 0) activeComponents.push(renderPembebasan());

  // ==============================================================
  // ✅ RENDER MODE LIST (4 BARIS TETAP DENGAN TEKS BERJALAN HORIZONTAL)
  // ==============================================================
  const renderListMode = () => {
    // Fungsi pembantu untuk membuat 1 baris
    const renderRow = <T extends { id: string | number },>(
      title: string,
      icon: React.ReactNode,
      baseColor: string,
      dataList: T[],
      renderContent: (item: T) => React.ReactNode
    ) => {
      const isBanyak = dataList.length > 3;
      const scrollData = isBanyak ? [...dataList, ...dataList] : dataList;

      return (
        // ✅ 1. Tambahkan "flex-1" agar baris ini melar penuh ke bawah, hilangkan h-24
        <div className="flex-1 flex items-stretch gap-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-4 shadow-lg overflow-hidden">

          {/* ✅ 2. BAGIAN KIRI: Lebarkan jadi min-w-[450px], Font text-3xl, Icon w-12 h-12 */}
          <div className={` flex items-center gap-4 w-105 px-8 h-full rounded-2xl shadow-inner shrink-0 bg-gradient-modern-purple`}
          >
            <div className="w-10 h-10 flex items-center justify-center">
              {icon}
            </div>
            <span className="text-2xl font-black text-white tracking-wider uppercase whitespace-nowrap">
              {title}
            </span>
          </div>


          {/* BAGIAN KANAN: KONTEN (SCROLL HORIZONTAL) */}
          <div className="flex-1 overflow-hidden relative h-full flex items-center">
            {dataList.length === 0 ? (
              <span className="text-white/40 italic font-medium text-2xl px-4">Tidak ada jadwal aktif...</span>
            ) : (
              <div className={`${isBanyak ? "animate-marquee" : ""} whitespace-nowrap flex items-center gap-10 w-max h-full px-4`}>
                {scrollData.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="flex items-center shrink-0">
                    {renderContent(item)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    };

    return (
      <div className="w-full h-full bg-white/5 backdrop-blur-lg border-2 border-white/20 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">

        {/* 1. BARIS KENAIKAN GAJI */}
        {data.settings.showKenaikanGaji && renderRow(
          "Kenaikan Gaji",
          <TrendingUp className="w-8 h-8 text-white" />,
          "bg-green-600",
          data.data.kenaikanGaji,
          (p) => (
            <div className={`px-6 py-4 rounded-lg border flex items-center gap-3  ${getRowStyle(p.jadwalKenaikanGaji)}`}>
              <span className="font-bold text-white text-3xl">{p.nama}</span>
              <span className="text-white/60">({p.nip})</span>
              <span className={`px-2 py-0.5 rounded font-bold text-xl ${getWarningBadge(p.jadwalKenaikanGaji, "bg-gradient-modern-green")}`}>
                {formatDate(p.jadwalKenaikanGaji)}
              </span>
            </div>
          )
        )}

        {/* 2. BARIS KENAIKAN PANGKAT */}
        {data.settings.showKenaikanPangkat && renderRow(
          "Kenaikan Pangkat",
          <ArrowUp className="w-8 h-8 text-white" />,
          "bg-purple-600",
          data.data.kenaikanPangkat,
          (p) => (
            <div className={`px-6 py-4 rounded-lg border flex items-center gap-3 ${getRowStyle(p.jadwalNaikPangkat)}`}>
              <span className="font-bold text-white text-3xl">{p.nama}</span>
              <span className="text-white/60">({p.golongan.kode})</span>
              <span className={`px-2 py-0.5 rounded font-bold text-xl ${getWarningBadge(p.jadwalNaikPangkat, "bg-gradient-modern-purple")}`}>
                {formatDate(p.jadwalNaikPangkat)}
              </span>
            </div>
          )
        )}

        {/* 3. BARIS JADWAL BEBAS */}
        {data.settings.showPembebasan && renderRow(
          "Jadwal Bebas WBP",
          <UserCheck className="w-8 h-8 text-white" />,
          "bg-orange-600",
          data.data.pembebasan,
          (w) => (
            <div className={`px-6 py-4 rounded-lg border flex items-center gap-3 ${getRowStyle(w.tanggalBebas)}`}>
              <span className="font-bold text-white text-3xl">{w.nama}</span>
              <span className="text-white/60">({w.jenisPidana})</span>
              <span className={`px-2 py-0.5 rounded font-bold text-xl ${getWarningBadge(w.tanggalBebas, "bg-orange-700")}`}>
                {w.tanggalBebas ? formatDate(w.tanggalBebas) : "-"}
              </span>
            </div>
          )
        )}

        {/* 4. BARIS MAPENALING */}
        {data.settings.showMapenaling && renderRow(
          "WBP Mapenaling",
          <Users className="w-8 h-8 text-white" />,
          "bg-cyan-600",
          data.data.mapenaling,
          (w) => (
            <div className={`px-6 py-4 rounded-lg border flex items-center gap-3 ${getRowStyle(w.jadwalSelesaiMapenaling)}`}>
              <span className="font-bold text-white text-3xl">{w.nama}</span>
              <span className="text-white/60">({w.durasiMapenaling} Hari)</span>
              <span className={`px-2 py-0.5 rounded font-bold text-sm ${getWarningBadge(w.jadwalSelesaiMapenaling, "bg-cyan-700")}`}>
                {formatDate(w.jadwalSelesaiMapenaling)}
              </span>
            </div>
          )
        )}

      </div>
    );
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-linear-to-br from-slate-900 via-purple-900 to-slate-800 overflow-hidden">
      {/* HEADER */}
      <div className="relative shrink-0 bg-linear-to-r from-blue-900 via-purple-900 to-pink-900 border-b-4 border-white/20 shadow-2xl">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="w-full px-6 py-4 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16  rounded-2xl flex items-center justify-center shadow-2xl animate-pulse-glow shrink-0">
                <Image
                  src="/logo.png"
                  alt="Logo Rutan Enrekang"
                  width={64}
                  height={64}
                  className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                  priority
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight leading-tight">{data.settings.displayTitle}</h1>
                <p className="text-white/80 text-base font-medium">Kementerian Imigrasi Dan Pemasyarakatan</p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-4xl font-bold text-white tabular-nums tracking-tight">{currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>
              <div className="text-white/80 text-sm font-semibold">{currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
          </div>
        </div>
      </div>

      {/* PENGUMUMAN MARQUEE */}
      {data.settings.showPengumuman && data.data.pengumuman.length > 0 && (
        <div className="relative shrink-0 overflow-hidden bg-linear-to-r from-red-600 via-pink-600 to-orange-600 shadow-2xl">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          <div className="w-full px-6 py-3 relative">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-xl whitespace-nowrap shrink-0">
                <span className="font-bold text-lg uppercase tracking-wider text-white">Pengumuman</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="animate-marquee whitespace-nowrap text-lg text-white font-semibold w-max">
                  {[...data.data.pengumuman, ...data.data.pengumuman].map((p, i) => (
                    <span key={`${p.id}-${i}`} className="inline-block mx-8">
                      [{p.tipe}] {p.judul} - {p.isi} {i < (data.data.pengumuman.length * 2) - 1 && " | "}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT UTAMA */}
      <div className="flex-1 overflow-hidden">
        <div className="w-full px-6 py-6 h-full">

          {slides.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center bg-white/5 backdrop-blur-md rounded-3xl border-2 border-dashed border-white/20 p-8">
              <div className="bg-white/10 p-6 rounded-full animate-pulse mb-6">
                <ShieldAlert className="w-24 h-24 text-blue-400" />
              </div>
              <h2 className="text-4xl font-extrabold text-white tracking-wide mb-2">BELUM ADA JADWAL AKTIF</h2>
              <p className="text-xl text-white/60 font-medium">Sistem Monitoring dalam mode siaga.</p>
            </div>
          ) : data.settings.layoutMode === 'LIST' ? (
            // 👇 TAMPILKAN MODE LIST/TICKER DISINI
            <div className="w-full h-full animate-fade-in">
              {renderListMode()}
            </div>
          ) : data.settings.layoutMode === 'CAROUSEL' ? (
            <div className="relative h-full flex flex-col">
              <div className={`flex-1 transition-opacity duration-300 ${fadeIn ? 'opacity-100' : 'opacity-0'} h-full min-h-0`}>
                {slides[currentSlide] === 'gaji' && renderKenaikanGaji()}
                {slides[currentSlide] === 'pangkat' && renderKenaikanPangkat()}
                {slides[currentSlide] === 'bebas' && renderPembebasan()}
                {slides[currentSlide] === 'mapenaling' && renderMapenaling()}
              </div>

              <div className="flex justify-center gap-2 mt-4 shrink-0">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setFadeIn(false); setTimeout(() => { setCurrentSlide(index); setFadeIn(true) }, 300)
                    }}
                    className={`h-2.5 rounded-full transition-all ${index === currentSlide ? 'bg-white w-10 shadow-lg' : 'bg-white/30 hover:bg-white/50 w-2.5'}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className={`grid gap-6 h-full w-full ${activeComponents.length === 1 ? 'grid-cols-1' :
              activeComponents.length === 2 ? 'grid-cols-2' :
                activeComponents.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
                  'grid-cols-2 grid-rows-2'
              }`}>
              {activeComponents.map((Component, index) => (
                <div key={index} className="w-full h-full min-h-0">
                  {Component}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="shrink-0 bg-linear-to-r from-slate-900 to-purple-900 border-t-2 border-white/20 py-2 shadow-inner">
        <div className="w-full px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <span className="text-white/60 text-xs font-bold uppercase tracking-wider">Keterangan Kotak:</span>
              <div className="flex items-center gap-4 text-xs font-bold text-white">
                <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded border-2 border-red-500 bg-red-900/40"></span> HARI INI / LEWAT</span>
                <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded border-2 border-orange-500 bg-orange-900/40"></span> &le; 7 HARI</span>
                <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded border-2 border-yellow-500/50 bg-yellow-900/30"></span> &le; 30 HARI</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-white/50 text-xs font-medium">
              <p>Pembaruan: {new Date(data.timestamp).toLocaleString('id-ID')}</p>
              <p>Auto-refresh: {data.settings.refreshInterval}s</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}