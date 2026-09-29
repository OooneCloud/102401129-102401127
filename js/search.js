/**
 * search.js —— 关键词搜索与筛选（纯函数，可单元测试）
 *
 * 搜索规则：
 *  - 关键词按空白符拆分为多个词，全部命中才算匹配（如“蓝色 耳机”）；
 *  - 匹配范围为 物品名称 + 地点 + 备注 + 发布人昵称；
 *  - 英文不区分大小写。
 */
(function (global, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    global.CLFSearch = factory();
  }
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  /** 把用户输入拆成小写关键词数组；空串返回 [] */
  function splitKeywords(q) {
    if (typeof q !== 'string') return [];
    var parts = q.trim().toLowerCase().split(/\s+/);
    var out = [];
    for (var i = 0; i < parts.length; i++) {
      if (parts[i]) out.push(parts[i]);
    }
    return out;
  }

  function haystack(item) {
    return [item.name, item.place, item.note, item.nickname]
      .join(' ')
      .toLowerCase();
  }

  /** 判断单条信息是否命中全部关键词 */
  function matches(item, terms) {
    if (!terms.length) return true;
    var text = haystack(item);
    for (var i = 0; i < terms.length; i++) {
      if (text.indexOf(terms[i]) < 0) return false;
    }
    return true;
  }

  /** 关键词搜索；返回新数组，不修改入参 */
  function search(items, q) {
    var terms = splitKeywords(q);
    var out = [];
    for (var i = 0; i < items.length; i++) {
      if (matches(items[i], terms)) out.push(items[i]);
    }
    return out;
  }

  /** 类型筛选：'all' | 'lost' | 'found' */
  function filterByType(items, type) {
    if (!type || type === 'all') return items.slice();
    var out = [];
    for (var i = 0; i < items.length; i++) {
      if (items[i].type === type) out.push(items[i]);
    }
    return out;
  }

  /** 分类筛选：'all' | 分类名 */
  function filterByCategory(items, cat) {
    if (!cat || cat === 'all') return items.slice();
    var out = [];
    for (var i = 0; i < items.length; i++) {
      if (items[i].cat === cat) out.push(items[i]);
    }
    return out;
  }

  /** 状态筛选：'all' | 'open'（进行中） | 'resolved'（已完成） */
  function filterByStatus(items, status) {
    if (!status || status === 'all') return items.slice();
    var out = [];
    for (var i = 0; i < items.length; i++) {
      if (items[i].status === status) out.push(items[i]);
    }
    return out;
  }

  /** 按发布时间倒序（新的在前）；返回新数组 */
  function sortByNewest(items) {
    return items.slice().sort(function (a, b) {
      return b.createdAt - a.createdAt;
    });
  }

  /** 组合查询：关键词 + 类型 + 分类 + 状态，一步到位 */
  function query(items, options) {
    options = options || {};
    var result = items.slice();
    if (options.q) result = search(result, options.q);
    if (options.type) result = filterByType(result, options.type);
    if (options.cat) result = filterByCategory(result, options.cat);
    if (options.status) result = filterByStatus(result, options.status);
    return sortByNewest(result);
  }

  return {
    splitKeywords: splitKeywords,
    matches: matches,
    search: search,
    filterByType: filterByType,
    filterByCategory: filterByCategory,
    filterByStatus: filterByStatus,
    sortByNewest: sortByNewest,
    query: query
  };
});
