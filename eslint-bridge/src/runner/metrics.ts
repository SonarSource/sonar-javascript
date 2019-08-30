/*
 * SonarQube JavaScript Plugin
 * Copyright (C) 2011-2019 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
import { SourceCode } from "eslint";
import * as estree from "estree";
import visit from "../utils/visitor";

const EXECUTABLE_NODES = [
  "ExpressionStatement",
  "IfStatement",
  "LabeledStatement",
  "BreakStatement",
  "ContinueStatement",
  "WithStatement",
  "SwitchStatement",
  "ReturnStatement",
  "ThrowStatement",
  "TryStatement",
  "WhileStatement",
  "DoWhileStatement",
  "ForStatement",
  "ForInStatement",
  "DebuggerStatement",
  "VariableDeclaration",
  "ForOfStatement",
];

const STATEMENT_NODES = [
  "ExpressionStatement",
  "IfStatement",
  "LabeledStatement",
  "BreakStatement",
  "ContinueStatement",
  "WithStatement",
  "SwitchStatement",
  "ReturnStatement",
  "ThrowStatement",
  "TryStatement",
  "WhileStatement",
  "DoWhileStatement",
  "ForStatement",
  "ForInStatement",
  "DebuggerStatement",
  "FunctionDeclaration",
  "VariableDeclaration",
  "ForOfStatement",
  "ClassDeclaration",
];

const FUNCTION_NODES = ["FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression"];

const CLASS_NODES = ["ClassDeclaration", "ClassExpression"];

export default function getMetrics(sourceCode: SourceCode): Metrics {
  return {
    ncloc: findLinesOfCode(sourceCode),
    ...findCommentLines(sourceCode),
    executableLines: findExecutableLines(sourceCode),
    functions: countFunctions(sourceCode),
    statements: countStatements(sourceCode),
    classes: countClasses(sourceCode),
  };
}

export interface Metrics {
  ncloc: number[];
  commentLines: number[];
  nosonarLines: number[];
  executableLines: number[];
  functions: number;
  statements: number;
  classes: number;
}

export const EMPTY_METRICS: Metrics = {
  ncloc: [],
  commentLines: [],
  nosonarLines: [],
  executableLines: [],
  functions: 0,
  statements: 0,
  classes: 0,
};

export function findLinesOfCode(sourceCode: SourceCode): number[] {
  const lines: Set<number> = new Set();
  const tokens = sourceCode.ast.tokens;
  for (const token of tokens) {
    addLines(token.loc.start.line, token.loc.end.line, lines);
  }
  return Array.from(lines).sort((a, b) => a - b);
}

export function findCommentLines(
  sourceCode: SourceCode,
): { commentLines: number[]; nosonarLines: number[] } {
  const commentLines: Set<number> = new Set();
  const nosonarLines: Set<number> = new Set();
  const firstToken = sourceCode.getFirstToken(sourceCode.ast);
  if (firstToken) {
    // ignore header comments -> comments before first token
    const header = sourceCode.getCommentsBefore(firstToken);
    const comments = sourceCode.ast.comments.slice(header.length);
    for (const comment of comments) {
      if (comment.loc) {
        if (
          comment.value
            .trim()
            .toUpperCase()
            .startsWith("NOSONAR")
        ) {
          addLines(comment.loc.start.line, comment.loc.end.line, nosonarLines);
        }
        addLines(comment.loc.start.line, comment.loc.end.line, commentLines);
      }
    }
  }
  return {
    commentLines: Array.from(commentLines).sort((a, b) => a - b),
    nosonarLines: Array.from(nosonarLines).sort((a, b) => a - b),
  };
}

export function findExecutableLines(sourceCode: SourceCode): number[] {
  const lines: Set<number> = new Set();
  visit(sourceCode.ast, node => {
    if (EXECUTABLE_NODES.includes(node.type) && node.loc) {
      lines.add(node.loc.start.line);
    }
  });
  return Array.from(lines).sort((a, b) => a - b);
}

export function countFunctions(sourceCode: SourceCode): number {
  return visitAndCountIf(sourceCode.ast, node => FUNCTION_NODES.includes(node.type));
}

export function countStatements(sourceCode: SourceCode): number {
  return visitAndCountIf(sourceCode.ast, node => STATEMENT_NODES.includes(node.type));
}

export function countClasses(sourceCode: SourceCode): number {
  return visitAndCountIf(sourceCode.ast, node => CLASS_NODES.includes(node.type));
}

function visitAndCountIf(root: estree.Node, condition: (node: estree.Node) => boolean): number {
  let results = 0;
  visit(root, node => {
    if (condition(node)) {
      results++;
    }
  });
  return results;
}

function addLines(startLine: number, endLine: number, lines: Set<number>) {
  for (let line = startLine; line <= endLine; line++) {
    lines.add(line);
  }
}