import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { compressToEncodedURIComponent } from 'lz-string'
import s from './MakerPage.module.css'
import { ThemeToggle } from '../ThemeToggle'

const THEMES = [
  { id: 'violet', label: 'Violet Cyber', preview: 'linear-gradient(135deg,#8b5cf6,#38bdf8)' },
  { id: 'rose', label: 'Rose Fire', preview: 'linear-gradient(135deg,#f43f5e,#fb923c)' },
  { id: 'emerald', label: 'Emerald Ocean', preview: 'linear-gradient(135deg,#10b981,#38bdf8)' },
  { id: 'gold', label: 'Gold Sunset', preview: 'linear-gradient(135deg,#f59e0b,#ec4899)' },
  { id: 'midnight', label: 'Midnight Blue', preview: 'linear-gradient(135deg,#3b82f6,#8b5cf6)' },
  { id: 'white', label: 'Clean Light', preview: 'linear-gradient(135deg,#f1f5f9,#e2e8f0)', border: '1px solid #cbd5e1' },
]
const EMOJIS = ['🎨', '💻', '🚀', '⚡', '🛠️', '📱', '🌐', '📊', '✍️', '🔧', '💡', '🎯', '📈', '🤝', '🔒', '☁️', '🎤', '📷', '🎵', '🏆', '🖥️', '📐', '🧩', '🔍', '📚', '🎓', '🏆', '🏅', '🧠', '💡']
let _id = 0
const mkProj = () => ({ id: _id++, name: '', url: '', github: '', desc: '', tech: '', image: '', featured: false })
const mkExp = () => ({ id: _id++, role: '', company: '', period: '', desc: '' })
const mkEdu = () => ({ id: _id++, degree: '', institution: '', year: '', desc: '' })
const mkSvc = () => ({ id: _id++, icon: '⚡', title: '', desc: '' })
const mkTes = () => ({ id: _id++, name: '', role: '', text: '', avatar: '' })
const mkCert = () => ({ id: _id++, name: '', issuer: '', year: '', url: '', image: '' })
const mkLearn = () => ({ id: _id++, title: '', desc: '', icon: '📚', status: 'active' })

const slugify = v => v.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'portfolio'

const enforceWords = (v, limit) => {
  if (!limit) return v;
  const count = (v || '').trim().split(/\s+/).filter(Boolean).length;
  if (count > limit) {
    const match = v.match(new RegExp(`^\\s*(?:\\S+\\s+){0,${limit - 1}}\\S+`));
    return match ? match[0] : v;
  }
  return v;
};

function Field({ label, hint, maxWords, value, children }) {
  const wordCount = (value || '').trim().split(/\s+/).filter(Boolean).length;
  return (
    <div className={s.field}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <label>{label}</label>
        {maxWords !== undefined && <small style={{ fontSize: '0.75rem', color: wordCount >= maxWords ? '#f43f5e' : 'var(--muted)' }}>{wordCount} / {maxWords} words</small>}
      </div>
      {children}
      {hint && <small className={s.hint}>{hint}</small>}
    </div>
  )
}
function Card({ id, icon, title, children }) {
  return (
    <section id={id} className={s.card}>
      <div className={s.sectionTitle}><span>{icon}</span>{title}</div>
      {children}
    </section>
  )
}

