import { describe, expect, test } from 'vitest'
// import { NodeTypes } from '@vue-vapor/compiler-dom'
import {
  transformChildren,
  transformElement,
  transformText,
  transformVBind,
  // transformVFor,
  transformVOn,
} from '../../src/core/compiler'
import { makeCompile } from './_utils'

const compileWithVFor = makeCompile({
  nodeTransforms: [
    // transformVFor,
    transformText,
    transformElement,
    transformChildren,
  ],
  directiveTransforms: {
    bind: transformVBind,
    on: transformVOn,
  },
})

describe('compiler: v-for', () => {
  test.only('basic v-for', () => {
    const { code, ir, vaporHelpers, helpers } = compileWithVFor(
      `<div>{items.map((item) => item)}</div>`,
    )

    expect(code).toMatchInlineSnapshot(`
      "import { createComponent as _createComponent, withDestructure as _withDestructure, createFor as _createFor, insert as _insert, template as _template } from 'vue/vapor';
      const t0 = _template("<div></div>")

      export function render(_ctx) {
        const n3 = t0()
        const n0 = _createFor(() => (_ctx.items), _withDestructure(([item]) => [], (_ctx0) => {
          const n2 = _createComponent(_ctx.() => item)
          return n2
        }))
        _insert(n0, n3)
        return n3
      }"
    `)

    expect(vaporHelpers).contains('createFor')
    expect(helpers.size).toBe(0)
    expect(ir.template).toEqual(['<div></div>'])
    expect(ir.block.returns).toEqual([3])
    expect(ir.block.dynamic).toMatchObject({
      children: [{ id: 3 }],
    })
    expect(ir.block.effect).toEqual([])
    expect(ir.block.operation[0].render.effect).lengthOf(0)
  })

  /*
  test('multi effect', () => {
    const { code } = compileWithVFor(
      `<div v-for="(item, index) of items" :item="item" :index="index" />`,
    )
    expect(code).matchSnapshot()
  })

  test('w/o value', () => {
    const { code } = compileWithVFor(`<div v-for=" of items">item</div>`)
    expect(code).matchSnapshot()
  })

  test.todo('object de-structured value', () => {
    const { code } = compileWithVFor(
      '<span v-for="({ id, value }) in items">{{ id }}{{ value }}</span>',
    )
    expect(code).matchSnapshot()
  })

  test('nested v-for', () => {
    const { code, ir } = compileWithVFor(
      `<div v-for="i in list"><span v-for="j in i">{{ j+i }}</span></div>`,
    )
    expect(code).matchSnapshot()
    expect(code).contains(`_createFor(() => (_ctx.list), (_ctx0) => {`)
    expect(code).contains(`_createFor(() => (_ctx0[0]), (_ctx1) => {`)
    expect(code).contains(`_ctx1[0]+_ctx0[0]`)
    expect(ir.template).toEqual(['<span></span>', '<div></div>'])
    expect(ir.block.operation).toMatchObject([
      {
        type: IRNodeTypes.FOR,
        id: 0,
        source: { content: 'list' },
        value: { content: 'i' },
        render: {
          type: IRNodeTypes.BLOCK,
          dynamic: {
            children: [{ template: 1 }],
          },
        },
      },
    ])
    expect((ir.block.operation[0] as any).render.operation[0]).toMatchObject({
      type: IRNodeTypes.FOR,
      id: 2,
      source: { content: 'i' },
      value: { content: 'j' },
      render: {
        type: IRNodeTypes.BLOCK,
        dynamic: {
          children: [{ template: 0 }],
        },
      },
    })
  })

  test('object de-structured value', () => {
    const { code, ir } = compileWithVFor(
      `<div v-for="(  { id, ...other }, index) in list" :key="id">{{ id + other + index }}</div>`,
    )
    expect(code).matchSnapshot()
    expect(code).contains(`([{ id, ...other }, index]) => [id, other, index]`)
    expect(code).contains(`_ctx0[0] + _ctx0[1] + _ctx0[2]`)
    expect(ir.block.operation[0]).toMatchObject({
      type: IRNodeTypes.FOR,
      source: {
        type: NodeTypes.SIMPLE_EXPRESSION,
        content: 'list',
      },
      value: {
        type: NodeTypes.SIMPLE_EXPRESSION,
        content: '{ id, ...other }',
        ast: {
          type: 'ArrowFunctionExpression',
          params: [
            {
              type: 'ObjectPattern',
            },
          ],
        },
      },
      key: {
        type: NodeTypes.SIMPLE_EXPRESSION,
        content: 'index',
      },
      index: undefined,
    })
  })

  test('array de-structured value', () => {
    const { code, ir } = compileWithVFor(
      `<div v-for="([id, ...other], index) in list" :key="id">{{ id + other + index }}</div>`,
    )
    expect(code).matchSnapshot()
    expect(code).contains(`([[id, ...other], index]) => [id, other, index]`)
    expect(code).contains(`_ctx0[0] + _ctx0[1] + _ctx0[2]`)
    expect(ir.block.operation[0]).toMatchObject({
      type: IRNodeTypes.FOR,
      source: {
        type: NodeTypes.SIMPLE_EXPRESSION,
        content: 'list',
      },
      value: {
        type: NodeTypes.SIMPLE_EXPRESSION,
        content: '[id, ...other]',
        ast: {
          type: 'ArrowFunctionExpression',
          params: [
            {
              type: 'ArrayPattern',
            },
          ],
        },
      },
      key: {
        type: NodeTypes.SIMPLE_EXPRESSION,
        content: 'index',
      },
      index: undefined,
    })
  })

  test('v-for aliases w/ complex expressions', () => {
    const { code, ir } = compileWithVFor(
      `<div v-for="({ foo = bar, baz: [qux = quux] }) in list">
        {{ foo + bar + baz + qux + quux }}
      </div>`,
    )
    expect(code).matchSnapshot()
    expect(code).contains(`([{ foo = bar, baz: [qux = quux] }]) => [foo, qux]`)
    expect(code).contains(
      `_ctx0[0] + _ctx.bar + _ctx.baz + _ctx0[1] + _ctx.quux`,
    )
    expect(ir.block.operation[0]).toMatchObject({
      type: IRNodeTypes.FOR,
      source: {
        type: NodeTypes.SIMPLE_EXPRESSION,
        content: 'list',
      },
      value: {
        type: NodeTypes.SIMPLE_EXPRESSION,
        content: '{ foo = bar, baz: [qux = quux] }',
        ast: {
          type: 'ArrowFunctionExpression',
          params: [
            {
              type: 'ObjectPattern',
            },
          ],
        },
      },
      key: undefined,
      index: undefined,
    })
  })
  */
})
