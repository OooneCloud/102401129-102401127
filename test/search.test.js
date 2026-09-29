/**
 * search.test.js —— 搜索与筛选（search.js）单元测试
 *
 * 用例设计方法：等价类划分 + 边界/异常输入。
 * 覆盖：关键词命中不同字段、多词 AND、大小写、无结果、
 * 类型/分类/状态筛选、排序纯度（不修改入参）与组合查询。
 */
'use strict';

var expect, S;
if (typeof window !== 'undefined') {
  expect = window.expect;
  S = window.CLFSearch;
} else {
  expect = require('./lib/chai.js').expect;
  S = require('../js/search.js');
}

function item(id, over) {
  var base = {
    id: id, type: 'lost', name: '物品' + id, cat: '其他', place: '地点' + id,
    date: '2026-09-28', nickname: '同学' + id, contact: '13800138821',
    note: '', status: 'open', createdAt: 1000
  };
  return Object.assign(base, over || {});
}

var DATA = [
  item('a', { name: '蓝色无线蓝牙耳机', cat: '电子数码', place: '三号教学楼', note: '放在讲台抽屉里', createdAt: 5000 }),
  item('b', { name: '校园一卡通', type: 'found', cat: '证件卡类', place: '第二食堂', status: 'resolved', createdAt: 4000 }),
  item('c', { name: '黑色折叠雨伞', cat: '生活用品', place: '图书馆一层大厅', nickname: '陈子航', createdAt: 3000 })
];

describe('关键词搜索（search.js）', function () {

  it('splitKeywords：按空白拆词、转小写、去空段', function () {
    expect(S.splitKeywords('  蓝色   EARBUDS ')).to.deep.equal(['蓝色', 'earbuds']);
    expect(S.splitKeywords('')).to.deep.equal([]);
    expect(S.splitKeywords(null)).to.deep.equal([]);
  });

  it('按物品名称命中', function () {
    expect(S.search(DATA, '耳机')).to.have.lengthOf(1);
    expect(S.search(DATA, '耳机')[0].id).to.equal('a');
  });

  it('按地点命中（名称不含关键词）', function () {
    var r = S.search(DATA, '图书馆');
    expect(r).to.have.lengthOf(1);
    expect(r[0].id).to.equal('c');
  });

  it('按备注与发布人昵称命中', function () {
    expect(S.search(DATA, '讲台')[0].id).to.equal('a');
    expect(S.search(DATA, '陈子航')[0].id).to.equal('c');
  });

  it('多个关键词 AND：全部命中才算匹配', function () {
    expect(S.search(DATA, '蓝色 耳机')).to.have.lengthOf(1);
    expect(S.search(DATA, '蓝色 雨伞')).to.have.lengthOf(0);
  });

  it('英文关键词不区分大小写', function () {
    var data = [item('d', { name: 'AirPods Pro 2' })];
    expect(S.search(data, 'airpods')).to.have.lengthOf(1);
    expect(S.search(data, 'AIRPODS pro')).to.have.lengthOf(1);
  });

  it('没有匹配结果时返回空数组', function () {
    expect(S.search(DATA, '不存在的东西')).to.deep.equal([]);
  });
});

describe('筛选与排序（search.js）', function () {

  it('filterByType：lost / found / all', function () {
    expect(S.filterByType(DATA, 'lost')).to.have.lengthOf(2);
    expect(S.filterByType(DATA, 'found')[0].id).to.equal('b');
    expect(S.filterByType(DATA, 'all')).to.have.lengthOf(3);
  });

  it('filterByCategory：按分类筛选', function () {
    expect(S.filterByCategory(DATA, '电子数码')[0].id).to.equal('a');
    expect(S.filterByCategory(DATA, 'all')).to.have.lengthOf(3);
  });

  it('filterByStatus：进行中 / 已完成', function () {
    expect(S.filterByStatus(DATA, 'open')).to.have.lengthOf(2);
    expect(S.filterByStatus(DATA, 'resolved')[0].id).to.equal('b');
  });

  it('sortByNewest：新的在前，且不修改原数组', function () {
    var sorted = S.sortByNewest(DATA);
    expect(sorted[0].id).to.equal('a');
    expect(DATA[0].id).to.equal('a');   // 原数组顺序未变
    expect(sorted).to.not.equal(DATA);  // 返回新数组
  });

  it('query 组合查询：关键词 + 类型 + 状态 + 排序一步到位', function () {
    var r = S.query(DATA, { q: '', type: 'lost', cat: 'all', status: 'open' });
    expect(r).to.have.lengthOf(2);
    expect(r[0].id).to.equal('a');      // createdAt 更大的排前
    expect(S.query(DATA, { q: '食堂', type: 'lost' })).to.have.lengthOf(0);  // 招领信息被类型筛掉
  });
});
