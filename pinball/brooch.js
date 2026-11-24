(() => {
  const demo = document.querySelector('.brooch-demo');
  const status = demo.querySelector('.demo-status');
  const steps = [...demo.querySelectorAll('.brooch-route i')];
  const visited = new Set();
  let started = false;
  let complete = false;

  function show(message) {
    const count = complete ? 4 : started ? visited.size + 1 : 0;
    steps.forEach((step, index) => step.classList.toggle('hit', index < count));
    const targets = [...visited];
    for (let index = 0; index < 2; index++) {
      steps[index + 1].textContent = targets[index] ? '단추 ' + targets[index].toUpperCase() : '단추';
    }
    status.textContent = message;
  }

  demo.querySelectorAll('[data-hit]').forEach(button => {
    button.addEventListener('click', () => {
      const target = button.dataset.hit;
      if (complete) {
        show('수리를 마쳤습니다. 다시 해 보려면 ‘처음부터’를 누르세요.');
      } else if (target === 'brooch') {
        if (visited.size === 2) {
          complete = true;
          show('수리 완성! 두 단추를 거쳐 브로치로 돌아왔습니다.');
        } else {
          const restarting = started;
          started = true;
          visited.clear();
          show(restarting ? '브로치에 일찍 돌아와 수리를 다시 시작합니다. 두 단추를 차례로 맞히세요.' : '수리를 시작했습니다. 서로 다른 단추 두 개를 맞히세요.');
        }
      } else if (!started) {
        show('먼저 브로치를 눌러 수리를 시작하세요.');
      } else if (visited.has(target)) {
        show(visited.size === 2 ? '두 단추를 모두 맞혔습니다. 브로치로 돌아오세요.' : '이미 맞힌 단추입니다. 다른 단추를 맞히세요.');
      } else {
        visited.add(target);
        show(visited.size === 2 ? '두 단추를 모두 맞혔습니다. 브로치로 돌아오세요.' : '첫 단추를 맞혔습니다. 다른 단추를 맞히세요.');
      }
    });
  });

  demo.querySelector('.redo').addEventListener('click', () => {
    started = false;
    complete = false;
    visited.clear();
    show('브로치를 눌러 수리를 시작하세요.');
  });
})();
