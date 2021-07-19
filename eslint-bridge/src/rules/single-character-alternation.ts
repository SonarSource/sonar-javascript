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
// https://sonarsource.github.io/rspec/#/rspec/S6035

import { Rule } from 'eslint';
import { Assertion, CapturingGroup, Group, LookaroundAssertion, Pattern } from 'regexpp/ast';
import { createRegExpRule } from '../utils';

type Alternation = Pattern | CapturingGroup | Group | LookaroundAssertion;

export const rule: Rule.RuleModule = createRegExpRule((context, location) => {
  function checkAlternation(alternation: Alternation) {
    if (
      alternation.alternatives.every(
        alt => alt.elements.length === 1 && alt.elements[0].type === 'Character',
      )
    ) {
      context.report({
        message: 'Replace this alternation with a character class.',
        loc: location(alternation),
      });
    }
  }
  return {
    onPatternEnter: checkAlternation,
    onGroupEnter: checkAlternation,
    onCapturingGroupEnter: checkAlternation,
    onAssertionEnter(node: Assertion) {
      if (node.kind === 'lookahead' || node.kind === 'lookbehind') {
        checkAlternation(node as LookaroundAssertion)
      }
    }
  };
});
