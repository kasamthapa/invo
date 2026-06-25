import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Plus, X, Camera } from 'lucide-react'
import {
  useProduct,
  useCreateProduct,
  useUpdateProduct,
  useAddVariant,
  useUploadImages,
} from '../hooks/useProducts'
import { ApiError } from '../lib/api'

// ── Types ─────────────────────────────────────────────────────────────────────

interface AttrRow {
  key: string
  value: string
}

interface VariantFormRow {
  id: string
  attributes: AttrRow[]
  price: string
  openingStock: string
  lowStockAt: string
}

interface FormState {
  code: string
  name: string
  description: string
  category: string
  basePrice: string
  visible: boolean
  variants: VariantFormRow[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function newVariant(): VariantFormRow {
  return {
    id: crypto.randomUUID(),
    attributes: [{ key: '', value: '' }],
    price: '',
    openingStock: '0',
    lowStockAt: '',
  }
}

function generateVariantCodePreview(code: string, attrs: AttrRow[]): string {
  const valid = attrs.filter((a) => a.key.trim() && a.value.trim())
  if (!code.trim()) return ''
  const base = code.trim().toUpperCase()
  if (valid.length === 0) return `${base}-DEFAULT`
  const sorted = [...valid].sort((a, b) => a.key.localeCompare(b.key))
  return `${base}-${sorted.map((a) => a.value.trim().toUpperCase()).join('-')}`
}

function parseNPR(val: string): number {
  return Math.round(parseFloat(val) * 100)
}

const ATTR_PRESETS = ['color', 'size', 'weight']

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[var(--text-muted)] text-xs uppercase tracking-widest font-medium px-4 pt-5 pb-2">
      {children}
    </h2>
  )
}

