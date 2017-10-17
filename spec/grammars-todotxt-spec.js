// main-spec.js -- Test the main module for the project
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

describe("todo.txt grammar", () => {

    let grammar = null;

    beforeEach(() => {
      waitsForPromise(() => {
        return atom.packages.activatePackage("language-todotxt")
      });
      runs(() => {
        grammar = atom.grammars.grammarForScopeName("text.todotxt");
      });
    });

    it("parses the grammar", () => {
      expect(grammar).toBeTruthy();
      expect(grammar.scopeName).toBe("text.todotxt");
    });

    it("selects the grammar for todo.txt files", () => {
      waitsForPromise(() => {
        return atom.workspace.open("todo.txt");
      });

      runs(() => {
        expect(atom.workspace.getActiveTextEditor().getGrammar()).toBe(grammar);
      });
    });

    it("does not select the grammar for done.txt files", () => {
      waitsForPromise(() => {
        return atom.workspace.open("done.txt");
      });

      runs(() => {
        expect(atom.workspace.getActiveTextEditor().getGrammar()).not.toBe(grammar);
      });
    });

    it("does not select the grammar for other text files", () => {
      waitsForPromise(() => {
        return atom.workspace.open("other.txt");
      });

      runs(() => {
        expect(atom.workspace.getActiveTextEditor().getGrammar()).not.toBe(grammar);
      });
    });

    it("correctly matches contexts at end of line", () => {
      let {tokens} = grammar.tokenizeLine("(A) Thank Mom for the meatballs @phone");
      let matches = tokens.filter((token) => { return token.value == "@phone"; });
      expect(matches.length).toEqual(1);
      expect(matches[0].scopes).toEqual(["text.todotxt", "entity.name.tag.todotxt.context"]);
    });

    it("correctly matches contexts mid-line", () => {
      let {tokens} = grammar.tokenizeLine("(A) Call Mom +Family +PeaceLoveAndHappiness @iphone @phone");
      let matches = tokens.filter((token) => { return token.value == "@iphone"; });
      expect(matches.length).toEqual(1);
      expect(matches[0].scopes).toEqual(["text.todotxt", "entity.name.tag.todotxt.context"]);
    });

    it("does not overmatch email addresses as contexts", () => {
      let {tokens} = grammar.tokenizeLine("Email user@example.com");
      let matches = tokens.filter((token) => { return token.value == "@example.com"; });
      expect(matches.length).toEqual(0);
    });

    it("does not overmatch isolated at symbol as context", () => {
      let {tokens} = grammar.tokenizeLine("2014-09-12 celebrate the @ symbol");
      let matches = tokens.filter((token) => { return token.value == "@"; });
      expect(matches.length).toEqual(0);
    });

    it("correctly matches projects at end of line", () => {
      let {tokens} = grammar.tokenizeLine("Post signs around the neighborhood +GarageSale");
      let matches = tokens.filter((token) => { return token.value == "+GarageSale"; });
      expect(matches.length).toEqual(1);
      expect(matches[0].scopes).toEqual(["text.todotxt", "entity.name.tag.todotxt.project"]);
    });

    it("correctly matches projects mid-line", () => {
      let {tokens} = grammar.tokenizeLine("(A) Call Mom +Family +PeaceLoveAndHappiness @iphone @phone");
      let matches = tokens.filter((token) => { return token.value == "+Family"; });
      expect(matches.length).toEqual(1);
      expect(matches[0].scopes).toEqual(["text.todotxt", "entity.name.tag.todotxt.project"]);
    });

    it("does not overmatch Google+ as a project", () => {
      let {tokens} = grammar.tokenizeLine("(B) 2017-06-17 set up Google+ +HG");
      let matches = tokens.filter((token) => { return token.value == "+"; });
      expect(matches.length).toEqual(0);
    });

    it("does not overmatch addition as a project", () => {
      let {tokens} = grammar.tokenizeLine("Learn how to add 2+2");
      let matches = tokens.filter((token) => { return token.value == "+2"; });
      expect(matches.length).toEqual(0);
    });
});