export default function MakerPage({ user, onLogout }) {
  const storageKey = user?.email ? `portfolioData_${user.email}` : 'myPortfolioData';
  const [name, setName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [typedTitles, setTypedTitles] = useState('')
  const [bio, setBio] = useState('')
  const [aboutLong, setAboutLong] = useState('')
  const [location, setLocation] = useState('')
  const [email, setEmail] = useState('')
  const [avatar, setAvatar] = useState('')
  const [avatarOk, setAvatarOk] = useState(false)
  const [whatsapp, setWhatsapp] = useState('')
  const [resumeUrl, setResumeUrl] = useState('')
  const [cvFile, setCvFile] = useState(null)

  const [upwork, setUpwork] = useState('')
  const [freelancer, setFreelancer] = useState('')
  const [mostaql, setMostaql] = useState('')
  const [fiveamsat, setFiveamsat] = useState('')

  const [yearsExp, setYearsExp] = useState('')
  const [projCount, setProjCount] = useState('')
  const [clients, setClients] = useState('')
  const [satisfaction, setSatisfaction] = useState('')

  const [skills, setSkills] = useState([])
  const [skillInput, setSkillInput] = useState('')
  const skillRef = useRef(null)

  const [projects, setProjects] = useState([mkProj()])
  const [experiences, setExperiences] = useState([mkExp()])
  const [educations, setEducations] = useState([mkEdu()])
  const [services, setServices] = useState([])
  const [certifications, setCertifications] = useState([])
  const [learning, setLearning] = useState([])
  const [testimonials, setTestimonials] = useState([])

  const [github, setGithub] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [twitter, setTwitter] = useState('')
  const [website, setWebsite] = useState('')
  const [instagram, setInstagram] = useState('')
  const [youtube, setYoutube] = useState('')

  const [theme, setTheme] = useState('violet')
  const [sectionSpacing, setSectionSpacing] = useState('medium')
  const [fontFamily, setFontFamily] = useState('sans')
  const [primaryColor, setPrimaryColor] = useState('#8b5cf6')

  const [link, setLink] = useState('')
  const [shortLink, setShortLink] = useState('')
  const [shortening, setShortening] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeSection, setActiveSection] = useState('personal')
  const [menuOpen, setMenuOpen] = useState(false)
  const [savedIndicator, setSavedIndicator] = useState(false)
  const [savedData] = useState(() => {
    const sKey = user?.email ? `portfolioData_${user.email}` : 'myPortfolioData';
    const saved = localStorage.getItem(sKey);
    if (saved) {
      try {
        const d = JSON.parse(saved);
        if (d.name || d.bio) {
          return d;
        }
      } catch (e) {
        console.error("Failed to parse saved portfolio", e);
      }
    }
    return null;
  });
  const [showResumePrompt, setShowResumePrompt] = useState(() => !!savedData);
  const [isScrolled, setIsScrolled] = useState(false)
  const resultRef = useRef(null)

  const resumeProject = () => {
    const d = savedData;
    if (!d) return;
    if (d.name) setName(d.name);
    if (d.jobTitle) setJobTitle(d.jobTitle);
    if (d.typedTitles) {
      if (Array.isArray(d.typedTitles)) setTypedTitles(d.typedTitles.join(', '));
      else if (typeof d.typedTitles === 'string') setTypedTitles(d.typedTitles);
    }
    if (d.bio) setBio(d.bio);
    if (d.aboutLong) setAboutLong(d.aboutLong);
    if (d.location) setLocation(d.location);
    if (d.email) setEmail(d.email);
    if (d.whatsapp) setWhatsapp(d.whatsapp);
    if (d.resumeUrl) setResumeUrl(d.resumeUrl);
    if (d.avatar) setAvatar(d.avatar);
    if (d.cvFile) setCvFile(d.cvFile);
    if (Array.isArray(d.skills)) setSkills(d.skills);
    if (Array.isArray(d.experiences)) setExperiences(d.experiences.map(x => ({ ...x, id: _id++ })));
    if (Array.isArray(d.educations)) setEducations(d.educations.map(x => ({ ...x, id: _id++ })));
    if (Array.isArray(d.projects)) setProjects(d.projects.map(x => ({ ...x, id: _id++ })));
    if (Array.isArray(d.services)) setServices(d.services.map(x => ({ ...x, id: _id++ })));
    if (Array.isArray(d.certifications)) setCertifications(d.certifications.map(x => ({ ...x, id: _id++ })));
    if (Array.isArray(d.learning)) setLearning(d.learning.map(x => ({ ...x, id: _id++ })));
    if (Array.isArray(d.testimonials)) setTestimonials(d.testimonials.map(x => ({ ...x, id: _id++ })));
    if (d.links) {
      if (d.links.github) setGithub(d.links.github);
      if (d.links.linkedin) setLinkedin(d.links.linkedin);
      if (d.links.twitter) setTwitter(d.links.twitter);
      if (d.links.website) setWebsite(d.links.website);
      if (d.links.instagram) setInstagram(d.links.instagram);
      if (d.links.youtube) setYoutube(d.links.youtube);
    }
    if (d.layout) {
      if (d.layout.sectionSpacing) setSectionSpacing(d.layout.sectionSpacing);
      if (d.layout.fontFamily) setFontFamily(d.layout.fontFamily);
      if (d.layout.primaryColor) setPrimaryColor(d.layout.primaryColor);
    }
    if (d.theme) setTheme(d.theme);
    setShowResumePrompt(false);
  };

  const startFresh = () => {
    if (window.confirm('Are you sure? This will clear your last unsaved progress.')) {
      localStorage.removeItem(storageKey);
      setShowResumePrompt(false);
      window.location.reload();
    }
  };


  // Auto-save data
  useEffect(() => {
    const data = {
      name, jobTitle, bio, aboutLong, location, email, whatsapp, resumeUrl, skills, avatar, cvFile,
      typedTitles: typedTitles.split(',').map(s => s.trim()).filter(Boolean),
      experiences, educations, projects, services, certifications, learning, testimonials,
      links: { github, linkedin, twitter, website, instagram, youtube },
      layout: { sectionSpacing, fontFamily, primaryColor },
      theme
    };
    localStorage.setItem(storageKey, JSON.stringify(data));
    // FIX: Show saved indicator
    setSavedIndicator(true);
    const t = setTimeout(() => setSavedIndicator(false), 2000);
    return () => clearTimeout(t);
  }, [storageKey, name, jobTitle, typedTitles, bio, aboutLong, location, email, whatsapp, resumeUrl, skills, avatar, cvFile, experiences, educations, projects, services, certifications, learning, testimonials, github, linkedin, twitter, website, instagram, youtube, sectionSpacing, fontFamily, primaryColor, theme]);

  // Scroll tracking for Navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      const sections = ['personal', 'stats', 'skills', 'experience', 'education', 'projects', 'services', 'certs', 'learning', 'testimonials', 'social', 'theme', 'layout'];
      let current = 'personal';
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 120) {
          current = id;
        }
      }
      setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const commitSkill = useCallback(() => {
    const v = skillInput.trim().replace(/,$/, '')
    if (v && !skills.includes(v)) setSkills(p => [...p, v])
    setSkillInput('')
  }, [skillInput, skills])
  const onSkillKey = e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commitSkill() } }
  const rmSkill = i => setSkills(p => p.filter((_, j) => j !== i))

  const upd = (set, id, f, v, maxW) => set(p => p.map(x => x.id === id ? { ...x, [f]: maxW ? enforceWords(v, maxW) : v } : x))
  const rm = (set, id) => set(p => p.filter(x => x.id !== id))

  const toDataUrl = (file, cb) => {
    const reader = new FileReader()
    reader.onload = e => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_WIDTH = 600
        const MAX_HEIGHT = 600
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height
            height = MAX_HEIGHT
          }
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        cb(canvas.toDataURL('image/jpeg', 0.7))
      }
      img.src = e.target?.result || ''
    }
    reader.readAsDataURL(file)
  }

  const onAvatarUpload = e => {
    const file = e.target.files?.[0]
    if (!file) return
    toDataUrl(file, (data) => {
      setAvatar(data)
      setAvatarOk(true)
    })
  }

  const onCvUpload = e => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setCvFile({ name: file.name, data: ev.target?.result || '' })
    reader.readAsDataURL(file)
  }

  const onProjectImageUpload = (id, e) => {
    const file = e.target.files?.[0]
    if (!file) return
    toDataUrl(file, (data) => upd(setProjects, id, 'image', data))
  }

  const onCertImageUpload = (id, e) => {
    const file = e.target.files?.[0]
    if (!file) return
    toDataUrl(file, (data) => upd(setCertifications, id, 'image', data))
  }

  const generate = () => {
    setIsGenerating(true)
    setLink('')
    if (!name.trim() || !bio.trim()) {
      alert('Please fill in at least your Name and Bio.');
      setIsGenerating(false);
      return;
    }

    const data = {
      name: name.trim(),
      title: jobTitle.trim(),
      typedWords: typedTitles.split(',').map(s => s.trim()).filter(Boolean),
      bio: bio.trim(),
      aboutLong: aboutLong.trim(),
      location: location.trim(),
      email: email.trim(),
      avatar: avatar.trim(),
      whatsapp: whatsapp.trim(),
      resumeUrl: resumeUrl.trim(),
      cvFile,
      freelance: {
        upwork: upwork.trim(),
        freelancer: freelancer.trim(),
        mostaql: mostaql.trim(),
        fiveamsat: fiveamsat.trim(),
      },
      stats: { yearsExp: yearsExp || null, projects: projCount || null, clients: clients || null, satisfaction: satisfaction || null },
      skills,
      experiences: experiences.filter(e => e.role.trim() || e.company.trim()).map(e => ({ role: e.role.trim(), company: e.company.trim(), period: e.period.trim(), desc: e.desc.trim() })),
      educations: educations.filter(e => e.degree.trim() || e.institution.trim()).map(e => ({ degree: e.degree.trim(), institution: e.institution.trim(), year: e.year.trim(), desc: e.desc.trim() })),
      projects: projects.filter(p => p.name.trim()).map(p => ({ name: p.name.trim(), url: p.url.trim(), github: p.github.trim(), desc: p.desc.trim(), tech: p.tech.trim(), image: p.image, featured: p.featured })),
      services: services.filter(sv => sv.title.trim()).map(sv => ({ icon: sv.icon, title: sv.title.trim(), desc: sv.desc.trim() })),
      certifications: certifications.filter(c => c.name.trim()).map(c => ({ name: c.name.trim(), issuer: c.issuer.trim(), year: c.year.trim(), url: c.url.trim(), image: c.image })),
      learning: learning.filter(l => l.title.trim()).map(l => ({ title: l.title.trim(), desc: l.desc.trim(), icon: l.icon, status: l.status })),
      testimonials: testimonials.filter(t => t.name.trim() && t.text.trim()).map(t => ({ name: t.name.trim(), role: t.role.trim(), text: t.text.trim(), avatar: t.avatar.trim() })),
      links: { github: github.trim(), linkedin: linkedin.trim(), twitter: twitter.trim(), website: website.trim(), instagram: instagram.trim(), youtube: youtube.trim() },
      layout: { sectionSpacing, fontFamily, primaryColor },
      theme,
    }

    const compactData = {
      ...data,
      cvFile: null
    }

    const shortId = Math.random().toString(36).slice(2, 8)
    const userSlug = slugify(name)
    const compressed = compressToEncodedURIComponent(JSON.stringify(compactData))
    const longUrl = `${window.location.origin}${window.location.pathname}#p=${userSlug}-${shortId}&d=${compressed}`

    setLink(longUrl)
    setShortLink('')
    setShortening(true)
    setIsGenerating(false)
    setTimeout(() => {
      const el = document.getElementById('result-box');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      else resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 200);

    // Generate short link using spoo.me which supports massive URLs
    fetch('https://spoo.me/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({ url: longUrl }).toString()
    })
      .then(r => r.json())
      .then(data => {
        if (data.short_url) {
          setShortLink(data.short_url);
        }
        setShortening(false);
      })
      .catch(err => {
        console.error('URL shortening failed:', err);
        setShortening(false);
      });
  }

  const copy = (txt) => {
    navigator.clipboard.writeText(txt).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  const navItems = [
    { id: 'personal', label: 'Personal', icon: '👤' },
    { id: 'stats', label: 'Stats', icon: '📊' },
    { id: 'skills', label: 'Skills', icon: '⚡' },
    { id: 'experience', label: 'Experience', icon: '💼' },
    { id: 'education', label: 'Education', icon: '🎓' },
    { id: 'projects', label: 'Projects', icon: '🚀' },
    { id: 'services', label: 'Services', icon: '🛠️' },
    { id: 'certs', label: 'Certs', icon: '🏆' },
    { id: 'social', label: 'Social', icon: '🔗' },
    { id: 'theme', label: 'Theme', icon: '🎨' },
  ];

  return (
    <div className={s.page}>

      {/* MAKER NAVBAR */}
      <nav className={`${s.nav} ${isScrolled ? s.navScrolled : ''}`}>
        <div className={s.navInner}>
          <a href="#" className={s.navBrand} onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
            <span>✨</span> port-make
          </a>

          <div className={s.navItems}>
            {navItems.map(item => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`${s.navItem} ${activeSection === item.id ? s.navActive : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveSection(item.id);
                document.getElementById(item.id)?.scrollIntoView({ behavior: 'auto', block: 'start' });

                }}
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className={s.navActions}>
            {savedIndicator && <span className={s.savedBadge}>✓ Saved</span>}
            <button
              className={s.generateNavBtn}
              onClick={generate}
              disabled={isGenerating}
              title="Generate Portfolio Link"
            >
              {isGenerating ? '⏳' : '✨ Generate'}
            </button>
            <div className={s.themeWrap}><ThemeToggle /></div>
            <div className={s.accountWrap}>
              <div className={s.userAvatar} title={user?.name || 'User'}>
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <button onClick={onLogout} className={s.signOutBtn} title="Sign Out">
                Sign Out
              </button>
            </div>
            <button className={s.hamburger} aria-label="Toggle menu" onClick={() => setMenuOpen(!menuOpen)}>
              <span style={menuOpen ? { transform: 'rotate(45deg) translateY(10.5px)' } : {}} />
              <span style={menuOpen ? { opacity: 0, transform: 'scale(0)' } : {}} />
              <span style={menuOpen ? { transform: 'rotate(-45deg) translateY(-10.5px)' } : {}} />
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        <div className={`${s.mobileMenu} ${menuOpen ? s.menuOpen : ''}`}>
          {navItems.map(item => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={s.mobileNavLink}
              onClick={(e) => {
                e.preventDefault();
                setMenuOpen(false);
                document.getElementById(item.id)?.scrollIntoView({ behavior: 'auto', block: 'start' });

              }}
            >
              {item.icon} {item.label}
            </a>
          ))}
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <ThemeToggle />
            </div>
            <div className={s.accountWrap}>
              <div className={s.userAvatar}>
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <button onClick={onLogout} className={s.signOutBtn}>Sign Out</button>
            </div>
          </div>

        </div>
      </nav>

      <div className={s.container}>
        {showResumePrompt && (
          <div className={s.resumePrompt} style={{
            background: 'var(--surface)',
            border: '2px solid var(--accent)',
            borderRadius: 'var(--radius)',
            padding: '2rem',
            marginBottom: '3rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-lg)',
            animation: 'slideUp 0.5s ease-out'
          }}>
            <h2 style={{ marginBottom: '0.5rem', fontFamily: 'Space Grotesk' }}>Welcome Back! ✨</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>We found a saved portfolio for <strong>{savedData?.name || 'you'}</strong>. Would you like to continue editing or start fresh?</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button onClick={resumeProject} className={s.openBtn} style={{ marginTop: 0 }}>Resume Last Project</button>
              <button onClick={startFresh} style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                padding: '0.75rem 1.5rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 600
              }}>Start Fresh</button>
            </div>
          </div>
        )}

        <div className={s.hero}>
          <div className={s.heroBg} />
          <div className={`${s.badge} text-animate`}>✦ No-code · Instant · Shareable</div>
          <h1 className={`${s.heroTitle} text-animate`}>Build Your Portfolio<br />in Minutes</h1>
          <p className={`${s.heroSub} text-animate`}>Fill in the details below — get a unique shareable link that IS your portfolio.</p>
          <div className={s.heroFeatures}>
            {['⚡ Instant link', '🎨 5 themes', '📱 Mobile-ready', '🔒 No server needed'].map(f => (
              <span key={f} className={s.heroFeature}>{f}</span>
            ))}
          </div>
        </div>

        {/* PERSONAL */}
        <Card id="personal" icon="👤" title="Personal Info">
          <div className={s.row}>
            <Field label="Full Name *"><input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Alex Johnson" /></Field>
            <Field label="Main Job Title"><input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. Full-Stack Developer" /></Field>
          </div>
          <Field label="Animated Job Titles (comma-separated, optional)" hint="These will animate via typewriter effect after your main job title.">
            <input value={typedTitles} onChange={e => setTypedTitles(e.target.value)} placeholder="UI Designer, Data Scientist, Tech Lead" />
          </Field>
          <Field label="Hero Subtitle / Short Bio *"><textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Write 1–2 sentences about yourself..." style={{ minHeight: '60px' }} /></Field>
          <Field label="Detailed About Me (Optional)" hint="A longer section detailing your journey and passion.">
            <textarea value={aboutLong} onChange={e => setAboutLong(e.target.value)} placeholder="I am a passionate software engineer with a deep interest in..." style={{ minHeight: '100px' }} />
          </Field>

          <div className={s.row}>
            <Field label="Location"><input value={location} onChange={e => setLocation(e.target.value)} placeholder="Cairo, Egypt" /></Field>
            <Field label="Email"><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="alex@example.com" /></Field>
          </div>
          <div className={s.row}>
            <Field label="WhatsApp Number">
              <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="+20 123 456 7890" />
            </Field>
            <Field label="Resume / CV Link (optional)">
              <input value={resumeUrl} onChange={e => setResumeUrl(e.target.value)} placeholder="https://drive.google.com/..." />
            </Field>
          </div>
          <div className={s.row}>
            <Field label="Upload Profile Picture">
              <input type="file" accept="image/*" onChange={onAvatarUpload} />
            </Field>
            <Field label="Upload CV File (PDF/DOC)">
              <input type="file" accept=".pdf,.doc,.docx" onChange={onCvUpload} />
              {cvFile && <small className={s.hint}>Attached: {cvFile.name}</small>}
            </Field>
          </div>
          <div className={s.row}>
            <Field label="Upwork Profile">
              <input value={upwork} onChange={e => setUpwork(e.target.value)} placeholder="https://upwork.com/freelancers/..." />
            </Field>
            <Field label="Freelancer Profile">
              <input value={freelancer} onChange={e => setFreelancer(e.target.value)} placeholder="https://freelancer.com/u/..." />
            </Field>
          </div>
          <div className={s.row}>
            <Field label="Mostaql Profile">
              <input value={mostaql} onChange={e => setMostaql(e.target.value)} placeholder="https://mostaql.com/u/..." />
            </Field>
            <Field label="5amsat Profile">
              <input value={fiveamsat} onChange={e => setFiveamsat(e.target.value)} placeholder="https://khamsat.com/user/..." />
            </Field>
          </div>
          {avatar && <img src={avatar} alt="preview" className={s.avatarPreview} loading="lazy" width="120" height="120" style={{ display: avatarOk ? 'block' : 'none' }} onLoad={() => setAvatarOk(true)} onError={() => setAvatarOk(false)} />}
        </Card>

        {/* STATS */}
        <Card id="stats" icon="📊" title="Stats & Numbers">
          <p className={s.hint} style={{ marginBottom: '1.2rem' }}>These show as animated counters on your portfolio — leave empty to hide.</p>
          <div className={s.row4}>
            <Field label="Years Exp."><input type="number" value={yearsExp} onChange={e => setYearsExp(e.target.value)} placeholder="5" /></Field>
            <Field label="Projects Done"><input type="number" value={projCount} onChange={e => setProjCount(e.target.value)} placeholder="40" /></Field>
            <Field label="Happy Clients"><input type="number" value={clients} onChange={e => setClients(e.target.value)} placeholder="30" /></Field>
            <Field label="Satisfaction %"><input type="number" min="0" max="100" value={satisfaction} onChange={e => setSatisfaction(e.target.value)} placeholder="98" /></Field>
          </div>
        </Card>

        {/* SKILLS */}
        <Card id="skills" icon="⚡" title="Skills">
          <Field label="Add skills (press Enter or comma)">
            <div className={s.tagWrap} onClick={() => skillRef.current?.focus()}>
              {skills.map((sk, i) => (
                <span key={i} className={s.tag}>{sk}<button type="button" aria-label={`Remove skill ${sk}`} onClick={() => rmSkill(i)}>×</button></span>
              ))}
              <input ref={skillRef} className={s.tagInput} value={skillInput}
                onChange={e => setSkillInput(e.target.value)} onKeyDown={onSkillKey} onBlur={commitSkill}
                placeholder={skills.length ? '' : 'Type a skill...'} />
            </div>
          </Field>
        </Card>

        {/* EXPERIENCE */}
        <Card id="experience" icon="💼" title="Work Experience">
          {experiences.map(ex => (
            <div key={ex.id} className={s.dynItem}>
              <button className={s.removeBtn} onClick={() => rm(setExperiences, ex.id)}>Remove</button>
              <div className={s.row}>
                <Field label="Job Title / Role" maxWords={15} value={ex.role}><input value={ex.role} onChange={e => upd(setExperiences, ex.id, 'role', e.target.value, 15)} placeholder="Senior Developer" /></Field>
                <Field label="Company" maxWords={15} value={ex.company}><input value={ex.company} onChange={e => upd(setExperiences, ex.id, 'company', e.target.value, 15)} placeholder="Tech Corp" /></Field>
              </div>
              <Field label="Period" maxWords={15} value={ex.period}><input value={ex.period} onChange={e => upd(setExperiences, ex.id, 'period', e.target.value, 15)} placeholder="Jan 2022 – Present" /></Field>
              <Field label="Description" maxWords={25} value={ex.desc}><textarea value={ex.desc} onChange={e => upd(setExperiences, ex.id, 'desc', e.target.value, 25)} placeholder="Key responsibilities and achievements..." style={{ minHeight: '65px' }} /></Field>
            </div>
          ))}
          <button className={s.addBtn} onClick={() => setExperiences(p => [...p, mkExp()])}>＋ Add Experience</button>
        </Card>

        {/* EDUCATION */}
        <Card id="education" icon="🎓" title="Education">
          {educations.map(ed => (
            <div key={ed.id} className={s.dynItem}>
              <button className={s.removeBtn} onClick={() => rm(setEducations, ed.id)}>Remove</button>
              <div className={s.row}>
                <Field label="Degree / Certificate" maxWords={15} value={ed.degree}><input value={ed.degree} onChange={e => upd(setEducations, ed.id, 'degree', e.target.value, 15)} placeholder="B.Sc. Computer Science" /></Field>
                <Field label="Institution" maxWords={15} value={ed.institution}><input value={ed.institution} onChange={e => upd(setEducations, ed.id, 'institution', e.target.value, 15)} placeholder="Cairo University" /></Field>
              </div>
              <Field label="Year" maxWords={15} value={ed.year}><input value={ed.year} onChange={e => upd(setEducations, ed.id, 'year', e.target.value, 15)} placeholder="2018 – 2022" /></Field>
              <Field label="Details (optional)" maxWords={25} value={ed.desc}><textarea value={ed.desc} onChange={e => upd(setEducations, ed.id, 'desc', e.target.value, 25)} placeholder="GPA, achievements, activities..." style={{ minHeight: '55px' }} /></Field>
            </div>
          ))}
          <button className={s.addBtn} onClick={() => setEducations(p => [...p, mkEdu()])}>＋ Add Education</button>
        </Card>

        {/* PROJECTS */}
        <Card id="projects" icon="🚀" title="Projects">
          {projects.map(p => (
            <div key={p.id} className={`${s.dynItem} ${p.featured ? s.featuredItem : ''}`}>
              <button className={s.removeBtn} onClick={() => rm(setProjects, p.id)}>Remove</button>
              <div className={s.row}>
                <Field label="Project Name" maxWords={15} value={p.name}><input value={p.name} onChange={e => upd(setProjects, p.id, 'name', e.target.value, 15)} placeholder="My Awesome App" /></Field>
                <Field label="Live URL"><input value={p.url} onChange={e => upd(setProjects, p.id, 'url', e.target.value)} placeholder="https://..." /></Field>
              </div>
              <Field label="GitHub Repository"><input value={p.github} onChange={e => upd(setProjects, p.id, 'github', e.target.value)} placeholder="https://github.com/user/repo" /></Field>
              <Field label="Description" maxWords={25} value={p.desc}><textarea value={p.desc} onChange={e => upd(setProjects, p.id, 'desc', e.target.value, 25)} placeholder="What does this project do?" style={{ minHeight: '65px' }} /></Field>
              <Field label="Tech Stack (comma-separated)" maxWords={15} value={p.tech}><input value={p.tech} onChange={e => upd(setProjects, p.id, 'tech', e.target.value, 15)} placeholder="React, Node.js, MongoDB" /></Field>
              <Field label="Project Image">
                <input type="file" accept="image/*" onChange={e => onProjectImageUpload(p.id, e)} />
                {p.image && <img src={p.image} alt={`${p.name || 'Project'} preview`} loading="lazy" width="220" height="120" style={{ marginTop: '.6rem', width: '100%', maxWidth: '220px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,.15)' }} />}
              </Field>
              <label className={s.checkLabel}>
                <input type="checkbox" checked={p.featured} onChange={e => upd(setProjects, p.id, 'featured', e.target.checked)} />
                ⭐ Mark as Featured Project
              </label>
            </div>
          ))}
          <button className={s.addBtn} onClick={() => setProjects(p => [...p, mkProj()])}>＋ Add Project</button>
        </Card>

        {/* SERVICES */}
        <Card id="services" icon="🛠️" title="Services">
          <p className={s.hint} style={{ marginBottom: '1.2rem' }}>What do you offer to clients?</p>
          {services.map(sv => (
            <div key={sv.id} className={s.dynItem}>
              <button className={s.removeBtn} onClick={() => rm(setServices, sv.id)}>Remove</button>
              <div className={s.row}>
                <Field label="Icon (pick or type emoji)">
                  <div className={s.emojiRow}>
                    <input className={s.emojiInput} value={sv.icon} onChange={e => upd(setServices, sv.id, 'icon', e.target.value)} maxLength={4} />
                    <div className={s.emojiGrid}>
                      {EMOJIS.slice(0, 16).map(em => (<button key={em} type="button" aria-label={`Select ${em} emoji`} className={`${s.emojiBt} ${sv.icon === em ? s.emojiActive : ''}`} onClick={() => upd(setServices, sv.id, 'icon', em)}>{em}</button>))}
                    </div>
                  </div>
                </Field>
                <Field label="Service Title" maxWords={15} value={sv.title}><input value={sv.title} onChange={e => upd(setServices, sv.id, 'title', e.target.value, 15)} placeholder="Web Development" /></Field>
              </div>
              <Field label="Description" maxWords={25} value={sv.desc}><textarea value={sv.desc} onChange={e => upd(setServices, sv.id, 'desc', e.target.value, 25)} placeholder="Brief description of this service..." style={{ minHeight: '60px' }} /></Field>
            </div>
          ))}
          <button className={s.addBtn} onClick={() => setServices(p => [...p, mkSvc()])}>＋ Add Service</button>
        </Card>

        {/* CERTIFICATIONS */}
        <Card id="certs" icon="🏆" title="Certifications">
          <p className={s.hint} style={{ marginBottom: '1.2rem' }}>Showcase your certificates and achievements.</p>
          {certifications.map(c => (
            <div key={c.id} className={s.dynItem}>
              <button className={s.removeBtn} onClick={() => rm(setCertifications, c.id)}>Remove</button>
              <div className={s.row}>
                <Field label="Certificate Name" maxWords={15} value={c.name}><input value={c.name} onChange={e => upd(setCertifications, c.id, 'name', e.target.value, 15)} placeholder="AWS Cloud Practitioner" /></Field>
                <Field label="Issuer / Organization" maxWords={15} value={c.issuer}><input value={c.issuer} onChange={e => upd(setCertifications, c.id, 'issuer', e.target.value, 15)} placeholder="Amazon Web Services" /></Field>
              </div>
              <div className={s.row}>
                <Field label="Year" maxWords={15} value={c.year}><input value={c.year} onChange={e => upd(setCertifications, c.id, 'year', e.target.value, 15)} placeholder="2023" /></Field>
                <Field label="Credential URL"><input value={c.url} onChange={e => upd(setCertifications, c.id, 'url', e.target.value)} placeholder="https://..." /></Field>
              </div>
              <Field label="Certificate Image">
                <input type="file" accept="image/*" onChange={e => onCertImageUpload(c.id, e)} />
                {c.image && <img src={c.image} alt="Cert preview" loading="lazy" width="220" height="120" style={{ marginTop: '.6rem', width: '100%', maxWidth: '220px', height: '120px', objectFit: 'cover', borderRadius: '8px' }} />}
              </Field>
            </div>
          ))}
          <button className={s.addBtn} onClick={() => setCertifications(p => [...p, mkCert()])}>＋ Add Certification</button>
        </Card>

        {/* LEARNING */}
        <Card id="learning" icon="🧠" title="Currently Learning">
          <p className={s.hint} style={{ marginBottom: '1.2rem' }}>What are you studying or planning to learn next?</p>
          {learning.map(l => (
            <div key={l.id} className={s.dynItem}>
              <button className={s.removeBtn} onClick={() => rm(setLearning, l.id)}>Remove</button>
              <div className={s.row}>
                <Field label="Topic Title" maxWords={15} value={l.title}><input value={l.title} onChange={e => upd(setLearning, l.id, 'title', e.target.value, 15)} placeholder="Machine Learning" /></Field>
                <Field label="Status">
                  <select value={l.status} onChange={e => upd(setLearning, l.id, 'status', e.target.value)}>
                    <option value="active">In Progress</option>
                    <option value="soon">Coming Soon</option>
                    <option value="done">Done</option>
                  </select>
                </Field>
              </div>
              <Field label="Icon / Emoji"><input value={l.icon} onChange={e => upd(setLearning, l.id, 'icon', e.target.value)} placeholder="📚" style={{ maxWidth: '80px' }} /></Field>
              <Field label="Short Description" maxWords={25} value={l.desc}><textarea value={l.desc} onChange={e => upd(setLearning, l.id, 'desc', e.target.value, 25)} placeholder="Studying algorithms and neural networks..." style={{ minHeight: '55px' }} /></Field>
            </div>
          ))}
          <button className={s.addBtn} onClick={() => setLearning(p => [...p, mkLearn()])}>＋ Add Learning Goal</button>
        </Card>

        {/* TESTIMONIALS */}
        <Card id="testimonials" icon="💬" title="Testimonials">
          <p className={s.hint} style={{ marginBottom: '1.2rem' }}>What do clients or colleagues say about you?</p>
          {testimonials.map(t => (
            <div key={t.id} className={s.dynItem}>
              <button className={s.removeBtn} onClick={() => rm(setTestimonials, t.id)}>Remove</button>
              <div className={s.row}>
                <Field label="Name" maxWords={15} value={t.name}><input value={t.name} onChange={e => upd(setTestimonials, t.id, 'name', e.target.value, 15)} placeholder="Sarah Ahmed" /></Field>
                <Field label="Role / Company" maxWords={15} value={t.role}><input value={t.role} onChange={e => upd(setTestimonials, t.id, 'role', e.target.value, 15)} placeholder="CEO at StartupX" /></Field>
              </div>
              <Field label="Quote" maxWords={25} value={t.text}><textarea value={t.text} onChange={e => upd(setTestimonials, t.id, 'text', e.target.value, 25)} placeholder="Working with them was an amazing experience..." style={{ minHeight: '70px' }} /></Field>
              <Field label="Their Avatar URL (optional)"><input value={t.avatar} onChange={e => upd(setTestimonials, t.id, 'avatar', e.target.value)} placeholder="https://..." /></Field>
            </div>
          ))}
          <button className={s.addBtn} onClick={() => setTestimonials(p => [...p, mkTes()])}>＋ Add Testimonial</button>
        </Card>

        {/* CONTACT — FIX: removed duplicate fields, shows current values with link to Personal */}
        <Card id="contact" icon="📬" title="Contact Info">
          <p className={s.hint} style={{ marginBottom: '1.2rem' }}>Contact info is managed in the <strong>Personal Info</strong> section above. Your email, WhatsApp, and CV will appear in the portfolio contact section automatically.</p>
          <div className={s.contactSummary}>
            <div className={s.contactSummaryItem}>
              <span className={s.contactSummaryLabel}>Email</span>
              <span className={s.contactSummaryValue}>{email || <em style={{ color: 'var(--text-secondary)' }}>Not set</em>}</span>
            </div>
            <div className={s.contactSummaryItem}>
              <span className={s.contactSummaryLabel}>WhatsApp</span>
              <span className={s.contactSummaryValue}>{whatsapp || <em style={{ color: 'var(--text-secondary)' }}>Not set</em>}</span>
            </div>
            <div className={s.contactSummaryItem}>
              <span className={s.contactSummaryLabel}>CV / Resume</span>
              <span className={s.contactSummaryValue}>{resumeUrl || cvFile?.name || <em style={{ color: 'var(--text-secondary)' }}>Not set</em>}</span>
            </div>
          </div>
          <button className={s.addBtn} style={{ marginTop: '1rem' }} onClick={() => document.getElementById('personal')?.scrollIntoView({ behavior: 'smooth' })}>
            ↑ Edit in Personal Section
          </button>
        </Card>

        {/* SOCIAL */}
        <Card id="social" icon="🔗" title="Social Links">
          <div className={s.row}>
            <Field label="GitHub"><input value={github} onChange={e => setGithub(e.target.value)} placeholder="https://github.com/username" /></Field>
            <Field label="LinkedIn"><input value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/username" /></Field>
          </div>
          <div className={s.row}>
            <Field label="Twitter / X"><input value={twitter} onChange={e => setTwitter(e.target.value)} placeholder="https://twitter.com/username" /></Field>
            <Field label="Website / Blog"><input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://mysite.com" /></Field>
          </div>
          <div className={s.row}>
            <Field label="Instagram"><input value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="https://instagram.com/username" /></Field>
            <Field label="YouTube"><input value={youtube} onChange={e => setYoutube(e.target.value)} placeholder="https://youtube.com/@channel" /></Field>
          </div>
        </Card>

        {/* THEME */}
        <Card id="theme" icon="🎨" title="Portfolio Theme">
          <div className={s.themeGrid}>
            {THEMES.map(t => (
              <div key={t.id} className={`${s.themeCard} ${theme === t.id ? s.themeActive : ''}`} onClick={() => setTheme(t.id)}>
                <div className={s.themePreview} style={{ background: t.preview, border: t.border || 'none' }} />
                <span>{t.label}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* LAYOUT */}
        <Card id="layout" icon="🧱" title="Body & Layout Options">
          <div className={s.row}>
            <Field label="Section Spacing">
              <select value={sectionSpacing} onChange={e => setSectionSpacing(e.target.value)}>
                <option value="small">Compact</option>
                <option value="medium">Standard</option>
                <option value="large">Spacious</option>
              </select>
            </Field>
            <Field label="Font Style">
              <select value={fontFamily} onChange={e => setFontFamily(e.target.value)}>
                <option value="sans">Modern Sans</option>
                <option value="serif">Classic Serif</option>
                <option value="mono">Technical Mono</option>
              </select>
            </Field>
          </div>
          <Field label="Primary Color">
            <div className={s.swatchGrid}>
              {['#0284c7', '#8b5cf6', '#f43f5e', '#10b981', '#f59e0b', '#ec4899', '#6366f1', '#1e293b'].map(c => (
                <button key={c} type="button"
                  className={`${s.swatch} ${primaryColor === c ? s.activeSwatch : ''}`}
                  style={{ background: c }}
                  aria-label={`Select color ${c}`}
                  onClick={() => setPrimaryColor(c)}
                >
                  {primaryColor === c && <span className={s.check}>✓</span>}
                </button>
              ))}
              <div className={s.customColorWrap}>
                <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className={s.customColorInput} />
                <span className={s.customColorIcon}>🎨</span>
              </div>
            </div>
          </Field>
        </Card>

        <button className={s.generateBtn} onClick={generate} disabled={isGenerating}>
          {isGenerating ? '⏳ Generating...' : '✨ Generate My Portfolio Link'}
        </button>

        {link && (
          <div id="result-box" ref={resultRef} className={s.resultBox}>
            <div className={s.resultIcon}>🎉</div>
            <h3>Your Portfolio is Ready!</h3>
            <p>Share this link anywhere — LinkedIn bio, email signature, Twitter, anywhere!</p>
            <p className={s.hint}>Your images have been compressed and included in the link below. Note: URLs with images may be quite long.</p>

            {shortening ? (
              <div style={{ margin: '1.5rem 0', color: '#a78bfa', fontWeight: 600, animation: 'pulse 1.5s infinite' }}>
                ⏳ Generating ultra-short link...
              </div>
            ) : shortLink ? (
              <>
                <div className={s.linkRow} style={{ marginTop: '1.2rem' }}>
                  <div className={s.linkDisplay} style={{ fontWeight: 800, fontSize: '1.15rem', color: '#fff', textAlign: 'center', padding: '.8rem' }}>{shortLink}</div>
                  <button className={s.copyBtn} onClick={() => copy(shortLink)} style={copied ? { background: '#10b981' } : {}}>
                    {copied ? '✓ Copied!' : 'Copy Short Link'}
                  </button>
                </div>
                <details style={{ fontSize: '0.85rem', color: 'var(--muted)', textAlign: 'left', marginTop: '1.5rem', background: 'var(--surface2)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 600, color: 'var(--text)' }}>View Original Long Link</summary>
                  <div className={s.linkRow} style={{ marginTop: '1rem' }}>
                    <div className={s.linkDisplay} style={{ fontSize: '0.75rem' }}>{link}</div>
                    <button className={s.copyBtn} onClick={() => copy(link)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', ...(copied ? { background: '#10b981' } : {}) }}>
                      Copy
                    </button>
                  </div>
                </details>
              </>
            ) : (
              <div className={s.linkRow} style={{ marginTop: '1.2rem' }}>
                <div className={s.linkDisplay}>{link}</div>
                <button className={s.copyBtn} onClick={() => copy(link)} style={copied ? { background: '#10b981' } : {}}>
                  {copied ? '✓ Copied!' : 'Copy Link'}
                </button>
              </div>
            )}

            <div className={s.resultActions} style={{ marginTop: '1.5rem' }}>
              <a href={shortLink || link} target="_blank" rel="noopener noreferrer" className={s.openBtn}>🌐 Preview Portfolio →</a>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}