import * as is from '../../../lib/helper/is'

describe('test helper/is.ts ', ()=>{

  it('objToString', ()=>{
    expect(is.objToString('<div>text</div>')).toBe('String')
    expect(is.objToString([])).toBe('Array')
    expect(is.objToString({})).toBe('Object')
    expect(is.objToString(123455)).toBe('Number')
    expect(is.objToString(1234.55)).toBe('Number')
    expect(is.objToString(/test/)).toBe('RegExp')
  })

  it('isRegExp', ()=>{
    expect(is.isRegExp(/test/)).toBe(true)
    expect(is.isRegExp((new RegExp('test', 'g')))).toBe(true)
  })


  it('isNull', ()=>{
    expect(is.isNull(null)).toBe(true)
    expect(is.isNull(undefined)).toBe(false)
  })

  it('isUndefined', ()=>{
    expect(is.isUndefined(undefined)).toBe(true)
    expect(is.isUndefined(null)).toBe(false)
  })

  it('isArray', ()=>{
    expect(is.isArray([])).toBe(true)
    expect(is.isArray({})).toBe(false)
    expect(is.isArray(123)).toBe(false)
  })

  it('isEmpty', ()=>{
    expect(is.isEmpty(null)).toBe(true)
    expect(is.isEmpty(undefined)).toBe(true)
    expect(is.isEmpty('')).toBe(true)
    expect(is.isEmpty([])).toBe(true)
    expect(is.isEmpty({})).toBe(true)
    expect(is.isEmpty(0)).toBe(false)
  })
})