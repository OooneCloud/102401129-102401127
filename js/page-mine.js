/**
 * page-mine.js —— 我的发布页逻辑
 *
 * 「我的发布」= 本机（当前浏览器）发布过的信息，按发布时间倒序。
 * 每条提供：
 *  - 标记为已找到 / 已归还（按信息类型显示对应文案），误标记可恢复为进行中；
 *  - 删除（需二次确认）。
 * 另提供「载入演示数据 / 清空全部数据」，方便测试人员快速构造与重置环境。
 */
(function () {
  'use strict';

  CLF.seedIfEmpty(CLFSeed.makeDemoItems);
  CLFUI.mountIcons();
  CLFUI.bindBottomNav();

  var listEl = document.getElementById('myList');
  var statRow = document.getElementById('statRow');

  function statHTML() {
    var mine = CLF.getMyItems();
    var open = 0, done = 0;
    mine.forEach(function (it) {
      if (it.status === 'resolved') done++; else open++;
    });
    return '<div class="stat-box"><div class="num open">' + open + '</div><div class="cap">进行中（等待线索）</div></div>' +
           '<div class="stat-box"><div class="num done">' + done + '</div><div class="cap">已完成（已找到 / 已归还）</div></div>';
  }

  function itemHTML(item) {
    var done = item.status === 'resolved';
    var markBtn = done
      ? '<button class="btn btn-sm btn-outline" type="button" data-op="reopen" data-id="' + item.id + '">恢复为进行中</button>'
      : '<button class="btn btn-sm btn-green" type="button" data-op="resolve" data-id="' + item.id + '">' +
          (item.type === 'lost' ? '标记为已找到' : '标记为已归还') + '</button>';
    return '<div class="my-item' + (done ? ' is-resolved' : '') + '">' +
      '<div class="row1">' +
        '<span class="name"><a href="detail.html?id=' + encodeURIComponent(item.id) + '">' + CLFUI.escapeHTML(item.name) + '</a></span>' +
        '<span class="badges">' +
          '<span class="badge badge-' + item.type + '">' + CLFUI.typeLabel(item.type) + '</span>' +
          (done ? '<span class="badge badge-resolved">' + CLF.statusLabel(item) + '</span>' : '') +
        '</span>' +
      '</div>' +
      '<div class="sub">' + CLFUI.escapeHTML(item.place) + ' · ' + CLFUI.escapeHTML(CLFUI.formatDate(item.date)) +
        ' · 发布于 ' + CLFUI.escapeHTML(CLFUI.timeAgo(item.createdAt)) + '</div>' +
      '<div class="ops">' + markBtn +
        '<button class="btn btn-sm btn-danger-weak" type="button" data-op="remove" data-id="' + item.id + '">删除</button>' +
      '</div>' +
    '</div>';
  }

  function render() {
    var mine = CLF.getMyItems();
    statRow.innerHTML = statHTML();
    CLFUI.renderCards(listEl, mine, {
      icon: 'user',
      title: '你还没有发布过信息',
      text: '丢了东西或捡到东西？发布一条信息，全校园都能看到。',
      actions: '<div class="actions"><a class="btn btn-sm btn-primary" href="publish.html">去发布</a></div>'
    });
    listEl.querySelectorAll('[data-op]').forEach(function (btn) {
      btn.addEventListener('click', function () { onOp(btn.dataset.op, btn.dataset.id); });
    });
  }

  function onOp(op, id) {
    if (op === 'resolve') {
      var item = CLF.resolveItem(id);
      if (item) CLFUI.toast(item.type === 'lost' ? '已标记为「已找到」' : '已标记为「已归还」');
      render();
    } else if (op === 'reopen') {
      CLF.reopenItem(id);
      CLFUI.toast('已恢复为进行中');
      render();
    } else if (op === 'remove') {
      if (window.confirm('确定删除这条信息吗？删除后不可恢复。')) {
        CLF.removeItem(id);
        CLFUI.toast('已删除');
        render();
      }
    }
  }

  document.getElementById('reseedBtn').addEventListener('click', function () {
    CLF.resetAll();
    CLF.seedIfEmpty(CLFSeed.makeDemoItems);
    CLFUI.toast('已重置为演示数据');
    render();
  });

  document.getElementById('clearBtn').addEventListener('click', function () {
    if (window.confirm('确定清空全部数据吗？包括演示数据与你本机发布的所有信息。')) {
      CLF.resetAll();
      CLFUI.toast('已清空全部数据');
      render();
    }
  });

  render();
})();
