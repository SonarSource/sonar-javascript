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
package org.sonar.plugins.javascript.eslint;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Predicate;
import org.sonar.api.batch.fs.InputFile;
import org.sonar.api.utils.log.Logger;
import org.sonar.api.utils.log.Loggers;

class TsConfigFile implements Predicate<InputFile> {
  private static final Logger LOG = Loggers.get(TsConfigFile.class);

  static final String UNMATCHED_CONFIG = "NO_CONFIG";

  final String filename;
  final List<String> files;

  TsConfigFile(String filename, List<String> files) {
    this.filename = filename;
    this.files = files;
  }

  @Override
  public boolean test(InputFile inputFile) {
    return files.contains(inputFile.absolutePath());
  }

  static Map<String, List<InputFile>> inputFilesByTsConfig(List<TsConfigFile> tsConfigFiles, List<InputFile> inputFiles) {
    Map<String, List<InputFile>> result = new LinkedHashMap<>();
    inputFiles.forEach(inputFile -> {
      String tsconfig = tsConfigFiles.stream()
        .filter(tsConfigFile -> tsConfigFile.test(inputFile))
        .map(tsConfigFile -> tsConfigFile.filename)
        .findFirst().orElse(UNMATCHED_CONFIG);
      LOG.debug("{} matched {}", inputFile.absolutePath(), tsconfig);
      result.computeIfAbsent(tsconfig, t -> new ArrayList<>()).add(inputFile);
    });
    return result;
  }


}
