/**
 * core.test.js —— 数据层（core.js）单元测试
 *
 * Node 环境下没有 localStorage，core.js 会自动降级为内存存储，
 * 这正好覆盖了“存储不可用”这条分支；浏览器端行为与其一致。
 */
'use strict';

var expect, CLF, CLFSeed;
if (typeof window !== 'undefined') {
  expect = window.expect;
  CLF = window.CLF;
  CLFSeed = window.CLFSeed;
} else {
  expect = require('./lib/chai.js').expect;
  CLF = require('../js/core.js');
  CLFSeed = require('../js/seed.js');
}

var BASE = {
  type: 'lost', name: '校园一卡通', cat: '证件卡类', place: '第二食堂二楼',
  date: '2026-09-28', nickname: '小林', contact: '13800138821', note: '浅蓝色卡套'
};

describe('CLF 数据层（core.js）', function () {
  beforeEach(function () {
    CLF.resetAll();
  });

  it('addItem 新增寻物信息：生成 id、状态为进行中、字段一致', function () {
    var item = CLF.addItem(BASE);
    expect(item.id).to.be.a('string').and.to.have.length.above(2);
    expect(item.status).to.equal('open');
    expect(item.name).to.equal('校园一卡通');
    expect(item.createdAt).to.be.a('number');
  });

  it('addItem 招领信息保留 type=found；非法类型归一为 lost', function () {
    var found = CLF.addItem(Object.assign({}, BASE, { type: 'found' }));
    expect(found.type).to.equal('found');
    var weird = CLF.addItem(Object.assign({}, BASE, { type: 'xxx' }));
    expect(weird.type).to.equal('lost');
  });

  it('getItems 后发布的排在前面；getItem 按 id 查询，查不到返回 null', function () {
    var a = CLF.addItem(BASE);
    var b = CLF.addItem(Object.assign({}, BASE, { name: '蓝色雨伞' }));
    expect(CLF.getItems()[0].id).to.equal(b.id);
    expect(CLF.getItem(a.id).name).to.equal('校园一卡通');
    expect(CLF.getItem('不存在')).to.equal(null);
  });

  it('updateItem 局部更新并返回新对象；id 不存在返回 null', function () {
    var item = CLF.addItem(BASE);
    var next = CLF.updateItem(item.id, { note: '卡套是黑色' });
    expect(next.note).to.equal('卡套是黑色');
    expect(next.name).to.equal('校园一卡通');       // 其余字段不受影响
    expect(CLF.updateItem('不存在', { note: 'x' })).to.equal(null);
  });

  it('resolveItem：寻物标记为「已找到」，招领标记为「已归还」', function () {
    var lost = CLF.addItem(BASE);
    var found = CLF.addItem(Object.assign({}, BASE, { type: 'found' }));
    expect(CLF.statusLabel(CLF.resolveItem(lost.id))).to.equal('已找到');
    expect(CLF.statusLabel(CLF.resolveItem(found.id))).to.equal('已归还');
    expect(CLF.resolveItem('不存在')).to.equal(null);
  });

  it('reopenItem 可把已完成的恢复为进行中（防误标记）', function () {
    var item = CLF.addItem(BASE);
    CLF.resolveItem(item.id);
    expect(CLF.reopenItem(item.id).status).to.equal('open');
  });

  it('removeItem 删除后查询不到；重复删除返回 false', function () {
    var item = CLF.addItem(BASE);
    expect(CLF.removeItem(item.id)).to.equal(true);
    expect(CLF.getItem(item.id)).to.equal(null);
    expect(CLF.removeItem(item.id)).to.equal(false);
  });

  it('发布自动归入「我的发布」，按发布时间倒序', function () {
    var a = CLF.addItem(BASE);
    var b = CLF.addItem(Object.assign({}, BASE, { name: '水杯' }));
    expect(CLF.isMine(b.id)).to.equal(true);
    var mine = CLF.getMyItems();
    expect(mine).to.have.lengthOf(2);
    expect(mine[0].id).to.equal(b.id);
    CLF.removeItem(a.id);
    expect(CLF.isMine(a.id)).to.equal(false);   // 删除时同步移出我的发布
  });

  it('resetAll 清空全部数据', function () {
    CLF.addItem(BASE);
    CLF.resetAll();
    expect(CLF.getItems()).to.have.lengthOf(0);
    expect(CLF.getMyItems()).to.have.lengthOf(0);
  });

  it('todayStr 返回 YYYY-MM-DD 格式', function () {
    expect(CLF.todayStr()).to.match(/^\d{4}-\d{2}-\d{2}$/);
    expect(CLF.todayStr(new Date(2026, 8, 5).getTime())).to.equal('2026-09-05');
  });

  it('seedIfEmpty：首次灌入演示数据，重复调用不再灌入', function () {
    expect(CLF.seedIfEmpty(CLFSeed.makeDemoItems)).to.equal(true);
    var n = CLF.getItems().length;
    expect(n).to.be.above(0);
    expect(CLF.seedIfEmpty(CLFSeed.makeDemoItems)).to.equal(false);
    expect(CLF.getItems()).to.have.lengthOf(n);
  });
});
