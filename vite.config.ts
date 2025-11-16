import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    // make sure that '@tanstack/router-plugin' is passed before 'plugin-solid'
    tanstackRouter({
      target: 'solid',
      autoCodeSplitting: true,
    }),
    solid(),
    tailwindcss(),
  ],
})
