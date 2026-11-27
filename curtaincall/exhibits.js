const roleRules={
  air:'대포로 발사된 뒤 봉을 잡아 지상 통로의 톱을 정지. 동료가 지나가면 다음 착지점으로 이동.',
  ground:'비행자의 낙하지점으로 트램펄린 운반. 톱이 멈춘 사이 관문을 통과해 동료의 착지를 받는 역할.'
};
for (const button of document.querySelectorAll('[data-role]')) {
  button.addEventListener('click',()=>{
    for (const peer of document.querySelectorAll('[data-role]')) {
      peer.setAttribute('aria-pressed',String(peer===button));
    }
    document.querySelector('#role-text').textContent=roleRules[button.dataset.role];
  });
}
const roomViews={
  golem:['m3-wire-golem-encounter.webp','깊은 틈 위 외줄을 건너는 두 단원과 건너편 착지 발판의 골렘','M3 · 외줄 건너편의 골렘','두 단원은 좁은 외줄 위, 골렘은 건너편 착지 발판에 위치. 먼저 건너는 단원이 골렘의 시선을 끌고 동료가 지나갈 틈을 만드는 협동 설계.'],
  fork:['live-conveyor.webp','컨베이어 아래의 고정 착지대','M3 · 컨베이어 관측장','순환봉 대기, 하층 연속봉, 대포 발사 중 하나를 선택. 세 경로의 합류 지점은 컨베이어 하차장.'],
  bridge:['live-return.webp','반환교 선택 발판의 양쪽 경로','M3 · 반환교','한쪽은 외줄에서 봉으로, 반대쪽은 봉에서 외줄로 이동. 부상 상태와 숙련도에 맞춰 순서를 고른 뒤 같은 잠금문에서 합류.'],
  exit:['m3-final.webp','골렘과 배선이 있는 작업장','M3 · 배선 작업장','출구 개방 조건은 배선 절단과 추격자 전원 처치. 마지막 작업장에서 팀이 함께 탈출.']
};
function bindViews(selector,data,imageId,captionId,descriptionId){
  const buttons=[...document.querySelectorAll('button[data-'+selector+']')];
  for(const button of buttons)button.addEventListener('click',()=>{
    const [src,alt,caption,description]=data[button.dataset[selector]];
    const image=document.getElementById(imageId);
    image.src='assets/'+src;image.alt=alt;
    document.getElementById(captionId).textContent=caption;
    document.getElementById(descriptionId).textContent=description;
    buttons.forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
  });
}
bindViews('room',roomViews,'route-photo','route-caption','room-text');
const plots=document.querySelector('.response-plots');
if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{
    if(entries.some(entry=>entry.isIntersecting)){plots.classList.add('motion-in');observer.disconnect();}
  });observer.observe(plots);
}
