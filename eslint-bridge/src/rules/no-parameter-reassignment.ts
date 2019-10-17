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
// https://jira.sonarsource.com/browse/RSPEC-1226

import { AST, Rule, Scope } from "eslint";
import * as estree from "estree";
import { resolveIdentifiers } from "./utils";
import { getParent } from "eslint-plugin-sonarjs/lib/utils/nodes";
import { TSESTree } from "@typescript-eslint/experimental-utils";

interface ReassignmentContext {
  type?: "catch" | "function" | "foreach";
  variablesToCheckInCurrentScope: Set<string>;
  variablesToCheck: Set<string>;
  variablesRead: Set<string>;
  referencesByIdentifier: Map<estree.Identifier, Scope.Reference>;
  parentContext?: ReassignmentContext;
}

export const rule: Rule.RuleModule = {
  create(context: Rule.RuleContext) {
    let variableUsageContext: ReassignmentContext = {
      variablesToCheckInCurrentScope: new Set<string>(),
      variablesToCheck: new Set<string>(),
      variablesRead: new Set<string>(),
      referencesByIdentifier: new Map<estree.Identifier, Scope.Reference>(),
    };
    const invalidReassignmentReferences: Scope.Reference[] = [];

    function checkIdentifierUsage(
      identifier: estree.Identifier,
      identifierContextType: "catch" | "function" | "foreach",
    ) {
      if (
        variableUsageContext.type !== identifierContextType ||
        !variableUsageContext.variablesToCheck.has(identifier.name)
      ) {
        return;
      }

      const currentReference = variableUsageContext.referencesByIdentifier.get(identifier);
      if (!!currentReference && !currentReference.init) {
        const variableName = identifier.name;
        if (
          variableUsageContext.variablesToCheck.has(variableName) &&
          !variableUsageContext.variablesRead.has(variableName) &&
          currentReference.isWriteOnly() &&
          !isUsedInWriteExpression(variableName, currentReference.writeExpr)
        ) {
          invalidReassignmentReferences.push(currentReference);
        }
        markAsRead(variableUsageContext, variableName);
      }
    }

    function isUsedInWriteExpression(variableName: string, writeExpr: estree.Node | null) {
      return (
        !!writeExpr &&
        !!context.getSourceCode().getFirstToken(writeExpr, token => token.value === variableName)
      );
    }

    function raiseIssue(reference: Scope.Reference) {
      let locationHolder: { node: estree.Node } | { loc: AST.SourceLocation } = {
        node: reference.identifier,
      };
      const location = getPreciseLocation(reference, reference.identifier.loc);
      if (!!location) {
        locationHolder = { loc: location };
      }
      context.report({
        message: `Introduce a new variable or use its initial value before reassigning "${
          reference.identifier.name
        }".`,
        ...locationHolder,
      });
    }

    return {
      onCodePathStart(_codePath: Rule.CodePath, node: estree.Node) {
        const currentScope = context.getSourceCode().scopeManager.acquire(node);
        if (!!currentScope && currentScope.type === "function") {
          let {
            referencesByIdentifier,
            variablesToCheck,
            variablesToCheckInCurrentScope,
          } = computeNewContextInfo(variableUsageContext, context, node);

          const functionName = getFunctionName(node as estree.FunctionExpression);
          if (!!functionName) {
            variablesToCheck.delete(functionName);
          }

          variableUsageContext = {
            type: "function",
            parentContext: variableUsageContext,
            variablesToCheck,
            referencesByIdentifier,
            variablesToCheckInCurrentScope,
            variablesRead: new Set<string>(),
          };
        } else {
          variableUsageContext = {
            parentContext: variableUsageContext,
            variablesToCheckInCurrentScope: new Set<string>(),
            variablesToCheck: new Set<string>(),
            variablesRead: new Set<string>(),
            referencesByIdentifier: new Map<estree.Identifier, Scope.Reference>(),
          };
        }
      },
      onCodePathEnd() {
        variableUsageContext = !variableUsageContext.parentContext
          ? variableUsageContext
          : variableUsageContext.parentContext;
      },

      onCodePathSegmentLoop(
        _fromSegment: Rule.CodePathSegment,
        _toSegment: Rule.CodePathSegment,
        node: estree.Node,
      ) {
        const parent = getParent(context);
        if (!isForEachLoopStart(node, parent)) {
          return;
        }
        const currentScope = context.getSourceCode().scopeManager.acquire(parent.body);
        let {
          referencesByIdentifier,
          variablesToCheck,
          variablesToCheckInCurrentScope,
        } = computeNewContextInfo(variableUsageContext, context, parent.left);

        if (!!currentScope) {
          referencesByIdentifier = currentScope.references.reduce(
            (currentMap, currentRef) => currentMap.set(currentRef.identifier, currentRef),
            referencesByIdentifier,
          );
        }

        // In case of array or object pattern expression, the left hand side are not declared variables but simply identifiers
        resolveIdentifiers(parent.left as TSESTree.Node, true)
          .map(identifier => identifier.name)
          .forEach(name => {
            variablesToCheck.add(name);
            variablesToCheckInCurrentScope.add(name);
          });

        variableUsageContext = {
          type: "foreach",
          parentContext: variableUsageContext,
          variablesToCheckInCurrentScope,
          variablesToCheck,
          variablesRead: new Set<string>(),
          referencesByIdentifier,
        };
      },
      onCodePathSegmentStart(_segment: Rule.CodePathSegment, node: estree.Node) {
        if (node.type !== "CatchClause") {
          return;
        }

        const {
          referencesByIdentifier,
          variablesToCheck,
          variablesToCheckInCurrentScope,
        } = computeNewContextInfo(variableUsageContext, context, node);

        variableUsageContext = {
          type: "catch",
          parentContext: variableUsageContext,
          variablesToCheckInCurrentScope,
          variablesToCheck,
          variablesRead: new Set<string>(),
          referencesByIdentifier,
        };
      },
      onCodePathSegmentEnd(_segment: Rule.CodePathSegment, node: estree.Node) {
        if (
          node.type === "CatchClause" ||
          node.type === "ForInStatement" ||
          node.type === "ForOfStatement"
        ) {
          variableUsageContext = !variableUsageContext.parentContext
            ? variableUsageContext
            : variableUsageContext.parentContext;
        }
      },

      "*:function > BlockStatement Identifier": (node: estree.Node) =>
        checkIdentifierUsage(node as estree.Identifier, "function"),
      "ForInStatement > *:statement Identifier": (node: estree.Node) =>
        checkIdentifierUsage(node as estree.Identifier, "foreach"),
      "ForOfStatement > *:statement Identifier": (node: estree.Node) =>
        checkIdentifierUsage(node as estree.Identifier, "foreach"),
      "CatchClause > BlockStatement Identifier": (node: estree.Node) =>
        checkIdentifierUsage(node as estree.Identifier, "catch"),
      "Program:exit": () =>
        invalidReassignmentReferences.forEach(reference => raiseIssue(reference)),
    };
  },
};

