import { useEffect, useRef, useState } from 'react'

const storageKey = 'mops-couture-community-demo'
const mediaDatabaseName = 'mops-couture-community-media'
const mediaStoreName = 'photos'
const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])
const maxPhotos = 5
const maxPhotoBytes = 8 * 1024 * 1024
const maxTotalPhotoBytes = 15 * 1024 * 1024
const occasions = ['Wedding', 'Party', 'Birthday', 'Church event', 'Graduation', 'Other celebration']
const demoDate = (daysAgo) => new Date(Date.now() - daysAgo * 86400000).toISOString()

const samplePosts = [
  {
    id: 'demo-post-ankara',
    author: 'Demo member · Amara',
    caption: 'A bright Ankara look for a family celebration. This sample post shows the kind of occasion story the community can share.',
    design: 'Ankara Two-Piece',
    occasion: 'Wedding',
    images: ['https://images.unsplash.com/photo-1628144029346-8a98676311b6?auto=format&fit=crop&w=1000&q=85'],
    createdAt: demoDate(1),
    liked: false,
    likes: 18,
    ratings: [5, 4, 5],
    comments: [
      { id: 'demo-comment-ankara-1', author: 'Demo member · Tola', text: 'Love the colour story for a celebration!' },
    ],
  },
  {
    id: 'demo-post-aso-oke',
    author: 'Demo member · Zainab',
    caption: 'A sample aso-oke occasion idea with details that feel special without losing comfort.',
    design: 'Aso-Oke Occasion Look',
    occasion: 'Birthday',
    images: ['https://images.unsplash.com/photo-1661332306744-70f9ed1a7f40?auto=format&fit=crop&w=1000&q=85'],
    createdAt: demoDate(3),
    liked: false,
    likes: 12,
    ratings: [5, 5, 4, 5],
    comments: [
      { id: 'demo-comment-aso-1', author: 'Demo member · Nneka', text: 'The styling details are beautiful.' },
    ],
  },
  {
    id: 'demo-post-burgundy',
    author: 'Demo member · Kemi',
    caption: 'Burgundy and gold inspiration for an evening party. This is illustrative demo content, not a verified customer story.',
    design: 'Burgundy Bridal Look',
    occasion: 'Party',
    images: ['https://images.unsplash.com/photo-1696962678565-bee84e6b9cb6?auto=format&fit=crop&w=1000&q=85'],
    createdAt: demoDate(5),
    liked: false,
    likes: 9,
    ratings: [4, 5, 4],
    comments: [],
  },
]

function isValidPost(post) {
  return post &&
    typeof post.id === 'string' &&
    typeof post.author === 'string' &&
    typeof post.caption === 'string' &&
    Array.isArray(post.images) &&
    Array.isArray(post.ratings) &&
    Array.isArray(post.comments) &&
    Number.isFinite(post.likes)
}

function readCommunityState() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(storageKey) || 'null')
    if (!saved) return { posts: samplePosts, displayName: 'Demo visitor', error: '' }
    if (!Array.isArray(saved.posts) || !saved.posts.every(isValidPost)) {
      return {
        posts: samplePosts,
        displayName: 'Demo visitor',
        error: 'Saved Community demo data could not be read. Sample posts are shown instead.',
      }
    }
    return {
      posts: saved.posts,
      displayName: typeof saved.displayName === 'string' ? saved.displayName : 'Demo visitor',
      error: '',
    }
  } catch {
    return {
      posts: samplePosts,
      displayName: 'Demo visitor',
      error: 'Saved Community demo data could not be read. Sample posts are shown instead.',
    }
  }
}

