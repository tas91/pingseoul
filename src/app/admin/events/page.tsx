'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { AdminEvent } from '@/lib/types'
import { Plus, Pencil, Trash2, X } from 'lucide-react'

const EMPTY_FORM = {
  name: '',
  dj: '',
  dressCode: '',
  posterFile: null as File | null,
  posterPreview: '',
  eventDate: '',
  startTime: '',
  endTime: '',
  entryFee: '',
  description: '',
  notifySubscribers: false,
  existingImages: [] as string[],
  newImageFiles: [] as File[],
  newImagePreviews: [] as string[],
}

async function uploadToStorage(file: File, supabase: ReturnType<typeof createClient>): Promise<string> {
  const ext = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from('event-posters').upload(fileName, file)
  if (error) throw new Error(`업로드 실패: ${error.message}`)
  const { data } = supabase.storage.from('event-posters').getPublicUrl(fileName)
  return data.publicUrl
}

export default function EventsPage() {
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [panelOpen, setPanelOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<AdminEvent | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminEvent | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const posterInputRef = useRef<HTMLInputElement>(null)
  const imagesInputRef = useRef<HTMLInputElement>(null)

  const fetchEvents = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/events')
    if (res.ok) {
      const data = await res.json()
      setEvents(data.events)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const openCreatePanel = () => {
    setEditingEvent(null)
    setForm(EMPTY_FORM)
    setError(null)
    setPanelOpen(true)
  }

  const openEditPanel = (event: AdminEvent) => {
    setEditingEvent(event)
    setForm({
      name: event.name,
      dj: event.dj,
      dressCode: event.dress_code,
      posterFile: null,
      posterPreview: event.poster_url,
      eventDate: event.event_date,
      startTime: event.start_time.slice(0, 5),
      endTime: event.end_time.slice(0, 5),
      entryFee: event.entry_fee != null ? String(event.entry_fee) : '',
      description: event.description ?? '',
      notifySubscribers: event.notify_subscribers,
      existingImages: event.images ?? [],
      newImageFiles: [],
      newImagePreviews: [],
    })
    setError(null)
    setPanelOpen(true)
  }

  const closePanel = () => {
    setPanelOpen(false)
    setEditingEvent(null)
    setError(null)
  }

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setForm((p) => ({ ...p, posterFile: file, posterPreview: URL.createObjectURL(file) }))
  }

  const handleImagesAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    const previews = files.map((f) => URL.createObjectURL(f))
    setForm((p) => ({
      ...p,
      newImageFiles: [...p.newImageFiles, ...files],
      newImagePreviews: [...p.newImagePreviews, ...previews],
    }))
    if (imagesInputRef.current) imagesInputRef.current.value = ''
  }

  const removeExistingImage = (index: number) => {
    setForm((p) => ({ ...p, existingImages: p.existingImages.filter((_, i) => i !== index) }))
  }

  const removeNewImage = (index: number) => {
    setForm((p) => ({
      ...p,
      newImageFiles: p.newImageFiles.filter((_, i) => i !== index),
      newImagePreviews: p.newImagePreviews.filter((_, i) => i !== index),
    }))
  }

  const handleSave = async () => {
    if (!form.name.trim()) return setError('이벤트 이름을 입력해주세요.')
    if (!form.eventDate) return setError('이벤트 날짜를 선택해주세요.')
    if (!form.startTime) return setError('시작 시간을 입력해주세요.')
    if (!form.endTime) return setError('종료 시간을 입력해주세요.')
    if (!editingEvent && !form.posterFile) return setError('포스터 이미지를 업로드해주세요.')

    setSaving(true)
    setError(null)

    try {
      const supabase = createClient()
      let posterUrl = editingEvent?.poster_url ?? ''

      if (form.posterFile) {
        posterUrl = await uploadToStorage(form.posterFile, supabase)
      }

      const newImageUrls = await Promise.all(
        form.newImageFiles.map((file) => uploadToStorage(file, supabase))
      )
      const images = [...form.existingImages, ...newImageUrls]

      const body = {
        name: form.name.trim(),
        dj: form.dj.trim(),
        dress_code: form.dressCode.trim(),
        poster_url: posterUrl,
        event_date: form.eventDate,
        start_time: form.startTime,
        end_time: form.endTime,
        entry_fee: form.entryFee !== '' ? Number(form.entryFee) : null,
        description: form.description.trim() || null,
        notify_subscribers: form.notifySubscribers,
        images,
      }

      const res = await fetch(
        editingEvent ? `/api/admin/events/${editingEvent.id}` : '/api/admin/events',
        {
          method: editingEvent ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      )

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      closePanel()
      fetchEvents()
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const res = await fetch(`/api/admin/events/${deleteTarget.id}`, { method: 'DELETE' })
    if (res.ok) {
      setDeleteTarget(null)
      fetchEvents()
    } else {
      const data = await res.json()
      alert(data.error)
    }
    setDeleting(false)
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">이벤트 관리</h1>
        <button
          onClick={openCreatePanel}
          className="flex items-center gap-2 px-4 py-2 bg-ping-red text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
        >
          <Plus size={16} />
          이벤트 등록
        </button>
      </div>

      {loading ? (
        <p className="text-ping-gray text-sm">불러오는 중...</p>
      ) : events.length === 0 ? (
        <p className="text-ping-gray text-sm">등록된 이벤트가 없습니다.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ping-gray border-b border-white/10">
                <th className="pb-3 pr-4 font-medium">이름</th>
                <th className="pb-3 pr-4 font-medium">날짜</th>
                <th className="pb-3 pr-4 font-medium">DJ</th>
                <th className="pb-3 pr-4 font-medium">드레스코드</th>
                <th className="pb-3 pr-4 font-medium">알림</th>
                <th className="pb-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 pr-4 font-medium">{event.name}</td>
                  <td className="py-3 pr-4 text-ping-gray">{event.event_date}</td>
                  <td className="py-3 pr-4 text-ping-gray">{event.dj || '—'}</td>
                  <td className="py-3 pr-4 text-ping-gray">{event.dress_code || '—'}</td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${event.notify_subscribers ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-ping-gray'}`}>
                      {event.notify_subscribers ? '알림 ON' : 'OFF'}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEditPanel(event)} className="p-1.5 text-ping-gray hover:text-white transition-colors">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => setDeleteTarget(event)} className="p-1.5 text-ping-gray hover:text-red-400 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 등록/수정 슬라이드 패널 */}
      {panelOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50" onClick={closePanel} />
          <div className="w-full max-w-md bg-[#111] border-l border-white/10 overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-lg font-bold">{editingEvent ? '이벤트 수정' : '이벤트 등록'}</h2>
              <button onClick={closePanel} className="text-ping-gray hover:text-white"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-4 flex-1">
              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
              )}

              {/* 이름 */}
              <div>
                <label className="block text-xs text-ping-gray mb-1">이름 <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ping-red"
                  placeholder="PING NIGHT VOL.42"
                />
              </div>

              {/* DJ */}
              <div>
                <label className="block text-xs text-ping-gray mb-1">DJ (선택)</label>
                <input
                  type="text"
                  value={form.dj}
                  onChange={(e) => setForm((p) => ({ ...p, dj: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ping-red"
                  placeholder="DJ KAYZER, GOSU"
                />
              </div>

              {/* 드레스코드 */}
              <div>
                <label className="block text-xs text-ping-gray mb-1">드레스코드 (선택)</label>
                <input
                  type="text"
                  value={form.dressCode}
                  onChange={(e) => setForm((p) => ({ ...p, dressCode: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ping-red"
                  placeholder="Smart Casual"
                />
              </div>

              {/* 포스터 */}
              <div>
                <label className="block text-xs text-ping-gray mb-1">포스터 <span className="text-red-400">*</span></label>
                <input ref={posterInputRef} type="file" accept="image/*" onChange={handlePosterChange} className="hidden" />
                <button
                  type="button"
                  onClick={() => posterInputRef.current?.click()}
                  className="w-full bg-white/5 border border-dashed border-white/20 rounded-lg px-3 py-3 text-sm text-ping-gray hover:border-ping-red hover:text-white transition-colors text-center"
                >
                  {form.posterPreview ? '포스터 변경' : '포스터 선택'}
                </button>
                {form.posterPreview && (
                  <div className="mt-3 space-y-3">
                    <div>
                      <p className="text-xs text-ping-gray mb-1.5">카드 미리보기 (홈 화면 기준)</p>
                      <div className="relative w-32 overflow-hidden rounded-lg bg-[#1A1A1A]" style={{ aspectRatio: '4/5' }}>
                        <img src={form.posterPreview} alt="카드 미리보기" className="w-full h-full object-cover object-top" />
                      </div>
                      <p className="text-[10px] text-ping-gray mt-1 opacity-60">주요 내용이 상단에 오도록 촬영/편집을 권장합니다.</p>
                    </div>
                    <div>
                      <p className="text-xs text-ping-gray mb-1.5">원본 이미지</p>
                      <img src={form.posterPreview} alt="원본 포스터" className="w-full rounded-lg" />
                    </div>
                  </div>
                )}
              </div>

              {/* 추가 이미지 */}
              <div>
                <label className="block text-xs text-ping-gray mb-2">추가 이미지 (선택)</label>
                <input ref={imagesInputRef} type="file" accept="image/*" multiple onChange={handleImagesAdd} className="hidden" />

                {(form.existingImages.length > 0 || form.newImagePreviews.length > 0) && (
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {form.existingImages.map((url, i) => (
                      <div key={`e-${i}`} className="relative aspect-square">
                        <img src={url} alt="" className="w-full h-full object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(i)}
                          className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                    {form.newImagePreviews.map((preview, i) => (
                      <div key={`n-${i}`} className="relative aspect-square">
                        <img src={preview} alt="" className="w-full h-full object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => removeNewImage(i)}
                          className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => imagesInputRef.current?.click()}
                  className="w-full bg-white/5 border border-dashed border-white/20 rounded-lg px-3 py-2.5 text-sm text-ping-gray hover:border-ping-red hover:text-white transition-colors text-center"
                >
                  + 이미지 추가
                </button>
              </div>

              {/* 날짜 */}
              <div>
                <label className="block text-xs text-ping-gray mb-1">이벤트 날짜 <span className="text-red-400">*</span></label>
                <input
                  type="date"
                  value={form.eventDate}
                  onChange={(e) => setForm((p) => ({ ...p, eventDate: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ping-red"
                />
              </div>

              {/* 시작/종료 시간 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-ping-gray mb-1">시작 시간 <span className="text-red-400">*</span></label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ping-red"
                  />
                </div>
                <div>
                  <label className="block text-xs text-ping-gray mb-1">종료 시간 <span className="text-red-400">*</span></label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ping-red"
                  />
                </div>
              </div>

              {/* 알림 여부 */}
              <div className="flex items-center justify-between py-1">
                <span className="text-sm">구독자 알림 <span className="text-red-400">*</span></span>
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, notifySubscribers: !p.notifySubscribers }))}
                  className={`relative w-10 h-6 rounded-full transition-colors ${form.notifySubscribers ? 'bg-ping-red' : 'bg-white/20'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${form.notifySubscribers ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* 입장료 */}
              <div>
                <label className="block text-xs text-ping-gray mb-1">입장료 (선택)</label>
                <input
                  type="number"
                  value={form.entryFee}
                  onChange={(e) => setForm((p) => ({ ...p, entryFee: e.target.value }))}
                  min="0"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ping-red"
                  placeholder="30000"
                />
              </div>

              {/* 이벤트 설명 */}
              <div>
                <label className="block text-xs text-ping-gray mb-1">이벤트 설명 (선택)</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ping-red resize-none"
                  placeholder="이벤트 설명을 입력하세요"
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-white/10">
              <button onClick={closePanel} disabled={saving} className="flex-1 py-2 border border-white/20 rounded-lg text-sm hover:bg-white/5 transition-colors disabled:opacity-50">
                취소
              </button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2 bg-ping-red text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50">
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-[#111] border border-white/10 rounded-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-base font-bold mb-2">이벤트 삭제</h3>
            <p className="text-sm text-ping-gray mb-6">
              <span className="text-white font-medium">"{deleteTarget.name}"</span>을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} disabled={deleting} className="flex-1 py-2 border border-white/20 rounded-lg text-sm hover:bg-white/5 transition-colors disabled:opacity-50">
                취소
              </button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50">
                {deleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
