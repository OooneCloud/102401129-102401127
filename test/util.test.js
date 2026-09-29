/**
 * util.test.js —— 纯工具函数（util.js）单元测试
 *
 * escapeHTML 是防 XSS 的关键路径，必须验证标签与引号都被转义；
 * 时间格式化注入固定 now，验证每个区间的边界。
 */
'use strict';

var expect, U;
if (typeof window !== 'undefined') {
  expect = window.expect;
  U = window.CLFUtil;
} else {
  expect = require('./lib/chai.js').expect;
  U = require('../js/util.js');
}

describe('纯工具函数（util.js）', function () {

  describe('escapeHTML（防 XSS）', function () {
    it('标签、引号、& 全部转义', function () {
      expect(U.escapeHTML('<img src=x onerror="alert(1)">'))
        .to.equal('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
      expect(U.escapeHTML("a'b&c<d>")).to.equal('a&#39;b&amp;c&lt;d&gt;');
    });

    it('正常文本原样返回，null/undefined 返回空串', function () {
      expect(U.escapeHTML('校园一卡通')).to.equal('校园一卡通');
      expect(U.escapeHTML(null)).to.equal('');
      expect(U.escapeHTML(undefined)).to.equal('');
    });
  });

  describe('formatDate', function () {
    var now = new Date(2026, 8, 29, 12, 0).getTime();   // 2026-09-29 12:00

    it('今天 / 昨天 / 普通日期', function () {
      expect(U.formatDate('2026-09-29', now)).to.equal('今天');
      expect(U.formatDate('2026-09-28', now)).to.equal('昨天');
      expect(U.formatDate('2026-09-01', now)).to.equal('9月1日');
    });

    it('跨年日期补年份', function () {
      expect(U.formatDate('2025-12-31', now)).to.equal('2025年12月31日');
    });

    it('非法格式原样返回', function () {
      expect(U.formatDate('20260929', now)).to.equal('20260929');
      expect(U.formatDate('', now)).to.equal('');
    });
  });

  describe('timeAgo', function () {
    var now = new Date(2026, 8, 29, 12, 0, 0).getTime();  // 2026-09-29 12:00

    it('一小时内：刚刚 / N分钟前', function () {
      expect(U.timeAgo(now - 30 * 1000, now)).to.equal('刚刚');
      expect(U.timeAgo(now - 5 * 60 * 1000, now)).to.equal('5分钟前');
    });

    it('24 小时内：N小时前；48 小时内：昨天', function () {
      expect(U.timeAgo(now - 3 * 3600 * 1000, now)).to.equal('3小时前');
      expect(U.timeAgo(now - 30 * 3600 * 1000, now)).to.equal('昨天');
    });

    it('更早显示 M月D日，跨年补年份', function () {
      expect(U.timeAgo(new Date(2026, 8, 20, 12, 0).getTime(), now)).to.equal('9月20日');
      expect(U.timeAgo(new Date(2025, 11, 20, 12, 0).getTime(), now)).to.equal('2025年12月20日');
    });
  });
});
