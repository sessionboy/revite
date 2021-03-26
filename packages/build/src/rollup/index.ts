import { rollup } from "rollup"

export default async (input:any)=>{

  try {   
  
    const bundle = await rollup({
      input,
      // external,
      // treeshake: { moduleSideEffects: 'no-external' },
      // ...config.rollupInputOptions,
      plugins: [
      
      ]
    })

    // const { output } = await bundle.generate({
    //   ...config.rollupOutputOptions,
    //   format: 'es',
    //   exports: 'named',
    //   entryFileNames: '[name].js',
    //   chunkFileNames: 'common/[name]-[hash].js'
    // })

    // for (const chunk of output) {
    //   if (chunk.type === 'chunk') {
    //     const fileName = chunk.fileName
    //     const filePath = path.join(cacheDir, fileName)
    //     await fs.ensureDir(path.dirname(filePath))
    //     await fs.writeFile(filePath, chunk.code)
    //   }
    //   if (chunk.type === 'asset' && chunk.fileName === '_analysis.json') {
    //     const filePath = path.join(cacheDir, chunk.fileName)
    //     await fs.writeFile(filePath, chunk.source)
    //   }
    // }
    // await fs.writeFile(hashPath, depHash)
  } catch {
    
  }
}