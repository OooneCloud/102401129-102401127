/**
 * ui.js —— 页面公共组件（仅浏览器使用）
 *
 * 提供：内联 SVG 图标、卡片渲染、轻提示 toast、一键复制联系方式、
 * 底部导航高亮等公共能力；文本转义与时间格式化等纯逻辑在 util.js。
 * 所有用户输入渲染前必须经过 escapeHTML，防止输入内容破坏页面。
 */
(function (global) {
  'use strict';

  var U = global.CLFUtil;   // 纯工具模块（util.js，先于本文件加载）
  var UI = {};

  /* ---------------- 内联 SVG 图标（离线可用，不依赖图标 CDN） ---------------- */

  function svg(inner, vb) {
    return '<svg class="icon" viewBox="' + (vb || '0 0 24 24') + '" fill="none" stroke="currentColor" ' +
      'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>';
  }

  var ICONS = {
    home: svg('<path d="M4 11l8-7 8 7"/><path d="M6 9.5V20h12V9.5"/>'),
    plus: svg('<circle cx="12" cy="12" r="8.6"/><path d="M12 8.2v7.6M8.2 12h7.6"/>'),
    user: svg('<circle cx="12" cy="8.2" r="3.8"/><path d="M4.5 19.5c1.6-3.3 4.3-4.9 7.5-4.9s5.9 1.6 7.5 4.9"/>'),
    search: svg('<circle cx="11" cy="11" r="6.8"/><path d="M16.2 16.2L21 21"/>'),
    pin: svg('<path d="M12 21s-6.8-5.2-6.8-10.7a6.8 6.8 0 1 1 13.6 0C18.8 15.8 12 21 12 21z"/><circle cx="12" cy="10" r="2.4"/>'),
    clock: svg('<circle cx="12" cy="12" r="8.4"/><path d="M12 7.4v4.9l3.1 1.9"/>'),
    back: svg('<path d="M14.5 5.5L8 12l6.5 6.5"/>'),
    copy: svg('<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>'),
    check: svg('<circle cx="12" cy="12" r="8.6"/><path d="M8.4 12.4l2.5 2.6 4.7-5.4"/>'),
    trash: svg('<path d="M4.5 7h15"/><path d="M9.5 7V5.2A1.2 1.2 0 0 1 10.7 4h2.6a1.2 1.2 0 0 1 1.2 1.2V7"/><path d="M6.5 7l.9 12.2a1.5 1.5 0 0 0 1.5 1.3h6.2a1.5 1.5 0 0 0 1.5-1.3L17.5 7"/><path d="M10.2 11v5.5M13.8 11v5.5"/>'),
    undo: svg('<path d="M3.5 4.5V10h5.5"/><path d="M4.6 13.8A8 8 0 1 0 6 6.4L3.5 8.9"/>'),
    phone: svg('<path d="M5.5 4h3.2l1.7 4.4-2.1 1.4a11.5 11.5 0 0 0 5.9 5.9l1.4-2.1L20 15.3v3.2a1.9 1.9 0 0 1-2 1.9A15.4 15.4 0 0 1 3.6 6a1.9 1.9 0 0 1 1.9-2z"/>'),
    headphones: svg('<path d="M4 20v-6a8 8 0 0 1 16 0v6"/><rect x="3" y="14.5" width="4.4" height="5.5" rx="1.6"/><rect x="16.6" y="14.5" width="4.4" height="5.5" rx="1.6"/>'),
    card: svg('<rect x="3" y="5" width="18" height="14" rx="2.4"/><circle cx="8.6" cy="11" r="1.9"/><path d="M13.5 9.4H18M13.5 12.8H18M5.6 16c.9-1.6 5-1.6 6 0"/>'),
    cup: svg('<path d="M5 5.5h10.5V14a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V5.5z"/><path d="M15.5 7.5H18a2.4 2.4 0 0 1 0 4.8h-2.5"/><path d="M7.5 2.8v1.4M11 2.8v1.4"/>'),
    shirt: svg('<path d="M9 4.2L4.2 6.8 6 10.6l2-1v9.2h8v-9.2l2 1 1.8-3.8L15 4.2a3 3 0 0 1-6 0z"/>'),
    key: svg('<circle cx="7.8" cy="16.2" r="4"/><path d="M10.6 13.4L20 4M14.6 5.4l3 3M17 7.8l2 2"/>'),
    box: svg('<path d="M20.5 8L12 3.2 3.5 8v8L12 20.8 20.5 16V8z"/><path d="M3.7 8.1L12 12.8l8.3-4.7M12 12.8v8"/>')
  };

  UI.icon = function (name) {
    return ICONS[name] || ICONS.box;
  };

  /* ---------------- 纯逻辑转发（实现在 util.js，便于单元测试） ---------------- */

  UI.escapeHTML = U.escapeHTML;
  UI.typeLabel = U.typeLabel;
  UI.formatDate = U.formatDate;
  UI.timeAgo = U.timeAgo;

  /** 分类 → 卡片图标的配色与图形 */
  var CAT_ICON = {
    '电子数码': { icon: 'headphones', tone: 'tone-lost' },
    '证件卡类': { icon: 'card', tone: 'tone-lost' },
    '生活用品': { icon: 'cup', tone: 'tone-found' },
    '衣物配饰': { icon: 'shirt', tone: 'tone-lost' },
    '钥匙工具': { icon: 'key', tone: 'tone-found' },
    '其他': { icon: 'box', tone: 'tone-resolved' }
  };

  /* ---------------- 卡片渲染 ---------------- */

  function badgesHTML(item) {
    var html = '<span class="badge badge-' + item.type + '">' + UI.typeLabel(item.type) + '</span>';
    var done = CLF.statusLabel(item);
    if (done) {
      html += '<span class="badge badge-resolved">' + done + '</span>';
    }
    return html;
  }

  /** 首页 / 搜索结果共用的信息卡片 */
  UI.cardHTML = function (item) {
    var cat = CAT_ICON[item.cat] || CAT_ICON['其他'];
    var tone = item.status === 'resolved' ? 'tone-resolved' :
      (item.type === 'found' ? 'tone-found' : 'tone-lost');
    return '' +
      '<a class="card' + (item.status === 'resolved' ? ' is-resolved' : '') + '" href="detail.html?id=' + encodeURIComponent(item.id) + '">' +
        '<div class="card-top">' +
          '<div class="catbox ' + tone + '">' + UI.icon(cat.icon) + '</div>' +
          '<div class="card-main">' +
            '<div class="card-title-row">' +
              '<h3>' + UI.escapeHTML(item.name) + '</h3>' +
              '<div class="badges">' + badgesHTML(item) + '</div>' +
            '</div>' +
            '<div class="meta"><span class="grow">' + UI.icon('pin') + UI.escapeHTML(item.place) + '</span></div>' +
            '<div class="meta meta-split">' +
              '<span>' + UI.icon('clock') + UI.escapeHTML(UI.formatDate(item.date)) + '</span>' +
              '<span class="grow">' + UI.icon('user') + UI.escapeHTML(item.nickname) + '</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</a>';
  };

  /** 渲染卡片列表到容器；items 为空时展示空状态 */
  UI.renderCards = function (el, items, emptyCfg) {
    if (!items.length) {
      var e = emptyCfg || {};
      el.innerHTML = '<div class="empty">' +
        '<div class="glyph">' + UI.icon(e.icon || 'search') + '</div>' +
        '<h4>' + UI.escapeHTML(e.title || '暂无相关内容') + '</h4>' +
        '<p>' + (e.html || UI.escapeHTML(e.text || '换个条件试试吧')) + '</p>' +
        (e.actions || '') +
        '</div>';
      return;
    }
    el.innerHTML = items.map(UI.cardHTML).join('');
  };

  /* ---------------- 交互小件 ---------------- */

  var toastTimer = null;
  UI.toast = function (msg) {
    var t = document.getElementById('toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'toast';
      t.className = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    // 触发重绘以重置过渡动画
    void t.offsetWidth;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 1800);
  };

  /**
   * 复制文本：优先用 clipboard API，file:// 等场景降级 execCommand。
   * 返回 Promise<boolean>。
   */
  UI.copyText = function (text) {
    function legacyCopy() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      return ok;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { return true; })
        .catch(function () { return legacyCopy(); });
    }
    return Promise.resolve(legacyCopy());
  };

  /** 底部导航高亮：页面里给对应 <a> 加 data-nav，调用本函数统一处理 */
  UI.bindBottomNav = function () {
    var links = document.querySelectorAll('.bottomnav a');
    for (var i = 0; i < links.length; i++) {
      if (links[i].dataset.nav === document.body.dataset.page) {
        links[i].classList.add('is-active');
      }
    }
  };

  /** 把静态 HTML 中 <span data-icon="名称"></span> 替换为对应 SVG */
  UI.mountIcons = function () {
    var els = document.querySelectorAll('[data-icon]');
    for (var i = 0; i < els.length; i++) {
      els[i].innerHTML = UI.icon(els[i].getAttribute('data-icon'));
    }
  };

  /** 读取 URL 查询参数 */
  UI.qs = function (name) {
    var m = new RegExp('[?&]' + name + '=([^&#]*)').exec(location.search);
    return m ? decodeURIComponent(m[1]) : '';
  };

  global.CLFUI = UI;
})(window);
