/**
 * Simple markdown to HTML converter for basic formatting
 * Supports: **bold**, *italic*, bullet lists, numbered lists, line breaks
 */

export function markdownToHtml(markdown: string): string {
  if (!markdown) return ''
  
  const html = markdown
  
  // Split into lines for processing
  const lines = html.split('\n')
  const processedLines: string[] = []
  let inList = false
  let listType: 'ul' | 'ol' | null = null
  let listItems: string[] = []
  
  function closeList() {
    if (listItems.length > 0 && listType) {
      const tag = listType === 'ul' ? 'ul' : 'ol'
      const listHtml = `<${tag} class="list-${listType === 'ul' ? 'disc' : 'decimal'} ml-6 space-y-1">${listItems.join('')}</${tag}>`
      processedLines.push(listHtml)
      listItems = []
      inList = false
      listType = null
    }
  }
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // Check for bullet list (- or *)
    if (/^[-*]\s+/.test(line)) {
      const content = line.replace(/^[-*]\s+/, '')
      if (!inList || listType !== 'ul') {
        closeList()
        inList = true
        listType = 'ul'
      }
      listItems.push(`<li>${formatInlineMarkdown(content)}</li>`)
      continue
    }
    
    // Check for numbered list (1. or 1))
    if (/^\d+[.)]\s+/.test(line)) {
      const content = line.replace(/^\d+[.)]\s+/, '')
      if (!inList || listType !== 'ol') {
        closeList()
        inList = true
        listType = 'ol'
      }
      listItems.push(`<li>${formatInlineMarkdown(content)}</li>`)
      continue
    }
    
    // Not a list item - close any open list
    closeList()
    
    // Empty line becomes <br>
    if (line === '') {
      processedLines.push('<br>')
    } else {
      processedLines.push(`<p>${formatInlineMarkdown(line)}</p>`)
    }
  }
  
  // Close any remaining list
  closeList()
  
  return processedLines.join('')
}

function formatInlineMarkdown(text: string): string {
  // Convert **bold** to <strong>
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  
  // Convert *italic* to <em> (but not if it's part of **bold**)
  text = text.replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em>$1</em>')
  
  return text
}
