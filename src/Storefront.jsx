
import { useEffect, useRef, useState } from 'react'
import heroImage from './assets/mops-couture-hero.png'
import CommunityFeed from './CommunityFeed.jsx'
import CustomCoutureEnquiry from './CustomCoutureEnquiry.jsx'
import './App.css'

const whatsappNumber = '2348027340474'
const bagStorageKey = 'mops-couture-demo-bag'
const preferencesStorageKey = 'mops-couture-visitor-preferences'
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
const routes = {
  '/': 'Home',
  '/ready-to-wear': 'Ready-to-Wear',
  '/custom-couture': 'Custom Couture',
  '/gallery': 'Gallery',
  '/community': 'Community',
  '/our-story': 'Our Story',
  '/contact': 'Contact',
  '/bag': 'Shopping Bag',
  '/settings': 'Visitor Preferences',
  '/settings/account': 'Account',
  '/settings/account/profile': 'Profile & Sign In',
  '/settings/account/information': 'Account Information',
  '/settings/account/security': 'Password & Security',
  '/settings/account/addresses': 'Saved Addresses',
  '/settings/account/designs': 'Saved Designs',
  '/settings/preferences': 'Shopping Preferences',
  '/settings/accessibility': 'Accessibility',
  '/settings/privacy': 'Privacy & Data',
  '/settings/help': 'Help & Contact',
  '/settings/terms': 'Terms & Policies',
  '/terms': 'Website Terms of Service',
  '/terms/custom-couture': 'Custom Couture Terms',
  '/privacy': 'Privacy Notice',
  '/admin/login': 'Owner Sign In',
  '/admin': 'Owner Dashboard',
}
const tracks = [
  {
    title: 'La La La — Young Jonn ft. Rema',
    src: '/music/Young_John_ft_Rema_LaLaLa_9595_AllNaijaMusic.mp3',
  },
  {
    title: '2Factor — Young Jonn ft. Asake & Focalistic',
    src: '/music/Young_John_ft_Asake_and_Focalistic_2Factor_9646_AllNaijaMusic.mp3',
  },
  {
    title: 'Worship — Asake ft. DJ Snake',
    src: '/music/Asake_ft_Dj_snake_Worship_6809_AllNaijaMusic.mp3',
  },
  {
    title: 'Many People — Adekunle Gold',
    src: '/music/Adekunle_Gold_Many_People_3568_AllNaijaMusic.mp3',
  },
  {
    title: 'A1 — Shoday ft. Kizz Daniel',
    src: '/music/Shoday_Ft_Kizz_Daniel_A1_7188_AllNaijaMusic.mp3',
  },
  {
    title: 'WAF — FOLA',
    src: '/music/FOLA_-_waf-9jastarsmusic.com.ng.mp3',
  },
  {
    title: 'B4 B4 — Davido ft. Mayorkun & Fola',
    src: '/music/Davido_ft_Mayorkun__Fola_B4_B4_8118_AllNaijaMusic.mp3',
  },
  {
    title: 'Nakupenda — Davido, Scotts Maphuma, Shoday, TxC, Al Xapo & Zlatan',
    src: '/music/Davido-feat-Scotts-Maphuma-Shoday-And-TxC-Al-Xapo-Zlatan-Nakupenda-(CeeNaija.com).mp3',
  },
  {
    title: 'Rora — Asake',
    src: '/music/Asake-Rora.mp3',
  },
  {
    title: 'MCBH — Asake',
    src: '/music/Asake-MCBH-(XclusiveRocks.com).mp3',
  },
  {
    title: 'Forgiveness — Asake',
    src: '/music/Asake-Forgiveness.mp3',
  },
]

function shuffleTrackIndices(previousOrder) {
  const shuffled = tracks.map((_, index) => index)
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const current = shuffled[index]
    shuffled[index] = shuffled[swapIndex]
    shuffled[swapIndex] = current
  }
  if (previousOrder?.every((trackIndex, index) => trackIndex === shuffled[index])) {
    shuffled.push(shuffled.shift())
  }
  return shuffled
}

function getPath() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  return routes[path] ? path : '/not-found'
}

function readPreferences() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(preferencesStorageKey) || '{}')
    return {
      preferences: {
        reduceMotion:
          typeof saved.reduceMotion === 'boolean'
            ? saved.reduceMotion
            : window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      },
      error: '',
    }
  } catch {
    return {
      preferences: { reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches },
      error: 'Saved accessibility preference could not be read from this browser.',
    }
  }
}

const collections = [
  {
    title: 'Ready-to-Wear',
    description: 'Wax-print silhouettes and expressive everyday style.',
    image:
      'https://images.unsplash.com/photo-1628144029346-8a98676311b6?auto=format&fit=crop&w=900&q=85',
  },
  {
    title: 'Custom Couture',
    description: 'A considered process, from fabric choice to final fit.',
    image:
      'https://images.unsplash.com/photo-1655682614757-a9a33fa45c93?auto=format&fit=crop&w=900&q=85',
  },
  {
    title: 'Occasion Wear',
    description: 'Coordinated print, headwrap and occasion styling.',
    image:
      'https://images.unsplash.com/photo-1661332306744-70f9ed1a7f40?auto=format&fit=crop&w=900&q=85',
  },
  {
    title: 'African Styles',
    description: 'Vivid wax-print fabric and contemporary West African dress.',
    image:
      'https://images.unsplash.com/photo-1696962678565-bee84e6b9cb6?auto=format&fit=crop&w=900&q=85',
  },
]

function createSampleProduct(id, name, category, style, price, description, image, colors, sourceUrl = '') {
  return {
    id,
    name,
    category,
    style,
    price,
    description,
    image,
    colors,
    sourceUrl,
    sizes,
  }
}

