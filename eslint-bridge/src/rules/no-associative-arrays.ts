/*
 * SonarQube JavaScript Plugin
 * Copyright (C) 2011-2020 SonarSource SA
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
// https://jira.sonarsource.com/browse/RSPEC-4619

import { Rule } from 'eslint';
import * as estree from 'estree';
import { isRequiredParserServices } from '../utils/isRequiredParserServices';
import { TSESTree } from '@typescript-eslint/experimental-utils';
import * as ts from 'typescript';

const message = `Make it an object if it must have named properties; otherwise, use a numeric index here.`;

export const rule: Rule.RuleModule = {
  create(context: Rule.RuleContext) {
    const services = context.parserServices;

    if (!isRequiredParserServices(services)) {
      return {};
    }

    const checker = services.program.getTypeChecker();

    function isArray(node: estree.Node) {
      const typ = checker.getTypeAtLocation(
        services.esTreeNodeToTSNodeMap.get(node as TSESTree.Node),
      );
      return typ.symbol && typ.symbol.name === 'Array';
    }

    function isString(node: estree.Node) {
      const typ = checker.getTypeAtLocation(
        services.esTreeNodeToTSNodeMap.get(node as TSESTree.Node),
      );
      return (typ.getFlags() & ts.TypeFlags.StringLike) !== 0;
    }

    return {
      'AssignmentExpression[left.type="MemberExpression"]'(node: estree.Node) {
        const memberExpr = (node as estree.AssignmentExpression).left as estree.MemberExpression;
        if (isString(memberExpr.property) && isArray(memberExpr.object)) {
          context.report({
            message,
            node,
          });
        }
      },
    };
  },
};
