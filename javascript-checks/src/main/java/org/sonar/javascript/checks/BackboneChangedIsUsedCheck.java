/*
 * SonarQube JavaScript Plugin
 * Copyright (C) 2011-2016 SonarSource SA
 * mailto:contact AT sonarsource DOT com
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

import org.sonar.check.Priority;
import org.sonar.check.Rule;
import org.sonar.plugins.javascript.api.symbols.Type;
import org.sonar.plugins.javascript.api.tree.Tree;
import org.sonar.plugins.javascript.api.tree.expression.AssignmentExpressionTree;
import org.sonar.plugins.javascript.api.tree.expression.DotMemberExpressionTree;
import org.sonar.plugins.javascript.api.tree.expression.ExpressionTree;
import org.sonar.plugins.javascript.api.visitors.DoubleDispatchVisitorCheck;
import org.sonar.squidbridge.annotations.SqaleConstantRemediation;

@Rule(
  key = "S2549",
  name = "The \"changed\" property should not be manipulated directly",
  priority = Priority.CRITICAL,
  tags = {Tags.BACKBONE, Tags.BUG})
@SqaleConstantRemediation("30min")
public class BackboneChangedIsUsedCheck extends DoubleDispatchVisitorCheck {

  private static final String MESSAGE = "Remove this update of the \"changed\" property.";
  private static final String CHANGED = "changed";

  @Override
  public void visitAssignmentExpression(AssignmentExpressionTree tree) {
    ExpressionTree variable = tree.variable();
    if (variable.is(Tree.Kind.DOT_MEMBER_EXPRESSION) && isChangedPropertyAccess((DotMemberExpressionTree) variable)) {
      addIssue(((DotMemberExpressionTree) variable).property(), MESSAGE);
    }

    super.visitAssignmentExpression(tree);
  }

  private static boolean isChangedPropertyAccess(DotMemberExpressionTree tree) {
    return tree.property().name().equals(CHANGED) && tree.object().types().contains(Type.Kind.BACKBONE_MODEL_OBJECT);
  }

}
