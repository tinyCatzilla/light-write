// from cocalc

import katex from "katex";

export default function KaTeXCompatHacks(math: string): string {
  math = eqnarray(math);
  return math;
}

export const macros = {
    "\\Bold": "\\mathbb{#1}",
    "\\ZZ": "\\Bold{Z}",
    "\\NN": "\\Bold{N}",
    "\\RR": "\\Bold{R}",
    "\\CC": "\\Bold{C}",
    "\\FF": "\\Bold{F}",
    "\\QQ": "\\Bold{Q}",
    "\\QQbar": "\\overline{\\QQ}",
    "\\CDF": "\\Bold{C}",
    "\\CIF": "\\Bold{C}",
    "\\CLF": "\\Bold{C}",
    "\\RDF": "\\Bold{R}",
    "\\RIF": "\\Bold{I} \\Bold{R}",
    "\\RLF": "\\Bold{R}",
    "\\CFF": "\\Bold{CFF}",
    "\\GF": "\\Bold{F}_{#1}",
    "\\Zp": "\\ZZ_{#1}",
    "\\Qp": "\\QQ_{#1}",
    "\\Zmod": "\\ZZ/#1\\ZZ",
    "\\mbox": "\\text", // see https://github.com/sagemathinc/cocalc/issues/6019
    "\\DeclareMathOperator": "\\providecommand{#1}{\\operatorname{#2}}",  // see https://github.com/sagemathinc/cocalc/issues/6179#issuecomment-1280002052
  } as const;

function replace_all(
    s: string,
    search: string,
    replace: string
): string {
    return s.split(search).join(replace);
}

// Support eqnarray: https://github.com/KaTeX/KaTeX/issues/3643
// This is very close: "\begin{darray}{rcl} ... \end{darray}"
function eqnarray(math: string): string {
  if (!math.includes("\\begin{eqnarray")) return math;
  // Note that darray never has equation numbers in katex as far as i can tell...
  math = replace_all(math, "\\begin{eqnarray}", "\\begin{darray}{rcl}");
  math = replace_all(math, "\\end{eqnarray}", "\\end{darray}");
  math = replace_all(math, "\\begin{eqnarray*}", "\\begin{darray}{rcl}");
  math = replace_all(math, "\\end{eqnarray*}", "\\end{darray}");
  return math;
}

/*
 *  This file is part of CoCalc: Copyright © 2020 Sagemath, Inc.
 *  License: AGPLv3 s.t. "Commons Clause" – see LICENSE.md for details
 */

function mathToHtml(
  math: string, // latex expression
  isInline: boolean,
  _ignore: Set<string> | undefined = undefined // used internally to avoid infinite recursion.
): { __html: string; err?: string } {
  if (!math.trim()) {
    // don't let it be empty, since then it is not possible to see/select.
    math = "\\LaTeX";
  }

  // Apply some hacks to deal with missing functionality in katex.
  math = KaTeXCompatHacks(math);

  let err: string | undefined = undefined;
  let html: string | undefined = undefined;
  try {
    html = katex.renderToString(math, {
      displayMode: !isInline,
      macros,
      globalGroup: true, // See https://github.com/sagemathinc/cocalc/issues/5750
    });
  } catch (error) {
    // If you are working interactively, e.g., in a notebook or md file, you might change a macro
    // you have already defined.  Unfortunately, katex/latex assumes you're processing the whole document
    // top to bottom from a clean slate every time.  For iterative work that makes no sense.  Thus we
    // automate changing newcommand into renewcommand, as needed, with an escape hatch to avoid an
    // infinite loop.  NOTE: if you redefine a macro, all other formulas that depend on it do not automatically
    // get rerendered, so you do have to edit them slightly or close/open the document to see the changes.
    // But at least this is a good first step.  Also, with this approach you still do see an error if
    // try to define something like \lt that is built in!  There you should use \renewcommand explicitly.
    // Parsing this also helps with opening files in separate tabs, where the same macros get defined.

    // TODO: See https://github.com/KaTeX/KaTeX/blob/main/src/macros.js for how to do this much better!
    // We can probably just slightly monkey patch how newcommand works... or something.
    err = error.toString();
    if (err?.endsWith("use \\renewcommand")) {
      const i = err.indexOf("redefine ");
      const j = err.lastIndexOf(";");
      const name = err.slice(i + "redefine ".length, j);
      let macros: any
      if (!_ignore?.has(name) && macros[name] != null) {
        math = math.replace("\\newcommand{" + name, "\\renewcommand{" + name);
        return mathToHtml(
          math,
          isInline,
          _ignore != null ? _ignore.add(name) : new Set([name])
        );
      }
    }
  }
  return { __html: html ?? "", err };
}

export function latexMathToHtml(s: string): string {
  const { __html, err } = s.startsWith("$$")
    ? mathToHtml(s.slice(2, s.length - 2), false)
    : s.startsWith("$")
    ? mathToHtml(s.slice(1, s.length - 1), true)
    : mathToHtml(s, false);
  if (err) {
    return `<span style="color:#ff6666">${err}</span>`;
  } else {
    return __html;
  }
}

export function latexMathToHtmlOrError(s: string): {
  __html: string;
  err?: string;
} {
  return s.startsWith("$$")
    ? mathToHtml(s.slice(2, s.length - 2), false)
    : s.startsWith("$")
    ? mathToHtml(s.slice(1, s.length - 1), true)
    : mathToHtml(s, false);
}