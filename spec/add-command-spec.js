// add-command-spec.js -- Command to add a new task
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
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
// ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
// SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

"use babel"

describe("todo.txt add command", () => {

  const workspaceElement = () => {
    return atom.views.getView(atom.workspace)
  }

  const getCurrentLine = (te) => {
    let pt = te.getCursorBufferPosition()
    return te.lineTextForBufferRow(pt.row)
  }

  beforeEach(() => {
    waitsForPromise(() => {
      return atom.workspace.open("todo.txt")
    })
    waitsForPromise(() => {
      return atom.packages.activatePackage("language-todotxt")
    })
  })

  it("has a todotxt:add command", () => {
    let commands = atom.commands.findCommands({target: workspaceElement()})
    let addCommand = commands.find((command) => { return command.name === "todotxt:add" })
    expect(addCommand).not.toBeUndefined()
  })

  it("adds a task at the beginning of the file", () => {
    let te = atom.workspace.getActiveTextEditor()
    let pt = te.getCursorBufferPosition()
    expect(pt.row).toEqual(0)
    atom.commands.dispatch(workspaceElement(), 'todotxt:add')
    pt = te.getCursorBufferPosition()
    expect(pt.row).toEqual(1)
    expect(pt.column).toEqual(11)
    let text = getCurrentLine(te)
    let dt = new Date()
    let now = `${dt.getFullYear()}-${(dt.getMonth() < 8) ? '0' : ''}${dt.getMonth() + 1}-${dt.getDate() < 10 ? '0' : ''}${dt.getDate()}`
    expect(text).toEqual(`${now} `)
  })

  it("adds a task at the end of the file", () => {
    let te = atom.workspace.getActiveTextEditor()
    te.moveDown(8);
    let pt = te.getCursorBufferPosition()
    expect(pt.row).toEqual(8)
    atom.commands.dispatch(workspaceElement(), 'todotxt:add')
    pt = te.getCursorBufferPosition()
    expect(pt.row).toEqual(9)
    expect(pt.column).toEqual(11)
    let text = getCurrentLine(te)
    let dt = new Date()
    let now = `${dt.getFullYear()}-${(dt.getMonth() < 8) ? '0' : ''}${dt.getMonth() + 1}-${dt.getDate() < 10 ? '0' : ''}${dt.getDate()}`
    expect(text).toEqual(`${now} `)
  })

})
