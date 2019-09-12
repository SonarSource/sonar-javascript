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
import * as espree from "espree";
import * as babel from "babel-eslint";
import { Linter, SourceCode } from "eslint";
import { ParsingError } from "./analyzer";

// this value is taken from typescript-estree
// still we might consider extending this range
// if everything which we need is working on older/newer versions
const COMPATIBLE_TS_VERSIONS = ">=3.2.1 <3.6.0";

export const PARSER_CONFIG_MODULE: Linter.ParserOptions = {
  tokens: true,
  comment: true,
  loc: true,
  range: true,
  ecmaVersion: 2018,
  sourceType: "module",
  codeFrame: false,
  ecmaFeatures: {
    jsx: true,
    globalReturn: true,
  },
};

// 'script' source type forces not strict
export const PARSER_CONFIG_SCRIPT: Linter.ParserOptions = {
  ...PARSER_CONFIG_MODULE,
  sourceType: "script",
};

export type Parse = (
  fileContent: string,
  filePath: string,
  tsConfigs?: string[],
) => SourceCode | ParsingError;

// exported for testing
export function loggerFn(msg: string) {
  if (
    msg.includes(
      `WARNING: You are currently running a version of TypeScript which is not officially supported by typescript-estree.`,
    )
  ) {
    const currentVersionMatch = msg.match(/YOUR TYPESCRIPT VERSION: (.+)\n/);
    const currentVersion = currentVersionMatch ? currentVersionMatch[1] : "";

    // to make warning coming from typescipt-eslint parser less importunate
    console.log(
      `WARN You are using version of TypeScript ${currentVersion} which is not officially supported; supported versions ` +
        COMPATIBLE_TS_VERSIONS,
    );
  } else {
    // fall back to default behavior of 'typescript-estree'
    console.log(msg);
  }
}

export function parseJavaScriptSourceFile(fileContent: string): SourceCode | ParsingError {
  let parseFunctions = [espree.parse, babel.parse];
  if (fileContent.includes("@flow")) {
    parseFunctions = [babel.parse];
  }

  let exceptionToReport: ParseException | null = null;
  for (const parseFunction of parseFunctions) {
    for (const config of [PARSER_CONFIG_MODULE, PARSER_CONFIG_SCRIPT]) {
      const result = parse(parseFunction, config, fileContent);
      if (result instanceof SourceCode) {
        return result;
      } else if (!exceptionToReport) {
        exceptionToReport = result;
      }
    }
  }

  // if we reach this point, we are sure that "exceptionToReport" is defined
  return {
    line: exceptionToReport!.lineNumber,
    message: exceptionToReport!.message,
  };
}

export function parseTypeScriptSourceFile(
  fileContent: string,
  filePath: string,
  tsConfigs?: string[],
): SourceCode | ParsingError {
  try {
    // we load the typescript parser dynamically, so we don't need typescript dependency when analyzing pure JS project
    const tsParser = require("@typescript-eslint/parser");
    const result = tsParser.parseForESLint(fileContent, {
      ...PARSER_CONFIG_MODULE,
      filePath: filePath,
      project: tsConfigs,
      loggerFn,
    });
    return new SourceCode({ ...result, parserServices: result.services, text: fileContent });
  } catch (exception) {
    return {
      line: exception.lineNumber,
      message: exception.message,
    };
  }
}

export function parse(
  parse: Function,
  config: Linter.ParserOptions,
  fileContent: string,
): SourceCode | ParseException {
  try {
    const ast = parse(fileContent, config);
    return new SourceCode(fileContent, ast);
  } catch (exception) {
    return exception;
  }
}

export type ParseException = {
  lineNumber?: number;
  message: string;
};
