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
package org.sonar.javascript.checks;

import java.util.Collections;
import java.util.List;
import org.sonar.check.Rule;
import org.sonar.check.RuleProperty;
import org.sonar.javascript.checks.annotations.JavaScriptRule;
import org.sonar.javascript.checks.annotations.TypeScriptRule;
import org.sonarsource.analyzer.commons.annotations.DeprecatedRuleKey;

@JavaScriptRule
@TypeScriptRule
@DeprecatedRuleKey(ruleKey = "ExcessiveParameterList")
@Rule(key = "S107")
public class MaxParameterCheck extends EslintBasedCheck {

  private static final int DEFAULT_MAXIMUM_FUNCTION_PARAMETERS = 7;

  @RuleProperty(
    key = "maximumFunctionParameters",
    description = "The maximum authorized number of parameters",
    defaultValue = "" + DEFAULT_MAXIMUM_FUNCTION_PARAMETERS)
  int maximumFunctionParameters = DEFAULT_MAXIMUM_FUNCTION_PARAMETERS;

  @Override
  public List<Object> configurations() {
    return Collections.singletonList(maximumFunctionParameters);
  }

  @Override
  public String eslintKey() {
    return "max-params";
  }
}
