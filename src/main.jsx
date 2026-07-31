import React from 'react'
import ReactDOM from 'react-dom/client'
import QRCode from 'qrcode'
import {
  CheckCircle2,
  Copy,
  Download,
  Languages,
  Moon,
  Printer,
  QrCode,
  RefreshCcw,
  ShieldCheck,
  Sun,
} from 'lucide-react'
import './styles.css'

const copy = {
  en: {
    title: 'SecureQR',
    tagline: 'Private QR codes, generated entirely in your browser.',
    privacy: 'Your QR data stays in this browser and is never uploaded.',
    type: 'QR type',
    input: 'Content',
    generate: 'Generate QR code',
    preview: 'Preview',
    empty: 'Enter valid content to generate a QR code.',
    downloadPng: 'Download PNG',
    downloadSvg: 'Download SVG',
    copy: 'Copy value',
    print: 'Print',
    reset: 'Reset',
    copied: 'Copied',
    foreground: 'Foreground',
    background: 'Background',
    size: 'Size',
    correction: 'Error correction',
    safety: 'Safety guidance',
    safetyText: 'Verify destinations before scanning. Do not encode passwords, private keys, authentication tokens, or highly sensitive personal data.',
    invalidUrl: 'Enter a valid HTTP or HTTPS URL.',
    invalid: 'Enter valid content.',
    text: 'Text',
    url: 'Website URL',
    email: 'Email',
    phone: 'Phone',
    sms: 'SMS',
    wifi: 'Wi-Fi',
    vcard: 'Contact card',
    ssid: 'Network name (SSID)',
    password: 'Wi-Fi password',
    security: 'Security',
    hidden: 'Hidden network',
    name: 'Full name',
    organization: 'Organization',
    subject: 'Subject',
    message: 'Message',
    phoneNumber: 'Phone number',
    emailAddress: 'Email address',
    technical: 'Privacy by design: no accounts, cookies, analytics, database, or persistent storage.',
  },
  ar: {
    title: 'SecureQR',
    tagline: 'رموز QR خاصة تُنشأ بالكامل داخل متصفحك.',
    privacy: 'تبقى بيانات رمز QR داخل هذا المتصفح ولا يتم رفعها.',
    type: 'نوع الرمز',
    input: 'المحتوى',
    generate: 'إنشاء رمز QR',
    preview: 'المعاينة',
    empty: 'أدخل محتوى صحيحاً لإنشاء الرمز.',
    downloadPng: 'تنزيل PNG',
    downloadSvg: 'تنزيل SVG',
    copy: 'نسخ القيمة',
    print: 'طباعة',
    reset: 'إعادة ضبط',
    copied: 'تم النسخ',
    foreground: 'لون الرمز',
    background: 'لون الخلفية',
    size: 'الحجم',
    correction: 'تصحيح الأخطاء',
    safety: 'إرشادات السلامة',
    safetyText: 'تحقق من الوجهة قبل المسح. لا تُضمّن كلمات المرور أو المفاتيح الخاصة أو رموز المصادقة أو البيانات الشخصية شديدة الحساسية.',
    invalidUrl: 'أدخل رابط HTTP أو HTTPS صحيحاً.',
    invalid: 'أدخل محتوى صحيحاً.',
    text: 'نص',
    url: 'رابط موقع',
    email: 'بريد إلكتروني',
    phone: 'هاتف',
    sms: 'رسالة SMS',
    wifi: 'شبكة Wi-Fi',
    vcard: 'بطاقة اتصال',
    ssid: 'اسم الشبكة (SSID)',
    password: 'كلمة مرور الشبكة',
    security: 'الحماية',
    hidden: 'شبكة مخفية',
    name: 'الاسم الكامل',
    organization: 'المؤسسة',
    subject: 'الموضوع',
    message: 'الرسالة',
    phoneNumber: 'رقم الهاتف',
    emailAddress: 'البريد الإلكتروني',
    technical: 'خصوصية حسب التصميم: دون حسابات أو ملفات تعريف ارتباط أو تحليلات أو قاعدة بيانات أو تخزين دائم.',
  },
}

const initialFields = {
  content: '',
  email: '',
  subject: '',
  message: '',
  phone: '',
  ssid: '',
  password: '',
  security: 'WPA',
  hidden: false,
  name: '',
  organization: '',
}

