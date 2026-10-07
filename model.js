/* Data contracts and local review scheduler, shared by UI and verification. */
(function (root, factory) {
  const model = factory();
  if (typeof module === 'object' && module.exports) module.exports = model;
  else root.LabModel = model;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const VERSION = 1;
  const KEY = 'senior-design-lab.v1';
  const intervals = [1, 3, 7, 14, 30, 60];
  function fresh() {
    return {version:VERSION, lessons:{}, cards:{}, notes:{}, bookmarks:[], projects:{}, skills:{}, theme:'light', goalMinutes:20, lastLesson:null, studyDays:[]};
  }
  function day(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  }
  function addDays(date, count) {
    const next = new Date(date); next.setDate(next.getDate()+count); return next.toISOString();
  }
  function schedule(previous, rating, now = new Date()) {
    if (!['again','hard','good','easy'].includes(rating)) throw new Error('Mức tự đánh giá không hợp lệ.');
    const card = previous || {stage:0,reviews:0};
    const stage = Math.min(5,Math.max(0,card.stage || 0));
    let nextStage = stage, due;
    if (rating === 'again') { nextStage=0; due=new Date(now.getTime()+5*60000).toISOString(); }
    if (rating === 'hard') { nextStage=Math.max(0,stage-1); due=addDays(now,1); }
    if (rating === 'good') { nextStage=Math.min(5,stage+1); due=addDays(now,intervals[stage]); }
    if (rating === 'easy') { nextStage=Math.min(5,stage+2); due=addDays(now,intervals[Math.min(5,stage+1)]); }
    return {stage:nextStage,reviews:(card.reviews || 0)+1,due,rating,lastReviewed:now.toISOString()};
  }
  function cardsFor(lessons) {
    return lessons.flatMap(l => [
      {id:`${l.id}:concept`,lessonId:l.id,module:l.module,kind:'Giải thích',question:l.question,answer:l.answer},
      {id:`${l.id}:case`,lessonId:l.id,module:l.module,kind:'Áp dụng',question:`${l.example[0]} Bạn sẽ tiếp cận thế nào?`,answer:l.example[1]}
    ]);
  }
  function dueCards(state, cards, now = new Date()) {
    return cards.filter(c => state.lessons[c.lessonId]?.started && (!state.cards[c.id] || new Date(state.cards[c.id].due) <= now))
      .sort((a,b) => (state.cards[a.id]?.due || '').localeCompare(state.cards[b.id]?.due || ''));
  }
  function requireObject(value) { return value && typeof value === 'object' && !Array.isArray(value); }
  function validate(data, catalog) {
    if (!requireObject(data) || data.version !== VERSION) throw new Error('Bản sao lưu không đúng định dạng Senior Design Lab.');
    const result=fresh();
    const lessonIds=new Set(catalog.lessons.map(l=>l.id));
    const cardIds=new Set(cardsFor(catalog.lessons).map(c=>c.id));
    const moduleIds=new Set(catalog.modules.map(m=>m.id));
    const projectMap=new Map(catalog.projects.map(p=>[p.id,p]));
    const cleanText = (value,max) => { if (typeof value !== 'string' || value.length > max) throw new Error('Nội dung sao lưu không hợp lệ hoặc quá dài.'); return value; };
    for (const key of ['lessons','cards','notes','projects','skills']) if (!requireObject(data[key])) throw new Error('Bản sao lưu thiếu dữ liệu học tập.');
    for (const [id,value] of Object.entries(data.lessons)) {
      if (!lessonIds.has(id) || !requireObject(value)) throw new Error('Bài học không hợp lệ trong sao lưu.');
      const quiz=value.quiz;
      if (quiz !== undefined && (!requireObject(quiz) || typeof quiz.correct !== 'boolean' || !Number.isInteger(quiz.attempts) || quiz.attempts<1 || quiz.attempts>100000)) throw new Error('Kết quả kiểm tra không hợp lệ.');
      if (value.started !== true || (value.completed !== undefined && typeof value.completed !== 'boolean') || (value.completed && !quiz?.correct)) throw new Error('Tiến độ bài học không hợp lệ.');
      result.lessons[id]={started:true,completed:!!value.completed,...(quiz?{quiz:{correct:quiz.correct,attempts:quiz.attempts}}:{})};
    }
    for (const [id,value] of Object.entries(data.cards)) {
      if (!cardIds.has(id) || !requireObject(value) || !Number.isInteger(value.stage) || value.stage<0 || value.stage>5 || !Number.isInteger(value.reviews) || value.reviews<1 || value.reviews>100000 || typeof value.due!=='string' || !Number.isFinite(Date.parse(value.due)) || typeof value.lastReviewed!=='string' || !Number.isFinite(Date.parse(value.lastReviewed)) || !['again','hard','good','easy'].includes(value.rating)) throw new Error('Lịch ôn tập không hợp lệ.');
      result.cards[id]={stage:value.stage,reviews:value.reviews,due:value.due,lastReviewed:value.lastReviewed,rating:value.rating};
    }
    for (const [id,value] of Object.entries(data.notes)) { if(!lessonIds.has(id)) throw new Error('Ghi chú không khớp bài học.'); result.notes[id]=cleanText(value,30000); }
    if (!Array.isArray(data.bookmarks) || data.bookmarks.some(id=>!lessonIds.has(id))) throw new Error('Danh sách đánh dấu không hợp lệ.');
    result.bookmarks=[...new Set(data.bookmarks)];
    for (const [id,value] of Object.entries(data.projects)) {
      const project=projectMap.get(id);
      if (!project || !requireObject(value) || !Array.isArray(value.checks) || value.checks.some(v=>!Number.isInteger(v)||v<0||v>=project.rubric.length)) throw new Error('Dự án thực hành không hợp lệ.');
      result.projects[id]={draft:cleanText(value.draft,60000),checks:[...new Set(value.checks)]};
    }
    for(const [id,value] of Object.entries(data.skills)) { if(!moduleIds.has(id)||!Number.isInteger(value)||value<0||value>3) throw new Error('Tự đánh giá không hợp lệ.'); result.skills[id]=value; }
    if(!['light','dark'].includes(data.theme) || ![10,20,30].includes(data.goalMinutes) || (data.lastLesson!==null && !lessonIds.has(data.lastLesson)) || !Array.isArray(data.studyDays) || data.studyDays.length>10000 || data.studyDays.some(v=>typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v))) throw new Error('Thiết lập sao lưu không hợp lệ.');
    result.theme=data.theme;result.goalMinutes=data.goalMinutes;result.lastLesson=data.lastLesson;result.studyDays=[...new Set(data.studyDays)];
    return result;
  }
  function completion(state,lessons) { return lessons.filter(l=>state.lessons[l.id]?.completed).length; }
  function touchStudy(state) { const today=day(); if(!state.studyDays.includes(today)) state.studyDays.push(today); }
  return {VERSION,KEY,fresh,day,addDays,schedule,cardsFor,dueCards,validate,completion,touchStudy};
});