function getFunctionName(node: estree.FunctionExpression) {
  return !node.id ? null : node.id.name;
}

function isForEachLoopStart(
  node: estree.Node,
  parent?: estree.Node,
): parent is estree.ForInStatement | estree.ForOfStatement {
  return (
    node.type === "BlockStatement" &&
    !!parent &&
    (parent.type === "ForInStatement" || parent.type === "ForOfStatement")
  );
}

function computeNewContextInfo(
  variableUsageContext: ReassignmentContext,
  context: Rule.RuleContext,
  node: estree.Node,
) {
  let referencesByIdentifier = new Map<estree.Identifier, Scope.Reference>();
  const variablesToCheck = new Set<string>(variableUsageContext.variablesToCheck);
  const variablesToCheckInCurrentScope = new Set<string>();
  context.getDeclaredVariables(node).forEach(variable => {
    variablesToCheck.add(variable.name);
    variablesToCheckInCurrentScope.add(variable.name);
    referencesByIdentifier = variable.references.reduce(
      (currentMap, currentRef) => currentMap.set(currentRef.identifier, currentRef),
      referencesByIdentifier,
    );
  });
  return { referencesByIdentifier, variablesToCheck, variablesToCheckInCurrentScope };
}

function markAsRead(context: ReassignmentContext, variableName: string) {
  context.variablesRead.add(variableName);
  if (!context.variablesToCheckInCurrentScope.has(variableName) && !!context.parentContext) {
    markAsRead(context.parentContext, variableName);
  }
}

function getPreciseLocation(
  reference: Scope.Reference,
  identifierLoc?: estree.SourceLocation | null,
) {
  if (!!identifierLoc && !!reference.writeExpr && !!reference.writeExpr.loc) {
    return { start: identifierLoc.start, end: reference.writeExpr.loc.end };
  }
  return identifierLoc;
}