function escapeQr(value) {
  return String(value).replace(/([\\;,":])/g, '\\$1')
}

function isSafeUrl(value) {
  try {
    const parsed = new URL(value)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

function hexLuminance(hex) {
  const channels = hex.replace('#', '').match(/.{2}/g)?.map((part) => {
    const value = Number.parseInt(part, 16) / 255
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })
  return channels ? (0.2126 * channels[0]) + (0.7152 * channels[1]) + (0.0722 * channels[2]) : 0
}

function contrastRatio(a, b) {
  const light = Math.max(hexLuminance(a), hexLuminance(b))
  const dark = Math.min(hexLuminance(a), hexLuminance(b))
  return (light + 0.05) / (dark + 0.05)
}

function App() {
  const [language, setLanguage] = React.useState('en')
  const [dark, setDark] = React.useState(() => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false)
  const [type, setType] = React.useState('text')
  const [fields, setFields] = React.useState(initialFields)
  const [foreground, setForeground] = React.useState('#0f172a')
  const [background, setBackground] = React.useState('#ffffff')
  const [size, setSize] = React.useState(320)
  const [level, setLevel] = React.useState('M')
  const [dataUrl, setDataUrl] = React.useState('')
  const [svg, setSvg] = React.useState('')
  const [error, setError] = React.useState('')
  const [copied, setCopied] = React.useState(false)
  const t = copy[language]
  const direction = language === 'ar' ? 'rtl' : 'ltr'

  const update = (key, value) => setFields((current) => ({ ...current, [key]: value }))

  const encodedValue = React.useMemo(() => {
    if (type === 'text' || type === 'url') return fields.content.trim()
    if (type === 'email') {
      if (!fields.email.trim()) return ''
      const params = new URLSearchParams()
      if (fields.subject) params.set('subject', fields.subject)
      if (fields.message) params.set('body', fields.message)
      return `mailto:${fields.email.trim()}${params.size ? `?${params}` : ''}`
    }
    if (type === 'phone') return fields.phone.trim() ? `tel:${fields.phone.trim()}` : ''
    if (type === 'sms') {
      if (!fields.phone.trim()) return ''
      return `sms:${fields.phone.trim()}${fields.message ? `?body=${encodeURIComponent(fields.message)}` : ''}`
    }
    if (type === 'wifi') {
      if (!fields.ssid.trim()) return ''
      return `WIFI:T:${escapeQr(fields.security)};S:${escapeQr(fields.ssid)};P:${escapeQr(fields.password)};H:${fields.hidden ? 'true' : 'false'};;`
    }
    if (type === 'vcard') {
      if (!fields.name.trim()) return ''
      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${escapeQr(fields.name)}`,
        fields.organization ? `ORG:${escapeQr(fields.organization)}` : '',
        fields.phone ? `TEL:${escapeQr(fields.phone)}` : '',
        fields.email ? `EMAIL:${escapeQr(fields.email)}` : '',
        'END:VCARD',
      ].filter(Boolean).join('\n')
    }
    return ''
  }, [fields, type])

  const validate = React.useCallback(() => {
    if (!encodedValue || encodedValue.length > 2048) return t.invalid
    if (type === 'url' && !isSafeUrl(encodedValue)) return t.invalidUrl
    if (type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) return t.invalid
    if (['phone', 'sms'].includes(type) && !/^\+?[0-9 ()-]{5,24}$/.test(fields.phone)) return t.invalid
    if (contrastRatio(foreground, background) < 3) return language === 'ar' ? 'التباين منخفض جداً لمسح موثوق.' : 'Contrast is too low for reliable scanning.'
    return ''
  }, [background, encodedValue, fields.email, fields.phone, foreground, language, t.invalid, t.invalidUrl, type])

  const generate = React.useCallback(async () => {
    const issue = validate()
    if (issue) {
      setError(issue)
      setDataUrl('')
      setSvg('')
      return
    }
    const options = { width: size, margin: 2, errorCorrectionLevel: level, color: { dark: foreground, light: background } }
    const [pngOutput, svgOutput] = await Promise.all([
      QRCode.toDataURL(encodedValue, options),
      QRCode.toString(encodedValue, { ...options, type: 'svg' }),
    ])
    setDataUrl(pngOutput)
    setSvg(svgOutput)
    setError('')
  }, [encodedValue, size, level, foreground, background, validate])

  React.useEffect(() => {
    if (!encodedValue) {
      setDataUrl('')
      setSvg('')
      setError('')
      return
    }
    const timer = window.setTimeout(generate, 180)
    return () => window.clearTimeout(timer)
  }, [encodedValue, size, level, foreground, background, generate])

  const reset = () => {
    setFields(initialFields)
    setDataUrl('')
    setSvg('')
    setError('')
  }

  const download = (format) => {
    const anchor = document.createElement('a')
    anchor.download = `secureqr-${type}.${format}`
    anchor.href = format === 'png' ? dataUrl : URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
    anchor.click()
    if (format === 'svg') URL.revokeObjectURL(anchor.href)
  }

  const input = (label, key, options = {}) => (
    <label className="field">
      <span>{label}</span>
      {options.textarea ? (
        <textarea value={fields[key]} maxLength={options.maxLength ?? 2048} onChange={(event) => update(key, event.target.value)} rows="4" />
      ) : (
        <input
          type={options.type ?? 'text'}
          value={fields[key]}
          maxLength={options.maxLength ?? 256}
          placeholder={options.placeholder}
          autoComplete="off"
          onChange={(event) => update(key, event.target.value)}
        />
      )}
    </label>
  )

  return (
    <main className={dark ? 'theme dark' : 'theme'} dir={direction}>
      <header>
        <div className="brand"><ShieldCheck aria-hidden="true" /><span>{t.title}</span></div>
        <div className="header-actions">
          <button className="icon-button" onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')} aria-label="Change language">
            <Languages aria-hidden="true" /><span>{language === 'en' ? 'العربية' : 'English'}</span>
          </button>
          <button className="icon-button square" onClick={() => setDark(!dark)} aria-label="Toggle color mode">
            {dark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
          </button>
        </div>
      </header>

      <section className="hero">
        <div className="eyebrow"><ShieldCheck size={16} /> Privacy-first</div>
        <h1>{t.tagline}</h1>
        <p className="privacy"><CheckCircle2 size={18} />{t.privacy}</p>
      </section>

      <section className="workspace">
        <div className="panel form-panel">
          <label className="field">
            <span>{t.type}</span>
            <select value={type} onChange={(event) => { setType(event.target.value); reset() }}>
              {['text', 'url', 'email', 'phone', 'sms', 'wifi', 'vcard'].map((value) => (
                <option key={value} value={value}>{t[value]}</option>
              ))}
            </select>
          </label>

          {(type === 'text' || type === 'url') && input(t.input, 'content', { textarea: type === 'text', placeholder: type === 'url' ? 'https://example.com' : '' })}
          {type === 'email' && <>{input(t.emailAddress, 'email', { type: 'email' })}{input(t.subject, 'subject')}{input(t.message, 'message', { textarea: true })}</>}
          {type === 'phone' && input(t.phoneNumber, 'phone', { type: 'tel' })}
          {type === 'sms' && <>{input(t.phoneNumber, 'phone', { type: 'tel' })}{input(t.message, 'message', { textarea: true })}</>}
          {type === 'wifi' && <>
            {input(t.ssid, 'ssid')}
            {input(t.password, 'password', { type: 'password' })}
            <label className="field"><span>{t.security}</span><select value={fields.security} onChange={(event) => update('security', event.target.value)}><option>WPA</option><option>WEP</option><option>nopass</option></select></label>
            <label className="checkbox"><input type="checkbox" checked={fields.hidden} onChange={(event) => update('hidden', event.target.checked)} />{t.hidden}</label>
          </>}
          {type === 'vcard' && <>{input(t.name, 'name')}{input(t.organization, 'organization')}{input(t.phoneNumber, 'phone', { type: 'tel' })}{input(t.emailAddress, 'email', { type: 'email' })}</>}

          <div className="customization">
            <label><span>{t.foreground}</span><input type="color" value={foreground} onChange={(event) => setForeground(event.target.value)} /></label>
            <label><span>{t.background}</span><input type="color" value={background} onChange={(event) => setBackground(event.target.value)} /></label>
            <label><span>{t.size}</span><select value={size} onChange={(event) => setSize(Number(event.target.value))}><option value="256">256</option><option value="320">320</option><option value="512">512</option></select></label>
            <label><span>{t.correction}</span><select value={level} onChange={(event) => setLevel(event.target.value)}><option>L</option><option>M</option><option>Q</option><option>H</option></select></label>
          </div>

          {error && <p className="error" role="alert">{error}</p>}
          <button className="primary" onClick={generate}><QrCode size={18} />{t.generate}</button>
        </div>

        <div className="panel preview-panel">
          <h2>{t.preview}</h2>
          <div className="preview-box">
            {dataUrl ? <img src={dataUrl} alt={language === 'ar' ? 'رمز QR المنشأ' : 'Generated QR code'} /> : <div className="empty"><QrCode /><p>{t.empty}</p></div>}
          </div>
          <div className="actions">
            <button disabled={!dataUrl} onClick={() => download('png')}><Download size={17} />{t.downloadPng}</button>
            <button disabled={!svg} onClick={() => download('svg')}><Download size={17} />{t.downloadSvg}</button>
            <button disabled={!encodedValue} onClick={async () => { await navigator.clipboard.writeText(encodedValue); setCopied(true); setTimeout(() => setCopied(false), 1200) }}><Copy size={17} />{copied ? t.copied : t.copy}</button>
            <button disabled={!dataUrl} onClick={() => window.print()}><Printer size={17} />{t.print}</button>
            <button onClick={reset}><RefreshCcw size={17} />{t.reset}</button>
          </div>
        </div>
      </section>

      <section className="security-grid">
        <article><ShieldCheck /><div><h2>{t.safety}</h2><p>{t.safetyText}</p></div></article>
        <article><CheckCircle2 /><div><h2>{language === 'ar' ? 'معلومات تقنية وخصوصية' : 'Technical & privacy information'}</h2><p>{t.technical}</p></div></article>
      </section>

      <footer><span>SecureQR</span><span>{language === 'ar' ? 'مصمم لتقليل انكشاف البيانات.' : 'Designed to minimize data exposure.'}</span></footer>
    </main>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