const products = [
  createSampleProduct(
    'ankara-two-piece', 'Ankara Two-Piece', 'Ankara', 'Two-Piece', 185000,
    'Illustrative wax-print co-ord styling reference.',
    'https://images.unsplash.com/photo-1628144029346-8a98676311b6?auto=format&fit=crop&w=700&q=85',
    ['Multicolour', 'Burgundy', 'Green'],
  ),
  createSampleProduct(
    'aso-oke-occasionwear', 'Aso-Oke Occasion Look', 'Aso-Oke', 'Occasion Set', 210000,
    'Illustrative Nigerian occasionwear reference with coordinated traditional styling.',
    'https://images.unsplash.com/photo-1661332306744-70f9ed1a7f40?auto=format&fit=crop&w=700&q=85',
    ['Print Mix', 'Burgundy', 'Gold'],
  ),
  createSampleProduct(
    'wax-print-dress', 'Wax-Print Dress', 'Wax-Print', 'Gown', 320000,
    'Illustrative printed dress styling with a coordinated headwrap reference.',
    'https://images.unsplash.com/photo-1696962678565-bee84e6b9cb6?auto=format&fit=crop&w=700&q=85',
    ['Green Print', 'Multicolour', 'Gold'],
  ),
  createSampleProduct(
    'ankara-fabric-look', 'Ankara Fabric Look', 'Ankara', 'Two-Piece', 240000,
    'A fabric-led styling concept. The editorial image is a Nigerian traditional-attire reference, not a confirmed product or fabric.',
    'https://images.pexels.com/photos/35069469/pexels-photo-35069469/free-photo-of-traditional-nigerian-attire-portrait-featuring-four-adults.jpeg?auto=compress&w=1200',
    ['Multicolour', 'Blue Print', 'Gold'],
    'https://www.pexels.com/photo/traditional-nigerian-attire-portrait-featuring-four-adults-35069469/',
  ),
  createSampleProduct(
    'burgundy-bridal-look', 'Burgundy Bridal Look', 'Occasion Wear', 'Gown', 360000,
    'A Nigerian bridal styling reference in a rich burgundy palette.',
    'https://images.pexels.com/photos/36997663/pexels-photo-36997663/free-photo-of-traditional-nigerian-bridal-portrait-in-red-attire.jpeg?auto=compress&w=1200',
    ['Burgundy', 'Gold', 'Ivory'],
    'https://www.pexels.com/photo/traditional-nigerian-bridal-portrait-in-red-attire-36997663/',
  ),
  createSampleProduct(
    'kano-evening-aso-ebi', 'Aso-Ebi Evening Pairing', 'Aso-Ebi', 'Occasion Set', 295000,
    'An evening occasionwear reference featuring coordinated West African dress.',
    'https://images.pexels.com/photos/39883810/pexels-photo-39883810/free-photo-of-elegant-african-fashion-at-night-in-kano.jpeg?auto=compress&w=1200',
    ['Burgundy', 'Multicolour', 'Gold'],
    'https://www.pexels.com/photo/elegant-african-fashion-at-night-in-kano-39883810/',
  ),
  createSampleProduct(
    'traditional-bridal-party', 'Traditional Bridal Party Style', 'Occasion Wear', 'Occasion Set', 340000,
    'A ceremony styling reference; garments and availability are not verified.',
    'https://images.pexels.com/photos/15234465/pexels-photo-15234465/free-photo-of-bride-lead-by-two-men-wearing-traditional-clothes.jpeg?cs=tinysrgb&dpr=1&w=500',
    ['Print Mix', 'Burgundy', 'Gold'],
    'https://www.pexels.com/photo/bride-lead-by-two-men-wearing-traditional-clothes-15234465/',
  ),
  createSampleProduct(
    'heritage-robe-reference', 'Heritage Robe Styling', 'Traditional Attire', 'Robe', 225000,
    'A robe and textile display reference inspired by cultural dress.',
    'https://images.pexels.com/photos/35619401/pexels-photo-35619401/free-photo-of-traditional-african-attire-with-drum-display.jpeg?cs=tinysrgb&dpr=1&w=500',
    ['Gold', 'Multicolour', 'Green'],
    'https://www.pexels.com/photo/traditional-african-attire-with-drum-display-35619401/',
  ),
  createSampleProduct(
    'paired-traditional-gowns', 'Paired Traditional Gowns', 'Traditional Attire', 'Gown', 275000,
    'Two-look reference for coordinated traditional dressing.',
    'https://images.pexels.com/photos/17273216/pexels-photo-17273216/free-photo-of-women-in-traditional-tribal-clothing.jpeg?cs=tinysrgb&dpr=1&w=500',
    ['Multicolour', 'Green', 'Gold'],
    'https://www.pexels.com/photo/women-in-traditional-tribal-clothing-17273216/',
  ),
  createSampleProduct(
    'celebration-couple-attire', 'Celebration Couple Attire', 'Occasion Wear', 'Occasion Set', 310000,
    'Coordinated celebration looks as a West African eventwear reference.',
    'https://images.pexels.com/photos/31914904/pexels-photo-31914904/free-photo-of-elegant-african-attire-at-a-celebratory-event.jpeg?cs=tinysrgb&dpr=1&w=500',
    ['Burgundy', 'Gold', 'Ivory'],
    'https://www.pexels.com/photo/elegant-african-attire-at-a-celebratory-event-31914904/',
  ),
  createSampleProduct(
    'dance-inspired-wrapper', 'Dance-Inspired Wrapper Set', 'Traditional Attire', 'Wrapper Set', 195000,
    'A vibrant traditional dancewear reference, presented as a styling concept.',
    'https://images.pexels.com/photos/39587423/pexels-photo-39587423/free-photo-of-vibrant-traditional-dance-at-indoor-celebration.jpeg?cs=tinysrgb&dpr=1&w=500',
    ['Multicolour', 'Gold', 'Green'],
    'https://www.pexels.com/photo/vibrant-traditional-dance-at-indoor-celebration-39587423/',
  ),
  createSampleProduct(
    'colorful-street-gown', 'Colourful Street Gown', 'Traditional Attire', 'Gown', 230000,
    'A contemporary traditional-dress reference styled for a city setting.',
    'https://images.pexels.com/photos/10698019/pexels-photo-10698019.jpeg?auto=compress&w=1200',
    ['Multicolour', 'Green', 'Burgundy'],
    'https://www.pexels.com/photo/smiling-woman-in-traditional-clothes-on-street-10698019/',
  ),
  createSampleProduct(
    'two-woman-aso-ebi', 'Aso-Ebi Duo Styling', 'Aso-Ebi', 'Occasion Set', 285000,
    'A paired traditional-attire reference for coordinated event dressing.',
    'https://images.pexels.com/photos/32655416/pexels-photo-32655416/free-photo-of-traditional-african-attire-portrait-of-two-women.jpeg?cs=tinysrgb&dpr=1&w=500',
    ['Burgundy', 'Multicolour', 'Gold'],
    'https://www.pexels.com/photo/traditional-african-attire-portrait-of-two-women-32655416/',
  ),
  createSampleProduct(
    'turbans-and-gowns', 'Turbans and Traditional Gowns', 'Traditional Attire', 'Gown', 260000,
    'A group styling reference pairing flowing gowns with traditional headwear.',
    'https://images.pexels.com/photos/17273201/pexels-photo-17273201/free-photo-of-young-women-wearing-traditional-gowns-and-turbans.jpeg?cs=tinysrgb&dpr=1&w=500',
    ['Multicolour', 'Gold', 'Burgundy'],
    'https://www.pexels.com/photo/young-women-wearing-traditional-gowns-and-turbans-17273201/',
  ),
  createSampleProduct(
    'elegant-traditional-attire', 'Elegant Traditional Attire', 'Traditional Attire', 'Gown', 250000,
    'A portrait reference for a refined traditional outfit silhouette.',
    'https://images.pexels.com/photos/38400973/pexels-photo-38400973/free-photo-of-elegant-woman-in-traditional-african-attire.jpeg?cs=tinysrgb&dpr=1&w=500',
    ['Burgundy', 'Gold', 'Green'],
    'https://www.pexels.com/photo/elegant-woman-in-traditional-african-attire-38400973/',
  ),
  createSampleProduct(
    'sunset-occasion-gown', 'Sunset Occasion Gown', 'Occasion Wear', 'Gown', 330000,
    'A traditional occasionwear reference photographed in warm evening light.',
    'https://images.pexels.com/photos/32106845/pexels-photo-32106845/free-photo-of-vibrant-traditional-attire-in-sunset-light.jpeg?cs=tinysrgb&dpr=1&w=500',
    ['Gold', 'Multicolour', 'Burgundy'],
    'https://www.pexels.com/photo/vibrant-traditional-attire-in-sunset-light-32106845/',
  ),
  createSampleProduct(
    'fulani-cultural-look', 'Fulani Cultural Look', 'Traditional Attire', 'Gown', 215000,
    'A traditional Fulani attire reference; not a verified Mop’s Couture creation.',
    'https://images.pexels.com/photos/34735501/pexels-photo-34735501/free-photo-of-fulani-cultural-parade-in-traditional-attire.jpeg?cs=tinysrgb&dpr=1&w=500',
    ['Multicolour', 'Gold', 'Green'],
    'https://www.pexels.com/photo/fulani-cultural-parade-in-traditional-attire-34735501/',
  ),
  createSampleProduct(
    'nigerian-traditional-gown', 'Nigerian Traditional Gown', 'Traditional Attire', 'Gown', 280000,
    'A Nigerian traditional-attire reference for a flowing gown concept.',
    'https://images.pexels.com/photos/36001753/pexels-photo-36001753/free-photo-of-nigerian-woman-in-traditional-attire-outdoors.jpeg?cs=tinysrgb&dpr=1&w=500',
    ['Burgundy', 'Green', 'Gold'],
    'https://www.pexels.com/photo/nigerian-woman-in-traditional-attire-outdoors-36001753/',
  ),
  createSampleProduct(
    'festival-celebration-set', 'Festival Celebration Set', 'Occasion Wear', 'Occasion Set', 245000,
    'A colourful cultural celebration reference for coordinated occasion styling.',
    'https://images.pexels.com/photos/33687423/pexels-photo-33687423/free-photo-of-traditional-cultural-festival-with-colorful-attire.jpeg?cs=tinysrgb&dpr=1&w=500',
    ['Multicolour', 'Green', 'Gold'],
    'https://www.pexels.com/photo/traditional-cultural-festival-with-colorful-attire-33687423/',
  ),
  createSampleProduct(
    'printed-fabric-drape', 'Printed Fabric Drape Look', 'Wax-Print', 'Wrap Dress', 205000,
    'A fabric-forward African dress reference with a flowing drape.',
    'https://images.pexels.com/photos/33536933/pexels-photo-33536933/free-photo-of-traditional-african-dress-in-outdoor-setting.jpeg?cs=tinysrgb&dpr=1&w=500',
    ['Multicolour', 'Green', 'Gold'],
    'https://www.pexels.com/photo/traditional-african-dress-in-outdoor-setting-33536933/',
  ),
  createSampleProduct(
    'twin-occasion-gowns', 'Twin Occasion Gown Styling', 'Occasion Wear', 'Gown', 300000,
    'A coordinated pair of traditional gowns as an eventwear reference.',
    'https://images.pexels.com/photos/17273203/pexels-photo-17273203/free-photo-of-young-women-wearing-traditional-gowns-and-turbans.jpeg?cs=tinysrgb&dpr=1&w=500',
    ['Burgundy', 'Multicolour', 'Gold'],
    'https://www.pexels.com/photo/young-women-wearing-traditional-gowns-and-turbans-17273203/',
  ),
  createSampleProduct(
    'colorful-traditional-look', 'Colourful Traditional Look', 'Traditional Attire', 'Gown', 235000,
    'A vibrant traditional look reference for an expressive occasion silhouette.',
    'https://images.pexels.com/photos/35829148/pexels-photo-35829148/free-photo-of-woman-in-traditional-colorful-attire-outdoors.jpeg?cs=tinysrgb&dpr=1&w=500',
    ['Multicolour', 'Burgundy', 'Green'],
    'https://www.pexels.com/photo/woman-in-traditional-colorful-attire-outdoors-35829148/',
  ),
  createSampleProduct(
    'headwrap-occasion-look', 'Headwrap Occasion Look', 'Occasion Wear', 'Headwrap Set', 220000,
    'A vivid African-fashion reference pairing occasion clothing and headwrap styling.',
    'https://images.pexels.com/photos/34584329/pexels-photo-34584329/free-photo-of-vibrant-african-fashion-with-headwrap.jpeg?cs=tinysrgb&dpr=1&w=500',
    ['Multicolour', 'Burgundy', 'Gold'],
    'https://www.pexels.com/photo/vibrant-african-fashion-with-headwrap-34584329/',
  ),
  createSampleProduct(
    'nigerian-gele-coordination', 'Nigerian Gele Coordination', 'Aso-Ebi', 'Headwrap Set', 275000,
    'A Nigerian group-style reference for coordinated traditional outfits and headwraps.',
    'https://images.pexels.com/photos/38012587/pexels-photo-38012587/free-photo-of-traditional-nigerian-women-with-musical-instrument.jpeg?cs=tinysrgb&dpr=1&w=500',
    ['Multicolour', 'Gold', 'Burgundy'],
    'https://www.pexels.com/photo/traditional-nigerian-women-with-musical-instrument-38012587/',
  ),
  createSampleProduct(
    'mens-traditional-agbada', 'Men’s Traditional Agbada', 'Traditional Attire', 'Agbada', 315000,
    'A men’s traditional African attire reference with a relaxed formal silhouette.',
    'https://images.pexels.com/photos/36029405/pexels-photo-36029405/free-photo-of-man-in-traditional-african-attire-outdoors.jpeg?cs=tinysrgb&dpr=1&w=500',
    ['Ivory', 'Gold', 'Burgundy'],
    'https://www.pexels.com/photo/man-in-traditional-african-attire-outdoors-36029405/',
  ),
  createSampleProduct(
    'mens-occasion-kaftan', 'Men’s Occasion Kaftan', 'Traditional Attire', 'Kaftan', 265000,
    'A men’s traditional attire reference for a clean, contemporary occasion look.',
    'https://images.pexels.com/photos/29625972/pexels-photo-29625972/free-photo-of-stylish-man-in-traditional-african-attire-smiling.jpeg?cs=tinysrgb&dpr=1&w=500',
    ['Green', 'Burgundy', 'Gold'],
    'https://www.pexels.com/photo/stylish-man-in-traditional-african-attire-smiling-29625972/',
  ),
  createSampleProduct(
    'adire-inspired-gown', 'Adire-Inspired Gown', 'Adire', 'Gown', 255000,
    'An indigo-led traditional dress reference inspired by Nigerian adire textiles.',
    'https://images.unsplash.com/photo-1655682614757-a9a33fa45c93?auto=format&fit=crop&w=700&q=85',
    ['Indigo', 'Blue Print', 'Ivory'],
  ),
]

