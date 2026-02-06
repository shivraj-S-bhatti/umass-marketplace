import * as XLSX from 'xlsx'
import ExcelJS from 'exceljs'
import { CreateListingForm } from '@/features/marketplace/pages/SellPage'

// Template column headers - must match exactly
export const TEMPLATE_COLUMNS = [
  'title',
  'price',
  'description',
  'category',
  'condition',
  'image',
  'link',
] as const

export type TemplateRow = {
  title: string
  price: number
  description?: string
  category?: string
  condition?: string
  image?: string
  link?: string
}

/**
 * Generates an Excel template file with headers and example row
 */
export function generateTemplate(): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new()
  
  // Create example data row
  const exampleData: TemplateRow[] = [
    {
      title: 'Example Item',
      price: 29.99,
      description: 'This is an example description',
      category: 'Electronics',
      condition: 'Like New',
      image: '',
      link: '',
    },
  ]
  
  // Convert to worksheet
  const worksheet = XLSX.utils.json_to_sheet(exampleData, {
    header: [...TEMPLATE_COLUMNS],
    skipHeader: false,
  })
  
  // Set column widths for better readability
  worksheet['!cols'] = [
    { wch: 20 }, // title
    { wch: 10 }, // price
    { wch: 40 }, // description
    { wch: 15 }, // category
    { wch: 12 }, // condition
    { wch: 50 }, // image
    { wch: 50 }, // link
  ]
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Listings')
  
  return workbook
}

/**
 * Downloads the template Excel file
 */
export function downloadTemplate(): void {
  const workbook = generateTemplate()
  const fileName = 'listing_template.xlsx'
  XLSX.writeFile(workbook, fileName)
}

/**
 * Validates that the uploaded file matches the template format
 */
export function validateTemplateFormat(file: File): { valid: boolean; error?: string } {
  // Check file extension
  if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
    return { valid: false, error: 'File must be an Excel file (.xlsx or .xls)' }
  }
  
  return { valid: true }
}

/**
 * Validates the structure of parsed Excel data
 */
export function validateExcelStructure(data: any[]): { valid: boolean; error?: string } {
  if (!data || data.length === 0) {
    return { valid: false, error: 'Excel file is empty or has no data rows' }
  }
  
  // Check if required columns exist in first row
  const firstRow = data[0]
  const requiredColumns = ['title', 'price']
  
  for (const col of requiredColumns) {
    if (!(col in firstRow)) {
      return { valid: false, error: `Missing required column: ${col}` }
    }
  }
  
  return { valid: true }
}

/**
 * Compresses an image by converting it to a canvas and reducing quality
 * Returns a promise that resolves to compressed base64 data URL
 */
