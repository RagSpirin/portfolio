(() => {
  const editionNotes = {
    '포켓몬스터 시리즈 (GBA·DS)': 'GBA에서 플레이한 버전은 포켓몬스터 파이어레드로 추정',
    '리듬 천국 (リズム天国)': '리듬 세상 시리즈의 첫 작품 · GBA'
  };
  const archive = {
    playstation: {
      title: 'PlayStation 게임 목록',
      groups: {
        PS5: [
          'Ratchet & Clank: Rift Apart', 'DEATH STRANDING 2: ON THE BEACH', 'Demon’s Souls',
          '스타워즈 제다이: 오더의 몰락', 'Stellar Blade', 'God of War Ragnarök (발할라 포함)', 'ASTRO’s PLAYROOM',
          '바이오하자드 빌리지', 'Returnal'
        ],
        PS4: [
          'inFAMOUS Second Son', 'God of War III Remastered', 'Patapon Remastered', 'Invector',
          'Shadow of the Colossus', 'God of War', '스타워즈 제다이: 오더의 몰락', 'GRAVITY RUSH 2',
          '바이오하자드 빌리지', '철권 7', 'Horizon Zero Dawn', 'UNCHARTED 4: A Thief’s End',
          '드래곤 퀘스트 XI 지나간 시간을 찾아서', 'HELLDIVERS', 'Call of Duty: WWII', 'Bloodborne',
          'Monster Hunter: World', 'Sekiro: Shadows Die Twice', 'The Dark Pictures Anthology: Little Hope',
          'Red Dead Redemption 2', '바이오하자드 RE:2', 'Devil May Cry 5', 'Call of Duty: Modern Warfare Remastered',
          'Marvel’s Spider-Man', 'The Crew 2', 'BEYOND: Two Souls', 'The Last of Us Remastered',
          'FIFA 19', 'Until Dawn', 'Destiny 2', 'LET IT DIE', 'Trials Fusion', '태고의 달인 모두 함께 쿵딱쿵!',
          'Ratchet & Clank', 'Detroit: Become Human', 'Journey', 'Call of Duty: Black Ops III',
          'Gran Turismo Sport', 'Alone With You', 'Mirror’s Edge Catalyst'
        ],
        PS2: [
          '렛츠 브라보 뮤직', 'Time Crisis 3', 'EyeToy 시리즈', 'Ratchet & Clank 시리즈',
          '슬라이 쿠퍼 시리즈', '뽀삐사루 3'
        ]
      }
    },
    classic: {
      title: '닌텐도·고전 콘솔 게임 목록',
      groups: {
        '닌텐도 고전': [
          '포켓몬스터 시리즈 (GBA·DS)', '별의 커비 도팡 일당의 습격', '리듬 천국 (リズム天国)',
          '젤다의 전설', '젤다 II 링크의 모험 (Zelda II: The Adventure of Link)', '젤다의 전설 몽환의 모래시계',
          '슈퍼 마리오브라더스', '슈퍼 마리오 USA (Super Mario Bros. 2)', '슈퍼 마리오브라더스 3',
          '슈퍼 마리오 시리즈 (DS·Wii)', '와리오 랜드 4',
          '젤다의 전설 신들의 트라이포스', '젤다의 전설 The Minish Cap (이상한 모자)', '젤다의 전설 황혼의 공주',
          '피크민 시리즈', '바이오하자드 시리즈 (Wii)'
        ],
        '스위치': [
          '젤다의 전설 브레스 오브 더 와일드', '젤다의 전설 티어스 오브 더 킹덤', '슈퍼 마리오 오디세이', '피크민 4'
        ],
        '기타 콘솔': [
          '역전재판', 'FINAL FANTASY III',
          '철권 시리즈', '진·삼국무쌍 시리즈', 'Rayman 3: Hoodlum Havoc', '괴혼 시리즈',
          'Michael Jackson’s Moonwalker', 'LEGO Star Wars 시리즈', 'Prince of Persia: The Sands of Time',
          '메탈슬러그 시리즈', 'LEGO Indiana Jones', 'Harry Potter 시리즈', 'SSX Tricky',
          'Grand Theft Auto: Chinatown Wars', 'Crash Bandicoot', 'Star Wars: The Force Unleashed'
        ]
      }
    }
  };

  const dialog = document.querySelector('#play-library');
  const title = dialog.querySelector('#library-title');
  const search = dialog.querySelector('#library-search');
  const filters = dialog.querySelector('#library-filters');
  const list = dialog.querySelector('#library-titles');
  const empty = dialog.querySelector('#library-empty');
  const status = dialog.querySelector('#library-status');
  const prev = dialog.querySelector('#library-prev');
  const next = dialog.querySelector('#library-next');
  const pageSize = 6;
  let records = [];
  let selectedGroup = '';
  let page = 0;
  let opener;

  function updateList() {
    const query = search.value.replace(/\s+/g, '').toLocaleLowerCase();
    const matches = records.filter(([name, groups]) => {
      const searchable = (name + (editionNotes[name] || '')).replace(/\s+/g, '').toLocaleLowerCase();
      return (!selectedGroup || groups.includes(selectedGroup)) && searchable.includes(query);
    });
    const pageCount = Math.ceil(matches.length / pageSize);
    list.replaceChildren();
    for (const [name, groups] of matches.slice(page * pageSize, (page + 1) * pageSize)) {
      const item = document.createElement('li');
      const gameName = document.createElement('span');
      const label = document.createElement('small');
      gameName.textContent = name;
      label.textContent = groups.join(' · ');
      item.append(gameName, label);
      if (editionNotes[name]) {
        const note = document.createElement('small');
        note.className = 'library-edition-note';
        note.textContent = editionNotes[name];
        item.append(note);
      }
      list.append(item);
    }
    empty.hidden = matches.length > 0;
    status.textContent = pageCount ? `총 ${matches.length}개 · ${page + 1} / ${pageCount} 페이지` : '0개';
    prev.setAttribute('aria-disabled', String(page === 0));
    next.setAttribute('aria-disabled', String(page + 1 >= pageCount));
  }

  function selectGroup(group) {
    selectedGroup = group;
    page = 0;
    for (const tab of filters.children) {
      tab.setAttribute('aria-pressed', String(tab.dataset.group === group));
    }
    updateList();
  }

  for (const button of document.querySelectorAll('[data-library]')) {
    const library = archive[button.dataset.library];
    const titles = new Map();
    for (const [group, names] of Object.entries(library.groups)) {
      for (const name of names) {
        if (!titles.has(name)) titles.set(name, []);
        titles.get(name).push(group);
      }
    }
    button.closest('.device-summary').querySelector('[data-library-count]').textContent = titles.size;
    button.hidden = false;
    button.addEventListener('click', () => {
      records = [...titles];
      title.textContent = library.title;
      filters.replaceChildren();
      for (const group of ['', ...Object.keys(library.groups)]) {
        const filter = document.createElement('button');
        filter.type = 'button';
        filter.textContent = group || '전체';
        filter.dataset.group = group;
        filter.addEventListener('click', () => selectGroup(group));
        filters.append(filter);
      }
      opener = button;
      search.value = '';
      selectGroup('');
      dialog.showModal();
      title.focus({preventScroll: true});
    });
  }

  search.addEventListener('input', () => {
    page = 0;
    updateList();
  });
  search.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !event.isComposing) {
      event.preventDefault();
      dialog.close();
    }
  });
  prev.addEventListener('click', () => {
    if (prev.getAttribute('aria-disabled') === 'true') return;
    page -= 1;
    updateList();
  });
  next.addEventListener('click', () => {
    if (next.getAttribute('aria-disabled') === 'true') return;
    page += 1;
    updateList();
  });
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => opener?.focus({preventScroll: true}));
})();

