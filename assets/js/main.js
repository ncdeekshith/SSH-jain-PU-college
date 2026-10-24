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
      return `<section class="faculty-group reveal"><div class="faculty-group-heading"><h3>${labels[title]}</h3><span>${group.people.length} members</span></div><div class="faculty-track">${cards}</div></section>`;
    }).join('');
    facultyRoot.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'));
  }

  const achieverRoot=document.querySelector('[data-achiever-groups]');
  if(achieverRoot&&window.ACHIEVER_GROUPS){
    achieverRoot.innerHTML=window.ACHIEVER_GROUPS.map(group=>{
      const cards=group.people.map(person=>{
        const percentage=Number(person.percentage).toFixed(2).replace(/\.00$/,'');
        const uniformPhoto=person.photo.replace('assets/images/results/','assets/images/results-uniform/');
        return `<article class="student-card"><div class="student-photo"><img src="${uniformPhoto}" alt="Portrait of ${person.name}" loading="lazy" decoding="async"><span>Rank ${person.rank}</span></div><div class="student-card-copy"><b>${person.name}</b><div class="student-result"><strong>${person.marks}<small>/600</small></strong><span>${percentage}%</span></div><small>${group.title} · II PUC 2025–26</small></div></article>`;
      }).join('');
      return `<section class="achiever-group" data-stream="${group.slug}"><div class="achiever-group-title"><div><span>${group.subtitle}</span><h4>${group.title} result roster</h4></div><small>Uniform studio portraits · continuous slider</small></div><div class="achiever-track" tabindex="0" aria-label="${group.title} student results continuous carousel">${cards}</div></section>`;
    }).join('');

    if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      achieverRoot.querySelectorAll('.achiever-track').forEach(track=>{
        let inView=false;
        let interacting=false;
        let lastTime=0;
        const originals=[...track.children];
        originals.forEach(card=>{
          const clone=card.cloneNode(true);
          clone.setAttribute('aria-hidden','true');
          track.appendChild(clone);
        });
        track.dataset.autoplay='continuous';
        track.addEventListener('pointerdown',()=>{interacting=true},{passive:true});
        track.addEventListener('pointerup',()=>{interacting=false},{passive:true});
        track.addEventListener('pointercancel',()=>{interacting=false},{passive:true});
        const carouselObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
          inView=entry.isIntersecting;
        }),{threshold:.25});
        carouselObserver.observe(track);
        const move=timestamp=>{
          const elapsed=lastTime?Math.min(timestamp-lastTime,64):0;
          lastTime=timestamp;
          if(inView&&!document.hidden&&!interacting){
            track.scrollLeft+=elapsed*.045;
            const loopWidth=track.scrollWidth/2;
            if(track.scrollLeft>=loopWidth) track.scrollLeft-=loopWidth;
          }
          window.requestAnimationFrame(move);
        };
        window.requestAnimationFrame(move);
      });
    }
  }

  const sportsRoot=document.querySelector('[data-sports-groups]');
  if(sportsRoot&&window.SPORTS_GROUPS){
    const missingPhotos=window.SPORTS_MISSING_PHOTOS||new Set();
    const initials=name=>name.split(/\s+/).filter(Boolean).slice(0,2).map(part=>part[0]).join('').toUpperCase();
    sportsRoot.innerHTML=window.SPORTS_GROUPS.map((group,groupIndex)=>{
      const cards=group.people.map(person=>{
        const [serial,name,studentClass,achievement]=person;
        const portrait=missingPhotos.has(serial)
          ? `<div class="sport-person-placeholder" aria-label="Photo not supplied for ${name}"><span>${initials(name)}</span></div>`
          : `<img src="assets/images/sports-2026-27-clean/sports-${String(serial).padStart(2,'0')}.webp" alt="Portrait of ${name}" loading="lazy">`;
        const level=/state/i.test(achievement)?'<em>State selected</em>':/district-level selected/i.test(achievement)?'<em>District selected</em>':'';
        return `<article class="sport-person-card">${portrait}<div class="sport-person-copy"><span class="sport-number">${String(serial).padStart(2,'0')}</span><b>${name}</b>${studentClass?`<small>${studentClass}</small>`:''}<p>${achievement}</p>${level}</div></article>`;
      }).join('');
      return `<section class="sports-group sports-group-${groupIndex+1}"><div class="sports-group-heading"><div><span>${String(groupIndex+1).padStart(2,'0')}</span><h4>${group.title}<small lang="kn">${group.titleKn}</small></h4></div><b>${group.people.length} students</b></div><div class="sports-card-grid">${cards}</div></section>`;
    }).join('');
  }

  const eventStories={
    freshers:{category:'Campus culture',title:'Freshers’ Welcome',image:'assets/images/event-freshers-2026.jpg',alt:'Freshers welcome cultural programme',copy:'A welcoming celebration designed to help new students meet their peers, connect with faculty and experience the creative energy of campus life through music, cultural performances and student interaction.'},
    science:{category:'Academic',title:'Science & Laboratory Day',image:'assets/images/subject-physics.jpg',alt:'Students participating in a science laboratory activity',copy:'An activity-led academic day where students explore practical demonstrations, laboratory methods and the real-world applications of Physics, Chemistry and Biology.'},
    sports:{category:'Sports',title:'Inter-College Sports Meet',image:'assets/images/sports-achievers-2026.jpg',alt:'Students celebrating a college sports achievement',copy:'A celebration of fitness, teamwork and disciplined competition, giving students opportunities to represent the college across athletics, team sports and inter-college events.'}
  };
  const eventDialog=document.querySelector('[data-event-dialog]');
  document.querySelectorAll('[data-event-open]').forEach(button=>button.addEventListener('click',()=>{
    const story=eventStories[button.dataset.eventOpen];
    if(!eventDialog||!story) return;
    const image=eventDialog.querySelector('[data-event-image]');
    image.src=story.image; image.alt=story.alt;
    eventDialog.querySelector('[data-event-category]').textContent=story.category;
    eventDialog.querySelector('[data-event-title]').textContent=story.title;
    eventDialog.querySelector('[data-event-copy]').textContent=story.copy;
    eventDialog.showModal();
  }));
  eventDialog?.querySelector('[data-event-close]')?.addEventListener('click',()=>eventDialog.close());
  eventDialog?.addEventListener('click',event=>{if(event.target===eventDialog) eventDialog.close()});

  if(location.hash) requestAnimationFrame(()=>setTimeout(()=>document.querySelector(location.hash)?.scrollIntoView({block:'start'}),120));

  document.querySelector('[data-enquiry-form]')?.addEventListener('submit',event=>{
    event.preventDefault();
    const message=event.currentTarget.querySelector('[data-form-message]');
    if(message) message.textContent='Thank you. The enquiry is prepared; connect the college Google Sheets deployment URL to begin receiving submissions.';
  });
  document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
});
