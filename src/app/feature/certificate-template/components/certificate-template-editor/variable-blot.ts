import Quill from 'quill';
import Embed from 'quill/blots/embed.js';
import Delta from 'quill-delta';
import { CertificateVariable } from '@domain/certificate-template';

/**
 * Renders a {{variableName}} token as a non-editable inline "badge" in the
 * Quill editor — see certificate-template.forms.ts's docblock for why. The
 * SAVED HTML must still contain the literal `{{variableName}}` token (the
 * backend's app/core/certificate/template_variables.py substitutes those by
 * plain string replace, and app/core/certificate/template_generator.py's
 * HTML→PDF parser has no idea what a badge is) — Quill lets an Embed blot
 * override exactly what `getSemanticHTML()` emits for it via an `html()`
 * method (see quill/core/editor.js's convertHTML, which calls `blot.html()`
 * when present instead of serializing the DOM node), so the visual badge and
 * the saved token are two independent representations of the same blot with
 * zero backend changes required.
 */
export interface VariableBlotValue {
  name: string;
  label: string;
}

export class VariableBlot extends Embed {
  static override blotName = 'variable';
  static override className = 'variable-badge';
  static override tagName = 'SPAN';

  static override create(value: VariableBlotValue): HTMLElement {
    const node = super.create(value) as HTMLElement;
    node.setAttribute('data-variable-name', value.name);
    node.setAttribute('contenteditable', 'false');
    node.setAttribute('title', value.label);
    node.textContent = value.label;
    return node;
  }

  static override value(domNode: HTMLElement): VariableBlotValue {
    return {
      name: domNode.getAttribute('data-variable-name') ?? '',
      label: domNode.textContent ?? '',
    };
  }

  // Not a real override — Parchment's EmbedBlot type doesn't declare `html()`,
  // but Quill's runtime checks for it with `'html' in blot` (see quill/core/
  // editor.js's convertHTML) and calls it when present.
  html(): string {
    const { name } = (this.constructor as typeof VariableBlot).value(this.domNode as HTMLElement);
    return `{{${name}}}`;
  }
}

let registered = false;

/** Registers the blot once, globally — safe to call from every editor instance. */
export function registerVariableBlot(): void {
  if (registered) return;
  Quill.register(VariableBlot, true);
  registered = true;
}

// Module-level catalog the clipboard matcher below reads from — Quill blots
// and matchers are plain functions/classes with no Angular DI, and this app
// only ever shows one CertificateTemplateEditor at a time, so a shared
// mutable catalog (kept in sync by the component whenever `variables()`
// changes) is the simplest way to resolve a token's display label without
// threading component state through Quill's clipboard pipeline.
let catalog: CertificateVariable[] = [];

export function setVariableCatalog(variables: CertificateVariable[]): void {
  catalog = variables;
}

export function lookupVariable(name: string): CertificateVariable | undefined {
  return catalog.find((v) => v.name === name);
}

function labelFor(name: string): string {
  return lookupVariable(name)?.sampleValue || 'Sin valor';
}

const TOKEN_RE = /\{\{(\w+)\}\}/g;

/**
 * Quill clipboard TEXT_NODE matcher — runs on every plain-text node fed
 * through `quill.clipboard.convert()`, which PrimeNG's p-editor already uses
 * both to seed the editor from the bound FormControl's initial value and on
 * paste. Splits any `{{variableName}}` token out of the text into a
 * VariableBlot insert, leaving everything else as plain text untouched.
 */
export function variableTokenMatcher(node: Node, delta: Delta): Delta {
  const text = (node as Text).data ?? '';
  TOKEN_RE.lastIndex = 0;
  if (!TOKEN_RE.test(text)) return delta;
  TOKEN_RE.lastIndex = 0;

  const result = new Delta();
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = TOKEN_RE.exec(text))) {
    if (match.index > lastIndex) result.insert(text.slice(lastIndex, match.index));
    const name = match[1];
    result.insert({ variable: { name, label: labelFor(name) } satisfies VariableBlotValue });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) result.insert(text.slice(lastIndex));
  return result;
}