const productsById = new Map(products.map((product) => [product.id, product]))
const money = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
})

function isValidBagItem(item) {
  const product = productsById.get(item?.productId)
  return (
    product &&
    sizes.includes(item.size) &&
    product.colors.includes(item.color) &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0
  )
}

function readBag() {
  try {
    const storedBag = window.localStorage.getItem(bagStorageKey)
    if (!storedBag) return { items: [], error: '' }

    const parsedBag = JSON.parse(storedBag)
    if (!Array.isArray(parsedBag)) {
      return { items: [], error: 'Saved bag data was invalid and has been cleared.' }
    }

    const items = parsedBag.filter(isValidBagItem)
    return {
      items,
      error:
        items.length === parsedBag.length
          ? ''
          : 'Some saved bag items were invalid and have been excluded.',
    }
  } catch {
    return { items: [], error: 'Saved bag data could not be read. A new bag has been started.' }
  }
}

function whatsappUrl(message) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 8h14l1 13H4L5 8Z" />
      <path d="M9 9V6a3 3 0 0 1 6 0v3" />
    </svg>
  )
}

function BackgroundMusicPlayer() {
  const [playlist, setPlaylist] = useState(() => ({
    order: shuffleTrackIndices(),
    position: 0,
  }))
  const playlistRef = useRef(playlist)
  const audioRef = useRef(null)
  const userActivated = useRef(false)
  const playbackRequested = useRef(false)
  const failedTracks = useRef(new Set())

  const trackIndex = playlist.order[playlist.position]

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || tracks.length === 0) return undefined

    const startAfterGesture = () => {
      if (playbackRequested.current || !audio.paused) return
      userActivated.current = true
      audio.volume = 0.25
      audio.play().then(
        () => {
          playbackRequested.current = true
        },
        () => {
          if (!audio.error) playbackRequested.current = false
        },
      )
    }

    const handleKeyDown = (event) => {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) startAfterGesture()
    }
    document.addEventListener('pointerdown', startAfterGesture, true)
    document.addEventListener('keydown', handleKeyDown, true)
    return () => {
      document.removeEventListener('pointerdown', startAfterGesture, true)
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !playbackRequested.current || tracks.length === 0) return
    audio.load()
    audio.play().catch(() => {
      playbackRequested.current = false
    })
  }, [trackIndex])

  if (tracks.length === 0) return null

  function advancePlaylist() {
    if (failedTracks.current.size >= tracks.length) {
      playbackRequested.current = false
      return
    }

    let order = playlistRef.current.order
    let position = playlistRef.current.position + 1
    if (position >= order.length) {
      order = shuffleTrackIndices(order)
      position = 0
    }

    let checked = 0
    while (failedTracks.current.has(order[position]) && checked < tracks.length) {
      position += 1
      checked += 1
      if (position >= order.length) {
        order = shuffleTrackIndices(order)
        position = 0
      }
    }

    if (checked >= tracks.length) {
      playbackRequested.current = false
      return
    }

    const nextPlaylist = { order, position }
    playlistRef.current = nextPlaylist
    setPlaylist(nextPlaylist)
  }

  function skipUnavailableTrack() {
    failedTracks.current.add(trackIndex)
    playbackRequested.current = userActivated.current
    advancePlaylist()
  }

  return (
    <audio
      ref={audioRef}
      src={tracks[trackIndex].src}
      preload="none"
      hidden
      aria-hidden="true"
      onEnded={advancePlaylist}
      onError={skipUnavailableTrack}
    />
  )
}

