import Papa from 'papaparse'

function normalizeRow(raw) {
  const drawNumber = parseInt(raw.draw_number ?? raw.drawNumber, 10)
  const drawDate = (raw.draw_date ?? raw.drawDate ?? '').trim()
  const numbers = [
    parseInt(raw.n1, 10),
    parseInt(raw.n2, 10),
    parseInt(raw.n3, 10),
    parseInt(raw.n4, 10),
    parseInt(raw.n5, 10),
    parseInt(raw.n6, 10),
  ]
  const additional = parseInt(raw.additional, 10)

  if (
    isNaN(drawNumber) ||
    !drawDate ||
    numbers.some(isNaN) ||
    numbers.some(n => n < 1 || n > 42) ||
    isNaN(additional) ||
    additional < 1 ||
    additional > 42 ||
    new Set(numbers).size !== 6
  ) {
    return null
  }

  return {
    drawNumber,
    drawDate,
    numbers: [...numbers].sort((a, b) => a - b),
    additional,
  }
}

export function parseCsvText(text) {
  const result = Papa.parse(text, { header: true, skipEmptyLines: true })
  return result.data.map(normalizeRow).filter(Boolean)
}

export function parseCsvFile(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const draws = result.data.map(normalizeRow).filter(Boolean)
        resolve(draws)
      },
      error: reject,
    })
  })
}
