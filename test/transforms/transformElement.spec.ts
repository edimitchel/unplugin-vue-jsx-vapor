import { describe, expect, test } from 'vitest'
// import {
//   type BindingMetadata,
//   BindingTypes,
//   NodeTypes,
// } from '@vue/compiler-core'
import { BindingTypes } from '@vue-vapor/compiler-core'
import {
  // IRDynamicPropsKind,
  // IRNodeTypes,
  transformChildren,
  transformElement,
  transformText,
  transformVBind,
  transformVOn,
} from '../../src/core/compiler/index'
import { makeCompile } from './_utils'

const compileWithElementTransform = makeCompile({
  nodeTransforms: [transformElement, transformChildren, transformText],
  directiveTransforms: {
    bind: transformVBind,
    on: transformVOn,
  },
})

describe('compiler: element transform', () => {
  describe('component', () => {
    test('import + resolve component', () => {
      const { code, vaporHelpers } = compileWithElementTransform(`<Foo/>`)
      expect(code).toMatchInlineSnapshot(`
        "import { resolveComponent as _resolveComponent, createComponent as _createComponent } from 'vue/vapor';

        export function render(_ctx) {
          const _component_Foo = _resolveComponent("Foo")
          const n0 = _createComponent(_component_Foo, null, null, true)
          return n0
        }"
      `)
      expect(vaporHelpers).contains.all.keys(
        // 'resolveComponent',
        'createComponent',
      )
    })
  })

  test('resolve namespaced component from setup bindings (inline const)', () => {
    const { code, vaporHelpers } = compileWithElementTransform(
      `<Foo.Example/>`,
      {
        inline: true,
        bindingMetadata: {
          Foo: BindingTypes.SETUP_CONST,
        },
      },
    )
    expect(code).toMatchInlineSnapshot(`
      "(() => {
        const n0 = _createComponent(Foo.Example, null, null, true)
        return n0
      })()"
    `)
    expect(code).contains(`Foo.Example`)
    expect(vaporHelpers).not.toContain('resolveComponent')
  })
})
