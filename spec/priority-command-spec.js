// priority-command-spec.js -- Set the priority for a task
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

describe("todo.txt priority commands", () => {

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

  it("has a todotxt:priority-* command for each letter", () => {
    let commands = atom.commands.findCommands({target: workspaceElement()})
    let priorities = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let priorityCommand = null
    for (priority of priorities) {
      let priorityCommand = commands.find((command) => { return command.name === `todotxt:priority-${priority.toLowerCase()}` })
      expect(priorityCommand).not.toBeUndefined()
    }
  })

  it("sets the priority for a task without a priority", () => {
    let te = atom.workspace.getActiveTextEditor();
    te.moveDown(2);
    let text = getCurrentLine(te);
    expect(text).toEqual("Post signs around the neighborhood +GarageSale");
    atom.commands.dispatch(workspaceElement(), 'todotxt:priority-c');
    text = getCurrentLine(te);
    expect(text).toEqual("(C) Post signs around the neighborhood +GarageSale");
  })

  it("changes the priority for a task with a priority", () => {
    let te = atom.workspace.getActiveTextEditor();
    te.moveDown(1);
    let text = getCurrentLine(te);
    expect(text).toEqual("(B) Schedule Goodwill pickup +GarageSale @phone");
    atom.commands.dispatch(workspaceElement(), 'todotxt:priority-a');
    text = getCurrentLine(te);
    expect(text).toEqual("(A) Schedule Goodwill pickup +GarageSale @phone");
  })

  it("does not change the priority for a task marked done", () => {
    let te = atom.workspace.getActiveTextEditor();
    te.moveDown(8);
    let text = getCurrentLine(te);
    expect(text).toEqual("x 2017-10-19 todotxt:done on a line that is already done +LanguageTodotxt");
    atom.commands.dispatch(workspaceElement(), 'todotxt:priority-d');
    text = getCurrentLine(te);
    expect(text).toEqual("x 2017-10-19 todotxt:done on a line that is already done +LanguageTodotxt");
  })

})
