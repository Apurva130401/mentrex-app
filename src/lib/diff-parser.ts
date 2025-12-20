
export interface DiffLine {
    type: 'context' | 'add' | 'remove' | 'header'
    content: string
    oldLine?: number
    newLine?: number
}

export interface DiffFile {
    file: string
    lines: DiffLine[]
}

export function parseDiff(diffText: string): DiffFile[] {
    const files: DiffFile[] = []
    let currentFile: DiffFile | null = null
    let oldLine = 0
    let newLine = 0

    const lines = diffText.split('\n')

    for (const line of lines) {
        if (line.startsWith('diff --git')) {
            // New file started
            if (currentFile) files.push(currentFile)
            currentFile = { file: '', lines: [] }
        } else if (line.startsWith('+++ b/')) {
            if (currentFile) currentFile.file = line.substring(6)
        } else if (line.startsWith('--- a/')) {
            // ignore
        } else if (line.startsWith('@@')) {
            // Header: @@ -1,5 +1,5 @@
            // Extract starting line numbers
            const match = line.match(/@@ -(\d+),?\d* \+(\d+),?\d* @@/)
            if (match) {
                oldLine = parseInt(match[1])
                newLine = parseInt(match[2])
            }
            if (currentFile) {
                currentFile.lines.push({ type: 'header', content: line })
            }
        } else if (line.startsWith('+') && !line.startsWith('+++')) {
            if (currentFile) {
                currentFile.lines.push({ type: 'add', content: line, newLine: newLine++ })
            }
        } else if (line.startsWith('-') && !line.startsWith('---')) {
            if (currentFile) {
                currentFile.lines.push({ type: 'remove', content: line, oldLine: oldLine++ })
            }
        } else {
            if (currentFile) {
                // Context line
                currentFile.lines.push({ type: 'context', content: line, oldLine: oldLine++, newLine: newLine++ })
            }
        }
    }

    if (currentFile) files.push(currentFile)

    return files.filter(f => f.file) // Removing any empties
}
