'use babel'

import { Point, Range } from 'atom'

export default {
  selector: '.text.todotxt',
  disableForSelector: '.text.todotxt .comment',

  inclusionPriority: 1,
  excludeLowerPriority: false,

  suggestionPriority: 2,

  filterSuggestions: false,

  getSuggestions({ editor, bufferPosition, activatedManually }) {
    let prefix = getPrefix(editor, bufferPosition)

    var suggestions
    if (prefix.length === 0 && !activatedManually) {
      suggestions = []
    } else {
      suggestions = findSuggestions(editor, prefix, getPrefixRange(bufferPosition, prefix))
    }

    let existing = getCurrentTags(editor, prefix, bufferPosition)
    return sortSuggestions(filterSuggestions(suggestions, existing))
  }
}

function findProjects(editor, prefix, prefixRange) {
  return findTags(editor, prefix, 'project', prefixRange)
}

function findContexts(editor, prefix, prefixRange) {
  return findTags(editor, prefix, 'context', prefixRange)
}

function findSuggestions(editor, prefix, prefixRange) {
  if (prefix.startsWith('+')) {
    return findProjects(editor, prefix, prefixRange)
  } else if (prefix.startsWith('@')) {
    return findContexts(editor, prefix, prefixRange)
  } else if (prefix === '') {
    return findProjects(editor, '').concat(findContexts(editor, ''))
  } else {
    return []
  }
}

// Find +project or @context tags (excluding any that intersect with excludeRange) with a given prefix
function findTags(editor, prefix, type, excludeRange) {
  let completions = []
  let index = {}
  scanForTags(editor, type, editor.getBuffer().getRange(), ({ match, range }) => {
    if (excludeRange && range.intersectsWith(excludeRange)) {
      return
    }

    let name = match[2]
    let tag = `${match[1]}${name}`
    if (!index.hasOwnProperty(name) && tag.startsWith(prefix)) {
      completions.push({
        text: tag,
        replacementPrefix: prefix,
        type: 'tag',
        iconHTML: `<i class="icon-letter tag">${type.charAt(0)}</i>`,
        rightLabel: type == 'context' ? 'Context' : 'Project'
      })
      index[name] = true
    }
  })
  return completions
}

// Scan a range for +project or @context tags, calling callback for each match
function scanForTags(editor, type, range, callback) {
  let regex = type == 'context' ? /(?:^|\s)(@)(\S+)/g : /(?:^|\s)([+])(\S+)/g
  editor.scanInBufferRange(regex, range, callback)
}

// Get the +project or @context tags on the current line, except for the current prefix
function getCurrentTags(editor, prefix, bufferPosition) {
  let existing = {}
  let prefixRange = getPrefixRange(bufferPosition, prefix)
  let wholeRow = editor.getBuffer().rangeForRow(bufferPosition.row)

  function addTag({ match, range }) {
    if (!range.intersectsWith(prefixRange)) {
      existing[`${match[1]}${match[2]}`] = true
    }
  }

  scanForTags(editor, 'project', wholeRow, addTag)
  scanForTags(editor, 'context', wholeRow, addTag)

  return existing
}

function filterSuggestions(completions, existing) {
  return completions.filter(completion => !existing.hasOwnProperty(completion.text))
}

function sortSuggestions(completions) {
  return completions.sort((a, b) => {
    let aText = a.text.substring(1).toLowerCase()
    let bText = b.text.substring(1).toLowerCase()
    return aText < bText ? -1 : aText > bText ? 1 : 0
  })
}

function getPrefixRange(bufferPosition, prefix) {
  return new Range(new Point(bufferPosition.row, bufferPosition.column - prefix.length), bufferPosition)
}

function getPrefix(editor, bufferPosition) {
  let regex = /(?:^|\s)([+@]?\S*)$/
  let line = editor.getTextInBufferRange([[bufferPosition.row, 0], bufferPosition])
  let match = line.match(regex)
  return match ? match[1] : ''
}
