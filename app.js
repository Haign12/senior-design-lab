(() => {
  'use strict';
  const D=window.LAB_DATA,M=window.LabModel,V=window.LabViews;
  const main=document.getElementById('main'),sidebar=document.getElementById('sidebar'),mobile=matchMedia('(max-width: 959px)');
  let state=M.fresh(),session=null,saveBlocked=false,toastTimer=null,pendingImport=null,menuOpen=false;
  function warning(message){const el=document.getElementById('storage-warning');el.textContent=message;el.hidden=false;}
  try { const raw=localStorage.getItem(M.KEY);if(raw)state=M.validate(JSON.parse(raw),D); }
  catch(error){saveBlocked=true;warning('Không đọc được dữ liệu đã lưu. Phiên này giữ dữ liệu trong bộ nhớ, chưa ghi đè bản cũ. Bạn có thể xuất bản sao lưu hoặc khôi phục tại Dữ liệu học tập.');}
  function save(){
    if(saveBlocked)return false;
    try { localStorage.setItem(M.KEY,JSON.stringify(state));return true; }
    catch(error){warning('Trình duyệt chưa lưu được dữ liệu. Việc học vẫn tiếp tục trong phiên này; hãy xuất bản sao lưu trước khi đóng trang.');return false;}
  }
  function toast(message){const el=document.getElementById('toast');el.textContent=message;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{el.hidden=true;},4000);}
  function parseRoute(){const raw=location.hash.slice(1)||'home';const [path,search='']=raw.split('?');return {path,params:new URLSearchParams(search)};}
  function updateChrome(){
    document.documentElement.dataset.theme=state.theme;
    document.getElementById('theme-toggle').innerHTML=state.theme==='light'?'Chế độ tối <span aria-hidden="true">◐</span>':'Chế độ sáng <span aria-hidden="true">◑</span>';
    const count=M.dueCards(state,M.cardsFor(D.lessons)).length;
    document.getElementById('due-count').textContent=count;
    const path=parseRoute().path,active=path.startsWith('lesson/')?'learn':path;
    document.querySelectorAll('[data-nav]').forEach(a=>{const selected=a.dataset.nav===active;a.classList.toggle('active',selected);if(selected)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  }
  function render(focus=false){
    const {path,params}=parseRoute();
    if(path!=='review')session=null;
    let html,title;
    if(path.startsWith('lesson/')){
      const id=path.slice(7),lesson=D.lessons.find(l=>l.id===id);
      if(lesson){state.lessons[id]||={started:true,completed:false};state.lastLesson=id;save();title=lesson.title;}
      html=V.lesson(state,id);
    }else{
      const map={home:()=>V.home(state),learn:()=>V.learn(state,params),review:()=>V.review(state,session),practice:()=>V.practice(state,params),notebook:()=>V.notebook(state),roadmap:()=>V.roadmap(state),methods:V.methods,settings:()=>V.settings(state)};
      html=(map[path]||V.notFound)();
      title={home:'Học hôm nay',learn:'Các chặng học',review:'Ôn tập',practice:'Xưởng thực hành',notebook:'Sổ tay',roadmap:'Lộ trình & năng lực',methods:'Cách học',settings:'Dữ liệu học tập'}[path];
    }
    main.innerHTML=html;document.title=`${title||'Nội dung'} · Senior Design Lab`;updateChrome();
    if(focus){window.scrollTo({top:0,behavior:'instant'});main.focus({preventScroll:true});}
  }
  function menu(open,returnFocus=true){
    menuOpen=open&&mobile.matches;
    document.body.classList.toggle('menu-open',menuOpen);
    document.getElementById('menu-toggle').setAttribute('aria-expanded',String(menuOpen));
    document.getElementById('sidebar-backdrop').hidden=!menuOpen;
    document.querySelector('.workspace').inert=menuOpen;
    sidebar.inert=mobile.matches&&!menuOpen;
    if(mobile.matches&&!menuOpen)sidebar.setAttribute('aria-hidden','true');else sidebar.removeAttribute('aria-hidden');
    if(menuOpen){sidebar.setAttribute('role','dialog');sidebar.setAttribute('aria-modal','true');sidebar.setAttribute('aria-label','Mục lục học tập');sidebar.querySelector('#menu-close').focus();}
    else{sidebar.removeAttribute('role');sidebar.removeAttribute('aria-modal');sidebar.removeAttribute('aria-label');if(returnFocus&&mobile.matches)document.getElementById('menu-toggle').focus();}
  }
  function download(filename,content,type){const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  function search(){const input=document.getElementById('lesson-search'),filter=document.getElementById('module-filter');if(!input||!filter)return;
    document.getElementById('lesson-results').innerHTML=V.learnResults(state,input.value,filter.value);
    const p=new URLSearchParams();if(input.value)p.set('search',input.value);if(filter.value!=='all')p.set('module',filter.value);
    history.replaceState(null,'',`${location.pathname}${location.search}#learn${p.size?'?'+p.toString():''}`);
  }
  document.addEventListener('click',event=>{
    const scroll=event.target.closest('[data-scroll]');
    if(scroll){event.preventDefault();const target=document.getElementById(scroll.dataset.scroll);target?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});target?.setAttribute('tabindex','-1');target?.focus({preventScroll:true});return;}
    const skip=event.target.closest('.skip-link');if(skip){event.preventDefault();main.focus();return;}
    const routeLink=event.target.closest('a[href^="#"]');if(routeLink&&menuOpen)menu(false,false);
    const button=event.target.closest('[data-action]');if(!button)return;
    const {action,id}=button.dataset;
    if(action==='bookmark'){
      const existed=state.bookmarks.includes(id);state.bookmarks=existed?state.bookmarks.filter(x=>x!==id):[...state.bookmarks,id];save();
      const inNotebook=parseRoute().path==='notebook';
      if(inNotebook){render();document.querySelector('.page-heading h1')?.setAttribute('tabindex','-1');document.querySelector('.page-heading h1')?.focus();}
      else{document.querySelectorAll(`[data-action="bookmark"][data-id="${id}"]`).forEach(b=>{b.classList.toggle('is-saved',!existed);b.setAttribute('aria-pressed',String(!existed));b.setAttribute('aria-label',`${existed?'Đánh dấu':'Bỏ đánh dấu'} bài học`);b.textContent=existed?'◇':'◆';});}
      toast(existed?'Đã bỏ đánh dấu.':'Đã thêm vào sổ tay.');
    }
    if(action==='complete'&&state.lessons[id]?.quiz?.correct){state.lessons[id].completed=true;M.touchStudy(state);const saved=save();render();const el=document.querySelector('.lesson-completion');el?.scrollIntoView({block:'center'});toast(saved?'Đã lưu tiến độ bài học.':'Đã ghi tiến độ trong phiên. Hãy xuất bản sao lưu.');}
    if(action==='clear-search'){document.getElementById('lesson-search').value='';document.getElementById('module-filter').value='all';search();document.getElementById('lesson-search').focus();}
    if(action==='start-review'){
      const mode=button.dataset.mode,filter=document.getElementById('review-module')?.value||'all';
      let queue=mode==='due'?M.dueCards(state,M.cardsFor(D.lessons)):M.cardsFor(D.lessons).filter(c=>filter==='all'||c.module===filter);
      if(!queue.length){toast('Chưa có thẻ đến hạn. Bạn có thể luyện tự do.');return;}
      // Free practice alternates module concepts/cases instead of sorting by chapter.
      if(mode==='free'){const groups=D.modules.map(m=>queue.filter(c=>c.module===m.id));queue=[];for(let i=0;i<8;i++)for(const group of groups)if(group[i])queue.push(group[i]);queue=queue.slice(0,12);}
      session={mode,queue,index:0,revealed:false};render();window.scrollTo(0,0);main.focus();
    }
    if(action==='end-review'){session=null;render();main.focus();}
    if(action==='reveal-card'&&session){session.revealed=true;button.hidden=true;const answer=document.getElementById('flashcard-answer');answer.hidden=false;document.querySelector('.rating-area').hidden=false;answer.setAttribute('tabindex','-1');answer.focus({preventScroll:true});}
    if(action==='rate-card'&&session?.revealed){
      const card=session.queue[session.index];if(!card)return;
      if(session.mode==='due')state.cards[card.id]=M.schedule(state.cards[card.id],button.dataset.rating);
      M.touchStudy(state);save();session.index++;session.revealed=false;render();main.focus();
    }
    if(action==='export-data'){download(`senior-design-lab-${M.day()}.json`,JSON.stringify({...state,exportedAt:new Date().toISOString()},null,2),'application/json');toast('Đã tạo bản sao lưu dữ liệu.');}
    if(action==='export-project'){
      const p=D.projects.find(p=>p.id===id),draft=state.projects[id]?.draft||'';
      download(`${id}-workbook.md`,`# ${p.title}\n\n## Đề bài giả định\n${p.brief}\n\n## Bản nháp của bạn\n${draft||'(Chưa có bản nháp)'}\n\n## Tiêu chí tự kiểm\n${p.rubric.map((r,i)=>`- [${state.projects[id]?.checks.includes(i)?'x':' '}] ${r}`).join('\n')}\n`,'text/markdown;charset=utf-8');
    }
  });
  document.addEventListener('submit',event=>{
    if(event.target.id!=='quiz-form')return;event.preventDefault();const form=event.target,id=form.dataset.lesson,lesson=D.lessons.find(l=>l.id===id),selected=new FormData(form).get('answer');if(selected===null){form.reportValidity();return;}
    const correct=Number(selected)===lesson.correct,old=state.lessons[id].quiz;state.lessons[id].quiz={correct:!!old?.correct||correct,attempts:(old?.attempts||0)+1};M.touchStudy(state);save();
    const box=document.getElementById('quiz-feedback');box.hidden=false;box.className=`quiz-feedback ${correct?'correct':'retry'}`;box.innerHTML=correct?`<strong>Đúng hướng rồi.</strong><p>${V.e(lesson.feedback)}</p>`:`<strong>Thử nghĩ lại nhé.</strong><p>${V.e(lesson.feedback)}</p><p>Đối chiếu phần cốt lõi rồi chọn lại. Lần thử này không khóa bài học.</p>`;
    document.querySelector('[data-action="complete"]').disabled=!state.lessons[id].quiz.correct||state.lessons[id].completed;
    document.querySelector('.lesson-completion p').textContent=state.lessons[id].quiz.correct?'Khi đã đọc, tự nhớ và làm bài tập, hãy xác nhận để ghi lại tiến độ.':'Hoàn thành kiểm tra nhanh trước khi ghi nhận bài đã học. Bài đọc luôn mở tự do.';
    box.setAttribute('tabindex','-1');box.focus({preventScroll:true});updateChrome();
  });
  document.addEventListener('input',event=>{
    const el=event.target;if(el.id==='lesson-search'){search();return;}
    if(el.dataset.note){state.notes[el.dataset.note]=el.value.slice(0,30000);const ok=save();document.getElementById('note-status').textContent=ok?'Đã lưu trên trình duyệt':'Giữ trong phiên này; hãy xuất backup';}
    if(el.dataset.project){const id=el.dataset.project;state.projects[id]||={draft:'',checks:[]};state.projects[id].draft=el.value.slice(0,60000);const ok=save();document.getElementById('draft-status').textContent=ok?'Đã lưu trên trình duyệt':'Giữ trong phiên này; hãy xuất backup';}
  });
  document.addEventListener('change',async event=>{
    const el=event.target;
    if(el.id==='module-filter')search();
    if(el.id==='daily-goal'){state.goalMinutes=Number(el.value);save();document.getElementById('daily-plan').textContent={10:'10 phút: đọc phần cốt lõi và tự nhớ. Bạn có thể làm bài tập vào phiên sau.',20:'20 phút: đọc bài, tự nhớ và làm kiểm tra nhanh.',30:'30 phút: học bài, kiểm tra và dành thêm thời gian cho bài tập.'}[state.goalMinutes];toast('Đã cập nhật nhịp học bạn chọn.');}
    if(el.dataset.skill){if(el.value==='')delete state.skills[el.dataset.skill];else state.skills[el.dataset.skill]=Number(el.value);save();}
    if(el.dataset.rubric){const id=el.dataset.rubric;state.projects[id]||={draft:'',checks:[]};const checks=state.projects[id].checks,index=Number(el.value);state.projects[id].checks=el.checked?[...new Set([...checks,index])]:checks.filter(v=>v!==index);save();document.getElementById('rubric-count').textContent=`${state.projects[id].checks.length}/${D.projects.find(p=>p.id===id).rubric.length} tiêu chí đã tự kiểm`;}
    if(el.id==='backup-file'){
      const file=el.files[0];if(!file)return;const feedback=document.getElementById('import-feedback');
      try{if(file.size>3000000)throw new Error('File quá lớn. Chỉ nhận bản sao lưu dưới 3 MB.');pendingImport=M.validate(JSON.parse(await file.text()),D);
        document.getElementById('confirm-text').textContent=`Bản sao lưu gồm ${M.completion(pendingImport,D.lessons)} bài hoàn thành, ${Object.values(pendingImport.notes).filter(n=>n.trim()).length} ghi chú và ${Object.keys(pendingImport.projects).length} dự án có dữ liệu. Khôi phục sẽ thay dữ liệu hiện tại trên trình duyệt này. Hãy xuất bản hiện tại trước nếu cần giữ.`;
        document.getElementById('confirm-dialog').showModal();
      }catch(error){pendingImport=null;feedback.className='import-error';feedback.textContent=`Chưa khôi phục: ${error.message} Dữ liệu hiện tại vẫn giữ nguyên.`;el.value='';}
    }
  });
  document.getElementById('confirm-dialog').addEventListener('close',event=>{
    if(event.target.returnValue==='confirm'&&pendingImport){state=pendingImport;saveBlocked=false;document.getElementById('storage-warning').hidden=true;const saved=save();render();toast(saved?'Đã khôi phục dữ liệu học tập.':'Đã khôi phục trong phiên; trình duyệt chưa lưu được.');}
    pendingImport=null;const file=document.getElementById('backup-file');if(file)file.value='';
  });
  document.getElementById('theme-toggle').addEventListener('click',()=>{state.theme=state.theme==='light'?'dark':'light';save();updateChrome();});
  document.getElementById('menu-toggle').addEventListener('click',()=>menu(!menuOpen));
  document.getElementById('menu-close').addEventListener('click',()=>menu(false));
  document.getElementById('sidebar-backdrop').addEventListener('click',()=>menu(false));
  mobile.addEventListener('change',()=>menu(false,false));
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&menuOpen){event.preventDefault();menu(false);}
    if(event.key==='Tab'&&menuOpen){const items=Array.from(sidebar.querySelectorAll('a,button')).filter(el=>!el.hidden);const first=items[0],last=items[items.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
    if(event.key==='/'&&!event.ctrlKey&&!event.metaKey&&!event.altKey&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)&&!document.getElementById('confirm-dialog').open){event.preventDefault();location.hash='learn?search=';setTimeout(()=>document.getElementById('lesson-search')?.focus(),0);}
  });
  window.addEventListener('hashchange',()=>{menu(false,false);render(true);});
  window.addEventListener('pageshow',()=>updateChrome());
  // The due count is time-sensitive (e.g. a forgotten card becomes due after 5 minutes).
  setInterval(()=>{updateChrome();if(parseRoute().path==='review'&&!session&&document.activeElement===document.body)render();},60000);
  menu(false,false);render();
})();
