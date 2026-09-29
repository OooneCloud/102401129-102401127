/**
 * page-publish.js —— 发布页逻辑
 *
 * 寻物 / 招领切换字段文案；提交前经 CLFValidate 校验，
 * 未通过时在对应字段下方就地展示错误；通过后写入数据层并弹出成功遮罩。
 */
(function () {
  'use strict';

  CLFUI.mountIcons();
  CLFUI.bindBottomNav();

  var currentType = 'lost';
  var overlay = document.getElementById('successOverlay');

  /* ---------------- 分类下拉 ---------------- */
  var catSelect = document.getElementById('cat');
  CLFValidate.CATEGORIES.forEach(function (c) {
    var opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    catSelect.appendChild(opt);
  });

  /* ---------------- 类型切换 ---------------- */
  var HINTS = {
    lost: '填写丢失物品的名称、地点和你的联系方式，捡到的同学会尽快联系你。',
    found: '请尽量写清拾获地点与物品特征，失主核对无误后即可物归原主。'
  };

  document.getElementById('typeSwitch').addEventListener('click', function (e) {
    var btn = e.target.closest('button');
    if (!btn) return;
    currentType = btn.dataset.type;
    this.querySelectorAll('button').forEach(function (b) {
      b.classList.toggle('is-active', b === btn);
    });
    document.getElementById('typeHint').textContent = HINTS[currentType];
    var isFound = currentType === 'found';
    document.getElementById('placeLabel').childNodes[0].textContent = isFound ? '拾获地点 ' : '丢失地点 ';
    document.getElementById('dateLabel').childNodes[0].textContent = isFound ? '拾获日期 ' : '丢失日期 ';
    document.getElementById('place').placeholder = isFound ? '如：图书馆一层大厅' : '如：三号教学楼 305 教室';
    clearError('type');
  });

  /* ---------------- 备注字数 ---------------- */
  var noteEl = document.getElementById('note');
  var noteCounter = document.getElementById('noteCounter');
  noteEl.addEventListener('input', function () {
    noteCounter.textContent = noteEl.value.length + ' / 100';
    noteCounter.classList.toggle('over', noteEl.value.length > 100);
  });

  /* ---------------- 日期默认今天、不允许未来 ---------------- */
  var dateEl = document.getElementById('date');
  dateEl.value = CLF.todayStr();
  dateEl.max = CLF.todayStr();

  /* ---------------- 校验错误显示 ---------------- */
  function showError(field, msg) {
    var box = document.querySelector('.field[data-field="' + field + '"]');
    if (!box) return;
    box.classList.add('is-error');
    box.querySelector('.err').textContent = msg;
  }

  function clearError(field) {
    var box = document.querySelector('.field[data-field="' + field + '"]');
    if (!box) return;
    box.classList.remove('is-error');
  }

  // 输入即清除该字段的错误态
  document.querySelectorAll('.field input, .field select, .field textarea').forEach(function (el) {
    el.addEventListener('input', function () {
      clearError(el.closest('.field').dataset.field);
    });
  });

  /* ---------------- 提交 ---------------- */
  document.getElementById('postForm').addEventListener('submit', function (e) {
    e.preventDefault();

    var input = {
      type: currentType,
      name: document.getElementById('name').value,
      cat: catSelect.value,
      place: document.getElementById('place').value,
      date: dateEl.value,
      nickname: document.getElementById('nickname').value,
      contact: document.getElementById('contact').value,
      note: noteEl.value
    };

    var result = CLFValidate.validatePost(input, CLF.todayStr());
    if (!result.valid) {
      // 先清空全部错误态，再标记本次出错字段
      document.querySelectorAll('.field').forEach(function (box) { box.classList.remove('is-error'); });
      Object.keys(result.errors).forEach(function (k) { showError(k, result.errors[k]); });
      CLFUI.toast('还有 ' + Object.keys(result.errors).length + ' 项没填对，看看红色提示');
      return;
    }

    var item = CLF.addItem(result.data);
    document.getElementById('viewDetail').href = 'detail.html?id=' + encodeURIComponent(item.id);
    overlay.classList.add('show');
  });

  /* ---------------- 成功遮罩 ---------------- */
  document.getElementById('postAnother').addEventListener('click', function () {
    overlay.classList.remove('show');
    document.getElementById('postForm').reset();
    dateEl.value = CLF.todayStr();
    noteCounter.textContent = '0 / 100';
    window.scrollTo(0, 0);
  });
})();
