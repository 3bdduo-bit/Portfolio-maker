import { useEffect, useRef, useState, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import s from'./PortfolioPage.module.css'

/* ── Lightbox modal ── */
function Lightbox({src,alt,onClose}){
  useEffect(()=>{
    const onKey=e=>{if(e.key==='Escape')onClose()}
    document.addEventListener('keydown',onKey)
    document.body.style.overflow='hidden'
    return()=>{document.removeEventListener('keydown',onKey);document.body.style.overflow=''}
  },[onClose])
  return(
    <div className={s.lbOverlay} onClick={onClose} role="dialog" aria-label="Image preview">
      <div className={s.lbFrame} onClick={e=>e.stopPropagation()}>
        <button className={s.lbClose} onClick={onClose} aria-label="Close">✕</button>
        <img src={src} alt={alt||'Preview'} className={s.lbImg}/>
        {alt&&<div className={s.lbCaption}>{alt}</div>}
      </div>
    </div>
  )
}

const THEMES={
  violet:{cls:'',       a1:'#8b5cf6',a2:'#38bdf8'},
  rose:  {cls:s.rose,   a1:'#f43f5e',a2:'#fb923c'},
  emerald:{cls:s.emerald,a1:'#10b981',a2:'#38bdf8'},
  gold:  {cls:s.gold,   a1:'#f59e0b',a2:'#ec4899'},
  midnight:{cls:s.midnight,a1:'#3b82f6',a2:'#8b5cf6'},
  white: {cls:s.white,  a1:'#8b5cf6',a2:'#38bdf8'},
}

/* ── Animated counter ── */
function useCounter(target,active){
  const[val,setVal]=useState(0)
  useEffect(()=>{
    if(!active||!target)return
    const n=Number(target);if(!n)return
    let cur=0
    const step=Math.ceil(n/60)
    const t=setInterval(()=>{cur=Math.min(cur+step,n);setVal(cur);if(cur>=n)clearInterval(t)},20)
    return()=>clearInterval(t)
  },[target,active])
  return val
}

/* ── Typewriter hook ── */
function useTypewriter(words,speed=90,pause=2200){
  const[text,setText]=useState('')
  const[wi,setWi]=useState(0)
  const[ci,setCi]=useState(0)
  const[deleting,setDeleting]=useState(false)
  useEffect(()=>{
    if(!words?.length)return
    const word=words[wi]
    const delay=deleting?speed/2:speed
    const t=setTimeout(()=>{
      if(!deleting){
        setText(word.slice(0,ci+1))
        if(ci+1===word.length)setTimeout(()=>setDeleting(true),pause)
        else setCi(c=>c+1)
      } else {
        setText(word.slice(0,ci-1))
        if(ci-1===0){setDeleting(false);setWi(w=>(w+1)%words.length);setCi(0)}
        else setCi(c=>c-1)
      }
    },delay)
    return()=>clearTimeout(t)
  },[words,wi,ci,deleting,speed,pause])
  return text
}

/* ── Scroll-reveal section ── */
function Sec({id,label,children,className='',delay=0}){
  const ref=useRef(null)
  useEffect(()=>{
    const el=ref.current;if(!el)return
    const obs=new IntersectionObserver(([e])=>{
      if(e.isIntersecting){el.style.transitionDelay=`${delay}ms`;el.classList.add(s.visible)}
    },{threshold:.1})
    obs.observe(el)
    return()=>obs.disconnect()
  },[delay])
  return(
    <section id={id} ref={ref} className={`${s.section} ${className}`} aria-label={label||id}>
      {label&&(
        <div className={s.secHeader}>
          <div className={s.secLine}/>
          <span className={s.secLabel}>{label}</span>
          <div className={s.secLine}/>
        </div>
      )}
      {children}
    </section>
  )
}

/* ── Stat item ── */
function StatItem({value,suffix='',label,active}){
  const n=useCounter(value,active)
  return(
    <div className={s.statItem}>
      <div className={s.statNum}>{n}{suffix}</div>
      <div className={s.statLabel}>{label}</div>
    </div>
  )
}

/* ── Testimonials carousel ── */
function Testimonials({items}){
  const[idx,setIdx]=useState(0)
  const prev=()=>setIdx(i=>(i-1+items.length)%items.length)
  const next=()=>setIdx(i=>(i+1)%items.length)
  const t=items[idx]
  useEffect(()=>{
    if(items.length<=1)return
    const timer=setInterval(()=>setIdx(i=>(i+1)%items.length),5000)
    return()=>clearInterval(timer)
  },[items.length])
  return(
    <div className={s.tesWrap}>
      <div className={s.tesCard}>
        <div className={s.tesQuote}>"</div>
        <p className={s.tesText}>{t.text}</p>
        <div className={s.tesAuthor}>
          {t.avatar?<img src={t.avatar} alt={`${t.name} avatar`} className={s.tesAvatar} loading="lazy" width="64" height="64"/>
            :<div className={s.tesAvatarFb}>{t.name[0]}</div>}
          <div>
            <div className={s.tesName}>{t.name}</div>
            {t.role&&<div className={s.tesRole}>{t.role}</div>}
          </div>
        </div>
      </div>
      {items.length>1&&(
        <div className={s.tesNav}>
          <button onClick={prev} className={s.tesBtn} aria-label="Previous">‹</button>
          <div className={s.tesDots}>
            {items.map((_,i)=>(
              <button key={i} className={`${s.tesDot} ${i===idx?s.tesDotActive:''}`}
                onClick={()=>setIdx(i)} aria-label={`Testimonial ${i+1}`}/>
            ))}
          </div>
          <button onClick={next} className={s.tesBtn} aria-label="Next">›</button>
        </div>
      )}
    </div>
  )
}

/* ── Certifications grid ── */
function CertCard({cert,onImageClick}){
  return(
    <div className={s.certCard}>
      {cert.image&&<img src={cert.image} alt={`${cert.name} certificate`} className={`${s.certImg} ${s.clickableImg}`} loading="lazy" width="400" height="240" onClick={()=>onImageClick(cert.image,cert.name)}/>}
      <div className={s.certBody}>
        <div className={s.certName}>{cert.name}</div>
        {cert.issuer&&<div className={s.certIssuer}>{cert.issuer}</div>}
        {cert.year&&<div className={s.certYear}>{cert.year}</div>}
        {cert.url&&<a href={cert.url} target="_blank" rel="noopener noreferrer" className={s.certLink}>View Certificate ↗</a>}
      </div>
    </div>
  )
}

/* ── Learning item ── */
function LearnItem({item,index}){
  const ref=useRef(null)
  useEffect(()=>{
    const el=ref.current;if(!el)return
    const obs=new IntersectionObserver(([e])=>{
      if(e.isIntersecting){el.style.transitionDelay=`${index*80}ms`;el.classList.add(s.learnVisible)}
    },{threshold:.1})
    obs.observe(el)
    return()=>obs.disconnect()
  },[index])
  return(
    <div ref={ref} className={s.learnItem}>
      <div className={s.learnIcon}>{item.icon||'📚'}</div>
      <div>
        <div className={s.learnTitle}>{item.title}</div>
        {item.desc&&<div className={s.learnDesc}>{item.desc}</div>}
      </div>
      {item.status&&<span className={`${s.learnBadge} ${item.status==='done'?s.learnDone:item.status==='soon'?s.learnSoon:s.learnActive}`}>
        {item.status==='done'?'✓ Done':item.status==='soon'?'Coming Soon':'In Progress'}
      </span>}
    </div>
  )
}

/* ── Helper to check if resume url is valid and safe ── */
function isValidHref(url){
  if(!url)return false
  const t=url.trim()
  return t!==''&&t!=='#'&&!t.toLowerCase().startsWith('javascript:')
}

/* ── Safe CV download/view link component ── */
function CvLink({href,fileName,label,className}){
  const isData=href?.startsWith('data:')
  if(isData){
    return(
      <a href={href} download={fileName||'CV.pdf'} className={className}>
        {label}
      </a>
    )
  }
  return(
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {label}
    </a>
  )
}

/* ── Main ── */
export default function PortfolioPage({data}){
  const[scrollPct,setScrollPct]=useState(0)
  const[statsActive,setStatsActive]=useState(false)
  const[lightboxSrc,setLightboxSrc]=useState(null)
  const[lightboxAlt,setLightboxAlt]=useState('')
  const openLightbox=useCallback((src,alt)=>{setLightboxSrc(src);setLightboxAlt(alt||'')},[]) 
  const closeLightbox=useCallback(()=>setLightboxSrc(null),[])
  const statsRef=useRef(null)
  const makerUrl=window.location.origin+window.location.pathname

  const typedWords=data?.title?[data.title,...(data.typedWords||[])]:undefined

  const typed=useTypewriter(
    typedWords&&typedWords.length>1?typedWords:null,
    80,2000
  )

  /* scroll progress */
  useEffect(()=>{
    const onScroll=()=>{
      const doc=document.documentElement
      setScrollPct((doc.scrollTop/(doc.scrollHeight-doc.clientHeight))*100)
    }
    window.addEventListener('scroll',onScroll,{passive:true})
    return()=>window.removeEventListener('scroll',onScroll)
  },[])

  /* stats observer */
  useEffect(()=>{
    if(!statsRef.current)return
    const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting)setStatsActive(true)},{threshold:.3})
    obs.observe(statsRef.current)
    return()=>obs.disconnect()
  },[])


  if(!data){
    return(
      <div className={s.page}>
        <div className={s.errorWrap}>
          <div className={s.errorIcon}>🔗</div>
          <h2>No Portfolio Data Found</h2>
          <p>This link doesn't contain portfolio data. Create your own!</p>
          <a href={makerUrl} className={s.backBtn}>Build My Portfolio</a>
        </div>
      </div>
    )
  }

  const th=THEMES[data.theme]||THEMES.violet
  const layout=data.layout||{}
  const hasStats=data.stats&&Object.values(data.stats).some(v=>v)
  const hasSocials=(data.links&&Object.values(data.links).some(v=>v))||(data.freelance&&Object.values(data.freelance).some(v=>v))
  const waLink=data.whatsapp?`https://wa.me/${data.whatsapp.replace(/\D/g,'')}?text=Hi%2C%20I%20found%20your%20portfolio!`:null
  const rawResumeHref=data.cvFile?.data||data.resumeUrl
  const hasResume=isValidHref(rawResumeHref)
  const resumeHref=hasResume?rawResumeHref:null
  const resumeLabel=data.cvFile?.name?'Download CV':'Resume'
  const spacingClass={small:s.sectionSmall,medium:'',large:s.sectionLarge}[layout.sectionSpacing||'medium']
  const fontClass={sans:'',serif:s.fontSerif,mono:s.fontMono}[layout.fontFamily||'sans']
  const dynamicStyle=layout.primaryColor?{'--pA1':layout.primaryColor}:undefined

  const socials=[
    data.links?.github    &&{href:data.links.github,   icon:'⌥', svg:'github',  label:'GitHub'},
    data.links?.linkedin  &&{href:data.links.linkedin, icon:'💼',svg:'linkedin', label:'LinkedIn'},
    data.links?.twitter   &&{href:data.links.twitter,  icon:'🐦',svg:'twitter',  label:'Twitter'},
    data.links?.website   &&{href:data.links.website,  icon:'🌐',svg:'website',  label:'Website'},
    data.links?.instagram &&{href:data.links.instagram,icon:'📸',svg:'ig',       label:'Instagram'},
    data.links?.youtube   &&{href:data.links.youtube,  icon:'▶️',svg:'yt',       label:'YouTube'},
    data.freelance?.upwork&&{href:data.freelance.upwork,icon:'🟢',svg:'upwork',  label:'Upwork'},
    data.freelance?.freelancer&&{href:data.freelance.freelancer,icon:'💠',svg:'fl',label:'Freelancer'},
    data.freelance?.mostaql&&{href:data.freelance.mostaql,icon:'🟠',svg:'mq',   label:'Mostaql'},
    data.freelance?.fiveamsat&&{href:data.freelance.fiveamsat,icon:'🟤',svg:'5k',label:'5amsat'},
  ].filter(Boolean)



  return(
    <div className={`${s.page} ${th.cls} ${fontClass}`} style={dynamicStyle}>
      <Helmet>
        <title>{data.name} | {data.jobTitle || 'Professional Portfolio'}</title>
        <meta name="description" content={data.bio || `Check out ${data.name}'s professional portfolio.`} />
        <meta property="og:title" content={`${data.name} | ${data.jobTitle || 'Portfolio'}`} />
        <meta property="og:description" content={data.bio || `View the professional work and experience of ${data.name}.`} />
        {data.avatar && <meta property="og:image" content={data.avatar} />}
      </Helmet>
      {/* PROGRESS BAR */}
      <div className={s.progressBar} style={{width:`${scrollPct}%`}} role="progressbar" aria-valuenow={Math.round(scrollPct)} aria-valuemin={0} aria-valuemax={100}/>



      {/* HERO */}
      <header id="hero" className={s.hero}>
        <div className={s.heroBg} aria-hidden="true">
          <div className={s.heroOrb1}/>
          <div className={s.heroOrb2}/>
          <div className={s.heroGrid}/>
        </div>
        <div className={s.heroInner}>
          {data.avatar
            ?<div className={s.avatarRing}><img src={data.avatar} alt={`${data.name} profile photo`} className={`${s.avatarImg} ${s.clickableImg}`} width="120" height="120" onClick={()=>openLightbox(data.avatar,`${data.name} profile photo`)}/></div>
            :<div className={s.avatarRing}><div className={s.avatarFb} aria-label={data.name[0]}>{data.name[0]}</div></div>}
          <h1 className={s.heroName}>{data.name}</h1>
          {data.title&&(
            <p className={s.jobTitle} aria-live="polite">
              {typedWords&&typedWords.length>1
                ?<><span>{typed}</span><span className={s.cursor}>|</span></>
                :data.title}
            </p>
          )}
          {(data.location||data.email)&&(
            <div className={s.metaRow}>
              {data.location&&<span className={s.metaPill}>📍 {data.location}</span>}
              {data.email&&<a href={`mailto:${data.email}`} className={s.metaPill}>✉️ {data.email}</a>}
            </div>
          )}
          {data.bio&&<p className={s.bio}>{data.bio}</p>}
          <div className={s.heroButtons}>
            {waLink&&<a href={waLink} target="_blank" rel="noopener noreferrer" className={s.waBtn}>💬 WhatsApp Me</a>}
            {data.email&&<a href={`mailto:${data.email}`} className={s.emailBtnHero}>✉️ Email Me</a>}
            {resumeHref&&<CvLink href={resumeHref} fileName={data.cvFile?.name} label="⬇ Download CV" className={s.cvBtnHero}/>}
          </div>
          {socials.length>0&&(
            <div className={s.socialRow}>
              {socials.map(sc=>(
                <a key={sc.label} href={sc.href} target="_blank" rel="noopener noreferrer"
                  className={s.socialBtn} aria-label={sc.label}>
                  <span aria-hidden="true">{sc.icon}</span>{sc.label}
                </a>
              ))}
            </div>
          )}

        </div>
      </header>

      <div className={s.container}>
        {/* ABOUT */}
        {data.aboutLong&&(
          <Sec id="about" label="About Me" className={spacingClass}>
            <div className={s.aboutCard}>
              <p className={s.aboutText}>{data.aboutLong}</p>
            </div>
          </Sec>
        )}

        {/* STATS */}
        {hasStats&&(
          <div ref={statsRef} id="stats">
            <Sec label="Stats" className={spacingClass}>
              <div className={s.statsGrid}>
                {data.stats.yearsExp   &&<StatItem value={data.stats.yearsExp}    suffix="+" label="Years of Experience" active={statsActive}/>}
                {data.stats.projects   &&<StatItem value={data.stats.projects}    suffix="+" label="Projects Completed"  active={statsActive}/>}
                {data.stats.clients    &&<StatItem value={data.stats.clients}     suffix="+" label="Happy Clients"       active={statsActive}/>}
                {data.stats.satisfaction&&<StatItem value={data.stats.satisfaction} suffix="%" label="Satisfaction Rate" active={statsActive}/>}
              </div>
            </Sec>
          </div>
        )}

        {/* SKILLS */}
        {data.skills?.length>0&&(
          <Sec id="skills" label="Skills" className={spacingClass}>
            <div className={s.skillsGrid}>
              {data.skills.map((sk,i)=>(
                <span key={i} className={s.skillTag} style={{animationDelay:`${i*40}ms`}}>{sk}</span>
              ))}
            </div>
          </Sec>
        )}

        {/* EXPERIENCE */}
        {data.experiences?.length>0&&(
          <Sec id="experience" label="Experience" className={spacingClass}>
            <div className={s.timeline}>
              {data.experiences.map((ex,i)=>(
                <div key={i} className={s.tlItem}>
                  <div className={s.tlDot}/>
                  <div className={s.tlContent}>
                    <div className={s.tlHeader}>
                      <span className={s.tlRole}>{ex.role}</span>
                      {ex.period&&<span className={s.tlPeriod}>{ex.period}</span>}
                    </div>
                    {ex.company&&<div className={s.tlCompany}>{ex.company}</div>}
                    {ex.desc&&<p className={s.tlDesc}>{ex.desc}</p>}
                  </div>
                </div>
              ))}
            </div>
          </Sec>
        )}

        {/* EDUCATION */}
        {data.educations?.length>0&&(
          <Sec id="education" label="Education" className={spacingClass}>
            <div className={s.timeline}>
              {data.educations.map((ed,i)=>(
                <div key={i} className={s.tlItem}>
                  <div className={s.tlDot}/>
                  <div className={s.tlContent}>
                    <div className={s.tlHeader}>
                      <span className={s.tlRole}>{ed.degree}</span>
                      {ed.year&&<span className={s.tlPeriod}>{ed.year}</span>}
                    </div>
                    {ed.institution&&<div className={s.tlCompany}>{ed.institution}</div>}
                    {ed.desc&&<p className={s.tlDesc}>{ed.desc}</p>}
                  </div>
                </div>
              ))}
            </div>
          </Sec>
        )}

        {/* PROJECTS */}
        {data.projects?.length>0&&(
          <Sec id="projects" label="Projects" className={spacingClass}>
            {data.projects.filter(p=>p.featured).length>0&&(
              <>
                <div className={s.projSubLabel}>⭐ Featured</div>
                <div className={s.projsGrid}>
                  {data.projects.filter(p=>p.featured).map((p,i)=><ProjCard key={i} p={p} onImageClick={openLightbox}/>)}
                </div>
                {data.projects.filter(p=>!p.featured).length>0&&(
                  <div className={s.projSubLabel} style={{marginTop:'2rem'}}>Other Projects</div>
                )}
              </>
            )}
            <div className={s.projsGrid}>
              {data.projects.filter(p=>!p.featured).map((p,i)=><ProjCard key={i} p={p} onImageClick={openLightbox}/>)}
            </div>
          </Sec>
        )}

        {/* SERVICES */}
        {data.services?.length>0&&(
          <Sec id="services" label="Services" className={spacingClass}>
            <div className={s.servicesGrid}>
              {data.services.map((sv,i)=>(
                <div key={i} className={s.serviceCard} style={{animationDelay:`${i*80}ms`}}>
                  <div className={s.serviceIcon} aria-hidden="true">{sv.icon}</div>
                  <h3 className={s.serviceTitle}>{sv.title}</h3>
                  {sv.desc&&<p className={s.serviceDesc}>{sv.desc}</p>}
                </div>
              ))}
            </div>
          </Sec>
        )}

        {/* CERTIFICATIONS */}
        {data.certifications?.length>0&&(
          <Sec id="certifications" label="Certifications" className={spacingClass}>
            <div className={s.certGrid}>
              {data.certifications.map((c,i)=><CertCard key={i} cert={c} onImageClick={openLightbox}/>)}
            </div>
          </Sec>
        )}

        {/* LEARNING */}
        {data.learning?.length>0&&(
          <Sec id="learning" label="Currently Learning" className={spacingClass}>
            <p className={s.learnIntro}>Always expanding my skillset — here's what I'm working on.</p>
            <div className={s.learnGrid}>
              {data.learning.map((item,i)=><LearnItem key={i} item={item} index={i}/>)}
            </div>
          </Sec>
        )}

        {/* TESTIMONIALS */}
        {data.testimonials?.length>0&&(
          <Sec id="testimonials" label="Testimonials" className={spacingClass}>
            <Testimonials items={data.testimonials}/>
          </Sec>
        )}

        {/* CONTACT */}
        {(data.email||waLink||hasSocials)&&(
          <Sec id="contact" label="Contact" className={spacingClass}>
            <div className={s.contactCard}>
              <h2 className={s.contactTitle}>Let's Work Together</h2>
              <p className={s.contactSub}>Have a project in mind? I'd love to hear from you!</p>
              <div className={s.contactBtns}>
                {data.email&&<a href={`mailto:${data.email}`} className={s.emailBtn}>✉️ Send Email</a>}
                {waLink&&<a href={waLink} target="_blank" rel="noopener noreferrer" className={s.waContactBtn}>💬 WhatsApp</a>}
                {resumeHref&&<CvLink href={resumeHref} fileName={data.cvFile?.name} label="⬇ Download CV" className={s.cvContactBtn}/>}
              </div>
              {socials.length>0&&(
                <div className={s.socialRow} style={{marginTop:'1.5rem'}}>
                  {socials.map(sc=>(
                    <a key={sc.label} href={sc.href} target="_blank" rel="noopener noreferrer"
                      className={s.socialBtn} aria-label={sc.label}>
                      <span aria-hidden="true">{sc.icon}</span>{sc.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </Sec>
        )}
      </div>

      <footer className={s.footer}>
        <span>Built with <a href={makerUrl} className={s.footerLink} target="_blank" rel="noopener noreferrer">port-make</a></span>
        <span className={s.footerDot}>·</span>
        <span>{data.name} © {new Date().getFullYear()}</span>
      </footer>
      {lightboxSrc&&<Lightbox src={lightboxSrc} alt={lightboxAlt} onClose={closeLightbox}/>}
    </div>
  )
}

/* ── Project card ── */
function ProjCard({p,onImageClick}){
  return(
    <article
      className={`${s.projCard} ${p.featured?s.projFeatured:''}`}>
      {p.featured&&<div className={s.featuredBadge} aria-label="Featured project">⭐ Featured</div>}
      {p.image&&<img src={p.image} alt={`${p.name} screenshot`} className={`${s.projImage} ${s.clickableImg}`} loading="lazy" width="600" height="330" onClick={()=>onImageClick(p.image,`${p.name} screenshot`)}/>}
      <div className={s.projBody}>
        <h3 className={s.projName}>{p.name}</h3>
        {p.desc&&<p className={s.projDesc}>{p.desc}</p>}
        {p.tech&&(
          <div className={s.projTech}>
            {p.tech.split(',').map((ch,j)=><span key={j} className={s.techChip}>{ch.trim()}</span>)}
          </div>
        )}
        <div className={s.projLinks}>
          {p.url&&<a href={p.url} target="_blank" rel="noopener noreferrer" className={s.projLink}>🔗 Live Demo</a>}
          {p.github&&<a href={p.github} target="_blank" rel="noopener noreferrer" className={s.projLinkGh}>⌥ GitHub</a>}
        </div>
      </div>
    </article>
  )
}
