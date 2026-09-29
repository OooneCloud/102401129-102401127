/**
 * core.js —— 数据层与业务核心
 *
 * 职责：
 *  1. 封装 localStorage 读写（不可用时自动降级为内存存储，页面仍可正常演示）；
 *  2. 失物信息（item）的增、删、改、查；
 *  3. 状态流转：进行中 open → 已完成 resolved（寻物=已找到 / 招领=已归还），支持误操作恢复；
 *  4. 「我的发布」归属：本应用不设账号，发布者身份以“发布时所在的浏览器”为准（myIds）。
 *
 * 本文件为纯逻辑模块，不依赖 DOM，可在浏览器与 Node（单元测试）中同时运行。
 */
(function (global, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();          // Node（Mocha 单元测试）
  } else {
    global.CLF = factory();              // 浏览器全局命名空间
  }
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  var KEY_ITEMS = 'clf_items';      // 全部失物信息列表
  var KEY_MINE = 'clf_my_ids';      // 本机（当前浏览器）发布的条目 id
  var KEY_SEED = 'clf_seeded_v1';   // 是否已灌入过演示数据

  var CATEGORIES = ['电子数码', '证件卡类', '生活用品', '衣物配饰', '钥匙工具', '其他'];

  /* ---------------- 存储层 ---------------- */

  var memoryStore = {};   // localStorage 不可用时的兜底
  var storage = (function () {
    try {
      var probe = '__clf_probe__';
      global.localStorage.setItem(probe, '1');
      global.localStorage.removeItem(probe);
      return global.localStorage;
    } catch (e) {
      return null;   // 部分环境禁用 file:// 存储，降级为内存模式
    }
  })();

  var isPersistent = !!storage;

  function readJSON(key, fallback) {
    if (!storage) {
      return Object.prototype.hasOwnProperty.call(memoryStore, key) ? memoryStore[key] : fallback;
    }
    var raw = storage.getItem(key);
    if (raw === null || raw === undefined || raw === '') return fallback;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return fallback;   // 数据损坏时按空数据处理，不让页面崩溃
    }
  }

  function writeJSON(key, value) {
    if (storage) {
      try {
        storage.setItem(key, JSON.stringify(value));
      } catch (e) { /* 存储满等异常：静默失败，功能不中断 */ }
    } else {
      memoryStore[key] = value;
    }
  }

  /* ---------------- 基础工具 ---------------- */

  function genId() {
    return 'i' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function todayStr(now) {
    var d = now ? new Date(now) : new Date();
    var m = d.getMonth() + 1;
    var day = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' + m : m) + '-' + (day < 10 ? '0' + day : day);
  }

  /* ---------------- 查询 ---------------- */

  function getItems() {
    var list = readJSON(KEY_ITEMS, []);
    return Object.prototype.toString.call(list) === '[object Array]' ? list : [];
  }

  function getItem(id) {
    var list = getItems();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  /* ---------------- 增删改 ---------------- */

  /**
   * 新增一条信息。data 为发布表单中已通过校验的字段。
   * 返回新建的 item（含 id / status / createdAt）。
   */
  function addItem(data) {
    var item = {
      id: genId(),
      type: data.type === 'found' ? 'found' : 'lost',   // lost=寻物 / found=招领
      name: data.name,
      cat: data.cat,
      place: data.place,
      date: data.date,          // 丢失 / 拾获日期，YYYY-MM-DD
      nickname: data.nickname,  // 发布人昵称
      contact: data.contact,    // 联系方式（手机 / QQ / 微信）
      note: data.note || '',
      status: 'open',           // open=进行中 / resolved=已完成
      createdAt: Date.now()
    };
    var list = getItems();
    list.unshift(item);         // 新信息排在最前
    writeJSON(KEY_ITEMS, list);
    markMine(item.id);          // 发布者即本机
    return item;
  }

  /**
   * 按 id 局部更新字段，返回更新后的 item；id 不存在时返回 null。
   */
  function updateItem(id, patch) {
    var list = getItems();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) {
        var next = {};
        for (var k in list[i]) next[k] = list[i][k];
        for (var p in patch) next[p] = patch[p];
        list[i] = next;
        writeJSON(KEY_ITEMS, list);
        return next;
      }
    }
    return null;
  }

  function removeItem(id) {
    var list = getItems();
    var kept = [];
    var removed = false;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) removed = true;
      else kept.push(list[i]);
    }
    if (removed) {
      writeJSON(KEY_ITEMS, kept);
      unmarkMine(id);
    }
    return removed;
  }

  /* ---------------- 状态流转 ----------------
   * 寻物（lost）：进行中 → 已找到
   * 招领（found）：进行中 → 已归还
   * 两者统一存为 status='resolved'，展示文案由 statusLabel 决定；
   * 支持 reopen 恢复为进行中，防止误标记后无法撤回。
   * ------------------------------------------ */

  function resolveItem(id) {
    var item = getItem(id);
    if (!item) return null;
    return updateItem(id, { status: 'resolved' });
  }

  function reopenItem(id) {
    var item = getItem(id);
    if (!item) return null;
    return updateItem(id, { status: 'open' });
  }

  function statusLabel(item) {
    if (!item || item.status !== 'resolved') return '';
    return item.type === 'lost' ? '已找到' : '已归还';
  }

  /* ---------------- 我的发布（本机归属） ---------------- */

  function readMine() {
    var ids = readJSON(KEY_MINE, []);
    return Object.prototype.toString.call(ids) === '[object Array]' ? ids : [];
  }

  function markMine(id) {
    var ids = readMine();
    if (ids.indexOf(id) < 0) {
      ids.push(id);
      writeJSON(KEY_MINE, ids);
    }
  }

  function unmarkMine(id) {
    var ids = readMine();
    var kept = [];
    for (var i = 0; i < ids.length; i++) {
      if (ids[i] !== id) kept.push(ids[i]);
    }
    writeJSON(KEY_MINE, kept);
  }

  function isMine(id) {
    return readMine().indexOf(id) >= 0;
  }

  /** 我的发布列表，按发布时间倒序 */
  function getMyItems() {
    var mine = readMine();
    var all = getItems();
    var result = [];
    for (var i = 0; i < all.length; i++) {
      if (mine.indexOf(all[i].id) >= 0) result.push(all[i]);
    }
    result.sort(function (a, b) { return b.createdAt - a.createdAt; });
    return result;
  }

  /* ---------------- 演示数据与重置 ---------------- */

  /** 首次打开自动灌入演示数据，让页面一打开就有内容可看 */
  function seedIfEmpty(demoFactory) {
    if (readJSON(KEY_SEED, false)) return false;
    if (getItems().length > 0) {
      writeJSON(KEY_SEED, true);
      return false;
    }
    var demo = typeof demoFactory === 'function' ? demoFactory(todayStr(), Date.now()) : [];
    writeJSON(KEY_ITEMS, demo);
    writeJSON(KEY_SEED, true);
    return true;
  }

  /** 清空本机全部数据（含演示数据与我的发布），用于测试与重置 */
  function resetAll() {
    writeJSON(KEY_ITEMS, []);
    writeJSON(KEY_MINE, []);
    writeJSON(KEY_SEED, false);
  }

  return {
    CATEGORIES: CATEGORIES,
    isPersistent: isPersistent,
    todayStr: todayStr,
    getItems: getItems,
    getItem: getItem,
    addItem: addItem,
    updateItem: updateItem,
    removeItem: removeItem,
    resolveItem: resolveItem,
    reopenItem: reopenItem,
    statusLabel: statusLabel,
    isMine: isMine,
    markMine: markMine,
    getMyItems: getMyItems,
    seedIfEmpty: seedIfEmpty,
    resetAll: resetAll
  };
});
