import * as helper from '../../../lib/helper'

describe('test helper/index.ts ', ()=>{

  it('escapeHtml', ()=>{
    expect(helper.escapeHtml('<div>text</div>')).toBe('&lt;div&gt;text&lt;/div&gt;')
    expect(helper.escapeHtml('"双引",\'单引\'')).toBe('&quote;双引&quote;,&#39;单引&#39;')
  })

  it('md5 ', ()=>{
    expect(helper.md5('123456')).toBe('e10adc3949ba59abbe56e057f20f883e')
    expect(helper.md5(123456)).toBe('e10adc3949ba59abbe56e057f20f883e')
    expect(JSON.stringify({test: 1})).toBe('{"test":1}')
    expect(helper.md5({test: 1})).toBe('44e7a186db2c24f55e9bf22e427df2ad')
  })

  it('replaceTemplateStr', ()=>{
    expect(helper.replaceTemplateStr('test:${data}', {data: 'param'})).toBe('test:param')
    expect(helper.replaceTemplateStr('test:${page}:${pageSize}', {page: 1, pageSize: 10})).toBe('test:1:10')
  })
})