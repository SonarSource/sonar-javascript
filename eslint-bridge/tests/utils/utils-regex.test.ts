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

import { Rule, RuleTester } from 'eslint';
import { Character } from 'regexpp/ast';
import { createRegExpRule } from '../../src/utils';

const rule: Rule.RuleModule = createRegExpRule((context, location) => {
  return {
    onCharacterEnter(character: Character) {
      if (character.value === 'a'.charCodeAt(0)) {
        context.report({
          message: `Found character 'a'.`,
          loc: location(character),
        });
      }
    },
  };
});

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2018, sourceType: 'module' } });
ruleTester.run('Template for regular expressions rules', rule, {
  valid: [
    {
      code: `const str = 'abc123';`,
    },
    {
      code: `const re = RegExpression();`,
    },
    {
      code: `const re = RegExp();`,
    },
    {
      code: `const re = new RegExp();`,
    },
    {
      code: `const re = new RegExp(pattern);`,
    },
    {
      code: `const re = new RegExp(pattern, flags);`,
    },
    {
      code: `const re = /z/;`,
    },
    {
      code: `const re = new RegExp('z');`,
    },
    {
      code: `const re = new RegExp('[malformed');`,
    },
  ],
  invalid: [
    {
      code: `const re = /a/u;`,
      errors: [
        {
          message: `Found character 'a'.`,
          line: 1,
          column: 13,
          endLine: 1,
          endColumn: 14,
        },
      ],
    },
    {
      code: `const re = RegExp('a');`,
      errors: [
        {
          message: `Found character 'a'.`,
          line: 1,
          column: 20,
          endLine: 1,
          endColumn: 21,
        },
      ],
    },
    {
      code: `const re = new RegExp('a');`,
      errors: [
        {
          message: `Found character 'a'.`,
          line: 1,
          column: 24,
          endLine: 1,
          endColumn: 25,
        },
      ],
    },
    {
      code: `const re = new RegExp('\u0061', 'u');`,
      errors: [
        {
          message: `Found character 'a'.`,
          line: 1,
          column: 24,
          endLine: 1,
          endColumn: 25,
        },
      ],
    },
  ],
});