function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="px-4 mb-4">
      <label className="block text-[var(--text-muted)] text-xs uppercase tracking-wider mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[var(--text-muted)] text-xs mt-1">{hint}</p>}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  readOnly,
}: {
  value: string
  onChange?: (v: string) => void
  placeholder?: string
  type?: string
  readOnly?: boolean
}) {
  return (
    <input
      type={type}
      value={value}
      readOnly={readOnly}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      placeholder={placeholder}
      className={`w-full bg-[var(--bg-surface-2)] border rounded-xl px-4 py-3 text-sm outline-none focus:border-[var(--accent)] ${
        readOnly
          ? 'text-[var(--text-muted)] border-[var(--border-2)] cursor-default'
          : 'text-[var(--text-primary)] border-[var(--border-2)] focus:border-[var(--accent)]'
      }`}
    />
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function ProductForm() {
  const { id } = useParams<{ id?: string }>()
  const isEdit = !!id
  const navigate = useNavigate()

  const { data: existingProduct, isLoading: productLoading } = useProduct(id ?? '')
  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct(id ?? '')
  const addVariantMutation = useAddVariant(id ?? '')
  const uploadMutation = useUploadImages(id ?? '')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<FormState>({
    code: '',
    name: '',
    description: '',
    category: '',
    basePrice: '',
    visible: true,
    variants: [newVariant()],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [savedOk, setSavedOk] = useState(false)

  // Pre-fill form in edit mode
  useEffect(() => {
    if (isEdit && existingProduct) {
      setForm({
        code: existingProduct.code,
        name: existingProduct.name,
        description: existingProduct.description ?? '',
        category: existingProduct.category ?? '',
        basePrice: String(existingProduct.basePrice / 100),
        visible: existingProduct.visible,
        variants: existingProduct.variants.map((v) => ({
          id: v.id,
          attributes: Object.entries(v.attributes).map(([key, value]) => ({ key, value })),
          price: v.price !== null ? String(v.price / 100) : '',
          openingStock: String(v.currentQty),
          lowStockAt: v.lowStockAt !== null ? String(v.lowStockAt) : '',
        })),
      })
    }
  }, [isEdit, existingProduct])

  // ── Variant helpers ──────────────────────────────────────────────────────────

  function updateVariant(variantId: string, patch: Partial<VariantFormRow>) {
    setForm((f) => ({
      ...f,
      variants: f.variants.map((v) => (v.id === variantId ? { ...v, ...patch } : v)),
    }))
  }

  function addAttr(variantId: string) {
    setForm((f) => ({
      ...f,
      variants: f.variants.map((v) =>
        v.id === variantId
          ? { ...v, attributes: [...v.attributes, { key: '', value: '' }] }
          : v,
      ),
    }))
  }

  function removeAttr(variantId: string, attrIdx: number) {
    setForm((f) => ({
      ...f,
      variants: f.variants.map((v) =>
        v.id === variantId
          ? { ...v, attributes: v.attributes.filter((_, i) => i !== attrIdx) }
          : v,
      ),
    }))
  }

  function updateAttr(variantId: string, attrIdx: number, field: 'key' | 'value', val: string) {
    setForm((f) => ({
      ...f,
      variants: f.variants.map((v) =>
        v.id === variantId
          ? {
              ...v,
              attributes: v.attributes.map((a, i) =>
                i === attrIdx ? { ...a, [field]: val } : a,
              ),
            }
          : v,
      ),
    }))
  }

  function addPresetAttr(variantId: string, key: string) {
    setForm((f) => ({
      ...f,
      variants: f.variants.map((v) =>
        v.id === variantId
          ? { ...v, attributes: [...v.attributes, { key, value: '' }] }
          : v,
      ),
    }))
  }

  function removeVariant(variantId: string) {
    setForm((f) => ({
      ...f,
      variants: f.variants.filter((v) => v.id !== variantId),
    }))
  }

  // ── Validation ───────────────────────────────────────────────────────────────

  function validate(): boolean {
    const errs: Record<string, string> = {}

    if (!form.name.trim() || form.name.trim().length < 2)
      errs.name = 'Name must be at least 2 characters'

    if (!isEdit) {
      if (!form.code.trim()) errs.code = 'Product code is required'
      else if (!/^[a-zA-Z0-9-]+$/.test(form.code.trim()))
        errs.code = 'Only letters, numbers, and hyphens allowed'
      else if (form.code.trim().length > 50) errs.code = 'Code must be 50 chars or less'
    }

    const price = parseFloat(form.basePrice)
    if (!form.basePrice.trim() || isNaN(price) || price <= 0)
      errs.basePrice = 'Enter a valid price greater than 0'

    if (form.variants.length === 0) errs.variants = 'At least one variant is required'
    else {
      form.variants.forEach((v, i) => {
        const valid = v.attributes.filter((a) => a.key.trim() && a.value.trim())
        if (valid.length === 0)
          errs[`variant_${i}`] = 'At least one attribute with key and value is required'
      })
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Submit ───────────────────────────────────────────────────────────────────

  async function handleSubmit() {
    setGlobalError(null)
    setSavedOk(false)
    if (!validate()) return

    if (isEdit) {
      // EDIT: update basic info only
      try {
        await updateMutation.mutateAsync({
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          category: form.category.trim() || undefined,
          basePrice: parseNPR(form.basePrice),
          visible: form.visible,
        })
        setSavedOk(true)
        setTimeout(() => setSavedOk(false), 2500)
      } catch (err) {
        setGlobalError(err instanceof ApiError ? err.message : 'Something went wrong.')
      }
    } else {
      // CREATE
      try {
        const body = {
          code: form.code.trim().toUpperCase(),
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          category: form.category.trim() || undefined,
          basePrice: parseNPR(form.basePrice),
          visible: form.visible,
          variants: form.variants.map((v) => ({
            attributes: Object.fromEntries(
              v.attributes
                .filter((a) => a.key.trim() && a.value.trim())
                .map((a) => [a.key.trim(), a.value.trim()]),
            ),
            price: v.price.trim() ? parseNPR(v.price) : undefined,
            openingStock: parseInt(v.openingStock) || 0,
            lowStockAt: v.lowStockAt.trim() ? parseInt(v.lowStockAt) : undefined,
          })),
        }
        const created = await createMutation.mutateAsync(body)
        navigate(`/app/products/${created.id}`)
      } catch (err) {
        if (err instanceof ApiError && err.status === 409) {
          if (err.message.toLowerCase().includes('code')) {
            setErrors((e) => ({ ...e, code: 'Product code already taken' }))
          } else if (err.message.toLowerCase().includes('variant')) {
            setErrors((e) => ({ ...e, variants: 'Duplicate variant attributes' }))
          } else {
            setGlobalError(err.message)
          }
        } else {
          setGlobalError(err instanceof ApiError ? err.message : 'Something went wrong.')
        }
      }
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    try {
      await uploadMutation.mutateAsync(files)
    } catch {
      setGlobalError('Image upload failed. Please try again.')
    }
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── Loading state (edit mode) ─────────────────────────────────────────────

  if (isEdit && productLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-[var(--border-2)] border-t-[var(--accent)] rounded-full animate-spin" />
      </div>
    )
  }

  const isBusy =
    createMutation.isPending || updateMutation.isPending || addVariantMutation.isPending

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="pb-10">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <Link
          to={isEdit && id ? `/app/products/${id}` : '/app/products'}
          className="flex items-center gap-1 text-[var(--text-muted)] active:opacity-70"
        >
          <ChevronLeft size={20} />
          <span className="text-sm">{isEdit ? 'Product' : 'Products'}</span>
        </Link>
        <button
          onClick={() => void handleSubmit()}
          disabled={isBusy}
          className="bg-[var(--accent)] text-[var(--text-primary)] text-sm font-semibold px-4 py-1.5 rounded-lg active:opacity-80 disabled:opacity-50"
        >
          {isBusy ? 'Saving…' : isEdit ? (savedOk ? 'Saved ✓' : 'Save') : 'Create'}
        </button>
      </div>

      {/* Global error */}
      {globalError && (
        <div className="mx-4 mb-4 bg-red-900/30 border border-red-700 rounded-xl px-4 py-3">
          <p className="text-red-400 text-sm">{globalError}</p>
        </div>
      )}

      {/* ── Section 1: Basic Info ── */}
      <SectionHeading>Basic Info</SectionHeading>

      <Field label="Product Name" required error={errors.name}>
        <TextInput
          value={form.name}
          onChange={(v) => setForm((f) => ({ ...f, name: v }))}
          placeholder="Floral Maxi Dress"
        />
      </Field>

      <Field
        label="Product Code"
        required={!isEdit}
        hint={isEdit ? 'Code cannot be changed after creation' : 'e.g. DRS-1042'}
        error={errors.code}
      >
        <TextInput
          value={form.code}
          onChange={isEdit ? undefined : (v) => setForm((f) => ({ ...f, code: v.toUpperCase() }))}
          placeholder="DRS-1042"
          readOnly={isEdit}
        />
      </Field>

      <Field label="Category" hint="e.g. Maxi, Kurta, Top">
        <TextInput
          value={form.category}
          onChange={(v) => setForm((f) => ({ ...f, category: v }))}
          placeholder="Maxi"
        />
      </Field>

      <Field label="Base Price (NPR)" required hint="Price in Nepali Rupees" error={errors.basePrice}>
        <TextInput
          value={form.basePrice}
          onChange={(v) => setForm((f) => ({ ...f, basePrice: v }))}
          placeholder="1800"
          type="number"
        />
      </Field>

      <Field label="Description">
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Optional product description…"
          rows={3}
          className="w-full bg-[var(--bg-surface-2)] border border-[var(--border-2)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm placeholder-[var(--text-placeholder)] outline-none focus:border-[var(--accent)] resize-none"
        />
      </Field>

      <div className="px-4 mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setForm((f) => ({ ...f, visible: !f.visible }))}
          className={`w-10 h-6 rounded-full transition-colors flex-shrink-0 ${
            form.visible ? 'bg-[var(--accent)]' : 'bg-[var(--border-2)]'
          }`}
        >
          <span
            className={`block w-4 h-4 bg-white rounded-full m-1 transition-transform ${
              form.visible ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
        <span className="text-[var(--text-secondary)] text-sm">Visible on public catalog</span>
      </div>

      {/* ── Section 2: Variants ── */}
      <SectionHeading>Variants</SectionHeading>

      {errors.variants && (
        <p className="text-red-400 text-xs px-4 mb-3">{errors.variants}</p>
      )}

      {form.variants.map((variant, vIdx) => {
        const codePreview = generateVariantCodePreview(form.code, variant.attributes)
        const variantError = errors[`variant_${vIdx}`]

        return (
          <div key={variant.id} className="mx-4 mb-4 bg-[var(--bg-surface-2)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[var(--text-primary)] text-sm font-medium">Variant {vIdx + 1}</span>
              {form.variants.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVariant(variant.id)}
                  className="text-red-400 text-xs active:opacity-70"
                >
                  Remove
                </button>
              )}
            </div>

            {/* Quick preset buttons */}
            <div className="flex gap-2 mb-3 flex-wrap">
              {ATTR_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => addPresetAttr(variant.id, preset)}
                  className="text-[var(--text-muted)] text-xs bg-[var(--border-2)] px-2.5 py-1 rounded-lg active:opacity-70"
                >
                  + {preset}
                </button>
              ))}
            </div>

            {/* Attribute rows */}
            <div className="space-y-2 mb-3">
              {variant.attributes.map((attr, aIdx) => (
                <div key={aIdx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={attr.key}
                    onChange={(e) => updateAttr(variant.id, aIdx, 'key', e.target.value)}
                    placeholder="color"
                    className="flex-1 bg-[var(--border-2)] border border-[var(--border-2)] rounded-lg px-3 py-2 text-[var(--text-primary)] text-xs outline-none focus:border-[var(--accent)] placeholder-[var(--text-placeholder)]"
                  />
                  <input
                    type="text"
                    value={attr.value}
                    onChange={(e) => updateAttr(variant.id, aIdx, 'value', e.target.value)}
                    placeholder="Red"
                    className="flex-1 bg-[var(--border-2)] border border-[var(--border-2)] rounded-lg px-3 py-2 text-[var(--text-primary)] text-xs outline-none focus:border-[var(--accent)] placeholder-[var(--text-placeholder)]"
                  />
                  <button
                    type="button"
                    onClick={() => removeAttr(variant.id, aIdx)}
                    className="text-[var(--text-muted)] active:text-red-400 flex-shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => addAttr(variant.id)}
              className="flex items-center gap-1 text-[var(--text-muted)] text-xs mb-3 active:opacity-70"
            >
              <Plus size={12} /> Add attribute
            </button>

            {codePreview && (
              <p className="text-[var(--text-muted)] text-xs mb-3">
                Code: <span className="text-[var(--text-muted)] font-mono">{codePreview}</span>
              </p>
            )}

            {variantError && (
              <p className="text-red-400 text-xs mb-3">{variantError}</p>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-[var(--text-muted)] text-xs mb-1">
                  Price (NPR) — leave empty to use base price
                </label>
                <input
                  type="number"
                  value={variant.price}
                  onChange={(e) => updateVariant(variant.id, { price: e.target.value })}
                  placeholder="2700"
                  className="w-full bg-[var(--border-2)] border border-[var(--border-2)] rounded-lg px-3 py-2 text-[var(--text-primary)] text-sm outline-none focus:border-[var(--accent)] placeholder-[var(--text-placeholder)]"
                />
              </div>

              {!isEdit && (
                <div>
                  <label className="block text-[var(--text-muted)] text-xs mb-1">Opening Stock</label>
                  <input
                    type="number"
                    value={variant.openingStock}
                    onChange={(e) => updateVariant(variant.id, { openingStock: e.target.value })}
                    placeholder="0"
                    min="0"
                    className="w-full bg-[var(--border-2)] border border-[var(--border-2)] rounded-lg px-3 py-2 text-[var(--text-primary)] text-sm outline-none focus:border-[var(--accent)] placeholder-[var(--text-placeholder)]"
                  />
                </div>
              )}

              <div>
                <label className="block text-[var(--text-muted)] text-xs mb-1">
                  Low Stock Alert at — leave empty to disable
                </label>
                <input
                  type="number"
                  value={variant.lowStockAt}
                  onChange={(e) => updateVariant(variant.id, { lowStockAt: e.target.value })}
                  placeholder="2"
                  min="0"
                  className="w-full bg-[var(--border-2)] border border-[var(--border-2)] rounded-lg px-3 py-2 text-[var(--text-primary)] text-sm outline-none focus:border-[var(--accent)] placeholder-[var(--text-placeholder)]"
                />
              </div>
            </div>
          </div>
        )
      })}

      <button
        type="button"
        onClick={() => setForm((f) => ({ ...f, variants: [...f.variants, newVariant()] }))}
        className="mx-4 flex items-center gap-2 text-[var(--success)] text-sm font-medium active:opacity-70 mb-2"
      >
        <Plus size={16} /> Add Variant
      </button>

      {/* ── Section 3: Photos (edit mode only) ── */}
      {isEdit && id && (
        <>
          <SectionHeading>Photos</SectionHeading>

          <div className="px-4">
            {/* Current images */}
            {existingProduct && existingProduct.images.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-4">
                {existingProduct.images.map((img) => (
                  <img
                    key={img.id}
                    src={img.url}
                    alt=""
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}

            {globalError && uploadMutation.isError && (
              <p className="text-red-400 text-xs mb-2">Upload failed. Please try again.</p>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => void handleFileChange(e)}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending}
              className="flex items-center gap-2 bg-[var(--bg-surface-2)] border border-[var(--border-2)] text-[var(--text-secondary)] text-sm px-4 py-2.5 rounded-xl active:opacity-80 disabled:opacity-50"
            >
              <Camera size={16} />
              {uploadMutation.isPending ? 'Uploading…' : 'Add Photos'}
            </button>
            <p className="text-[var(--text-muted)] text-xs mt-2">Up to 5 images, max 5 MB each</p>
          </div>
        </>
      )}
    </div>
  )
}
