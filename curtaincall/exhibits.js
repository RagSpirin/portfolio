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
const plots=document.querySelector('.response-plots');
if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{
    if(entries.some(entry=>entry.isIntersecting)){plots.classList.add('motion-in');observer.disconnect();}
  });observer.observe(plots);
}
