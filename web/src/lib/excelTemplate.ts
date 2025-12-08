import * as XLSX from 'xlsx'
import { CreateListingForm } from '@/pages/SellPage'

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
    header: TEMPLATE_COLUMNS,
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
 * Extracts images from Excel file and converts them to base64 data URLs
 * Note: Image extraction from Excel files in the browser is limited.
 * Users should provide image URLs in the 'image' column instead.
 */
async function extractImagesFromExcel(file: File): Promise<Map<number, string>> {
  const imageMap = new Map<number, string>()
  
  // Image extraction from Excel files requires server-side processing
  // For now, we'll rely on image URLs provided in the 'image' column
  // This function is kept for future server-side implementation
  console.log('Image extraction from Excel files is not available in the browser. Please provide image URLs in the "image" column.')
  
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
          
          // Find image column index (if exists)
          const imageColIndex = headers.findIndex((h: string) => 
            h.includes('image') || h === 'imageurl' || h === 'image'
          )
          
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
              if (value !== null && value !== undefined && value !== '') {
                rowObj[header] = value
              }
            })
            
            // Check if there's an embedded image for this row (row number is i+1 because header is row 1)
            const rowNumber = i + 1
            let image = rowObj.image || rowObj.imageurl || rowObj.imageUrl
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
  return rows.map((row) => ({
    title: row.title,
    price: row.price,
    description: row.description || '',
    category: row.category || '',
    condition: row.condition || '',
    imageUrl: row.image?.trim() || '', // Map 'image' to 'imageUrl' for API, ensure it's a string
  }))
}
