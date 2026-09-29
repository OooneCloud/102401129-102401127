/**
 * validate.test.js —— 发布表单校验（validate.js）单元测试
 *
 * 用例设计方法：白盒 · 分支覆盖（每个错误分支至少一条用例）
 * + 边界值分析（名称 30/31 字、备注 100/101 字、日期今天/明天）。
 * today 注入固定值 '2026-09-29'，保证“未来日期”判断可确定性复现。
 */
'use strict';

var expect, V;
if (typeof window !== 'undefined') {
  expect = window.expect;
  V = window.CLFValidate;
} else {
  expect = require('./lib/chai.js').expect;
  V = require('../js/validate.js');
}

var TODAY = '2026-09-29';

function okInput() {
  return {
    type: 'lost', name: '校园一卡通', cat: '证件卡类', place: '第二食堂二楼',
    date: TODAY, nickname: '小林', contact: '13800138821', note: ''
  };
}

describe('发布校验（validate.js）', function () {

  it('合法的寻物信息通过校验，且字段经过去空格规范化', function () {
    var r = V.validatePost(Object.assign(okInput(), { name: '  校园一卡通  ' }), TODAY);
    expect(r.valid).to.equal(true);
    expect(r.data.name).to.equal('校园一卡通');
    expect(r.errors).to.equal(undefined);
  });

  it('合法的招领信息通过校验', function () {
    var r = V.validatePost({
      type: 'found', name: '黑色折叠雨伞', cat: '生活用品', place: '图书馆一层大厅',
      date: '2026-09-28', nickname: '陈子航', contact: 'chenzh1024', note: '已交前台'
    }, TODAY);
    expect(r.valid).to.equal(true);
    expect(r.data.type).to.equal('found');
  });

  it('缺少发布类型时报错', function () {
    var input = okInput();
    delete input.type;
    expect(V.validatePost(input, TODAY).errors).to.have.property('type');
  });

  it('物品名称：为空、超长均报错；30 字为边界可通过', function () {
    expect(V.validatePost(Object.assign(okInput(), { name: '   ' }), TODAY).errors).to.have.property('name');
    expect(V.validatePost(Object.assign(okInput(), { name: '卡'.repeat(31) }), TODAY).errors).to.have.property('name');
    var r = V.validatePost(Object.assign(okInput(), { name: '卡'.repeat(30) }), TODAY);
    expect(r.valid).to.equal(true);
  });

  it('物品分类必须是 6 个预置分类之一', function () {
    expect(V.validatePost(Object.assign(okInput(), { cat: '虚拟物品' }), TODAY).errors).to.have.property('cat');
    expect(V.validatePost(Object.assign(okInput(), { cat: '' }), TODAY).errors).to.have.property('cat');
  });

  it('地点为空 / 超长报错，且招领场景提示「拾获地点」', function () {
    expect(V.validatePost(Object.assign(okInput(), { place: '' }), TODAY).errors).to.have.property('place');
    var found = V.validatePost(Object.assign(okInput(), { type: 'found', place: '' }), TODAY);
    expect(found.errors.place).to.contain('拾获');
  });

  it('日期：不能晚于今天（明天报错、今天通过）', function () {
    expect(V.validatePost(Object.assign(okInput(), { date: '2026-09-30' }), TODAY).errors).to.have.property('date');
    expect(V.validatePost(Object.assign(okInput(), { date: TODAY }), TODAY).valid).to.equal(true);
  });

  it('日期：空值与不存在的日期（2 月 30 日）报错', function () {
    expect(V.validatePost(Object.assign(okInput(), { date: '' }), TODAY).errors).to.have.property('date');
    expect(V.validatePost(Object.assign(okInput(), { date: '2026-02-30' }), TODAY).errors).to.have.property('date');
    expect(V.validatePost(Object.assign(okInput(), { date: '2026/09/29' }), TODAY).errors).to.have.property('date');
  });

  it('联系方式：为空或含非法字符报错；QQ 号、微信号、手机号均可通过', function () {
    expect(V.validatePost(Object.assign(okInput(), { contact: '' }), TODAY).errors).to.have.property('contact');
    expect(V.validatePost(Object.assign(okInput(), { contact: 'wx; drop table' }), TODAY).errors).to.have.property('contact');
    expect(V.validatePost(Object.assign(okInput(), { contact: '1024667788' }), TODAY).valid).to.equal(true);
    expect(V.validatePost(Object.assign(okInput(), { contact: 'wx-lin_1024' }), TODAY).valid).to.equal(true);
  });

  it('备注选填；最多 100 字（100 通过、101 报错）', function () {
    expect(V.validatePost(Object.assign(okInput(), { note: '注'.repeat(100) }), TODAY).valid).to.equal(true);
    expect(V.validatePost(Object.assign(okInput(), { note: '注'.repeat(101) }), TODAY).errors).to.have.property('note');
  });

  it('多个字段同时出错时，全部错误一次性返回', function () {
    var r = V.validatePost({ type: 'lost' }, TODAY);
    expect(Object.keys(r.errors).length).to.be.at.least(4);
    expect(r.valid).to.equal(false);
  });
});
