/**
 * ui.test.js —— 渲染层安全测试（仅浏览器环境运行，Node 下自动跳过）
 *
 * 重点验证：用户输入的恶意内容经 cardHTML 渲染后已被转义，
 * 不会被浏览器当作标签执行（XSS 防护的端到端验证）。
 */
(function () {
  if (typeof window === 'undefined') return;   // Node 环境跳过（Node 无 DOM）

  'use strict';
  var expect = window.expect;
  var UI = window.CLFUI;

  describe('卡片渲染安全（ui.js）', function () {

    it('物品名称中的脚本标签被转义，不会注入 HTML', function () {
      var item = {
        id: 'xss1', type: 'lost', name: '<script>alert(1)</script>',
        cat: '其他', place: '<b> bold </b>', date: '2026-09-29',
        nickname: '小<于>', contact: '13800138821', note: '', status: 'open',
        createdAt: Date.now()
      };
      var html = UI.cardHTML(item);
      expect(html).to.not.contain('<script>');
      expect(html).to.contain('&lt;script&gt;');
      expect(html).to.contain('&lt;b&gt; bold &lt;/b&gt;');
      expect(html).to.contain('小&lt;于&gt;');
    });

    it('已完成信息渲染出状态徽章，正常信息不渲染', function () {
      var open = { id: 'o1', type: 'found', name: '雨伞', cat: '生活用品', place: '图书馆', date: '2026-09-29', nickname: '同学', contact: '13800138821', note: '', status: 'open', createdAt: Date.now() };
      var done = Object.assign({}, open, { id: 'o2', status: 'resolved' });
      expect(UI.cardHTML(open)).to.not.contain('badge-resolved');
      expect(UI.cardHTML(done)).to.contain('badge-resolved');
      expect(UI.cardHTML(done)).to.contain('已归还');
    });
  });
})();
