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
package org.sonar.javascript.tree.impl.expression;

import com.google.common.collect.Iterators;
import java.util.Iterator;
import java.util.List;
import javax.annotation.Nullable;
import org.sonar.javascript.tree.impl.declaration.FunctionTreeImpl;
import org.sonar.javascript.tree.symbols.type.FunctionType;
import org.sonar.javascript.tree.symbols.type.TypableTree;
import org.sonar.plugins.javascript.api.symbols.Type;
import org.sonar.plugins.javascript.api.symbols.TypeSet;
import org.sonar.plugins.javascript.api.tree.Tree;
import org.sonar.plugins.javascript.api.tree.declaration.BindingElementTree;
import org.sonar.plugins.javascript.api.tree.declaration.ParameterListTree;
import org.sonar.plugins.javascript.api.tree.expression.FunctionExpressionTree;
import org.sonar.plugins.javascript.api.tree.expression.IdentifierTree;
import org.sonar.plugins.javascript.api.tree.flow.FlowGenericParameterClauseTree;
import org.sonar.plugins.javascript.api.tree.flow.FlowTypeAnnotationTree;
import org.sonar.plugins.javascript.api.tree.lexical.SyntaxToken;
import org.sonar.plugins.javascript.api.tree.statement.BlockTree;
import org.sonar.plugins.javascript.api.visitors.DoubleDispatchVisitor;

public class FunctionExpressionTreeImpl extends FunctionTreeImpl implements FunctionExpressionTree, TypableTree {

  private final SyntaxToken asyncToken;
  private final SyntaxToken functionKeyword;
  private final SyntaxToken star;
  private final IdentifierTree name;
  private final FlowGenericParameterClauseTree genericParameterClause;
  private final ParameterListTree parameters;
  private final FlowTypeAnnotationTree returnType;
  private final BlockTree body;
  private final Kind kind;
  private Type functionType;

  private FunctionExpressionTreeImpl(
    @Nullable SyntaxToken asyncToken,
    SyntaxToken functionKeyword,
    @Nullable SyntaxToken star, IdentifierTree name,
    @Nullable FlowGenericParameterClauseTree genericParameterClause,
    ParameterListTree parameters, @Nullable FlowTypeAnnotationTree returnType, BlockTree body) {
    this.asyncToken = asyncToken;
    this.functionKeyword = functionKeyword;
    this.star = star;
    this.name = name;
    this.genericParameterClause = genericParameterClause;
    this.parameters = parameters;
    this.returnType = returnType;
    this.body = body;
    this.kind = star == null ? Kind.FUNCTION_EXPRESSION : Kind.GENERATOR_FUNCTION_EXPRESSION;

    this.functionType = FunctionType.create(this);
  }

  public static FunctionExpressionTree createGenerator(
    SyntaxToken functionKeyword, SyntaxToken star, @Nullable IdentifierTree name, @Nullable FlowGenericParameterClauseTree genericParameterClause,
    ParameterListTree parameters, @Nullable FlowTypeAnnotationTree returnType, BlockTree body
  ) {
    return new FunctionExpressionTreeImpl(null, functionKeyword, star, name, genericParameterClause, parameters, returnType, body);
  }

  public static FunctionExpressionTree create(
    @Nullable SyntaxToken asyncToken, SyntaxToken functionToken, @Nullable IdentifierTree name,
    @Nullable FlowGenericParameterClauseTree genericParameterClause,
    ParameterListTree parameters, @Nullable FlowTypeAnnotationTree returnType, BlockTree body
  ) {
    return new FunctionExpressionTreeImpl(asyncToken, functionToken, null, name, genericParameterClause, parameters, returnType, body);
  }

  @Override
  public SyntaxToken functionKeyword() {
    return functionKeyword;
  }

  @Nullable
  @Override
  public SyntaxToken starToken() {
    return star;
  }

  @Nullable
  @Override
  public IdentifierTree name() {
    return name;
  }

  @Nullable
  @Override
  public FlowGenericParameterClauseTree genericParameterClause() {
    return genericParameterClause;
  }

  @Nullable
  @Override
  public SyntaxToken asyncToken() {
    return asyncToken;
  }

  @Override
  public ParameterListTree parameterClause() {
    return parameters;
  }

  @Nullable
  @Override
  public FlowTypeAnnotationTree returnType() {
    return returnType;
  }

  @Override
  public Kind getKind() {
    return kind;
  }

  @Override
  public BlockTree body() {
    return body;
  }

  @Override
  public List<BindingElementTree> parameterList() {
    return parameters.parameters();
  }

  @Override
  public Iterator<Tree> childrenIterator() {
    return Iterators.forArray(asyncToken, functionKeyword, star, name, genericParameterClause, parameters, returnType, body);
  }

  @Override
  public void accept(DoubleDispatchVisitor visitor) {
    visitor.visitFunctionExpression(this);
  }

  @Override
  public TypeSet types() {
    TypeSet set = TypeSet.emptyTypeSet();
    set.add(functionType);
    return set;
  }

  @Override
  public void add(Type type) {
    throw new UnsupportedOperationException();
  }
}