function compressImage(dataUrl: string, maxSizeKB: number = 500): Promise<string> {
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

/**
 * Extracts images from Excel file and converts them to base64 data URLs
 * Uses ExcelJS to extract embedded images from Excel files
 */
async function extractImagesFromExcel(file: File): Promise<Map<number, string>> {
  const imageMap = new Map<number, string>()
  
  try {
    const arrayBuffer = await file.arrayBuffer()
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(arrayBuffer)
    
    const worksheet = workbook.worksheets[0]
    if (!worksheet) {
      console.warn('No worksheet found in Excel file')
      return imageMap
    }
    
    // Get all images from the worksheet
    const images = worksheet.getImages()
    
    for (const image of images) {
      try {
        // Get the image from workbook media
        const excelImage = workbook.model.media?.find((m: unknown) => String((m as { index?: number }).index) === String(image.imageId))
        if (!excelImage || !excelImage.buffer) {
          console.warn(`Image ${image.imageId} not found in media`)
          continue
        }
        
        // Get buffer - handle both Buffer (Node.js) and ArrayBuffer/Uint8Array (browser)
        let buffer: Uint8Array
        if (excelImage.buffer instanceof Uint8Array) {
          buffer = excelImage.buffer
        } else if (excelImage.buffer instanceof ArrayBuffer) {
          buffer = new Uint8Array(excelImage.buffer)
        } else if (typeof Buffer !== 'undefined' && (excelImage.buffer as any) instanceof Buffer) {
          // Node.js Buffer - convert to Uint8Array
          buffer = new Uint8Array(excelImage.buffer)
        } else {
          // Try to convert to Uint8Array
          buffer = new Uint8Array(excelImage.buffer as any)
        }
        
        // Determine image type from extension
        let mimeType = 'image/png' // default
        const extension = excelImage.extension || excelImage.name?.split('.').pop()?.toLowerCase()
        if (extension === 'jpg' || extension === 'jpeg') {
          mimeType = 'image/jpeg'
        } else if (extension === 'gif') {
          mimeType = 'image/gif'
        } else if (extension === 'webp') {
          mimeType = 'image/webp'
        }
        
        // Convert buffer to base64 data URL (browser-compatible)
        const binaryString = Array.from(buffer, byte => String.fromCharCode(byte)).join('')
        const base64 = btoa(binaryString)
        const dataUrl = `data:${mimeType};base64,${base64}`
        
        // Compress the image to reduce size
        const compressedDataUrl = await compressImage(dataUrl, 400) // Max 400KB per image
        
        // Map image to row number (range.tl.nativeRow is 0-indexed, we want 1-indexed for row number)
        // Add 1 because Excel rows are 1-indexed and we want to match the data row
        const rowNumber = image.range.tl.nativeRow + 1
        imageMap.set(rowNumber, compressedDataUrl)
        
      } catch (error) {
        console.warn(`Failed to extract image ${image.imageId}:`, error)
      }
    }
  } catch (error) {
    console.error('Error extracting images from Excel:', error)
  }
  
  return imageMap
}

/**
 * Parses an Excel file and returns array of listing objects with images
 */
export async function parseExcelFile(file: File): Promise<TemplateRow[]> {
  return new Promise(async (resolve, reject) => {
    try {
      // Extract images first
      const imageMap = await extractImagesFromExcel(file)
      
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result
          if (!data) {
            reject(new Error('Failed to read file'))
            return
          }
          
          const workbook = XLSX.read(data, { type: 'binary' })
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          
          // Convert to JSON with header row
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: '',
          }) as any[][]
          
          if (jsonData.length < 2) {
            reject(new Error('Excel file must have at least a header row and one data row'))
            return
          }
          
          // Get headers from first row
          const headers = jsonData[0].map((h: any) => String(h).toLowerCase().trim())
          
          // Map old column names to new template format
          const columnMapping: Record<string, string> = {
            'item': 'title',
            'selling price': 'price',
            'price': 'price',
            'comment': 'description',
            'description': 'description',
            'link': 'link',
            'image': 'image',
            'imageurl': 'image', // Support old column name
            'category': 'category',
            'condition': 'condition',
          }
          
          // Normalize headers
          const normalizedHeaders = headers.map((h) => {
            const normalized = h.toLowerCase().trim().replace(/\s+/g, ' ')
            return columnMapping[normalized] || normalized
          })
          
          // Convert rows to objects
          const rows: TemplateRow[] = []
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i]
            if (row.every((cell) => cell === '' || cell === null || cell === undefined)) {
              continue // Skip empty rows
            }
            
            const rowObj: any = {}
            normalizedHeaders.forEach((header, index) => {
              const value = row[index]
              // Always set the value, even if empty, so we can check for it later
              // Convert to string and trim whitespace
              if (value !== null && value !== undefined) {
                rowObj[header] = String(value).trim()
              }
            })
            
            // Check if there's an embedded image for this row (row number is i+1 because header is row 1)
            const rowNumber = i + 1
            // Check for image in various possible column names, and ensure it's not empty
            let image = (rowObj.image && rowObj.image.trim() !== '') 
              ? rowObj.image.trim() 
              : (rowObj.imageurl && rowObj.imageurl.trim() !== '') 
                ? rowObj.imageurl.trim() 
                : (rowObj.imageUrl && rowObj.imageUrl.trim() !== '') 
                  ? rowObj.imageUrl.trim() 
                  : null
            if (!image) {
              // Check if there's an extracted image for this row
              const extractedImage = imageMap.get(rowNumber)
              if (extractedImage) {
                image = extractedImage
              }
            }
            
            // Ensure required fields
            if (rowObj.title && rowObj.price !== undefined && rowObj.price !== null && rowObj.price !== '') {
              rows.push({
                title: String(rowObj.title || '').trim(),
                price: parseFloat(String(rowObj.price || 0)),
                description: rowObj.description ? String(rowObj.description).trim() : undefined,
                category: rowObj.category ? String(rowObj.category).trim() : undefined,
                condition: rowObj.condition ? String(rowObj.condition).trim() : undefined,
                image: image || undefined,
                link: rowObj.link ? String(rowObj.link).trim() : undefined,
              })
            }
          }
          
          resolve(rows)
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }
      
      reader.readAsBinaryString(file)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Converts template rows to CreateListingForm format
 */
export function convertToCreateListingForm(rows: TemplateRow[]): CreateListingForm[] {
  return rows.map((row) => {
    // Ensure image is properly converted - if it exists and is not empty, use it, otherwise use empty string
    const imageValue = row.image && typeof row.image === 'string' && row.image.trim() !== '' 
      ? row.image.trim() 
      : ''
    
    return {
      title: row.title,
      price: row.price,
      // Send undefined instead of empty string for optional fields to match backend validation
      description: row.description && row.description.trim() !== '' ? row.description.trim() : undefined,
      category: row.category && row.category.trim() !== '' ? row.category.trim() : undefined,
      condition: row.condition && row.condition.trim() !== '' ? row.condition.trim() : undefined,
      imageUrl: imageValue || undefined, // Send undefined if empty string
    }
  })
}
