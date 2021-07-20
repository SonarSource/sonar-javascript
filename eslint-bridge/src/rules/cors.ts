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
// https://jira.sonarsource.com/browse/RSPEC-5122

import { Rule } from 'eslint';
import * as estree from 'estree';
import { toEncodedMessage } from 'eslint-plugin-sonarjs/lib/utils/locations';
import { getModuleNameOfNode, getUniqueWriteUsage, getObjectExpressionProperty } from '../utils';
import { isLiteral } from 'eslint-plugin-sonarjs/lib/utils/nodes';
import { TSESTree } from '@typescript-eslint/experimental-utils';

const MESSAGE = `Make sure that enabling CORS is safe here.`;

const CORS_HEADER = 'Access-Control-Allow-Origin';

export const rule: Rule.RuleModule = {
  meta: {
    schema: [
      {
        // internal parameter for rules having secondary locations
        enum: ['sonar-runtime'],
      },
    ],
  },
  create(context: Rule.RuleContext) {
    function report(node: estree.Node, ...secondaryLocations: estree.Node[]) {
      const message = toEncodedMessage(MESSAGE, secondaryLocations as TSESTree.Node[]);
      context.report({ message, node });
    }

    function isCorsCall(callee: estree.Node) {
      return getModuleNameOfNode(context, callee)?.value === 'cors';
    }

    return {
      CallExpression(node: estree.Node) {
        const call = node as estree.CallExpression;
        const { callee } = call;

        if (isCorsCall(callee)) {
          if (call.arguments.length === 0) {
            report(call);
            return;
          }
          const [arg] = call.arguments;
          let sensitiveCorsProperty = getSensitiveCorsProperty(arg);
          if (sensitiveCorsProperty) {
            report(sensitiveCorsProperty);
          }
          if (arg?.type === 'Identifier') {
            const usage = getUniqueWriteUsage(context, arg.name);
            sensitiveCorsProperty = getSensitiveCorsProperty(usage);
            if (sensitiveCorsProperty) {
              report(sensitiveCorsProperty, arg);
            }
          }
        }

        if (isSettingCorsHeader(call)) {
          report(call);
        }
      },

      ObjectExpression(node: estree.Node) {
        const objProperty = getObjectExpressionProperty(node, CORS_HEADER);
        if (objProperty && isAnyDomain(objProperty.value)) {
          report(objProperty);
        }
      },
    };
  },
};

function isCorsHeader(node: estree.Node) {
  const header = node as TSESTree.Node;
  return isLiteral(header) && header.value === CORS_HEADER;
}

function isAnyDomain(node: estree.Node) {
  const domain = node as TSESTree.Node;
  return isLiteral(domain) && domain.value === '*';
}

function getSensitiveCorsProperty(
  node: estree.Node | undefined | null,
): estree.Property | undefined {
  const originProperty = getObjectExpressionProperty(node, 'origin');
  if (originProperty && isAnyDomain(originProperty.value)) {
    return originProperty;
  }
  return undefined;
}

function isSettingCorsHeader(call: estree.CallExpression) {
  return isCorsHeader(call.arguments[0]) && isAnyDomain(call.arguments[1]);
}