function SettingsPage({
  pathname,
  itemCount,
  preferences,
  preferenceError,
  preferenceStatus,
  updatePreference,
  navigate,
  whatsappUrl,
}) {
  const accountLinks = [
    ['/settings/account/profile', 'Profile & Sign In', 'Customer sign-in and profile tools are not connected.'],
    ['/settings/account/information', 'Account Information', 'No customer account information is held by this site.'],
    ['/settings/account/security', 'Password & Security', 'No password or sign-in system is configured.'],
    ['/settings/account/addresses', 'Saved Addresses', 'Address book functionality is not configured.'],
    ['/settings/account/designs', 'Saved Designs / Wishlist', 'Saved designs are not synced or saved by this site.'],
  ]

  function pageLink(path, title, description) {
    return (
      <a className="settings-link-card" href={path} onClick={navigate} key={path}>
        <span>
          <strong>{title}</strong>
          <small>{description}</small>
        </span>
        <b aria-hidden="true">→</b>
      </a>
    )
  }

  function accountStatus(title, description) {
    return (
      <section className="settings-content-panel">
        <p className="eyebrow accent">Account · planned</p>
        <h2>{title}</h2>
        <p>{description}</p>
        <p>No customer authentication service is connected. This page does not create an account or collect account credentials.</p>
        <a className="text-link" href="/settings/account" onClick={navigate}>Back to Account</a>
      </section>
    )
  }

  return (
    <section className="settings-section" aria-labelledby="settings-heading">
      <p className="eyebrow accent">Your preferences</p>
      <h1 id="settings-heading">
        {pathname === '/settings' ? 'Settings' : routes[pathname] || 'Settings'}
      </h1>
      <p className="section-note">
        Manage supported local preferences and find account, privacy and help information.
      </p>

      {pathname === '/settings' && (
        <div className="settings-link-grid">
          {pageLink('/settings/account', 'Account', 'Profile, sign-in and account options')}
          {pageLink('/settings/preferences', 'Your Preferences', 'Shopping bag and storefront information')}
          {pageLink('/settings/accessibility', 'Accessibility', 'Reduced-motion preference')}
          {pageLink('/settings/privacy', 'Privacy & Data', 'What this site stores and does not store')}
          {pageLink('/settings/help', 'Help & Contact', 'Contact channels and enquiry guidance')}
          {pageLink('/settings/terms', 'Terms & Policies', 'Website and custom enquiry information')}
        </div>
      )}

      {pathname === '/settings/account' && (
        <div className="settings-link-grid account-settings-grid">
          {accountLinks.map(([path, title, description]) => pageLink(path, title, description))}
          <p className="settings-notice">
            Authentication is not connected yet. No account or personal profile details are stored by this site.
          </p>
        </div>
      )}

      {pathname.startsWith('/settings/account/') && accountStatus(
        routes[pathname],
        accountLinks.find(([path]) => path === pathname)?.[2] || 'This account feature is not configured.',
      )}

      {pathname === '/settings/preferences' && (
        <section className="settings-content-panel">
          <p className="eyebrow accent">Shopping</p>
          <h2>Your shopping preferences</h2>
          <p>The current demo bag has <strong>{itemCount}</strong> {itemCount === 1 ? 'item' : 'items'} and is stored in this browser&apos;s local storage. It is not connected to an account or synced remotely.</p>
          <p>The storefront currency is Nigerian naira (NGN). Currency selection, checkout preferences, and saved style profiles are not implemented.</p>
          <a className="text-link" href="/bag" onClick={navigate}>View your bag</a>
        </section>
      )}

      {pathname === '/settings/accessibility' && (
        <section className="settings-content-panel">
          <p className="eyebrow accent">Accessibility</p>
          <h2>Motion preference</h2>
          <p>The website respects your operating-system reduced-motion setting. You may also reduce decorative animation for this browser.</p>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={preferences.reduceMotion}
              onChange={(event) => updatePreference('reduceMotion', event.target.checked)}
            />
            <span>Reduce decorative motion on this device</span>
          </label>
          {preferenceError && <p className="settings-feedback error" role="status">{preferenceError}</p>}
          {preferenceStatus && <p className="settings-feedback" role="status">{preferenceStatus}</p>}
          <p className="settings-note">This preference is saved locally in this browser, not to an online account.</p>
        </section>
      )}

      {pathname === '/settings/privacy' && (
        <section className="settings-content-panel">
          <p className="eyebrow accent">Privacy &amp; Data</p>
          <h2>How this demo handles information</h2>
          <ul className="settings-policy-list">
            <li>The shopping bag and reduced-motion preference are stored in browser local storage on this device.</li>
            <li>There is no customer account, remote enquiry database, analytics service, or advertising tracker configured in this project.</li>
            <li>The couture enquiry form opens a WhatsApp message only after you review and choose to continue. This website does not save the enquiry or consent record.</li>
            <li>WhatsApp processes messages according to its own terms and privacy notice. Do not include information you do not wish to share there.</li>
            <li>Remote data export, deletion, and synchronization are not available because no customer backend is connected.</li>
          </ul>
          <a className="text-link" href="/privacy" onClick={navigate}>Read the Privacy Notice</a>
        </section>
      )}

      {pathname === '/settings/help' && (
        <section className="settings-content-panel">
          <p className="eyebrow accent">Help &amp; Contact</p>
          <h2>How can we help?</h2>
          <p>For custom outfit questions, share your design details through the custom enquiry page. Product selections can be reviewed in your bag.</p>
          <div className="settings-help-links">
            <a className="text-link" href="/contact" onClick={navigate}>Visit Contact</a>
            <a className="text-link" href="/custom-couture" onClick={navigate}>Custom Couture enquiry</a>
            <a className="text-link" href="/bag" onClick={navigate}>Shopping bag</a>
            <a href={whatsappUrl('Hello Mop’s Couture, I’d like help with an enquiry.')} target="_blank" rel="noreferrer">
              WhatsApp · +234 802 734 0474
            </a>
          </div>
        </section>
      )}

      {pathname === '/settings/terms' && <PolicyContent path="/terms" navigate={navigate} />}
    </section>
  )
}

