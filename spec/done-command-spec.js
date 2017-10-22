// done-command-spec.js -- Test the main module for the project
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

"use babel";

describe("todo.txt done command", () => {

  const workspaceElement = () => {
    return atom.views.getView(atom.workspace)
  };

  beforeEach(() => {
    waitsForPromise(() => {
      return atom.workspace.open("todo.txt");
    });

    waitsForPromise(() => {
      return atom.packages.activatePackage("language-todotxt");
    });
  });

  it("has a todotxt:done command", () => {
    let commands = atom.commands.findCommands({target: workspaceElement()});
    let doneCommand = commands.find((command) => { return command.name === "todotxt:done" });
    expect(doneCommand).not.toBeUndefined();
  });

  it("marks a line with a priority and with a start date as done", () => {

    const getCurrentLine = (te) => {
      let pt = te.getCursorBufferPosition();
      return te.lineTextForBufferRow(pt.row);
    };

    let te = atom.workspace.getActiveTextEditor();
    te.moveDown(5);
    let text = getCurrentLine(te);
    expect(text).toEqual("(A) 2017-10-17 Implement the todotxt:done command +LanguageTodotxt");
    atom.commands.dispatch(workspaceElement(), 'todotxt:done');
    text = getCurrentLine(te);
    let dt = new Date();
    let now = `${dt.getFullYear()}-${(dt.getMonth() < 8) ? '0' : ''}${dt.getMonth() + 1}-${dt.getDate() < 10 ? '0' : ''}${dt.getDate()}`;
    expect(text).toEqual(`x ${now} 2017-10-17 Implement the todotxt:done command +LanguageTodotxt pri:A`);
  });

  it("marks a line without a priority and with a start date as done", () => {

    const getCurrentLine = (te) => {
      let pt = te.getCursorBufferPosition();
      return te.lineTextForBufferRow(pt.row);
    };

    let te = atom.workspace.getActiveTextEditor();
    te.moveDown(6);
    let text = getCurrentLine(te);
    expect(text).toEqual("2017-10-19 todotxt:done without a priority +LanguageTodotxt");
    atom.commands.dispatch(workspaceElement(), 'todotxt:done');
    text = getCurrentLine(te);
    let dt = new Date();
    let now = `${dt.getFullYear()}-${(dt.getMonth() < 8) ? '0' : ''}${dt.getMonth() + 1}-${dt.getDate() < 10 ? '0' : ''}${dt.getDate()}`;
    expect(text).toEqual(`x ${now} 2017-10-19 todotxt:done without a priority +LanguageTodotxt`);
  });

  it("marks a line with a priority and no start date as done", () => {

    const getCurrentLine = (te) => {
      let pt = te.getCursorBufferPosition();
      return te.lineTextForBufferRow(pt.row);
    };

    let te = atom.workspace.getActiveTextEditor();
    te.moveDown(7);
    let text = getCurrentLine(te);
    expect(text).toEqual("(D) todotxt:done with a priority and no start date +LanguageTodotxt");
    atom.commands.dispatch(workspaceElement(), 'todotxt:done');
    text = getCurrentLine(te);
    let dt = new Date();
    let now = `${dt.getFullYear()}-${(dt.getMonth() < 8) ? '0' : ''}${dt.getMonth() + 1}-${dt.getDate() < 10 ? '0' : ''}${dt.getDate()}`;
    expect(text).toEqual(`x ${now} todotxt:done with a priority and no start date +LanguageTodotxt pri:D`);
  });

  it("is idempotent for a line that is already marked as done", () => {

    const getCurrentLine = (te) => {
      let pt = te.getCursorBufferPosition();
      return te.lineTextForBufferRow(pt.row);
    };

    let te = atom.workspace.getActiveTextEditor();
    te.moveDown(8);
    let text = getCurrentLine(te);
    expect(text).toEqual("x 2017-10-19 todotxt:done on a line that is already done +LanguageTodotxt");
    atom.commands.dispatch(workspaceElement(), 'todotxt:done');
    text = getCurrentLine(te);
    expect(text).toEqual("x 2017-10-19 todotxt:done on a line that is already done +LanguageTodotxt");
  });

  it("makes edits in a single transaction", () => {

    const getCurrentLine = (te) => {
      let pt = te.getCursorBufferPosition();
      return te.lineTextForBufferRow(pt.row);
    };

    let te = atom.workspace.getActiveTextEditor();
    te.moveDown(5);
    let text = getCurrentLine(te);
    expect(text).toEqual("(A) 2017-10-17 Implement the todotxt:done command +LanguageTodotxt");
    atom.commands.dispatch(workspaceElement(), 'todotxt:done');
    text = getCurrentLine(te);
    let dt = new Date();
    let now = `${dt.getFullYear()}-${(dt.getMonth() < 8) ? '0' : ''}${dt.getMonth() + 1}-${dt.getDate() < 10 ? '0' : ''}${dt.getDate()}`;
    expect(text).toEqual(`x ${now} 2017-10-17 Implement the todotxt:done command +LanguageTodotxt pri:A`);

    atom.commands.dispatch(workspaceElement(), 'core:undo');
    expect(text).toEqual("(A) 2017-10-17 Implement the todotxt:done command +LanguageTodotxt");
  });

});
