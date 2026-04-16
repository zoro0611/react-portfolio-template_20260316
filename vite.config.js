import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const watchPublicData = {
    name: 'watch-public-data',
    configureServer(server) {
        server.watcher.add(path.resolve(__dirname, 'public/**/*.json'))
        server.watcher.on('change', (file) => {
            if (file.includes(`${path.sep}public${path.sep}`)) {
                server.ws.send({ type: 'full-reload' })
            }
        })
    }
}

// https://vitejs.dev/config/
export default defineConfig({
    base: '/',
    plugins: [react(), watchPublicData],
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        // Split the swiper plugin library into a separate chunk to avoid a large chunk size on index.js
                        if (id.includes('swiper'))
                            return 'swiper';
                        return;
                    }
                }
            }
        }
    },
    css: {
        preprocessorOptions: {
            scss: {
                silenceDeprecations: ["mixed-decls", "color-functions", "global-builtin", "import"],
            },
        },
    },
})
