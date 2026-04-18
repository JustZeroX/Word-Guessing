export function cosineSimilarity(vectorA = [], vectorB = []) {
  if (!vectorA.length || !vectorB.length || vectorA.length !== vectorB.length) {
    return '0.0000'
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let index = 0; index < vectorA.length; index += 1) {
    const valueA = Number(vectorA[index]) || 0
    const valueB = Number(vectorB[index]) || 0
    dotProduct += valueA * valueB
    normA += valueA ** 2
    normB += valueB ** 2
  }

  if (!normA || !normB) return '0.0000'

  const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  const percentage = Math.max(0, similarity * 100)
  return percentage.toFixed(4)
}
