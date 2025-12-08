/**
 * Compresses an image by converting it to a canvas and reducing quality/dimensions
 * Returns a promise that resolves to compressed base64 data URL
 * @param dataUrl - The image data URL to compress
 * @param maxSizeKB - Maximum size in KB (default 400KB)
 */
export function compressImage(dataUrl: string, maxSizeKB: number = 400): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let width = img.width
      let height = img.height
      let quality = 0.9

      // Compress by reducing quality until size is acceptable
      while (quality > 0.1) {
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(dataUrl) // Fallback to original if compression fails
          return
        }
        
        ctx.drawImage(img, 0, 0, width, height)
        const compressed = canvas.toDataURL('image/jpeg', quality)
        
        // Check if size is acceptable (rough estimate: base64 is ~33% larger)
        const sizeKB = (compressed.length * 0.75) / 1024
        if (sizeKB <= maxSizeKB) {
          resolve(compressed)
          return
        }
        
        // Reduce quality if still too large
        quality -= 0.1
        
        // If quality is too low, reduce dimensions instead
        if (quality < 0.3) {
          width = Math.floor(width * 0.8)
          height = Math.floor(height * 0.8)
          quality = 0.9
        }
      }
      
      // Last resort: return the smallest possible version
      resolve(canvas.toDataURL('image/jpeg', 0.1))
    }
    img.onerror = () => {
      resolve(dataUrl) // Fallback to original if image fails to load
    }
    img.src = dataUrl
  })
}
