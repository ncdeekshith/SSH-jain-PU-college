document.addEventListener('DOMContentLoaded',()=>{
  const body=document.body;
  const header=document.querySelector('[data-header]');
  const menu=document.querySelector('[data-menu]');
  const nav=document.querySelector('[data-nav]');
  const updateHeader=()=>header?.classList.toggle('scrolled',scrollY>24);
  updateHeader(); addEventListener('scroll',updateHeader,{passive:true});
  menu?.addEventListener('click',()=>{
    const open=body.classList.toggle('menu-open');
    menu.setAttribute('aria-expanded',String(open));
    menu.setAttribute('aria-label',open?'Close menu':'Open menu');
  });
  nav?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
    body.classList.remove('menu-open'); menu?.setAttribute('aria-expanded','false');
  }));

  const reveals=document.querySelectorAll('.reveal');
  if('IntersectionObserver'in window){
    const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target)}
    }),{threshold:.1});
    reveals.forEach(el=>revealObserver.observe(el));
  }else reveals.forEach(el=>el.classList.add('visible'));

  const sectionLinks=[...document.querySelectorAll('.main-nav a')];
  if('IntersectionObserver'in window){
    const sectionObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){sectionLinks.forEach(link=>link.classList.toggle('active',link.getAttribute('href')==='#'+entry.target.id))}
    }),{rootMargin:'-35% 0px -55%'});
    document.querySelectorAll('main section[id]').forEach(section=>sectionObserver.observe(section));
  }

  const facultyRoot=document.querySelector('[data-faculty-groups]');
  if(facultyRoot&&window.STAFF_GROUPS){
    const requiredOrder=['Teaching Faculty','Laboratory Assistants','Non-Teaching Staff'];
    const labels={'Teaching Faculty':'Teaching Faculty','Laboratory Assistants':'Laboratory Team','Non-Teaching Staff':'Office Team'};
    facultyRoot.innerHTML=requiredOrder.map(title=>{
      const group=window.STAFF_GROUPS.find(item=>item.title===title);
      if(!group) return '';
      const cards=group.people.map(person=>`<article class="faculty-card"><img src="assets/images/${person[3]}" alt="Portrait of ${person[0]}" loading="lazy"><div><b>${person[0]}</b><span>${person[1]}</span><small>${person[2]||''}</small></div></article>`).join('');
      return `<section class="faculty-group reveal"><h3>${labels[title]} <small>— swipe or scroll →</small></h3><div class="faculty-track">${cards}</div></section>`;
    }).join('');
    facultyRoot.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'));
  }

  const achieverRoot=document.querySelector('[data-achiever-groups]');
  if(achieverRoot&&window.ACHIEVER_GROUPS){
    achieverRoot.innerHTML=window.ACHIEVER_GROUPS.map(group=>{
      const cards=group.people.map(person=>{
        const cropX=-(person[2]-120);
        const cropY=-(person[3]-115);
        return `<article class="student-card"><div class="student-portrait" role="img" aria-label="Portrait of ${person[0]}" style="--crop-x:${cropX}px;--crop-y:${cropY}px"></div><div class="student-card-copy"><b>${person[0]}</b><span>${person[1]}</span><small>${group.subtitle}</small></div></article>`;
      }).join('');
      return `<section class="achiever-group"><div class="achiever-group-title"><div><span>${group.subtitle}</span><h4>${group.title}</h4></div><small>Slides automatically · swipe or scroll →</small></div><div class="achiever-track" tabindex="0" aria-label="${group.title} automatic carousel">${cards}</div></section>`;
    }).join('');

    if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      achieverRoot.querySelectorAll('.achiever-track').forEach(track=>{
        let timer;
        let inView=false;
        let spriteReady=false;
        const stop=()=>{window.clearInterval(timer);timer=undefined};
        const start=()=>{
          stop();
          if(!inView||document.hidden||!spriteReady) return;
          timer=window.setInterval(()=>{
            const card=track.querySelector('.student-card');
            if(!card||track.scrollWidth<=track.clientWidth) return;
            const gap=parseFloat(window.getComputedStyle(track).columnGap)||14;
            const step=card.getBoundingClientRect().width+gap;
            const maxScroll=track.scrollWidth-track.clientWidth;
            const next=track.scrollLeft+step;
            track.scrollTo({left:next>=maxScroll-4?0:next,behavior:'smooth'});
          },3200);
        };
        track.dataset.autoplay='true';
        track.addEventListener('mouseenter',stop);
        track.addEventListener('mouseleave',start);
        track.addEventListener('focusin',stop);
        track.addEventListener('focusout',start);
        track.addEventListener('touchstart',stop,{passive:true});
        track.addEventListener('touchend',()=>window.setTimeout(start,1600),{passive:true});
        document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
        const carouselObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
          inView=entry.isIntersecting;
          inView?start():stop();
        }),{threshold:.25});
        carouselObserver.observe(track);
        const sprite=new Image();
        sprite.addEventListener('load',()=>{spriteReady=true;start()},{once:true});
        sprite.src='assets/images/achievers-2025-26-web.jpg';
      });
    }
  }

  document.querySelector('[data-enquiry-form]')?.addEventListener('submit',event=>{
    event.preventDefault();
    const message=event.currentTarget.querySelector('[data-form-message]');
    if(message) message.textContent='Thank you. The enquiry is prepared; connect the college Google Sheets deployment URL to begin receiving submissions.';
  });
  document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
});
