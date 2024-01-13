import type { UnpluginFactory } from 'unplugin'
import { createUnplugin } from 'unplugin'
import { createFilter } from 'vite'
import type { Options } from './types'
import { transformVueJsxVapor } from './core/transfrom'

export const unpluginFactory: UnpluginFactory<Options | undefined> = options => ({
  enforce: 'pre',
  name: 'unplugin-vue-jsx-vapor',
  transformInclude: createFilter(options?.include || /\.[jt]sx$/, options?.exclude),
  transform: transformVueJsxVapor,
})

export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory)

export default unplugin
