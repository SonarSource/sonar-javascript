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
package org.sonar.javascript.checks;

import org.sonar.check.Rule;
import org.sonar.javascript.checks.annotations.JavaScriptRule;
import org.sonar.javascript.checks.utils.CheckUtils;
import org.sonar.javascript.tree.KindSet;
import org.sonar.plugins.javascript.api.tree.Tree;
import org.sonar.plugins.javascript.api.tree.Tree.Kind;
import org.sonar.plugins.javascript.api.tree.expression.YieldExpressionTree;
import org.sonar.plugins.javascript.api.visitors.DoubleDispatchVisitorCheck;

@JavaScriptRule
@Rule(key = "S3828")
public class YieldOutsideGeneratorCheck extends DoubleDispatchVisitorCheck {

  private static final String MESSAGE = "Remove this \"yield\" expression or move it into a generator.";

  @Override
  public void visitYieldExpression(YieldExpressionTree tree) {
    Tree firstFunctionAncestor = CheckUtils.getFirstAncestor(tree, KindSet.FUNCTION_KINDS);

    if (firstFunctionAncestor == null || !isGenerator(firstFunctionAncestor)) {
      addIssue(tree.yieldKeyword(), MESSAGE);
    }

    super.visitYieldExpression(tree);
  }

  private static boolean isGenerator(Tree tree) {
    return tree.is(Kind.GENERATOR_DECLARATION, Kind.GENERATOR_FUNCTION_EXPRESSION, Kind.GENERATOR_METHOD);
  }

}
