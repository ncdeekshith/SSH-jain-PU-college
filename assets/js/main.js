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

  document.querySelector('[data-enquiry-form]')?.addEventListener('submit',event=>{
    event.preventDefault();
    const message=event.currentTarget.querySelector('[data-form-message]');
    if(message) message.textContent='Thank you. The enquiry is prepared; connect the college Google Sheets deployment URL to begin receiving submissions.';
  });
  document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
});
