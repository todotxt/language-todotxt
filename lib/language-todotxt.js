'use babel'

// langauge-todotxt.js -- main module for language-todotxt
//
// Copyright (c) 2017, Evan Prodromou <evan@prodromou.name>
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the organization nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
// DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
// ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
// SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

import { CompositeDisposable } from 'atom'

export default {

  activate() {
    this.subscriptions = new CompositeDisposable()

    let commands = {
      'todotxt:done': () => { this.done() },
      'todotxt:add': () => { this.add() }
    }

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

    for (i in letters) {
      let letter = letters[i]
      let key = `todotxt:priority-${letter.toLowerCase()}`
      let value = () => { this.priority(letter) }
      commands[key] = value
    }

    this.subscriptions.add(atom.commands.add('atom-workspace', commands))
  },

  deactivate() {
    this.subscriptions.dispose()
  },

  dateNow() {
    let dt = new Date()
    return `${dt.getFullYear()}-${(dt.getMonth() < 8) ? '0' : ''}${dt.getMonth() + 1}-${dt.getDate() < 10 ? '0' : ''}${dt.getDate()}`
  },

  done() {
    let te = atom.workspace.getActiveTextEditor()
    let pt = te.getCursorBufferPosition()
    let line = te.lineTextForBufferRow(pt.row)
    if (!line.match(/^x /)) {
      let pm = line.match(/^\(([A-Z])\) /)
      if (pm) {
        let pri = pm[1]
        line = `${line.substr(pm[0].length)} pri:${pri}`
      }
      let now = this.dateNow()
      line = `x ${now} ${line}`
      te.getBuffer().transact(() => {
        te.moveToBeginningOfLine()
        te.deleteToEndOfLine()
        te.insertText(line)
        te.moveToBeginningOfLine()
      })
    }
  },

  add() {
    let te = atom.workspace.getActiveTextEditor()
    te.moveToEndOfLine()
    let now = this.dateNow()
    te.insertText(`\n${now} `)
  },

  priority(letter) {
    let te = atom.workspace.getActiveTextEditor()
    let pt = te.getCursorBufferPosition()
    let line = te.lineTextForBufferRow(pt.row)
    if (!line.match(/^x /)) {
      // Remove the priority if it exists
      let pm = line.match(/^\(([A-Z])\) /)
      if (pm) {
        line = line.substr(pm[0].length)
      }
      line = `(${letter}) ${line}`
      te.moveToBeginningOfLine()
      te.deleteToEndOfLine()
      te.insertText(line)
      te.moveToBeginningOfLine()
    }
  }
}
