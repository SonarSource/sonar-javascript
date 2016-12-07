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
package org.sonar.javascript.se.builtins;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import java.util.List;
import java.util.Map;
import org.sonar.javascript.se.Constraint;
import org.sonar.javascript.se.Type;
import org.sonar.javascript.se.sv.SymbolicValue;

import static org.sonar.javascript.se.Type.EMPTY;
import static org.sonar.javascript.se.Type.TO_LOCALE_STRING_SIGNATURE;

public class DateBuiltInProperties extends BuiltInProperties {

  @Override
  Map<String, SymbolicValue> getMethods() {
    List<Constraint> threeNumbers = ImmutableList.of(Constraint.ANY_NUMBER, Constraint.ANY_NUMBER, Constraint.ANY_NUMBER);
    List<Constraint> fourNumbers = ImmutableList.of(Constraint.ANY_NUMBER, Constraint.ANY_NUMBER, Constraint.ANY_NUMBER, Constraint.ANY_NUMBER);

    return ImmutableMap.<String, SymbolicValue>builder()
      .put("getDate", method(Constraint.TRUTHY_NUMBER_PRIMITIVE, EMPTY))
      .put("getDay", method(Constraint.NUMBER_PRIMITIVE, EMPTY))
      .put("getFullYear", method(Constraint.NUMBER_PRIMITIVE, EMPTY))
      .put("getHours", method(Constraint.NUMBER_PRIMITIVE, EMPTY))
      .put("getMilliseconds", method(Constraint.NUMBER_PRIMITIVE, EMPTY))
      .put("getMinutes", method(Constraint.NUMBER_PRIMITIVE, EMPTY))
      .put("getMonth", method(Constraint.NUMBER_PRIMITIVE, EMPTY))
      .put("getSeconds", method(Constraint.NUMBER_PRIMITIVE, EMPTY))
      .put("getTime", method(Constraint.NUMBER_PRIMITIVE, EMPTY))
      .put("getTimezoneOffset", method(Constraint.NUMBER_PRIMITIVE, EMPTY))
      .put("getUTCDate", method(Constraint.TRUTHY_NUMBER_PRIMITIVE, EMPTY))
      .put("getUTCDay", method(Constraint.NUMBER_PRIMITIVE, EMPTY))
      .put("getUTCFullYear", method(Constraint.NUMBER_PRIMITIVE, EMPTY))
      .put("getUTCHours", method(Constraint.NUMBER_PRIMITIVE, EMPTY))
      .put("getUTCMilliseconds", method(Constraint.NUMBER_PRIMITIVE, EMPTY))
      .put("getUTCMinutes", method(Constraint.NUMBER_PRIMITIVE, EMPTY))
      .put("getUTCMonth", method(Constraint.NUMBER_PRIMITIVE, EMPTY))
      .put("getUTCSeconds", method(Constraint.NUMBER_PRIMITIVE, EMPTY))
      .put("getYear", method(Constraint.NUMBER_PRIMITIVE, EMPTY))

      .put("setDate", method(Constraint.NUMBER_PRIMITIVE, Type.ONE_NUMBER))
      .put("setFullYear", method(Constraint.NUMBER_PRIMITIVE, threeNumbers))
      .put("setHours", method(Constraint.NUMBER_PRIMITIVE, fourNumbers))
      .put("setMilliseconds", method(Constraint.NUMBER_PRIMITIVE, Type.ONE_NUMBER))
      .put("setMinutes", method(Constraint.NUMBER_PRIMITIVE, threeNumbers))
      .put("setMonth", method(Constraint.NUMBER_PRIMITIVE, Type.NUMBER_NUMBER))
      .put("setSeconds", method(Constraint.NUMBER_PRIMITIVE, Type.NUMBER_NUMBER))
      .put("setTime", method(Constraint.NUMBER_PRIMITIVE, Type.ONE_NUMBER))
      .put("setUTCDate", method(Constraint.NUMBER_PRIMITIVE, Type.ONE_NUMBER))
      .put("setUTCFullYear", method(Constraint.NUMBER_PRIMITIVE, threeNumbers))
      .put("setUTCHours", method(Constraint.NUMBER_PRIMITIVE, fourNumbers))
      .put("setUTCMilliseconds", method(Constraint.NUMBER_PRIMITIVE, Type.ONE_NUMBER))
      .put("setUTCMinutes", method(Constraint.NUMBER_PRIMITIVE, threeNumbers))
      .put("setUTCMonth", method(Constraint.NUMBER_PRIMITIVE, Type.NUMBER_NUMBER))
      .put("setUTCSeconds", method(Constraint.NUMBER_PRIMITIVE, Type.NUMBER_NUMBER))
      .put("setYear", method(Constraint.NUMBER_PRIMITIVE, Type.ONE_NUMBER))

      .put("toDateString", method(Constraint.TRUTHY_STRING_PRIMITIVE, EMPTY))
      .put("toISOString", method(Constraint.TRUTHY_STRING_PRIMITIVE, EMPTY))
      .put("toJSON", method(Constraint.TRUTHY_STRING_PRIMITIVE, EMPTY))
      .put("toGMTString", method(Constraint.TRUTHY_STRING_PRIMITIVE, EMPTY))
      .put("toLocaleDateString", method(Constraint.TRUTHY_STRING_PRIMITIVE, TO_LOCALE_STRING_SIGNATURE))
      .put("toLocaleTimeString", method(Constraint.TRUTHY_STRING_PRIMITIVE, TO_LOCALE_STRING_SIGNATURE))
      .put("toTimeString", method(Constraint.TRUTHY_STRING_PRIMITIVE, EMPTY))
      .put("toUTCString", method(Constraint.TRUTHY_STRING_PRIMITIVE, EMPTY))

      // overrides Object
      .put("toString", method(Constraint.TRUTHY_STRING_PRIMITIVE, EMPTY))
      .put("toLocaleString", method(Constraint.TRUTHY_STRING_PRIMITIVE, TO_LOCALE_STRING_SIGNATURE))
      .put("valueOf", method(Constraint.NUMBER_PRIMITIVE, EMPTY))
      .build();
  }

  @Override
  Map<String, Constraint> getPropertiesConstraints() {
    return ImmutableMap.of();
  }


  @Override
  Map<String, Constraint> getOwnPropertiesConstraints() {
    return ImmutableMap.of();
  }

  @Override
  Map<String, SymbolicValue> getOwnMethods() {
    return ImmutableMap.<String, SymbolicValue>builder()
      .put("now", method(Constraint.NUMBER_PRIMITIVE, Type.EMPTY))
      .put("parse", method(Constraint.NUMBER_PRIMITIVE, Type.ONE_STRING))
      .put("UTC", method(Constraint.NUMBER_PRIMITIVE, (int index) -> {
        if (index < 6) {
          return Constraint.ANY_NUMBER;
        }
        return null;
      }))
      .build();
  }
}
