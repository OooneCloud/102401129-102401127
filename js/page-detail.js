/**
 * page-detail.js —— 详情页逻辑
 *
 * 信息来源：detail.html?id=xxx，从数据层按 id 读取并整体渲染（渲染前转义）。
 * 提供：
 *  - 联系方式一键复制（clipboard API + execCommand 降级）；
 *  - 发布者操作面板：仅当信息是“本机发布”时出现，可标记已找到/已归还、
 *    误标记可恢复为进行中、可删除 —— 状态变更立即落库，列表页刷新即见。
 */
(function () {
  'use strict';

  CLFUI.mountIcons();

  var wrap = document.getElementById('detailWrap');
  var id = CLFUI.qs('id');

  var PHONE_RE = /^1\d{10}$/;

  function resolvedBanner(item) {
    return '<div class="banner-resolved">' + CLFUI.icon('check') +
      '<span>该信息已标记为「' + CLF.statusLabel(item) + '」，感谢每一位帮忙的同学！</span></div>';
  }

  function ownerPanelHTML(item) {
    var markLabel = item.type === 'lost' ? '标记为已找到' : '标记为已归还';
    var ops;
    if (item.status === 'open') {
      ops = '<button class="btn btn-sm btn-green" type="button" data-op="resolve">' + markLabel + '</button>' +
            '<button class="btn btn-sm btn-danger-weak" type="button" data-op="remove">删除</button>';
    } else {
      ops = '<button class="btn btn-sm btn-outline" type="button" data-op="reopen"><span style="display:inline-flex">' + CLFUI.icon('undo') + '</span>恢复为进行中</button>' +
            '<button class="btn btn-sm btn-danger-weak" type="button" data-op="remove">删除</button>';
    }
    return '<div class="owner-panel">' +
      '<p class="pt">这条信息是你发布的。物品找回 / 归还后，请及时更新状态，避免其他同学继续联系你。</p>' +
      '<div class="ops">' + ops + '</div>' +
      '</div>';
  }

  function render() {
    var item = CLF.getItem(id);
    if (!item) {
      wrap.innerHTML = '<div class="empty">' +
        '<div class="glyph">' + CLFUI.icon('box') + '</div>' +
        '<h4>没有找到这条信息</h4>' +
        '<p>它可能已被发布者删除，或者链接不完整。</p>' +
        '<div class="actions"><a class="btn btn-sm btn-primary" href="index.html">回首页看看</a></div>' +
        '</div>';
      document.title = '信息不存在 · 校园失物招领';
      return;
    }

    var cat = item.cat || '其他';
    var dateLabel = (item.type === 'found' ? '拾获日期' : '丢失日期');
    var phoneBtn = PHONE_RE.test(item.contact)
      ? '<a class="btn btn-sm btn-outline" style="margin-top:0" href="tel:' + CLFUI.escapeHTML(item.contact) + '">拨打电话</a>'
      : '';

    wrap.innerHTML =
      '<div class="detail-card' + (item.status === 'resolved' ? ' is-resolved' : '') + '">' +
        '<div class="detail-head">' +
          '<div class="catbox ' + (item.type === 'found' ? 'tone-found' : 'tone-lost') + '">' + CLFUI.icon('box') + '</div>' +
          '<div>' +
            '<h2>' + CLFUI.escapeHTML(item.name) + '</h2>' +
            '<div class="badges">' +
              '<span class="badge badge-' + item.type + '">' + CLFUI.typeLabel(item.type) + '</span>' +
              (item.status === 'resolved' ? '<span class="badge badge-resolved">' + CLF.statusLabel(item) + '</span>' : '') +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="kv"><span class="k">物品分类</span><span class="v">' + CLFUI.escapeHTML(cat) + '</span></div>' +
        '<div class="kv"><span class="k">' + dateLabel + '</span><span class="v">' +
          CLFUI.escapeHTML(item.date) + '（' + CLFUI.escapeHTML(CLFUI.formatDate(item.date)) + '）</span></div>' +
        '<div class="kv"><span class="k">' + (item.type === 'found' ? '拾获地点' : '丢失地点') + '</span>' +
          '<span class="v">' + CLFUI.escapeHTML(item.place) + '</span></div>' +
        '<div class="kv"><span class="k">发布人</span><span class="v">' + CLFUI.escapeHTML(item.nickname) + '</span></div>' +
        '<div class="kv"><span class="k">发布时间</span><span class="v">' + CLFUI.escapeHTML(CLFUI.timeAgo(item.createdAt)) + '</span></div>' +
        '<div class="kv"><span class="k">信息编号</span><span class="v">' + CLFUI.escapeHTML(item.id) + '</span></div>' +
        (item.note ? '<div class="note-block">' + CLFUI.escapeHTML(item.note) + '</div>' : '') +
      '</div>' +

      '<div class="contact-card">' +
        '<p class="who">' + (item.type === 'found' ? '认领' : '提供线索') + '请联系发布者：' + CLFUI.escapeHTML(item.nickname) + '</p>' +
        '<p class="how">' + CLFUI.escapeHTML(item.contact) + '</p>' +
        '<div class="contact-actions">' +
          '<button class="btn btn-sm btn-primary" type="button" id="copyBtn"><span style="display:inline-flex">' + CLFUI.icon('copy') + '</span>一键复制联系方式</button>' +
          phoneBtn +
        '</div>' +
      '</div>' +

      (item.status === 'resolved' ? resolvedBanner(item) : '') +
      (CLF.isMine(item.id) ? ownerPanelHTML(item) : '');

    bindEvents(item);
  }

  function bindEvents(item) {
    var copyBtn = document.getElementById('copyBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var text = '【校园失物招领】' + item.name + '（' + (item.type === 'found' ? '招领' : '寻物') + '），' +
          '发布者：' + item.nickname + '，联系方式：' + item.contact;
        CLFUI.copyText(text).then(function (ok) {
          CLFUI.toast(ok ? '联系方式已复制，快去联系吧' : '复制失败，请手动长按复制');
        });
      });
    }

    wrap.querySelectorAll('[data-op]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var op = btn.dataset.op;
        if (op === 'resolve') {
          CLF.resolveItem(item.id);
          CLFUI.toast(item.type === 'lost' ? '已标记为「已找到」，感谢反馈！' : '已标记为「已归还」，感谢反馈！');
          render();
        } else if (op === 'reopen') {
          CLF.reopenItem(item.id);
          CLFUI.toast('已恢复为进行中');
          render();
        } else if (op === 'remove') {
          if (window.confirm('确定删除这条信息吗？删除后不可恢复。')) {
            CLF.removeItem(item.id);
            CLFUI.toast('已删除');
            location.href = 'my-posts.html';
          }
        }
      });
    });
  }

  render();
})();
