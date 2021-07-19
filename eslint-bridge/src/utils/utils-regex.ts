/*
 * SonarQube JavaScript Plugin
 * Copyright (C) 2011-2021 SonarSource SA
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

import { AST, Rule } from 'eslint';
import * as estree from 'estree';
import * as regexpp from 'regexpp';
import type { RegExpVisitor } from 'regexpp/visitor';
import { getRegexpLocation } from './utils-location-regex';

const regExpParser = new regexpp.RegExpParser();

export function createRegExpRule(
  handlers: (
    context: Rule.RuleContext,
    location: (regexpNode: regexpp.AST.Node) => AST.SourceLocation,
  ) => RegExpVisitor.Handlers,
  meta?: Rule.RuleMetaData,
): Rule.RuleModule {
  return {
    ...meta,
    create(context: Rule.RuleContext) {
      function checkRegex(node: estree.Node, pattern: string, flags: string) {
        let regExpAST: regexpp.AST.Node;
        try {
          regExpAST = regExpParser.parsePattern(pattern, 0, pattern.length, flags.includes('u'));
        } catch {
          // Ignore regular expressions with syntax errors
          return;
        }
        const location = (regexpNode: regexpp.AST.Node) =>
          getRegexpLocation(context.getSourceCode(), node, regexpNode);
        regexpp.visitRegExpAST(regExpAST, handlers(context, location));
      }

      function checkLiteral(literal: estree.Literal) {
        if (!(literal.value instanceof RegExp)) {
          return;
        }
        const {
          regex: { pattern, flags },
        } = literal as estree.RegExpLiteral;
        checkRegex(literal, pattern, flags);
      }

      function checkCallExpression(callExpr: estree.CallExpression) {
        if (!isRegExpConstructor(callExpr)) {
          return;
        }
        const pattern = getPattern(callExpr);
        const flags = getFlags(callExpr);
        if (pattern !== null && flags !== null) {
          checkRegex(callExpr.arguments[0], pattern, flags);
        }
      }

      return {
        Literal: checkLiteral,
        NewExpression: checkCallExpression,
        CallExpression: checkCallExpression,
      };
    },
  };
}

function isRegExpConstructor(callExpr: estree.CallExpression) {
  return callExpr.callee.type === 'Identifier' && callExpr.callee.name === 'RegExp';
}

function getPattern(callExpr: estree.CallExpression): string | null {
  if (callExpr.arguments.length > 0) {
    const pattern = callExpr.arguments[0];
    if (pattern.type === 'Literal' && typeof pattern.value === 'string') {
      return pattern.value;
    }
  }
  return null;
}

function getFlags(callExpr: estree.CallExpression): string | null {
  if (callExpr.arguments.length < 2) {
    return '';
  }
  const flags = callExpr.arguments[1];
  if (flags.type === 'Literal' && typeof flags.value === 'string') {
    return flags.value;
  }
  return null;
}
