// autocomplete-spec.js -- Test the autocomplete provider for the project
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

let suggestionsForPrefix = (provider, editor, prefix, options) => {
  let bufferPosition = editor.getCursorBufferPosition()
  let scopeDescriptor = editor.getLastCursor().getScopeDescriptor()
  let suggestions = provider.getSuggestions({editor, bufferPosition, prefix, scopeDescriptor})
  if (options && options.raw) {
    return suggestions
  } else {
    if (suggestions) {
      return (suggestions.map((sug) => sug.text))
    } else {
      return []
    }
  }
}

describe("todo.txt autocompletion", () => {
  var provider

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
      return atom.packages.activatePackage("language-todotxt").then(package => {
        provider = package.mainModule.getAutocompleteProvider()
      })
    })
  })

  it("finds all suggestions with no prefix", () => {
    let te = atom.workspace.getActiveTextEditor()
    te.moveDown(9)
    let text = getCurrentLine(te)
    expect(text).toEqual("")
    expect(suggestionsForPrefix(provider, te, "")).toEqual([
      "@computer",
      "+GarageSale",
      "@GroceryStore",
      "+LanguageTodotxt",
      "@phone"
    ])
  })

})
