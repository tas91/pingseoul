'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { X, Upload, Loader2, AlertCircle, ImageIcon } from 'lucide-react'

interface EventFormData {
  name: string
  dj: string
  dress_code: string
  poster_url: string
  event_date: string
  start_time: string
  end_time: string
  entry_fee: string
  description: string
}

interface AdminEvent {
  id: string
  name: string
  dj: string
  dress_code: string
  poster_url: string
  event_date: string
  start_time: string
  end_time: string
  entry_fee: number | null
  description: string | null
}

interface EventFormProps {
  event?: AdminEvent
  onClose: () => void
  onSaved: () => void
}

const EMPTY_FORM: EventFormData = {
  name: '',
  dj: '',
  dress_code: '',
  poster_url: '',
  event_date: '',
  start_time: '21:00',
  end_time: '05:00',
  entry_fee: '',
  description: '',
}

function eventToForm(e: AdminEvent): EventFormData {
  return {
    name: e.name,
    dj: e.dj,
    dress_code: e.dress_code,
    poster_url: e.poster_url,
    event_date: e.event_date,
    start_time: e.start_time,
    end_time: e.end_time,
    entry_fee: e.entry_fee != null ? String(e.entry_fee) : '',
    description: e.description ?? '',
  }
}

export default function EventForm({ event, onClose, onSaved }: EventFormProps) {
  const isEdit = !!event
  const [form, setForm] = useState<EventFormData>(event ? eventToForm(event) : EMPTY_FORM)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const set = (field: keyof EventFormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError(null)

    const data = new FormData()
    data.append('file', file)

    const res = await fetch('/api/admin/events/upload', { method: 'POST', body: data })
    const json = await res.json()

    if (!res.ok) {
      setUploadError(json.error ?? '포스터 업로드에 실패했습니다.')
    } else {
      set('poster_url', json.url)
    }

    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaveError(null)

    const body = {
      name: form.name,
      dj: form.dj,
      dress_code: form.dress_code,
      poster_url: form.poster_url,
      event_date: form.event_date,
      start_time: form.start_time,
      end_time: form.end_time,
      entry_fee: form.entry_fee !== '' ? Number(form.entry_fee) : null,
      description: form.description || null,
    }

    const res = await fetch(
      isEdit ? `/api/admin/events/${event.id}` : '/api/admin/events',
      {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    )
    const json = await res.json()

    if (!res.ok) {
      setSaveError(json.error ?? '저장에 실패했습니다.')
      setSaving(false)
      return
    }

    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/60" onClick={onClose} />
      <div className="w-full max-w-lg bg-[#111] border-l border-white/10 flex flex-col h-full overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 sticky top-0 bg-[#111] z-10">
          <h2 className="text-base font-semibold text-white">
            {isEdit ? '이벤트 수정' : '이벤트 추가'}
          </h2>
          <button onClick={onClose} className="text-ping-gray hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 px-6 py-5 space-y-5">
          {/* Poster upload */}
          <div>
            <label className="block text-xs font-medium text-ping-gray mb-2">포스터 이미지</label>
            <div
              className="relative w-full aspect-[3/4] max-w-[180px] rounded-lg overflow-hidden bg-white/5 border border-white/10 cursor-pointer group"
              onClick={() => !uploading && fileInputRef.current?.click()}
            >
              {form.poster_url ? (
                <Image
                  src={form.poster_url}
                  alt="포스터 미리보기"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-ping-gray">
                  <ImageIcon size={28} />
                  <span className="text-xs">이미지 없음</span>
                </div>
              )}

              {/* Hover overlay */}
              {!uploading && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5">
                  <Upload size={20} className="text-white" />
                  <span className="text-xs text-white">클릭하여 업로드</span>
                </div>
              )}

              {/* Uploading overlay */}
              {uploading && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <Loader2 size={24} className="text-white animate-spin" />
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleFileChange}
            />

            {uploadError && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
                <AlertCircle size={13} />
                {uploadError}
              </div>
            )}
            <p className="mt-1.5 text-xs text-ping-gray/60">JPEG · PNG · WebP · GIF, 최대 5MB</p>
          </div>

          {/* Event name */}
          <Field label="이벤트명 *">
            <input
              required
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="예: PING FRIDAY NIGHT"
              className={inputCls}
            />
          </Field>

          {/* DJ */}
          <Field label="DJ *">
            <input
              required
              value={form.dj}
              onChange={(e) => set('dj', e.target.value)}
              placeholder="예: DJ SODA, DJ MASA"
              className={inputCls}
            />
          </Field>

          {/* Date */}
          <Field label="날짜 *">
            <input
              required
              type="date"
              value={form.event_date}
              onChange={(e) => set('event_date', e.target.value)}
              className={inputCls}
            />
          </Field>

          {/* Time */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="시작 시간 *">
              <input
                required
                type="time"
                value={form.start_time}
                onChange={(e) => set('start_time', e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="종료 시간 *">
              <input
                required
                type="time"
                value={form.end_time}
                onChange={(e) => set('end_time', e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>

          {/* Dress code */}
          <Field label="드레스 코드 *">
            <input
              required
              value={form.dress_code}
              onChange={(e) => set('dress_code', e.target.value)}
              placeholder="예: Smart Casual"
              className={inputCls}
            />
          </Field>

          {/* Entry fee */}
          <Field label="입장료 (원)">
            <input
              type="number"
              min="0"
              value={form.entry_fee}
              onChange={(e) => set('entry_fee', e.target.value)}
              placeholder="무료일 경우 비워두세요"
              className={inputCls}
            />
          </Field>

          {/* Description */}
          <Field label="설명">
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="이벤트 설명 (선택)"
              className={`${inputCls} resize-none`}
            />
          </Field>

          {saveError && (
            <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              <AlertCircle size={13} />
              {saveError}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2 pb-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-white/10 text-ping-gray hover:text-white rounded-lg text-sm transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="flex-1 px-4 py-2.5 bg-ping-red hover:bg-ping-red/90 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {saving ? '저장 중...' : isEdit ? '수정 완료' : '이벤트 추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-ping-gray mb-1.5">{label}</label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-ping-red/60 transition-colors'
