import { Calendar } from "@/components/common/Calendar";
import { parseCalendarDate } from "@/lib/utils/calendar";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

test("calendar rejects impossible dates without normalizing them to a different month", () => {
  for (const value of ["", "invalid", "2026-02-29", "2026-04-31", "2026-13-01", "2026-00-10", "2026-10-00"]) {
    assert.equal(parseCalendarDate(value), null, value);
  }
  assert.equal(parseCalendarDate("2024-02-29")?.getDate(), 29);
  assert.equal(parseCalendarDate("2026-10-27")?.getMonth(), 9);
});

test("shared calendar keeps the selected day and blocks earlier dates", () => {
  const html = renderToStaticMarkup(<Calendar month={new Date(2024, 1, 1)} selectedDate={new Date(2024, 1, 29)} minDate={new Date(2024, 1, 28, 18)} onMonthChange={() => {}} onSelect={() => {}} />);
  assert.equal((html.match(/aria-label="\d{2}\/02\/2024"/g) ?? []).length, 29);
  assert.match(html, /disabled="" aria-label="27\/02\/2024"/);
  assert.doesNotMatch(html, /disabled="" aria-label="28\/02\/2024"/);
  assert.match(html, /aria-label="29\/02\/2024" aria-pressed="true"/);
  assert.match(html, /aria-label="Tháng trước"/);
  assert.match(html, /aria-label="Tháng sau"/);
});

test("component files contain one component; reusable components document their function", () => {
  const root = path.resolve("components");
  const walk = (directory: string): string[] => readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(directory, entry.name)) : entry.name.endsWith(".tsx") ? [path.join(directory, entry.name)] : []);
  for (const file of walk(root)) {
    const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const containsJsx = (node: ts.Node): boolean => ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node) || Boolean(ts.forEachChild(node, containsJsx));
    const names = source.statements.flatMap(statement => {
      if (ts.isFunctionDeclaration(statement) && statement.name && /^[A-Z]/.test(statement.name.text) && containsJsx(statement)) return [statement.name.text];
      if (ts.isVariableStatement(statement)) return statement.declarationList.declarations.filter(declaration => ts.isIdentifier(declaration.name) && /^[A-Z]/.test(declaration.name.text) && declaration.initializer && (ts.isArrowFunction(declaration.initializer) || ts.isFunctionExpression(declaration.initializer) || ts.isCallExpression(declaration.initializer) && ["memo", "forwardRef"].includes(declaration.initializer.expression.getText(source))) && containsJsx(declaration.initializer)).map(declaration => declaration.name.getText(source));
      return [];
    });
    assert.equal(names.length, 1, `${file}: ${names.join(", ")}`);
    assert.equal(names[0], path.basename(file, ".tsx"), file);
    if (path.dirname(file) === path.join(root, "common")) assert.match(source.text, /\/\*\* Hiển thị|\/\*\* Cung cấp/, file);
  }
});
