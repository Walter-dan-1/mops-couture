import { useEffect, useRef, useState } from 'react'

const storageKey = 'mops-couture-community-demo'
const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const maxPhotos = 3
const maxPhotoBytes = 1024 * 1024
const maxTotalPhotoBytes = 2 * 1024 * 1024
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

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error(`Could not read ${file.name}. Please choose it again.`))
    reader.readAsDataURL(file)
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

export default function CommunityFeed() {
  const [initialState] = useState(readCommunityState)
  const [posts, setPosts] = useState(initialState.posts)
  const [displayName, setDisplayName] = useState(initialState.displayName)
  const [storageError, setStorageError] = useState(initialState.error)
  const [view, setView] = useState('recent')
  const [occasionFilter, setOccasionFilter] = useState('All occasions')
  const [composerOpen, setComposerOpen] = useState(false)
  const [caption, setCaption] = useState('')
  const [design, setDesign] = useState('')
  const [occasion, setOccasion] = useState('')
  const [rating, setRating] = useState(0)
  const [photos, setPhotos] = useState([])
  const [formError, setFormError] = useState('')
  const [commentDrafts, setCommentDrafts] = useState({})
  const [commentErrors, setCommentErrors] = useState({})
  const [posting, setPosting] = useState(false)
  const [outfitConfirmed, setOutfitConfirmed] = useState(false)
  const inputRef = useRef(null)
  const previewUrls = useRef(new Set())

  useEffect(() => {
    let errorTimeout
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ posts, displayName }))
    } catch {
      errorTimeout = window.setTimeout(() => {
        setStorageError('Your Community demo changes are visible now but could not be saved in this browser. Try smaller photos or remove older demo posts.')
      }, 0)
    }
    return () => window.clearTimeout(errorTimeout)
  }, [posts, displayName])

  useEffect(() => () => {
    previewUrls.current.forEach((url) => URL.revokeObjectURL(url))
    previewUrls.current.clear()
  }, [])

  function clearPhotos() {
    previewUrls.current.forEach((url) => URL.revokeObjectURL(url))
    previewUrls.current.clear()
    setPhotos([])
    if (inputRef.current) inputRef.current.value = ''
  }

  function selectPhotos(event) {
    const files = Array.from(event.target.files || [])
    setFormError('')
    if (files.length > maxPhotos) {
      setFormError(`Choose up to ${maxPhotos} outfit photos.`)
      event.target.value = ''
      return
    }
    if (files.some((file) => !allowedImageTypes.has(file.type))) {
      setFormError('Use JPG, PNG, WebP or GIF image files only.')
      event.target.value = ''
      return
    }
    if (files.some((file) => file.size > maxPhotoBytes)) {
      setFormError('Each photo must be 1 MB or smaller.')
      event.target.value = ''
      return
    }
    if (files.reduce((total, file) => total + file.size, 0) > maxTotalPhotoBytes) {
      setFormError('The selected photos must total 2 MB or less.')
      event.target.value = ''
      return
    }
    clearPhotos()
    const nextPhotos = files.map((file) => {
      const preview = URL.createObjectURL(file)
      previewUrls.current.add(preview)
      return { file, preview }
    })
    setPhotos(nextPhotos)
  }

  function removePhoto(preview) {
    URL.revokeObjectURL(preview)
    previewUrls.current.delete(preview)
    setPhotos((current) => current.filter((photo) => photo.preview !== preview))
    if (inputRef.current) inputRef.current.value = ''
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
    setPosting(true)
    setFormError('')
    try {
      const images = await Promise.all(photos.map(({ file }) => readFileAsDataUrl(file)))
      const newPost = {
        id: createId(),
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
      setPosts((current) => [newPost, ...current])
      setView('recent')
      setOccasionFilter('All occasions')
      setCaption('')
      setDesign('')
      setOccasion('')
      setRating(0)
      setOutfitConfirmed(false)
      setComposerOpen(false)
      clearPhotos()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not read the selected photos.')
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
    <div className="community-page">
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
            setComposerOpen((open) => !open)
            setFormError('')
          }}>
            {composerOpen ? 'Close form' : '＋ Share your outfit'}
          </button>
        </div>
      </section>

      {storageError && <p className="community-error" role="status">{storageError}</p>}

      {composerOpen && (
        <form className="community-composer" onSubmit={publishPost}>
          <div className="community-composer-heading">
            <div>
              <p className="eyebrow accent">Your style, your story</p>
              <h2>Share your outfit</h2>
            </div>
            <span>Demo post</span>
          </div>
          <label>
            Outfit photos <span>(required · up to {maxPhotos})</span>
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={selectPhotos} />
          </label>
          <p className="community-field-help">JPG, PNG, WebP or GIF · up to 1 MB each and 2 MB total. Photos stay in this browser demo.</p>
          {photos.length > 0 && (
            <div className="community-photo-previews" aria-label="Selected photo previews">
              {photos.map((photo) => (
                <figure key={photo.preview}>
                  <img src={photo.preview} alt={`Preview of ${photo.file.name}`} />
                  <button type="button" onClick={() => removePhoto(photo.preview)} aria-label={`Remove ${photo.file.name}`}>Remove</button>
                </figure>
              ))}
            </div>
          )}
          <label>
            Caption <span>(required)</span>
            <textarea value={caption} maxLength={600} rows={4} onChange={(event) => setCaption(event.target.value)} placeholder="Tell us about the outfit and how you styled it..." />
          </label>
          <div className="community-composer-fields">
            <label>
              Design or outfit <span>(optional)</span>
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
            <input type="checkbox" checked={outfitConfirmed} onChange={(event) => setOutfitConfirmed(event.target.checked)} />
            <span>I confirm this is a Mop&apos;s Couture outfit I own and have worn, and I have permission to use these photos in this demo.</span>
          </label>
          <p className="community-field-help">This is a demo-only confirmation. Your photos are stored in this browser and are not uploaded or shared.</p>
          {formError && <p className="community-error" role="alert">{formError}</p>}
          <div className="community-composer-actions">
            <button className="community-publish-button" type="submit" disabled={posting}>{posting ? 'Sharing…' : 'Publish demo post'}</button>
            <button className="community-cancel-button" type="button" onClick={() => {
              clearPhotos()
              setCaption('')
              setDesign('')
              setOccasion('')
              setRating(0)
              setOutfitConfirmed(false)
              setFormError('')
              setComposerOpen(false)
            }}>Cancel</button>
          </div>
        </form>
      )}

      <section className="community-posts-section" aria-label={`${view} community posts`}>
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
                    <img key={`${post.id}-${index}`} src={image} alt={`Demo outfit photo ${index + 1}${post.design ? ` for ${post.design}` : ''}`} loading="lazy" />
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
      </section>
    </div>
  )
}
