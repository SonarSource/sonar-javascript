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

import com.google.gson.Gson;
import org.junit.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class OpenCurlyBracesAtEOLCheckTest {

  @Test
  public void test_configuration() {
    OpenCurlyBracesAtEOLCheck check = new OpenCurlyBracesAtEOLCheck();
    String defaultConfigAsString = new Gson().toJson(check.configurations());
    assertThat(defaultConfigAsString).isEqualTo("[\"1tbs\",{\"allowSingleLine\":true}]");
    check.braceStyle = "stroustrup";
    String stroustrupConfigAsString = new Gson().toJson(check.configurations());
    assertThat(stroustrupConfigAsString).isEqualTo("[\"stroustrup\",{\"allowSingleLine\":true}]");
  }

}
