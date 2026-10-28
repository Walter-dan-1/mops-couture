import { useEffect, useRef, useState } from 'react'
import './CustomCoutureEnquiry.css'

const initialForm = {
  name: '',
  phone: '',
  location: '',
  designType: '',
  customDesignType: '',
  materialType: '',
  customMaterialType: '',
  size: '',
  preferredDate: '',
  notes: '',
}

const designOptions = [
  'Dress / Gown',
  'Two-piece outfit',
  'Traditional attire',
  'Wedding / Occasion wear',
  'Other',
]
const materialOptions = ['Ankara', 'Lace', 'Aso-oke', 'Silk / Satin', 'Other']
const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const whatsappNumber = '2348027340474'

function localDateString(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function displayDate(value) {
  if (!value) return 'Not selected'
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${value}T12:00:00`))
}

function PreferredDateCalendar({ value, onChange }) {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)
  const [today] = useState(() => localDateString(new Date()))
  const monthName = new Intl.DateTimeFormat('en-NG', {
    month: 'long',
    year: 'numeric',
  }).format(visibleMonth)
  const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1)
  const offset = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth() + 1,
    0,
  ).getDate()
  const days = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ]

  useEffect(() => {
    if (!open) return undefined
    const closeOnEscape = (event) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      triggerRef.current?.focus()
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [open])

  function moveMonth(amount) {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + amount, 1),
    )
  }

  return (
    <div className="couture-field">
      <label id="preferred-date-label">Preferred date</label>
      <div className="couture-date-row">
        <button
          ref={triggerRef}
          type="button"
          className="couture-date-trigger"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-labelledby="preferred-date-label"
          onClick={() => setOpen((current) => !current)}
        >
          {value ? displayDate(value) : 'Choose a preferred date'}
        </button>
        {value && (
          <button
            type="button"
            className="couture-clear-date"
            onClick={() => onChange('')}
            aria-label="Clear preferred date"
          >
            Clear
          </button>
        )}
      </div>
      <p className="couture-field-hint">
        This is a request only, not a confirmed appointment or delivery date.
      </p>
      {open && (
        <div className="couture-calendar" role="dialog" aria-label="Choose a preferred date">
          <div className="couture-calendar-heading">
            <button type="button" onClick={() => moveMonth(-1)} aria-label="Previous month">
              ‹
            </button>
            <h3 aria-live="polite">{monthName}</h3>
            <button type="button" onClick={() => moveMonth(1)} aria-label="Next month">
              ›
            </button>
          </div>
          <div className="couture-calendar-grid" role="group" aria-label={monthName}>
            {weekdays.map((day) => (
              <span className="couture-weekday" key={day}>
                {day}
              </span>
            ))}
            {days.map((day, index) => {
              if (!day) {
                return <span className="couture-calendar-blank" aria-hidden="true" key={`blank-${index}`} />
              }
              const date = new Date(
                visibleMonth.getFullYear(),
                visibleMonth.getMonth(),
                day,
              )
              const isoDate = localDateString(date)
              const selected = isoDate === value
              const isToday = isoDate === today
              return (
                <button
                  type="button"
                  key={isoDate}
                  className={[
                    'couture-calendar-day',
                    selected ? 'is-selected' : '',
                    isToday ? 'is-today' : '',
                  ].filter(Boolean).join(' ')}
                  aria-label={new Intl.DateTimeFormat('en-NG', {
                    dateStyle: 'full',
                  }).format(date)}
                  aria-pressed={selected}
                  aria-current={isToday ? 'date' : undefined}
                  disabled={isoDate < today}
                  onClick={() => {
                    onChange(isoDate)
                    setOpen(false)
                  }}
                >
                  {day}
                </button>
              )
            })}
          </div>
          <p className="couture-field-hint">
            Dates are preferences only. Availability and timing require confirmation.
          </p>
        </div>
      )}
    </div>
  )
}

export default function CustomCoutureEnquiry({ onNavigate }) {
  const [form, setForm] = useState(initialForm)
  const [consent, setConsent] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [errors, setErrors] = useState({})
  const [step, setStep] = useState('details')

  function updateField(field, value) {
    setForm((current) => {
      const next = { ...current, [field]: value }
      if (field === 'designType' && value !== 'Other') next.customDesignType = ''
      if (field === 'materialType' && value !== 'Other') next.customMaterialType = ''
      return next
    })
    setConsent(false)
    setErrors((current) => ({ ...current, [field]: '', form: '' }))
    setStep('details')
  }

  function validateForm() {
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Please enter your full name.'
    const phoneDigits = form.phone.replace(/\D/g, '')
    if (!/^[+()\d\s-]{7,24}$/.test(form.phone.trim()) || phoneDigits.length < 7 || phoneDigits.length > 15) {
      nextErrors.phone = 'Enter a valid phone number.'
    }
    if (!form.location.trim()) nextErrors.location = 'Please enter your location.'
    if (!form.designType) nextErrors.designType = 'Choose a design type.'
    if (form.designType === 'Other' && !form.customDesignType.trim()) {
      nextErrors.customDesignType = 'Please specify your design.'
    }
    if (!form.materialType) nextErrors.materialType = 'Choose a material type.'
    if (form.materialType === 'Other' && !form.customMaterialType.trim()) {
      nextErrors.customMaterialType = 'Please specify your material.'
    }
    if (!consent) nextErrors.consent = 'Please confirm your consent to continue.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function reviewEnquiry(event) {
    event.preventDefault()
    if (validateForm()) setStep('review')
  }

  const design = form.designType === 'Other' ? form.customDesignType.trim() : form.designType
  const material =
    form.materialType === 'Other' ? form.customMaterialType.trim() : form.materialType
  const whatsAppMessage = [
      'Hello Mop’s Couture, I’d like to enquire about a custom outfit.',
      `Name: ${form.name.trim()}`,
      `Phone: ${form.phone.trim()}`,
      `Location: ${form.location.trim()}`,
      `Design type: ${design}`,
      `Material: ${material}`,
      `Size or measurements: ${form.size.trim() || 'Not specified'}`,
      `Preferred date: ${displayDate(form.preferredDate)}`,
      `Additional details: ${form.notes.trim() || 'None'}`,
      'I understand this is an enquiry only. Please confirm availability, pricing, and timing.',
  ].join('\n')
  const whatsAppHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsAppMessage)}`

  return (
    <section className={`couture-enquiry couture-enquiry--${step}`} aria-labelledby="couture-enquiry-heading">
      <header className="couture-enquiry-header">
        <p className="eyebrow">Mop&apos;s Couture · Made around your style</p>
        <h2 id="couture-enquiry-heading">
          {step === 'review' ? 'Review your enquiry' : 'Tell us about your design'}
        </h2>
        <p>
          {step === 'review'
            ? 'Check your details before choosing to continue to WhatsApp.'
            : 'Share your details and outfit preferences. No order is confirmed by sending an enquiry.'}
        </p>
        <div className="couture-progress" aria-label={step === 'review' ? 'Step 2 of 2' : 'Step 1 of 2'}>
          <span className="is-active" />
          <span className={step === 'review' ? 'is-active' : ''} />
        </div>
        <small>{step === 'review' ? 'STEP 2 OF 2 · REVIEW' : 'STEP 1 OF 2 · YOUR DETAILS'}</small>
      </header>

      {step === 'details' ? (
        <form className="couture-form" noValidate onSubmit={reviewEnquiry}>
          <section className="couture-form-section">
            <h3>01. Your details</h3>
            <p className="couture-field-hint">Fields marked * are required.</p>
            <div className="couture-field">
              <label htmlFor="couture-name">Full name *</label>
              <input id="couture-name" autoComplete="name" maxLength={100} value={form.name}
                aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'couture-name-error' : undefined}
                onChange={(event) => updateField('name', event.target.value)} />
              {errors.name && <small className="couture-error" id="couture-name-error">{errors.name}</small>}
            </div>
            <div className="couture-field">
              <label htmlFor="couture-phone">Phone number *</label>
              <input id="couture-phone" type="tel" autoComplete="tel" maxLength={30} value={form.phone}
                placeholder="e.g. 08012345678" aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? 'couture-phone-error' : undefined}
                onChange={(event) => updateField('phone', event.target.value)} />
              {errors.phone && <small className="couture-error" id="couture-phone-error">{errors.phone}</small>}
            </div>
            <div className="couture-field">
              <label htmlFor="couture-location">Location *</label>
              <input id="couture-location" autoComplete="address-level2" maxLength={120} value={form.location}
                placeholder="City or area" aria-invalid={Boolean(errors.location)}
                aria-describedby={errors.location ? 'couture-location-error' : undefined}
                onChange={(event) => updateField('location', event.target.value)} />
              {errors.location && <small className="couture-error" id="couture-location-error">{errors.location}</small>}
            </div>
          </section>

          <section className="couture-form-section">
            <h3>02. Your design</h3>
            <div className="couture-field">
              <label htmlFor="couture-design">Design type *</label>
              <select id="couture-design" value={form.designType} aria-invalid={Boolean(errors.designType)}
                aria-describedby={errors.designType ? 'couture-design-error' : undefined}
                onChange={(event) => updateField('designType', event.target.value)}>
                <option value="">Choose a design type</option>
                {designOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
              {errors.designType && <small className="couture-error" id="couture-design-error">{errors.designType}</small>}
            </div>
            {form.designType === 'Other' && (
              <div className="couture-field couture-reveal-field">
                <label htmlFor="couture-design-other">Please specify your design *</label>
                <input id="couture-design-other" maxLength={160} value={form.customDesignType}
                  aria-invalid={Boolean(errors.customDesignType)}
                  aria-describedby={errors.customDesignType ? 'couture-design-other-error' : undefined}
                  onChange={(event) => updateField('customDesignType', event.target.value)} />
                {errors.customDesignType && <small className="couture-error" id="couture-design-other-error">{errors.customDesignType}</small>}
              </div>
            )}
            <div className="couture-field">
              <label htmlFor="couture-material">Material type *</label>
              <select id="couture-material" value={form.materialType} aria-invalid={Boolean(errors.materialType)}
                aria-describedby={errors.materialType ? 'couture-material-error' : undefined}
                onChange={(event) => updateField('materialType', event.target.value)}>
                <option value="">Choose a material</option>
                {materialOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
              {errors.materialType && <small className="couture-error" id="couture-material-error">{errors.materialType}</small>}
            </div>
            {form.materialType === 'Other' && (
              <div className="couture-field couture-reveal-field">
                <label htmlFor="couture-material-other">Please specify your material *</label>
                <input id="couture-material-other" maxLength={160} value={form.customMaterialType}
                  aria-invalid={Boolean(errors.customMaterialType)}
                  aria-describedby={errors.customMaterialType ? 'couture-material-other-error' : undefined}
                  onChange={(event) => updateField('customMaterialType', event.target.value)} />
                {errors.customMaterialType && <small className="couture-error" id="couture-material-other-error">{errors.customMaterialType}</small>}
              </div>
            )}
            <div className="couture-field">
              <label htmlFor="couture-size">Size or measurements</label>
              <input id="couture-size" maxLength={160} value={form.size}
                placeholder="Add a size or discuss measurements later"
                onChange={(event) => updateField('size', event.target.value)} />
            </div>
            <PreferredDateCalendar value={form.preferredDate}
              onChange={(value) => updateField('preferredDate', value)} />
            <div className="couture-field">
              <label htmlFor="couture-notes">Additional design details</label>
              <textarea id="couture-notes" rows={4} maxLength={1000} value={form.notes}
                placeholder="Colours, style, occasion or special requests"
                onChange={(event) => updateField('notes', event.target.value)} />
            </div>
          </section>

          <section className="couture-form-section">
            <h3>03. Review and consent</h3>
            <div className="couture-terms-panel">
              <h4>Before you continue</h4>
              <p>Check your details carefully. Design, fabric, measurements, prices, deposits, timing and delivery must be confirmed before production. Applicable cancellation, alteration and refund terms will be communicated before payment; mandatory consumer rights still apply. Enquiry details are not stored by this website and are sent only if you choose to continue through WhatsApp.</p>
              <button type="button" className="couture-terms-toggle" onClick={() => setShowTerms((current) => !current)}
                aria-expanded={showTerms}>
                {showTerms ? 'Hide terms summary' : 'Read custom-order terms'}
              </button>
              {showTerms && (
                <ol className="couture-terms-list">
                  <li>You are responsible for checking the details you provide.</li>
                  <li>Agree the design, fabric, colour, measurements and price with the studio before production.</li>
                  <li>Your preferred date is a request, not a confirmed booking or delivery date.</li>
                  <li>Deposits, cancellation, alteration, refund and delivery terms must be clearly explained before any payment. Consumer rights that apply by law are not waived.</li>
                  <li>This website does not save enquiry or consent records. If you send the message in WhatsApp, its handling is subject to WhatsApp&apos;s terms and privacy notice.</li>
                  <li>Sending an enquiry does not confirm an order.</li>
                </ol>
              )}
              <p className="couture-policy-links">
                <a href="/terms/custom-couture" onClick={onNavigate}>Custom Couture Terms</a>
                <a href="/privacy" onClick={onNavigate}>Privacy Notice</a>
              </p>
              <p className="couture-field-hint">The policy text is informational and requires the owner&apos;s legal review before production use.</p>
            </div>
            <label className="couture-consent">
              <input type="checkbox" checked={consent} aria-invalid={Boolean(errors.consent)}
                aria-describedby={errors.consent ? 'couture-consent-error' : undefined}
                onChange={(event) => {
                  setConsent(event.target.checked)
                  setErrors((current) => ({ ...current, consent: '' }))
                }} />
              <span>I confirm that the information I provided is accurate, and I have read and agree to the Custom Couture Terms and Privacy Notice.</span>
            </label>
            {errors.consent && <small className="couture-error" id="couture-consent-error" role="alert">{errors.consent}</small>}
            <button className="couture-submit" type="submit">Review enquiry</button>
            <p className="couture-demo-notice">Nothing is saved to an account or sent automatically. You will review your enquiry before opening WhatsApp.</p>
          </section>
        </form>
      ) : (
        <section className="couture-review" aria-live="polite">
          <p className="couture-field-hint">Your enquiry and consent have not been stored. Continuing opens WhatsApp; you must send the message there.</p>
          <dl>
            <dt>Full name</dt><dd>{form.name}</dd>
            <dt>Phone</dt><dd>{form.phone}</dd>
            <dt>Location</dt><dd>{form.location}</dd>
            <dt>Design type</dt><dd>{design}</dd>
            <dt>Material</dt><dd>{material}</dd>
            <dt>Size / measurements</dt><dd>{form.size || 'Not specified'}</dd>
            <dt>Preferred date</dt><dd>{displayDate(form.preferredDate)}</dd>
            <dt>Additional details</dt><dd>{form.notes || 'None'}</dd>
            <dt>Consent</dt><dd>Confirmed for this enquiry only; no record has been saved by this website.</dd>
          </dl>
          <div className="couture-review-actions">
            <button type="button" className="couture-secondary" onClick={() => setStep('details')}>Back to edit</button>
            <a className="couture-submit" href={whatsAppHref} target="_blank" rel="noreferrer">Continue to WhatsApp</a>
          </div>
          <p className="couture-demo-notice">WhatsApp opening does not confirm delivery, availability, pricing, or acceptance of an order.</p>
        </section>
      )}
    </section>
  )
}