function createId() {
  return globalThis.crypto?.randomUUID?.() || `demo-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function formatPostDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date)
}

function openMediaDatabase() {
  if (!window.indexedDB) {
    return Promise.reject(new Error('This browser does not support local photo storage. Try a current version of Chrome, Edge or Firefox.'))
  }
  return new Promise((resolve, reject) => {
    let request
    try {
      request = window.indexedDB.open(mediaDatabaseName, 1)
    } catch {
      reject(new Error('Could not open local photo storage. Check browser storage permissions and try again.'))
      return
    }
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(mediaStoreName)) {
        request.result.createObjectStore(mediaStoreName)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(new Error('Could not open local photo storage. Check browser storage permissions and try again.'))
    request.onblocked = () => reject(new Error('Local photo storage is busy in another tab. Close other Mop’s Couture tabs and retry.'))
  })
}

async function saveCommunityPhoto(key, blob) {
  const database = await openMediaDatabase()
  try {
    await new Promise((resolve, reject) => {
      const transaction = database.transaction(mediaStoreName, 'readwrite')
      transaction.objectStore(mediaStoreName).put(blob, key)
      transaction.oncomplete = resolve
      transaction.onerror = () => reject(new Error('A photo could not be saved in this browser. Check available storage and retry.'))
      transaction.onabort = () => reject(new Error('Photo saving was interrupted. Check available storage and retry.'))
    })
  } finally {
    database.close()
  }
}

async function readCommunityPhoto(key) {
  const database = await openMediaDatabase()
  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(mediaStoreName, 'readonly')
      const request = transaction.objectStore(mediaStoreName).get(key)
      request.onsuccess = () => {
        if (request.result instanceof Blob) resolve(request.result)
        else reject(new Error('A saved photo could not be found in this browser.'))
      }
      request.onerror = () => reject(new Error('A saved photo could not be read from this browser.'))
    })
  } finally {
    database.close()
  }
}

async function deleteCommunityPhotos(keys) {
  if (!keys.length || !window.indexedDB) return
  const database = await openMediaDatabase()
  try {
    await new Promise((resolve, reject) => {
      const transaction = database.transaction(mediaStoreName, 'readwrite')
      const store = transaction.objectStore(mediaStoreName)
      keys.forEach((key) => store.delete(key))
      transaction.oncomplete = resolve
      transaction.onerror = () => reject(new Error('Temporary photos could not be removed from local browser storage.'))
      transaction.onabort = () => reject(new Error('Temporary photo cleanup was interrupted.'))
    })
  } finally {
    database.close()
  }
}

function decodeLegacyPhoto(dataUrl) {
  return fetch(dataUrl).then((response) => {
    if (!response.ok) throw new Error('A previously saved demo photo could not be migrated.')
    return response.blob()
  })
}

function decodeImageFile(file, preview) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      if (image.naturalWidth * image.naturalHeight > 40000000) {
        reject(new Error(`${file.name} has too many pixels to preview safely.`))
        return
      }
      resolve()
    }
    image.onerror = () => reject(new Error(`${file.name} is not a readable image. Choose a valid JPG, PNG or WebP photo.`))
    image.src = preview
  })
}

function Stars({ value, label }) {
  return (
    <span className="community-stars" aria-label={label}>
      <span aria-hidden="true">{'★'.repeat(value)}{'☆'.repeat(5 - value)}</span>
      <span>{label}</span>
    </span>
  )
}

function RatingPicker({ value, onChange }) {
  return (
    <fieldset className="community-rating-picker">
      <legend>Optional demo rating</legend>
      <div role="group" aria-label="Rate your outfit experience from one to five stars">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            aria-pressed={value === rating}
            aria-label={`${rating} ${rating === 1 ? 'star' : 'stars'}`}
            onClick={() => onChange(value === rating ? 0 : rating)}
          >
            {rating <= value ? '★' : '☆'}
          </button>
        ))}
      </div>
      <span>{value ? `${value} of 5 selected` : 'Not rated'}</span>
    </fieldset>
  )
}

export default function CommunityFeed({ isCreatePage = false, onNavigate }) {
  const [initialState] = useState(readCommunityState)
  const [posts, setPosts] = useState(initialState.posts)
  const [displayName, setDisplayName] = useState(initialState.displayName)
  const [storageError, setStorageError] = useState(initialState.error)
  const [view, setView] = useState('recent')
  const [occasionFilter, setOccasionFilter] = useState('All occasions')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [caption, setCaption] = useState('')
  const [design, setDesign] = useState('')
  const [occasion, setOccasion] = useState('')
  const [rating, setRating] = useState(0)
  const [photos, setPhotos] = useState([])
  const [activePhotoId, setActivePhotoId] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [processingPhotos, setProcessingPhotos] = useState(false)
  const [saveProgress, setSaveProgress] = useState('')
  const [publishStatus, setPublishStatus] = useState('')
  const [formError, setFormError] = useState('')
  const [commentDrafts, setCommentDrafts] = useState({})
  const [commentErrors, setCommentErrors] = useState({})
  const [posting, setPosting] = useState(false)
  const [outfitConfirmed, setOutfitConfirmed] = useState(false)
  const inputRef = useRef(null)
  const pickerTriggerRef = useRef(null)
  const pickerDialogRef = useRef(null)
  const photosRef = useRef([])
  const previewUrls = useRef(new Set())
  const postMediaUrls = useRef(new Map())
  const [postMediaSources, setPostMediaSources] = useState({})
  const [mediaReady, setMediaReady] = useState(false)
  const [mediaError, setMediaError] = useState('')

  useEffect(() => {
    if (!mediaReady) return undefined
    let errorTimeout
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ posts, displayName }))
    } catch {
      errorTimeout = window.setTimeout(() => {
        setStorageError('Community details could not be saved in this browser. Your current feed remains available until you leave this page.')
      }, 0)
    }
    return () => window.clearTimeout(errorTimeout)
  }, [posts, displayName, mediaReady])

  useEffect(() => {
    let active = true
    async function hydratePostPhotos() {
      const normalizedPosts = []
      const newSources = {}
      let changed = false
      let failedPhotos = 0

      for (const post of posts) {
        const images = []
        for (const [index, source] of post.images.entries()) {
          if (typeof source !== 'string' || source.startsWith('http')) {
            images.push(source)
            continue
          }

          const legacyDataUrl = source.startsWith('data:image/')
          const localKey = legacyDataUrl ? `${post.id}:${index}` : source.startsWith('local-photo:') ? source.slice('local-photo:'.length) : ''
          if (!localKey) {
            images.push(source)
            continue
          }
          if (!legacyDataUrl && postMediaUrls.current.has(source)) {
            images.push(source)
            continue
          }

          try {
            const blob = legacyDataUrl ? await decodeLegacyPhoto(source) : await readCommunityPhoto(localKey)
            if (legacyDataUrl) {
              await saveCommunityPhoto(localKey, blob)
              changed = true
            }
            const mediaReference = `local-photo:${localKey}`
            images.push(mediaReference)
            newSources[mediaReference] = URL.createObjectURL(blob)
            if (legacyDataUrl) changed = true
          } catch {
            failedPhotos += 1
            images.push(source)
          }
        }
        normalizedPosts.push(images.some((image, index) => image !== post.images[index])
          ? { ...post, images }
          : post)
      }

      if (!active) {
        Object.values(newSources).forEach((url) => URL.revokeObjectURL(url))
        return
      }
      if (Object.keys(newSources).length) {
        Object.entries(newSources).forEach(([key, url]) => postMediaUrls.current.set(key, url))
        setPostMediaSources((current) => ({ ...current, ...newSources }))
      }
      if (changed) setPosts(normalizedPosts)
      if (failedPhotos) {
        setMediaError(`${failedPhotos} saved photo${failedPhotos === 1 ? '' : 's'} could not be restored. Remove that post or choose its photo again.`)
      }
      setMediaReady(true)
    }

    hydratePostPhotos().catch(() => {
      if (active) {
        setMediaError('Local photo storage could not be opened. Existing sample posts are still available.')
        setMediaReady(true)
      }
    })
    return () => { active = false }
  }, [posts])

  useEffect(() => () => {
    previewUrls.current.forEach((url) => URL.revokeObjectURL(url))
    previewUrls.current.clear()
    postMediaUrls.current.forEach((url) => URL.revokeObjectURL(url))
    postMediaUrls.current.clear()
  }, [])

  useEffect(() => {
    if (!pickerOpen) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    pickerDialogRef.current?.focus()

    function handlePickerKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        closePicker()
        return
      }
      if (event.key !== 'Tab' || !pickerDialogRef.current) return
      const focusable = pickerDialogRef.current.querySelectorAll(
        'button:not(:disabled), input:not(:disabled), [tabindex="0"]',
      )
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (document.activeElement === pickerDialogRef.current && event.shiftKey) {
        event.preventDefault()
        last.focus()
      } else if (document.activeElement === pickerDialogRef.current) {
        event.preventDefault()
        first.focus()
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handlePickerKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handlePickerKeyDown)
    }
  }, [pickerOpen])

  function clearPhotos() {
    previewUrls.current.forEach((url) => URL.revokeObjectURL(url))
    previewUrls.current.clear()
    photosRef.current = []
    setPhotos([])
    setActivePhotoId('')
    if (inputRef.current) inputRef.current.value = ''
  }

  async function addPhotoFiles(files) {
    if (!files.length) return
    setFormError('')
    setPublishStatus('')
    if (photosRef.current.length + files.length > maxPhotos) {
      setFormError(`You can select up to ${maxPhotos} photos in total. Remove a photo before adding more.`)
      return
    }
    if (files.some((file) => !allowedImageTypes.has(file.type))) {
      setFormError('Use JPG, PNG or WebP image files only. Video and GIF uploads are not supported.')
      return
    }
    if (files.some((file) => file.size > maxPhotoBytes)) {
      setFormError('Each photo must be 8 MB or smaller.')
      return
    }
    const totalBytes = [...photosRef.current, ...files].reduce((total, entry) => total + (entry.file?.size || 0), 0)
    if (totalBytes > maxTotalPhotoBytes) {
      setFormError('All selected photos must total 15 MB or less.')
      return
    }
    setProcessingPhotos(true)
    const nextPhotos = []
    try {
      for (const file of files) {
        const preview = URL.createObjectURL(file)
        previewUrls.current.add(preview)
        try {
          await decodeImageFile(file, preview)
          nextPhotos.push({ id: createId(), file, preview })
        } catch (error) {
          URL.revokeObjectURL(preview)
          previewUrls.current.delete(preview)
          throw error
        }
      }
      const updatedPhotos = [...photosRef.current, ...nextPhotos]
      photosRef.current = updatedPhotos
      setPhotos(updatedPhotos)
      if (!activePhotoId && nextPhotos.length) setActivePhotoId(nextPhotos[0].id)
      setFormError('')
    } catch (error) {
      nextPhotos.forEach(({ preview }) => {
        URL.revokeObjectURL(preview)
        previewUrls.current.delete(preview)
      })
      setFormError(error instanceof Error ? error.message : 'These photos could not be previewed. Please choose them again.')
    } finally {
      setProcessingPhotos(false)
    }
  }

  function selectPhotos(event) {
    const files = Array.from(event.target.files || [])
    event.target.value = ''
    void addPhotoFiles(files)
  }

  function closePicker() {
    setPickerOpen(false)
    setDragActive(false)
    pickerTriggerRef.current?.focus()
  }

  function movePhoto(photoId, direction) {
    const currentIndex = photosRef.current.findIndex((photo) => photo.id === photoId)
    const nextIndex = currentIndex + direction
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= photosRef.current.length) return
    const reordered = [...photosRef.current]
    ;[reordered[currentIndex], reordered[nextIndex]] = [reordered[nextIndex], reordered[currentIndex]]
    photosRef.current = reordered
    setPhotos(reordered)
  }

  function removePhoto(photoId) {
    const removed = photosRef.current.find((photo) => photo.id === photoId)
    if (!removed) return
    URL.revokeObjectURL(removed.preview)
    previewUrls.current.delete(removed.preview)
    const remaining = photosRef.current.filter((photo) => photo.id !== photoId)
    photosRef.current = remaining
    setPhotos(remaining)
    if (activePhotoId === photoId) setActivePhotoId(remaining[0]?.id || '')
  }

  function updatePost(postId, update) {
    setPosts((current) => current.map((post) => post.id === postId ? update(post) : post))
  }

  function toggleLike(postId) {
    updatePost(postId, (post) => ({
      ...post,
      liked: !post.liked,
      likes: Math.max(0, post.likes + (post.liked ? -1 : 1)),
    }))
  }

  function addComment(event, postId) {
    event.preventDefault()
    const text = (commentDrafts[postId] || '').trim()
    if (!text) {
      setCommentErrors((current) => ({ ...current, [postId]: 'Write a comment before posting it.' }))
      return
    }
    const author = displayName.trim() || 'Demo visitor'
    updatePost(postId, (post) => ({
      ...post,
      comments: [...post.comments, { id: createId(), author, text }],
    }))
    setCommentDrafts((current) => ({ ...current, [postId]: '' }))
    setCommentErrors((current) => ({ ...current, [postId]: '' }))
  }

  async function publishPost(event) {
    event.preventDefault()
    if (posting) return
    const cleanCaption = caption.trim()
    if (!photos.length) {
      setFormError('Add at least one outfit photo before sharing.')
      return
    }
    if (!cleanCaption) {
      setFormError('Add a caption to describe your outfit.')
      return
    }
    if (!outfitConfirmed) {
      setFormError('Please confirm the outfit and photo permission before sharing.')
      return
    }
    const postId = createId()
    const photoKeys = photos.map((_, index) => `${postId}:${index}`)
    const savedPhotoKeys = []
    setPosting(true)
    setFormError('')
    setPublishStatus('')
    try {
      for (const [index, photo] of photos.entries()) {
        setSaveProgress(`Saving photo ${index + 1} of ${photos.length} in this browser…`)
        await saveCommunityPhoto(photoKeys[index], photo.file)
        savedPhotoKeys.push(photoKeys[index])
      }
      const images = photoKeys.map((key) => `local-photo:${key}`)
      const newPost = {
        id: postId,
        author: displayName.trim() || 'Demo visitor',
        caption: cleanCaption,
        design: design.trim(),
        occasion,
        images,
        createdAt: new Date().toISOString(),
        liked: false,
        likes: 0,
        ratings: rating ? [rating] : [],
        comments: [],
        isUserPost: true,
      }
      const nextPosts = [newPost, ...posts]
      try {
        window.localStorage.setItem(storageKey, JSON.stringify({ posts: nextPosts, displayName }))
      } catch {
        throw new Error('Your post details could not be saved in this browser. Free some browser storage and retry.')
      }
      const newSources = Object.fromEntries(photos.map((photo, index) => {
        const key = images[index]
        const url = URL.createObjectURL(photo.file)
        postMediaUrls.current.set(key, url)
        return [key, url]
      }))
      setPostMediaSources((current) => ({ ...current, ...newSources }))
      setPosts((current) => [newPost, ...current])
      setStorageError('')
      setPublishStatus('Your outfit post is saved in this browser demo.')
      setView('recent')
      setOccasionFilter('All occasions')
      setCaption('')
      setDesign('')
      setOccasion('')
      setRating(0)
      setOutfitConfirmed(false)
      setSaveProgress('')
      setPickerOpen(false)
      clearPhotos()
      onNavigate('/community')
    } catch (error) {
      let cleanupMessage = ''
      try {
        await deleteCommunityPhotos(savedPhotoKeys)
      } catch (cleanupError) {
        cleanupMessage = cleanupError instanceof Error ? ` ${cleanupError.message}` : ''
      }
      setSaveProgress('')
      setFormError(`${error instanceof Error ? error.message : 'The post could not be saved.'}${cleanupMessage}`)
    } finally {
      setPosting(false)
    }
  }

  const filteredPosts = posts
    .filter((post) => occasionFilter === 'All occasions' || post.occasion === occasionFilter)
    .sort((first, second) => view === 'popular'
      ? second.likes - first.likes || second.createdAt.localeCompare(first.createdAt)
      : second.createdAt.localeCompare(first.createdAt))

  return (
    <div className={`community-page${isCreatePage ? ' community-create-page' : ''}`}>
      {isCreatePage ? (
        <header className="community-create-intro">
          <button className="community-back-link" type="button" onClick={() => onNavigate('/community')}>
            <span aria-hidden="true">←</span> Back to Community
          </button>
          <p className="eyebrow accent">Your style, your story</p>
          <h1>Share Your Outfit</h1>
          <p>Create a demo post with your outfit photos and story. Your post is saved only in this browser.</p>
        </header>
      ) : (
        <>
          <header className="community-intro">
            <p className="eyebrow accent">Mop&apos;s Couture · Demo community</p>
            <h1>Wear it. Share your story.</h1>
            <p>A space for people to share outfits made by Miss Mop, occasions they wore them to, and conversations around their style.</p>
            <p className="community-demo-note">Demo mode: sample photos, member names, posts, comments and likes are illustrative. Your posts and interactions are saved only in this browser and are not shared with other visitors.</p>
          </header>

          <section className="community-toolbar" aria-label="Community feed controls">
        <label>
          Demo display name
          <input value={displayName} maxLength={40} onChange={(event) => setDisplayName(event.target.value)} placeholder="Demo visitor" />
        </label>
        <div className="community-toolbar-actions">
          <div className="community-view-tabs" role="group" aria-label="Browse posts">
            <button type="button" className={view === 'recent' ? 'active' : ''} aria-pressed={view === 'recent'} onClick={() => setView('recent')}>Recent</button>
            <button type="button" className={view === 'popular' ? 'active' : ''} aria-pressed={view === 'popular'} onClick={() => setView('popular')}>Popular</button>
          </div>
          <label>
            Occasion
            <select value={occasionFilter} onChange={(event) => setOccasionFilter(event.target.value)}>
              <option>All occasions</option>
              {occasions.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <button className="community-create-button" type="button" onClick={() => {
            setFormError('')
            onNavigate('/community/create')
          }}>＋ Share your outfit</button>
        </div>
      </section>

      {storageError && <p className="community-error" role="status">{storageError}</p>}
      {mediaError && <p className="community-error" role="status">{mediaError}</p>}
      {publishStatus && <p className="community-success" role="status">{publishStatus}</p>}
        </>
      )}

      {isCreatePage && (
        <form className="community-composer" onSubmit={publishPost}>
          <div className="community-composer-heading">
            <div>
              <p className="eyebrow accent">Your style, your story</p>
              <h2>Share your outfit</h2>
            </div>
            <span>Demo post</span>
          </div>
          <section className="community-photo-selection" aria-labelledby="community-photo-heading">
            <div className="community-photo-selection-heading">
              <div>
                <h3 id="community-photo-heading">1. Add your outfit photos</h3>
                <p>{photos.length} of {maxPhotos} selected · JPG, PNG or WebP · 8 MB each</p>
              </div>
              <button
                ref={pickerTriggerRef}
                className="community-add-photos"
                type="button"
                onClick={() => {
                  setFormError('')
                  setPickerOpen(true)
                }}
              >
                {photos.length ? 'Manage photos' : '＋ Add photos'}
              </button>
            </div>
            {processingPhotos && <p className="community-processing" role="status">Preparing photo previews…</p>}
            {saveProgress && <p className="community-processing" role="status">{saveProgress}</p>}
            {photos.length > 0 && (
              <div className="community-selected-summary" aria-live="polite">
                <img src={photos[0].preview} alt="" />
                <span>{photos.length} photo{photos.length === 1 ? '' : 's'} ready to review</span>
                <button type="button" onClick={() => setPickerOpen(true)}>Review selection</button>
              </div>
            )}
          </section>
          {photos.length > 0 && (
            <p className="community-photo-caption">{photos.length} photo{photos.length === 1 ? '' : 's'} selected · saved only in this browser demo</p>
          )}
          <label>
            2. Caption <span>(required)</span>
            <textarea value={caption} maxLength={600} rows={4} onChange={(event) => setCaption(event.target.value)} placeholder="Tell us about the outfit and how you styled it..." />
          </label>
          <div className="community-composer-fields">
            <label>
              3. Design or outfit <span>(optional)</span>
              <input value={design} maxLength={80} onChange={(event) => setDesign(event.target.value)} placeholder="e.g. Ankara two-piece" />
            </label>
            <label>
              Occasion <span>(optional)</span>
              <select value={occasion} onChange={(event) => setOccasion(event.target.value)}>
                <option value="">Choose an occasion</option>
                {occasions.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
          </div>
          <RatingPicker value={rating} onChange={setRating} />
          <label className="community-confirmation">
            <input type="checkbox" checked={outfitConfirmed} disabled={posting} onChange={(event) => setOutfitConfirmed(event.target.checked)} />
            <span>4. I confirm this is a Mop&apos;s Couture outfit I own and have worn, and I own these photos or have permission to share them.</span>
          </label>
          {photos.length > 0 && caption.trim() && (
            <section className="community-post-review" aria-label="Post review">
              <span>5. Review your post</span>
              <p>{caption.trim()}</p>
              <small>{photos.length} photo{photos.length === 1 ? '' : 's'}{design.trim() ? ` · ${design.trim()}` : ''}{occasion ? ` · ${occasion}` : ''}{rating ? ` · ${rating}/5 demo rating` : ''}</small>
            </section>
          )}
          {formError && !pickerOpen && <p className="community-error" role="alert">{formError}</p>}
          <div className="community-composer-actions">
            <button className="community-publish-button" type="submit" disabled={posting || processingPhotos}>{posting ? 'Saving photos…' : '6. Publish demo post'}</button>
            <button className="community-cancel-button" type="button" onClick={() => onNavigate('/community')}>Cancel</button>
          </div>
        </form>
      )}

      {pickerOpen && (
        <div
          className="community-picker-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closePicker()
          }}
        >
          <section
            ref={pickerDialogRef}
            className="community-media-picker"
            role="dialog"
            aria-modal="true"
            aria-labelledby="community-picker-title"
            aria-describedby="community-picker-help"
            tabIndex={-1}
          >
            <header className="community-picker-header">
              <div>
                <p className="eyebrow accent">Your outfit</p>
                <h2 id="community-picker-title">Choose your photos</h2>
              </div>
              <button type="button" className="community-picker-close" onClick={closePicker} aria-label="Close photo picker">×</button>
            </header>
            <p id="community-picker-help" className="community-picker-help">
              Select up to {maxPhotos} JPG, PNG or WebP photos · 8 MB each · 15 MB total. Your selection stays here until you publish.
            </p>
            <input
              ref={inputRef}
              className="community-file-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={selectPhotos}
              aria-label="Choose outfit photos"
            />
            <div
              className={`community-dropzone${dragActive ? ' is-dragging' : ''}${photos.length ? ' has-photos' : ''}`}
              onDragOver={(event) => {
                event.preventDefault()
                setDragActive(true)
              }}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setDragActive(false)
              }}
              onDrop={(event) => {
                event.preventDefault()
                setDragActive(false)
                void addPhotoFiles(Array.from(event.dataTransfer.files || []))
              }}
            >
              {photos.length > 0 ? (
                <>
                  <img
                    className="community-picker-main-image"
                    src={photos.find((photo) => photo.id === activePhotoId)?.preview || photos[0].preview}
                    alt={`Selected outfit photo preview ${Math.max(photos.findIndex((photo) => photo.id === activePhotoId), 0) + 1}`}
                  />
                  <div className="community-picker-preview-footer">
                    <p>{photos.find((photo) => photo.id === activePhotoId)?.file.name || photos[0].file.name}</p>
                    <span>{photos.length} of {maxPhotos} selected</span>
                  </div>
                </>
              ) : (
                <div className="community-dropzone-empty">
                  <span aria-hidden="true">✥</span>
                  <strong>Bring your look into focus</strong>
                  <p>Choose your outfit photos or drop them here</p>
                </div>
              )}
            </div>
            {photos.length > 0 && (
              <div className="community-picker-thumbnails" aria-label="Selected photos in display order">
                {photos.map((photo, index) => (
                  <div className={`community-picker-thumbnail${photo.id === activePhotoId ? ' is-active' : ''}`} key={photo.id}>
                    <button
                      type="button"
                      className="community-thumbnail-select"
                      onClick={() => setActivePhotoId(photo.id)}
                      aria-label={`Preview photo ${index + 1}: ${photo.file.name}`}
                      aria-pressed={photo.id === activePhotoId}
                    >
                      <img src={photo.preview} alt="" />
                      <span>{index + 1}</span>
                    </button>
                    <div className="community-thumbnail-actions">
                      <button type="button" onClick={() => movePhoto(photo.id, -1)} disabled={index === 0} aria-label={`Move photo ${index + 1} earlier`}>↑</button>
                      <button type="button" onClick={() => movePhoto(photo.id, 1)} disabled={index === photos.length - 1} aria-label={`Move photo ${index + 1} later`}>↓</button>
                      <button type="button" onClick={() => removePhoto(photo.id)} aria-label={`Remove photo ${index + 1}`}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {processingPhotos && <p className="community-processing" role="status">Processing selected photos…</p>}
            <div className="community-picker-actions">
              <button
                type="button"
                className="community-picker-add"
                onClick={() => {
                  if (inputRef.current) inputRef.current.click()
                }}
                disabled={processingPhotos || photos.length >= maxPhotos}
              >
                {photos.length ? '＋ Add more photos' : '＋ Add photos'}
              </button>
              <button type="button" className="community-picker-done" onClick={closePicker} disabled={processingPhotos}>
                {photos.length ? 'Use these photos' : 'Done'}
              </button>
            </div>
            {formError && <p className="community-error" role="alert">{formError}</p>}
          </section>
        </div>
      )}

      {!isCreatePage && <section className="community-posts-section" aria-label={`${view} community posts`}>
        <div className="community-post-grid">
          {filteredPosts.map((post) => {
            const averageRating = post.ratings.length
              ? post.ratings.reduce((total, current) => total + current, 0) / post.ratings.length
              : 0
            return (
              <article className="community-post" key={post.id}>
                <div className="community-post-heading">
                  <div>
                    <span className="community-demo-badge">{post.isUserPost ? 'YOUR DEMO POST' : 'SAMPLE POST'}</span>
                    <h2>{post.author}</h2>
                    <time dateTime={post.createdAt}>{formatPostDate(post.createdAt)}</time>
                  </div>
                  <span className="community-post-occasion">{post.occasion || 'Style story'}</span>
                </div>
                <div className={`community-post-images${post.images.length > 1 ? ' multiple' : ''}`}>
                  {post.images.map((image, index) => (
                    postMediaSources[image] || image.startsWith('http') || image.startsWith('data:image/')
                      ? <img key={`${post.id}-${index}`} src={postMediaSources[image] || image} alt={`Demo outfit photo ${index + 1}${post.design ? ` for ${post.design}` : ''}`} loading="lazy" />
                      : <div key={`${post.id}-${index}`} className="community-photo-unavailable" role="img" aria-label={`Photo ${index + 1} unavailable`}>Photo unavailable in this browser</div>
                  ))}
                </div>
                <div className="community-post-content">
                  <p>{post.caption}</p>
                  {post.design && <p className="community-post-design"><span>Design</span>{post.design}</p>}
                  {averageRating > 0 && <Stars value={Math.round(averageRating)} label={`${averageRating.toFixed(1)} demo average · ${post.ratings.length} ${post.ratings.length === 1 ? 'rating' : 'ratings'}`} />}
                  {!post.ratings.length && <span className="community-no-rating">No demo rating yet</span>}
                  <div className="community-post-actions">
                    <button type="button" aria-pressed={post.liked} onClick={() => toggleLike(post.id)}>{post.liked ? '♥ Liked' : '♡ Like'} <span>{post.likes}</span></button>
                    <span>{post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}</span>
                  </div>
                  <div className="community-comments">
                    {post.comments.map((comment) => (
                      <p key={comment.id}><strong>{comment.author}</strong> {comment.text}</p>
                    ))}
                    {commentErrors[post.id] && <p className="community-error" role="alert">{commentErrors[post.id]}</p>}
                    <form onSubmit={(event) => addComment(event, post.id)}>
                      <label className="visually-hidden" htmlFor={`comment-${post.id}`}>Write a comment on {post.author}&apos;s post</label>
                      <input
                        id={`comment-${post.id}`}
                        maxLength={300}
                        value={commentDrafts[post.id] || ''}
                        onChange={(event) => setCommentDrafts((current) => ({ ...current, [post.id]: event.target.value }))}
                        placeholder="Add a demo comment..."
                      />
                      <button type="submit">Comment</button>
                    </form>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
        {filteredPosts.length === 0 && <p className="community-empty-state">No posts for this occasion yet. Share an outfit to start the conversation.</p>}
      </section>}
    </div>
  )
}
