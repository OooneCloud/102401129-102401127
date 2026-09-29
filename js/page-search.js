/**
 * page-search.js —— 搜索页逻辑
 *
 * 支持：输入实时搜索（轻微防抖）、回车与按钮触发、热门词一键搜索；
 * 空结果给出“换关键词 / 去发布”引导，避免用户停在死胡同。
 */
(function () {
  'use strict';

  CLF.seedIfEmpty(CLFSeed.makeDemoItems);
  CLFUI.mountIcons();

  var kwEl = document.getElementById('kw');
  var initSec = document.getElementById('initSec');
  var hotSec = document.getElementById('hotSec');
  var resultSec = document.getElementById('resultSec');
  var resultList = document.getElementById('resultList');
  var resultCount = document.getElementById('resultCount');
  var debounceTimer = null;

  /* 热门关键词 */
  var HOT = ['校园卡', '耳机', '雨伞', '钥匙', '充电器', '保温杯'];
  var hotBox = document.getElementById('hotwords');
  HOT.forEach(function (w) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'hotword';
    b.textContent = w;
    b.addEventListener('click', function () {
      kwEl.value = w;
      runSearch();
    });
    hotBox.appendChild(b);
  });

  function runSearch() {
    var q = kwEl.value.trim();
    if (!q) {
      // 关键词被清空：回到初始态
      initSec.style.display = 'block';
      hotSec.style.display = 'block';
      resultSec.style.display = 'none';
      return;
    }
    var items = CLFSearch.query(CLF.getItems(), { q: q });
    initSec.style.display = 'none';
    hotSec.style.display = 'none';
    resultSec.style.display = 'block';
    resultCount.textContent = '找到 ' + items.length + ' 条与「' + q + '」相关的信息';
    CLFUI.renderCards(resultList, items, {
      icon: 'search',
      title: '没有找到相关物品',
      text: '换个关键词试试；如果是你丢的，也可以发布一条寻物信息，让捡到的同学来找你。',
      actions: '<div class="actions">' +
        '<button class="btn btn-sm btn-outline" type="button" id="clearKw">清空重搜</button>' +
        '<a class="btn btn-sm btn-primary" href="publish.html">去发布寻物</a>' +
        '</div>'
    });
    var clearBtn = document.getElementById('clearKw');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        kwEl.value = '';
        runSearch();
        kwEl.focus();
      });
    }
  }

  kwEl.addEventListener('input', function () {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runSearch, 200);
  });

  kwEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      clearTimeout(debounceTimer);
      runSearch();
    }
  });

  document.getElementById('searchBtn').addEventListener('click', runSearch);

  // 带关键词进入搜索页（如从其他页面跳转）
  var initial = CLFUI.qs('q');
  if (initial) {
    kwEl.value = initial;
  }
  kwEl.focus();
  if (initial) runSearch();
})();