function PolicyContent({ path, navigate }) {
  const isCustomTerms = path === '/terms/custom-couture'
  const isPrivacy = path === '/privacy'
  return (
    <section className="settings-content-panel policy-content">
      <p className="eyebrow accent">Terms &amp; Policies</p>
      <h2>{isPrivacy ? 'Privacy Notice' : isCustomTerms ? 'Custom Couture Terms' : 'Website Terms of Service'}</h2>
      {isPrivacy ? (
        <>
          <p>This demo site stores a shopping bag and a reduced-motion preference in your local browser only. It has no customer account, remote enquiry storage, analytics, or advertising tracking configured.</p>
          <p>If you choose to continue an enquiry, the site prepares a WhatsApp message. You decide whether to send it; the site does not keep a copy. WhatsApp handles any message you send under its own terms and privacy notice.</p>
          <p>This website currently has no remote data export, deletion, or account-management feature. The owner should review and publish a complete privacy notice before collecting customer information through a connected service.</p>
        </>
      ) : (
        <>
          <p>Catalogue products and prices on this website are illustrative demo content. They do not represent confirmed stock, an offer to sell, or an agreed price. Confirm product details, pricing, availability, and any arrangements directly with Mop&apos;s Couture.</p>
          {isCustomTerms && <p>Custom design, fabric, colour, measurements, price, deposits, production timing, delivery and fitting details must be reviewed and agreed with the studio before production. A selected date is a preference only and is not an appointment or delivery commitment.</p>}
          <p>Any applicable deposit, cancellation, alteration, refund and delivery terms should be clearly communicated and agreed before payment. Nothing in this summary is intended to exclude consumer rights that apply by law.</p>
          <p>Sending an enquiry does not confirm an order. This website provides no online payment or checkout.</p>
          <p className="settings-note">These informational terms are not legal advice and require review by the business owner and an appropriately qualified Nigerian legal professional before production use.</p>
        </>
      )}
      <div className="settings-help-links">
        {!isPrivacy && <a className="text-link" href="/terms/custom-couture" onClick={navigate}>Custom Couture Terms</a>}
        {!isPrivacy && <a className="text-link" href="/terms" onClick={navigate}>Website Terms of Service</a>}
        {!isPrivacy && <a className="text-link" href="/privacy" onClick={navigate}>Privacy Notice</a>}
        {isPrivacy && <a className="text-link" href="/settings/privacy" onClick={navigate}>Back to Privacy &amp; Data</a>}
      </div>
    </section>
  )
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [pathname, setPathname] = useState(getPath)
  const topbarRef = useRef(null)
  const menuToggleRef = useRef(null)
  const [bag, setBag] = useState(readBag)
  const [storageError, setStorageError] = useState(bag.error)
  const [preferences, setPreferences] = useState(() => readPreferences().preferences)
  const [preferenceError, setPreferenceError] = useState(() => readPreferences().error)
  const [preferenceStatus, setPreferenceStatus] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All styles')
  const [styleFilter, setStyleFilter] = useState('All silhouettes')
  const [colourFilter, setColourFilter] = useState('All colours')
  const [sizeFilter, setSizeFilter] = useState('All sizes')
  const [priceFilter, setPriceFilter] = useState('Any sample price')
  const [galleryPhoto, setGalleryPhoto] = useState(null)
  const galleryTriggerRef = useRef(null)
  const [recentlyAdded, setRecentlyAdded] = useState('')
  const [selectedOptions, setSelectedOptions] = useState(() =>
    Object.fromEntries(
      products.map((product) => [
        product.id,
        { size: 'M', color: product.colors[0] },
      ]),
    ),
  )

  useEffect(() => {
    const handlePopState = () => setPathname(getPath())
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    if (!window.location.hash) return undefined
    const targetId = decodeURIComponent(window.location.hash.slice(1))
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [pathname])

  useEffect(() => {
    if (!galleryPhoto) return undefined

    const closeOnEscape = (event) => {
      if (event.key !== 'Escape') return
      setGalleryPhoto(null)
      galleryTriggerRef.current?.focus()
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [galleryPhoto])

  useEffect(() => {
    if (!recentlyAdded) return undefined
    const timeout = window.setTimeout(() => setRecentlyAdded(''), 1400)
    return () => window.clearTimeout(timeout)
  }, [recentlyAdded])

  useEffect(() => {
    if (!menuOpen) return undefined

    const closeOnOutsideClick = (event) => {
      if (!topbarRef.current?.contains(event.target)) setMenuOpen(false)
    }
    const closeOnEscape = (event) => {
      if (event.key !== 'Escape') return
      setMenuOpen(false)
      menuToggleRef.current?.focus()
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [menuOpen])

  useEffect(() => {
    document.documentElement.toggleAttribute('data-reduce-motion', preferences.reduceMotion)
  }, [preferences.reduceMotion])

  function navigate(event) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) return
    const destination = new URL(event.currentTarget.href)
    if (destination.origin !== window.location.origin || !routes[destination.pathname]) return
    event.preventDefault()
    window.history.pushState({}, '', `${destination.pathname}${destination.hash}`)
    setPathname(destination.pathname)
    setMenuOpen(false)
    if (destination.hash) {
      document.getElementById(decodeURIComponent(destination.hash.slice(1)))?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  function updatePreference(name, value) {
    const updated = { ...preferences, [name]: value }
    setPreferences(updated)
    try {
      window.localStorage.setItem(preferencesStorageKey, JSON.stringify(updated))
      setPreferenceError('')
      setPreferenceStatus('Your accessibility preference is saved on this device.')
    } catch {
      setPreferenceStatus('')
      setPreferenceError('Visitor preferences could not be saved in this browser.')
    }
  }

  function updateBag(update) {
    const nextBag = update(bag)
    setBag(nextBag)
    try {
      window.localStorage.setItem(bagStorageKey, JSON.stringify(nextBag.items))
      setStorageError(nextBag.error)
    } catch {
      setStorageError('Your bag could not be saved in this browser. Keep this page open while enquiring.')
    }
  }

  const itemCount = bag.items.reduce((total, item) => total + item.quantity, 0)
  const subtotal = bag.items.reduce((total, item) => {
    const product = productsById.get(item.productId)
    return total + (product ? product.price * item.quantity : 0)
  }, 0)

  const isHome = pathname === '/'
  const isReadyToWear = pathname === '/ready-to-wear'
  const isGallery = pathname === '/gallery'
  const isCommunity = pathname === '/community'
  const isCustom = pathname === '/custom-couture'
  const isStory = pathname === '/our-story'
  const isContact = pathname === '/contact'
  const isBag = pathname === '/bag'
  const isSettings = pathname.startsWith('/settings')
  const isPolicy = pathname === '/terms' || pathname === '/terms/custom-couture' || pathname === '/privacy'
  const isAdminLogin = pathname === '/admin/login'
  const isAdmin = pathname === '/admin'
  const categories = [...new Set(products.map((product) => product.category))]
  const styles = [...new Set(products.map((product) => product.style))]
  const colours = [...new Set(products.flatMap((product) => product.colors))]
  const visibleProducts = products.filter((product) => {
    const searchText = `${product.name} ${product.category} ${product.style} ${product.description}`.toLowerCase()
    const matchesText = searchText.includes(search.trim().toLowerCase())
    const matchesCategory = category === 'All styles' || product.category === category
    const matchesStyle = styleFilter === 'All silhouettes' || product.style === styleFilter
    const matchesColour = colourFilter === 'All colours' || product.colors.includes(colourFilter)
    const matchesSize = sizeFilter === 'All sizes' || product.sizes.includes(sizeFilter)
    const matchesPrice = priceFilter === 'Any sample price' || product.price <= Number(priceFilter)
    return matchesText && matchesCategory && matchesStyle && matchesColour && matchesSize && matchesPrice
  })

  function clearCatalogueFilters() {
    setSearch('')
    setCategory('All styles')
    setStyleFilter('All silhouettes')
    setColourFilter('All colours')
    setSizeFilter('All sizes')
    setPriceFilter('Any sample price')
  }

  function closeGalleryPhoto() {
    setGalleryPhoto(null)
    galleryTriggerRef.current?.focus()
  }

  function updateOption(product, option, value) {
    setSelectedOptions((current) => ({
      ...current,
      [product.id]: {
        size: current[product.id]?.size || 'M',
        color: current[product.id]?.color || product.colors[0],
        [option]: value,
      },
    }))
  }

  function addToBag(product) {
    const option = selectedOptions[product.id] || { size: 'M', color: product.colors[0] }
    setRecentlyAdded(`${product.id}:${option.size}:${option.color}`)
    updateBag((current) => {
      const existing = current.items.find(
        (item) =>
          item.productId === product.id &&
          item.size === option.size &&
          item.color === option.color,
      )
      const items = existing
        ? current.items.map((item) =>
            item === existing ? { ...item, quantity: item.quantity + 1 } : item,
          )
        : [
            ...current.items,
            { productId: product.id, size: option.size, color: option.color, quantity: 1 },
          ]
      return { items, error: '' }
    })
  }

  function changeSelectedQuantity(product, option, amount) {
    updateBag((current) => {
      const selectedItem = current.items.find(
        (item) =>
          item.productId === product.id &&
          item.size === option.size &&
          item.color === option.color,
      )
      if (!selectedItem) return current

      const items = amount < 0 && selectedItem.quantity === 1
        ? current.items.filter((item) => item !== selectedItem)
        : current.items.map((item) =>
            item === selectedItem ? { ...item, quantity: item.quantity + amount } : item,
          )
      return { items, error: '' }
    })
  }

  function changeQuantity(item, amount) {
    updateBag((current) => ({
      ...current,
      error: '',
      items: current.items.map((entry) =>
        entry === item ? { ...entry, quantity: Math.max(1, entry.quantity + amount) } : entry,
      ),
    }))
  }

  function removeFromBag(item) {
    updateBag((current) => ({
      ...current,
      error: '',
      items: current.items.filter((entry) => entry !== item),
    }))
  }

  const bagMessage = [
    'Hello Mop’s Couture, I’d like to enquire about these demo catalogue selections:',
    ...bag.items.map((item) => {
      const product = productsById.get(item.productId)
      return `- ${product.name}, size ${item.size}, ${item.color}, quantity ${item.quantity}, ${money.format(product.price)} each, line total ${money.format(product.price * item.quantity)}`
    }),
    `Illustrative subtotal: ${money.format(subtotal)}. Please confirm availability and pricing.`,
  ].join('\n')

  return (
    <div className="page-shell">
      <header className="topbar" ref={topbarRef}>
        <a className="brand-lockup" href="/" onClick={navigate} aria-label="Mop's Couture home">
          <span className="brand-crest" aria-hidden="true">M</span>
          <span className="brand-wordmark">Mop&apos;s <i>Couture</i></span>
        </a>

        <button
          ref={menuToggleRef}
          type="button"
          className="menu-toggle"
          onClick={() => setMenuOpen((current) => !current)}
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <a href="/bag" className="header-bag-link" onClick={navigate} aria-label={`Shopping bag, ${itemCount} items`}>
          <BagIcon />
          <span>Bag</span>
          <span className="bag-count" aria-live="polite">{itemCount}</span>
        </a>

        <nav
          id="main-navigation"
          className={`site-nav ${menuOpen ? 'open' : ''}`}
          aria-label="Main navigation"
          aria-hidden={!menuOpen}
        >
          <a href="/" onClick={navigate}>Home</a>
          <a href="/ready-to-wear" onClick={navigate}>Ready-to-Wear</a>
          <a href="/custom-couture" onClick={navigate}>Custom Couture</a>
          <a href="/gallery" onClick={navigate}>Gallery</a>
          <a href="/community" onClick={navigate}>Community</a>
          <a href="/our-story" onClick={navigate}>Our Story</a>
          <a href="/contact" onClick={navigate}>Contact</a>
          <a href="/settings" onClick={navigate}>Settings</a>
        </nav>
      </header>

      <main>
        {isHome && <section className="hero-section" id="home">
          <div className="hero-copy">
            <p className="eyebrow">Nigerian couture · Made with intention</p>
            <h1>
              Elegance,
              <span> sewn in culture.</span>
            </h1>
            <p className="subtext">
              A celebration of African print, expressive occasion style, and the artistry of a considered fit.
            </p>
            <div className="hero-actions">
              <a href="/ready-to-wear" onClick={navigate} className="primary-button">Explore the collection</a>
              <a href="/contact" onClick={navigate} className="secondary-button">Contact us</a>
            </div>
            <div className="brand-tagline">Your Style, Our <span>Passion.</span></div>
          </div>
          <div className="hero-visual">
            <div className="image-frame">
              <img
                src={heroImage}
                alt="Mop’s Couture designer in her original black-and-gold promotional portrait"
                fetchPriority="high"
              />
            </div>
            <p className="hero-image-caption">The designer · Mop&apos;s Couture</p>
          </div>
        </section>}

        {isGallery && <div className="gallery-page">
          <section className="gallery-intro" aria-labelledby="gallery-heading">
            <p className="eyebrow accent">Mop&apos;s Couture · Visual journal</p>
            <h1 id="gallery-heading">The Gallery</h1>
            <p>Explore West African fashion references and a curated preview of demonstration styles. Editorial images are inspiration only; they are not confirmed Mop&apos;s Couture products or customer orders.</p>
          </section>

          <section className="gallery-section" aria-labelledby="lookbook-heading">
            <div className="gallery-section-heading">
              <div>
                <p className="eyebrow accent">01 · Editorial references</p>
                <h2 id="lookbook-heading">The Lookbook</h2>
              </div>
              <p>Open any image for a larger view. Reference photographs are not brand portfolio or product photography.</p>
            </div>
            <div className="lookbook-grid">
              {products.slice(0, 8).map((product, index) => (
                <button
                  className={`lookbook-photo lookbook-photo-${index + 1}`}
                  key={product.id}
                  type="button"
                  onClick={(event) => {
                    galleryTriggerRef.current = event.currentTarget
                    setGalleryPhoto(product)
                  }}
                  aria-label={`Enlarge reference image: ${product.name}`}
                >
                  <img src={product.image} alt={`${product.name} fashion reference`} loading="lazy" />
                  <span>{product.style} · editorial reference</span>
                </button>
              ))}
            </div>
          </section>

          <section className="gallery-section gallery-custom" aria-labelledby="custom-creations-heading">
            <div className="gallery-designer-photo">
              <img src={heroImage} alt="Mop's Couture designer in the original promotional portrait" loading="lazy" />
            </div>
            <div>
              <p className="eyebrow accent">02 · Made to your brief</p>
              <h2 id="custom-creations-heading">Custom Creations</h2>
              <p>The designer&apos;s portrait is genuine brand imagery. Verified photographs of completed custom outfits have not yet been supplied, so this page does not present stock references as Mop&apos;s Couture creations.</p>
              <a className="primary-button" href="/custom-couture" onClick={navigate}>Start a custom enquiry</a>
            </div>
          </section>

          <section className="gallery-section" aria-labelledby="customer-style-heading">
            <div className="gallery-section-heading">
              <div>
                <p className="eyebrow accent">03 · Shared with permission</p>
                <h2 id="customer-style-heading">Customer Style</h2>
              </div>
            </div>
            <div className="gallery-empty-state">
              <span aria-hidden="true">✥</span>
              <h3>Customer photographs will appear here</h3>
              <p>No customer images have been provided and approved for publication yet.</p>
            </div>
          </section>

          <section className="gallery-section" aria-labelledby="popular-designs-heading">
            <div className="gallery-section-heading">
              <div>
                <p className="eyebrow accent">04 · Curated demo edit</p>
                <h2 id="popular-designs-heading">Popular Designs</h2>
              </div>
              <p>Curated demonstration concepts, not sales or popularity rankings. Prices are illustrative.</p>
            </div>
            <div className="gallery-design-grid">
              {[products[0], products[1], products[2], products[17]].map((product) => (
                <article className="gallery-design-card" key={product.id}>
                  <img src={product.image} alt={`${product.name} illustrative style reference`} loading="lazy" />
                  <div>
                    <span>DEMO STYLE · NOT VERIFIED STOCK</span>
                    <h3>{product.name}</h3>
                    <p>{money.format(product.price)} <small>illustrative sample price</small></p>
                    <a href={`/ready-to-wear#${product.id}`} onClick={navigate}>View in Ready-to-Wear</a>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="gallery-section" aria-labelledby="reviews-heading">
            <div className="gallery-section-heading">
              <div>
                <p className="eyebrow accent">05 · Customer feedback</p>
                <h2 id="reviews-heading">Ratings &amp; Reviews</h2>
              </div>
            </div>
            <div className="gallery-empty-state">
              <span aria-hidden="true">♡</span>
              <h3>Verified reviews will appear here</h3>
              <p>No verified customer ratings or reviews have been supplied. No testimonials are being shown as real.</p>
            </div>
          </section>
        </div>}

        {isCommunity && <CommunityFeed />}

        {galleryPhoto && <div
          className="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Larger view: ${galleryPhoto.name}`}
          onClick={(event) => {
            if (event.target === event.currentTarget) closeGalleryPhoto()
          }}
        >
          <div className="gallery-lightbox-content">
            <button type="button" className="gallery-lightbox-close" onClick={closeGalleryPhoto} aria-label="Close image preview">×</button>
            <img src={galleryPhoto.image} alt={`${galleryPhoto.name} fashion reference`} />
            <p>{galleryPhoto.name} · Editorial reference only</p>
            {galleryPhoto.sourceUrl && <a href={galleryPhoto.sourceUrl} target="_blank" rel="noreferrer">View original photo source</a>}
          </div>
        </div>}

        {(isHome || isReadyToWear) && <section className="catalogue-section" id="shop" aria-labelledby="catalogue-heading">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow accent">{isHome ? 'A first look · Demonstration styles' : 'Illustrative edit · Not a live inventory'}</p>
              <h2 id="catalogue-heading">{isHome ? 'Ready-to-Wear Preview' : 'Ready-to-Wear Collection'}</h2>
            </div>
            <p className="section-note">
              {isHome
                ? 'Explore a small selection of illustrative African-inspired style concepts.'
                : 'Demonstration concepts, sample imagery and illustrative prices only. No actual product or stock is represented.'}
            </p>
          </div>
          {isReadyToWear && <div className="catalogue-filters" aria-label="Catalogue filters">
            <label>
              Search demo styles
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search styles" />
            </label>
            <label>
              Category
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                <option>All styles</option>
                {categories.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label>
              Silhouette
              <select value={styleFilter} onChange={(event) => setStyleFilter(event.target.value)}>
                <option>All silhouettes</option>
                {styles.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label>
              Colour
              <select value={colourFilter} onChange={(event) => setColourFilter(event.target.value)}>
                <option>All colours</option>
                {colours.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label>
              Sample size
              <select value={sizeFilter} onChange={(event) => setSizeFilter(event.target.value)}>
                <option>All sizes</option>
                {sizes.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label>
              Maximum illustrative price
              <select value={priceFilter} onChange={(event) => setPriceFilter(event.target.value)}>
                <option>Any sample price</option>
                <option value="200000">Up to ₦200,000</option>
                <option value="250000">Up to ₦250,000</option>
                <option value="300000">Up to ₦300,000</option>
                <option value="350000">Up to ₦350,000</option>
              </select>
            </label>
            <div className="catalogue-filter-summary">
              <p aria-live="polite">Showing {visibleProducts.length} of {products.length} demo styles</p>
              <button type="button" onClick={clearCatalogueFilters}>Clear filters</button>
            </div>
          </div>}
          {isReadyToWear && <p className="catalogue-image-note">
            These stock/editorial reference photographs illustrate style direction; they do not depict confirmed Mop&apos;s Couture products or stock.
          </p>}
          <div className="product-grid">
            {(isReadyToWear ? visibleProducts : products.slice(0, 2)).map((product) => {
              const option = selectedOptions[product.id] || { size: 'M', color: product.colors[0] }
              const selectionKey = `${product.id}:${option.size}:${option.color}`
              const selectedBagItem = bag.items.find(
                (item) =>
                  item.productId === product.id &&
                  item.size === option.size &&
                  item.color === option.color,
              )
              const enquiryQuantity = selectedBagItem?.quantity ?? 1
              const productMessage = [
                `Hello Mop’s Couture, I’d like to enquire about the demo style "${product.name}".`,
                `Style: ${product.style} · ${product.category}`,
                `Sample selection: size ${option.size}, ${option.color}, quantity ${enquiryQuantity}`,
                `Illustrative price: ${money.format(product.price)} each · line total ${money.format(product.price * enquiryQuantity)}`,
                'Please confirm whether a similar design can be made and advise current pricing and availability.',
              ].join('\n')
              return (
                <article className="product-card" id={product.id} key={product.id}>
                  <img src={product.image} alt={`${product.name} African-fashion editorial reference image; not a confirmed product`} loading="lazy" />
                  <div className="product-body">
                    <span className="demo-label">Demo concept · Reference photo · Not verified stock</span>
                    <div className="product-meta">
                      <h3>{product.name}</h3>
                      <span>{money.format(product.price)} <small>illustrative</small></span>
                    </div>
                    <p className="product-style-label">{product.style} · {product.category}</p>
                    <p>{product.description}</p>
                    {isReadyToWear && <details className="product-details">
                      <summary>Style details &amp; sample options</summary>
                      <p>Sample silhouette: {product.style}. Sample sizes: {product.sizes.join(', ')}. Colour references: {product.colors.join(', ')}. Options shown are for enquiry only; no size, colour, inventory or production availability is confirmed.</p>
                      {product.sourceUrl && <a href={product.sourceUrl} target="_blank" rel="noreferrer">View editorial photo source</a>}
                    </details>}
                    <div className="product-options">
                      <label>
                        Size
                        <select
                          value={option.size}
                          onChange={(event) => updateOption(product, 'size', event.target.value)}
                        >
                          {sizes.map((size) => <option key={size} value={size}>{size}</option>)}
                        </select>
                      </label>
                      <label>
                        Colour
                        <select
                          value={option.color}
                          onChange={(event) => updateOption(product, 'color', event.target.value)}
                        >
                          {product.colors.map((color) => <option key={color} value={color}>{color}</option>)}
                        </select>
                      </label>
                    </div>
                    {recentlyAdded === selectionKey && <span className="product-added-feedback" role="status">Added to bag</span>}
                    <div className={`product-actions${isReadyToWear ? '' : ' product-actions-single'}`}>
                      {selectedBagItem ? (
                        <div className="product-quantity-control" role="group" aria-label={`${product.name} quantity in bag`}>
                          <button
                            type="button"
                            onClick={() => changeSelectedQuantity(product, option, -1)}
                            aria-label={`Decrease ${product.name} quantity`}
                          >−</button>
                          <span aria-live="polite">{selectedBagItem.quantity}</span>
                          <button
                            type="button"
                            onClick={() => changeSelectedQuantity(product, option, 1)}
                            aria-label={`Increase ${product.name} quantity`}
                          >+</button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => addToBag(product)}>Add demo selection</button>
                      )}
                      {isReadyToWear && <a href={whatsappUrl(productMessage)} target="_blank" rel="noreferrer">Enquire on WhatsApp</a>}
                    </div>
                  </div>
                </article>
              )
            })}
            {isReadyToWear && visibleProducts.length === 0 && <p className="empty-bag">No demo styles match those filters.</p>}
          </div>
          {isHome && <a className="text-link page-preview-link" href="/ready-to-wear" onClick={navigate}>View all ready-to-wear</a>}
        </section>}

        {isHome && <section className="home-gallery-preview" aria-labelledby="home-gallery-heading">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow accent">Gallery preview</p>
              <h2 id="home-gallery-heading">Inspired by West African style</h2>
            </div>
            <a className="text-link" href="/gallery" onClick={navigate}>Explore the gallery</a>
          </div>
          <div className="home-gallery-grid">
            {collections.slice(0, 2).map((item) => (
              <a
                className="collection-card"
                href="/gallery"
                onClick={navigate}
                key={item.title}
              >
                <img src={item.image} alt={`${item.title} illustrative fashion inspiration`} loading="lazy" />
                <span className="collection-shade" aria-hidden="true"></span>
                <span className="collection-body">
                  <span className="collection-number">ILLUSTRATIVE INSPIRATION</span>
                  <strong>{item.title}</strong>
                  <span className="collection-description">{item.description}</span>
                </span>
              </a>
            ))}
          </div>
        </section>}

        {isBag && <section className="bag-section" id="bag" aria-labelledby="bag-heading">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow accent">Your selections</p>
              <h2 id="bag-heading">Shopping Bag <span className="bag-heading-count">({itemCount})</span></h2>
            </div>
            <span className="section-note">Demo bag only. No payment or online checkout is available.</span>
          </div>
          {storageError && <p className="storage-message" role="status">{storageError}</p>}
          {bag.items.length === 0 ? (
            <p className="empty-bag">Your bag is empty. Choose a demo item above to add a selection.</p>
          ) : (
            <>
              <div className="bag-items">
                {bag.items.map((item) => {
                  const product = productsById.get(item.productId)
                  return (
                    <article className="bag-item" key={`${item.productId}-${item.size}-${item.color}`}>
                      <div>
                        <h3>{product.name}</h3>
                        <p>Size {item.size} · {item.color} · {money.format(product.price)} illustrative each</p>
                      </div>
                      <div className="quantity-control" aria-label={`Quantity for ${product.name}`}>
                        <button type="button" onClick={() => changeQuantity(item, -1)} aria-label={`Decrease ${product.name} quantity`}>−</button>
                        <span aria-live="polite">{item.quantity}</span>
                        <button type="button" onClick={() => changeQuantity(item, 1)} aria-label={`Increase ${product.name} quantity`}>+</button>
                      </div>
                      <strong>{money.format(product.price * item.quantity)}</strong>
                      <button type="button" className="remove-button" onClick={() => removeFromBag(item)}>Remove</button>
                    </article>
                  )
                })}
              </div>
              <div className="bag-summary">
                <p><span>Illustrative subtotal</span><strong>{money.format(subtotal)}</strong></p>
                <p className="section-note">Prices are examples for the demo and must be confirmed by the brand.</p>
                <a className="primary-button" href={whatsappUrl(bagMessage)} target="_blank" rel="noreferrer">
                  Enquire about selections on WhatsApp
                </a>
              </div>
            </>
          )}
        </section>}

        {isHome && <section className="home-intro-preview custom-intro-preview">
          <p className="eyebrow">Custom couture</p>
          <h2>Made especially for you.</h2>
          <p>Share your occasion and outfit idea to start a conversation about a considered fit and personal style.</p>
          <a className="primary-button" href="/custom-couture" onClick={navigate}>Discover custom couture</a>
        </section>}

        {isCustom && <CustomCoutureEnquiry onNavigate={navigate} />}

        {isHome && <section className="home-intro-preview story-intro-preview">
          <p className="eyebrow accent">Our story</p>
          <h2>Passion. Purpose. Craft.</h2>
          <p>Mop&apos;s Couture brings custom outfits, ready-to-wear and alterations together with a personal approach to style.</p>
          <a className="text-link" href="/our-story" onClick={navigate}>Read our story</a>
        </section>}

        {isStory && <section className="story-section" id="story">
          <div className="story-photo-wrap">
            <img
              src={heroImage}
              alt="Mop’s Couture designer in the original promotional portrait"
              loading="lazy"
            />
          </div>
          <div className="story-copy">
            <p className="eyebrow accent">Our story</p>
            <h2>Passion. Purpose. Craft.</h2>
            <p>
              Rooted in custom outfits, ready-to-wear, alterations, and classic and trendy styles,
              Mop&apos;s Couture makes room for personal style and expressive dressing.
            </p>
            <span className="story-signoff">Mop&apos;s Couture <b aria-hidden="true">♡</b></span>
          </div>
          <div className="story-values" aria-label="Brand values">
            <div><b aria-hidden="true">✥</b><span>Timeless<br />designs</span></div>
            <div><b aria-hidden="true">〰</b><span>Considered<br />fit</span></div>
            <div><b aria-hidden="true">✺</b><span>Quality<br />craft</span></div>
            <div><b aria-hidden="true">♡</b><span>Made with<br />care</span></div>
          </div>
        </section>}

        {isContact && <section className="contact-section" id="contact">
          <div className="contact-copy">
            <p className="eyebrow accent">Let&apos;s create your look</p>
            <h2>We&apos;re here to help you shine.</h2>
            <p>Questions about tailoring or an idea you&apos;d like to share? Start a conversation directly on WhatsApp.</p>
          </div>
          <a
            className="primary-button"
            href={whatsappUrl('Hello Mop’s Couture, I’d like to ask about your tailoring and fashion services.')}
            target="_blank"
            rel="noreferrer"
          >
            ◉ &nbsp; +234 802 734 0474
          </a>
        </section>}

        {isHome && <section className="community-section" aria-labelledby="community-heading">
          <div className="section-heading">
            <p className="eyebrow accent">The Mop&apos;s style community</p>
            <h2 id="community-heading">Wear it. Share your story.</h2>
            <p className="section-note">Explore demo outfit stories, conversations and sample ratings from the Mop&apos;s Couture community.</p>
          </div>
          <div className="community-preview">
            <article><span>DEMO COMMUNITY</span><h3>Outfits and occasions</h3><p>Share a look you wore, tell its story, and join a style conversation.</p></article>
            <article><span>DEMO COMMUNITY</span><h3>Likes, comments and ratings</h3><p>Try the interactive feed. All sample names and engagement are clearly marked as demo data.</p></article>
            <article><span>LOCAL DEMO</span><h3>Your style belongs here</h3><p>Posts you create stay in this browser and are not shared with other visitors.</p></article>
          </div>
          <a className="primary-button community-preview-link" href="/community" onClick={navigate}>Explore the Community</a>
        </section>}

        {isSettings && <SettingsPage
          pathname={pathname}
          itemCount={itemCount}
          preferences={preferences}
          preferenceError={preferenceError}
          preferenceStatus={preferenceStatus}
          updatePreference={updatePreference}
          navigate={navigate}
          whatsappUrl={whatsappUrl}
        />}

        {isPolicy && <section className="settings-section">
          <PolicyContent path={pathname} navigate={navigate} />
        </section>}

        {(isAdminLogin || isAdmin) && <section className="admin-setup-section">
          <p className="eyebrow accent">Private owner area</p>
          <h1>{isAdminLogin ? 'Owner sign in' : 'Product management'}</h1>
          <div className="admin-notice" role="status">
            <h2>Secure backend setup required</h2>
            <p>This project has no configured authentication or database. The admin area is intentionally locked; it does not accept a frontend-only password and does not claim that product changes are saved.</p>
            <p>Owner access requires Supabase Auth, a products table with owner-only row-level security, and image storage. The migration and environment-variable example are setup scaffolding only; the app's sign-in, product CRUD, and upload flows still need to be implemented and tested before this area can be enabled.</p>
            <p>Never put a service-role key or admin credential in a <code>VITE_</code> variable.</p>
            <a className="primary-button" href="/contact" onClick={navigate}>Contact the site owner</a>
          </div>
        </section>}

        {pathname === '/not-found' && <section className="settings-section">
          <p className="eyebrow accent">Page not found</p>
          <h1>That page isn&apos;t available.</h1>
          <a className="primary-button" href="/" onClick={navigate}>Return home</a>
        </section>}
      </main>

      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand-block">
            <a className="footer-brand" href="/" onClick={navigate}>Mop&apos;s <i>Couture</i></a>
            <p>Style. Elegance. You.</p>
            <span>Your Style, Our Passion.</span>
          </div>
          <div className="footer-links footer-primary-links">
            <h3>Quick links</h3>
            <a href="/" onClick={navigate}>Home</a>
            <a href="/ready-to-wear" onClick={navigate}>Ready-to-Wear</a>
            <a href="/custom-couture" onClick={navigate}>Custom Couture</a>
            <a href="/gallery" onClick={navigate}>Gallery</a>
            <a href="/community" onClick={navigate}>Community</a>
            <a href="/our-story" onClick={navigate}>Our Story</a>
            <a href="/settings" onClick={navigate}>Visitor preferences</a>
          </div>
          <div className="footer-links footer-enquiry-links">
            <h3>Enquiries</h3>
            <a className="footer-how-it-works" href="/custom-couture" onClick={navigate}>How it works</a>
            <a href="/bag" onClick={navigate}>Your selections</a>
            <a href="/contact" onClick={navigate}>Contact Mop&apos;s</a>
            <p>Sample prices and designs on this website are illustrative only.</p>
          </div>
          <div className="footer-contact">
            <h3>Owner</h3>
            <a className="footer-owner-link" href="/admin/login" onClick={navigate}>Owner sign in</a>
            <h3>Contact us</h3>
            <a
              href={whatsappUrl('Hello Mop’s Couture, I’d like to make an enquiry.')}
              target="_blank"
              rel="noreferrer"
            >
              ◉ &nbsp; Chat with us on WhatsApp
            </a>
            <a className="footer-phone" href="tel:+2348027340474">+234 802 734 0474</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Mop&apos;s Couture</span>
          <span>Designed with passion for every queen.</span>
        </div>
      </footer>
      <BackgroundMusicPlayer />
    </div>
  )
}

export default App
