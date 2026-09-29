/**
 * page-index.js —— 首页逻辑
 *
 * 首次打开自动灌入演示数据；支持 类型（全部/寻物/招领）× 分类 × 状态
 * 三重筛选，组合查询逻辑全部来自 search.js（与单元测试覆盖同一份代码）。
 */
(function () {
  'use strict';

  CLF.seedIfEmpty(CLFSeed.makeDemoItems);   // 首次打开灌入演示数据
  CLFUI.mountIcons();
  CLFUI.bindBottomNav();

  var state = { type: 'all', cat: 'all', status: 'all' };
  var listEl = document.getElementById('list');
  var countEl = document.getElementById('count');

  if (!CLF.isPersistent) {
    document.getElementById('storageNote').style.display = 'block';
  }

  /* 分类筛选 chips */
  var catBar = document.getElementById('catBar');
  var chips = ['<button class="chip is-active" data-cat="all" type="button">全部类别</button>'];
  CLF.CATEGORIES.forEach(function (c) {
    chips.push('<button class="chip" data-cat="' + c + '" type="button">' + c + '</button>');
  });
  catBar.innerHTML = chips.join('');

  function apply() {
    var items = CLFSearch.query(CLF.getItems(), state);
    CLFUI.renderCards(listEl, items, {
      icon: 'box',
      title: '没有匹配的信息',
      text: '试试切换上方的筛选条件，或者发布一条新信息',
      actions: '<div class="actions"><a class="btn btn-sm btn-primary" href="publish.html">去发布</a></div>'
    });
    countEl.textContent = '共 ' + items.length + ' 条信息';
  }

  /* 类型 chips */
  document.getElementById('typeBar').addEventListener('click', function (e) {
    var btn = e.target.closest('.chip');
    if (!btn) return;
    state.type = btn.dataset.type;
    this.querySelectorAll('.chip').forEach(function (b) {
      b.classList.toggle('is-active', b === btn);
    });
    apply();
  });

  /* 分类 chips */
  catBar.addEventListener('click', function (e) {
    var btn = e.target.closest('.chip');
    if (!btn) return;
    state.cat = btn.dataset.cat;
    this.querySelectorAll('.chip').forEach(function (b) {
      b.classList.toggle('is-active', b === btn);
    });
    apply();
  });

  /* 状态分段器 */
  document.getElementById('statusSeg').addEventListener('click', function (e) {
    var btn = e.target.closest('button');
    if (!btn) return;
    state.status = btn.dataset.status;
    this.querySelectorAll('button').forEach(function (b) {
      b.classList.toggle('is-active', b === btn);
    });
    apply();
  });

  apply();
})();
