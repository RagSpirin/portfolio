const roleViews={
  air:['cannon-gate.webp','봉을 잡는 비행자와 지상 담당자의 관문 기획도','기획 도해 · 톱 관문','봉에 매달려 지상 통로의 톱을 멈추는 비행자. 동료가 지나간 뒤 다음 착지로 이동'],
  ground:['played-m2-takeoff.webp','지상 담당의 트램펄린과 대포 출발점','M2 직접 플레이 · 지상 출발점','낙하지점으로 트램펄린을 옮기는 지상 담당. 톱이 멈춘 사이 통과해 다음 착지 준비']
};
const roomViews={
  golem:['test-pursuer.webp','공장 통로의 골렘','플레이테스트 빌드 · 추격자 조우','한 명이 골렘의 시선을 끄는 동안 발판을 건너는 동료. 길을 읽을 시간과 머물 때의 위험을 함께 설계'],
  fork:['live-conveyor.webp','컨베이어 아래의 고정 착지대','Unity 씬 · 컨베이어 관측장','순환봉·하층 연속봉·대포 중 선택. 서로 다른 세 경로가 같은 하차장에서 합류'],
  bridge:['live-return.webp','반환교 선택 발판의 양쪽 경로','Unity 씬 · 반환교','한쪽은 외줄부터, 반대편은 봉부터 진행. 부상이나 숙련도에 따라 고른 경로가 같은 잠금문 앞에서 합류'],
  exit:['m3-final.webp','골렘과 배선이 있는 작업장','M3 최종 테스트 · 배선 작업장','배선 전체 절단과 추격자 전원 처치 후 팀 공용 출구 개방']
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
bindViews('role',roleViews,'role-photo','role-cap','role-text');
bindViews('room',roomViews,'route-photo','route-caption','room-text');
const plots=document.querySelector('.response-plots');
if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{
    if(entries.some(entry=>entry.isIntersecting)){plots.classList.add('motion-in');observer.disconnect();}
  });observer.observe(plots);
}
