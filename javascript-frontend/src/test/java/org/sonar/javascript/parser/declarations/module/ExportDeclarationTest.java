/*
 * SonarQube JavaScript Plugin
 * Copyright (C) 2011 SonarSource and Eriks Nukis
 * sonarqube@googlegroups.com
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
 * You should have received a copy of the GNU Lesser General Public
 * License along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02
 */
package org.sonar.javascript.parser.declarations.module;

import org.junit.Test;
import org.sonar.javascript.parser.JavaScriptLegacyGrammar;

import static org.sonar.javascript.utils.Assertions.assertThat;

public class ExportDeclarationTest {


  @Test
  public void ok() {
    assertThat(JavaScriptLegacyGrammar.EXPORT_DECLARATION)
      // Namespace export
      .matches("export * from \"f\" ;")

      // Named export
      .matches("export { } ;")
      .matches("export var a;")
      .matches("export class C {}")

      // Default export
      .matches("export default function f() {}")
      .matches("export default function * f() {}")
      .matches("export default class C {}")
      .matches("export default {}")
      .matches("export default expression ;");
  }

}
