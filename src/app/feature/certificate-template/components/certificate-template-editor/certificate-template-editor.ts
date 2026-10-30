import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewChild,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Editor } from 'primeng/editor';
import type { EditorInitEvent, EditorSelectionChangeEvent, EditorTextChangeEvent } from 'primeng/types/editor';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { ColorPicker } from 'primeng/colorpicker';
import { ConfirmationService, MessageService } from 'primeng/api';
import Quill from 'quill';
import { CertificateTemplateApi } from '@shared/api/organization-certificate-template.api';
import {
  CertificateTemplate,
  CertificateVariable,
  ImagePosition,
  SignatureLinePosition,
} from '@domain/certificate-template';
import { AdjustableLine, AdjustableLineValue } from '@shared/ui/adjustable-line/adjustable-line';
import { Organization } from '@domain/organization';
import {
  CroppableImage,
  CroppableImageValue,
  ImageCrop,
  ImageFrameRect,
  ImageNaturalSize,
  NO_CROP,
} from '@shared/ui/croppable-image/croppable-image';
import { CertificateTemplateFormFields } from '../../certificate-template.forms';
import { operationState } from '@shared/utils/operation-state';
import { environment } from '@env/environment';
import { registerVariableBlot, setVariableCatalog, variableTokenMatcher, VariableBlotValue } from './variable-blot';

registerVariableBlot();

type QuillInstance = InstanceType<typeof Quill>;

// A4 at 96dpi — the page canvas's true px size, and the ratio used to
// convert the draggable overlays' position/size to the mm the backend
// stores and renders with (app/models/certificate_template.py, fpdf2 uses
// mm as its page unit). Keeping this ratio fixed (rather than measuring the
// rendered canvas) means the saved layout is independent of the visual
// scale below.
const PX_PER_MM = 96 / 25.4;
const PAGE_WIDTH_MM = 210;
const PAGE_HEIGHT_MM = 297;
const PAGE_WIDTH_PX = Math.round(PAGE_WIDTH_MM * PX_PER_MM);
const PAGE_HEIGHT_PX = Math.round(PAGE_HEIGHT_MM * PX_PER_MM);

// The page keeps its real A4 proportions and is rendered at a user-chosen
// zoom level (see zoomPercent/pageScale below, and setZoom()) — a Google
// Docs-style zoom selector, defaulting to 100% (true size) instead of the
// fixed 62% this used to be locked at. DraggableResizable divides pointer
// deltas by this same factor so dragging/resizing still tracks the cursor
// 1:1 on screen while the underlying saved coordinates stay true mm/px.
const DEFAULT_ZOOM_PERCENT = 100;
const ZOOM_OPTIONS: { label: string; value: string }[] = [
  { label: 'Ajustar', value: 'fit' },
  { label: '50%', value: '50' },
  { label: '75%', value: '75' },
  { label: '90%', value: '90' },
  { label: '100%', value: '100' },
  { label: '125%', value: '125' },
  { label: '150%', value: '150' },
  { label: '200%', value: '200' },
];

type ImageKey = 'logo' | 'seal' | 'signature';

// Mirrors app/core/certificate/template_generator.py's _DEFAULT_IMAGE_LAYOUT
// (mm) — same starting position/size a brand-new template opens with, so it
// visually matches today's certificate before any edits.
const DEFAULT_LAYOUT_MM: Record<ImageKey, ImagePosition> = {
  logo: { x: 150, y: 8, w: 40, h: null },
  signature: { x: 105, y: 90, w: 50, h: null },
  seal: { x: 147, y: 84, w: 38, h: null },
};

// Only these two areas are actually free-form/editable — the title, the
// donation data table, the certificate number line and the signature block
// (line + name + title) are drawn by the backend at fixed positions (see
// app/core/certificate/template_generator.py), the exact same ones
// generate_certificate_pdf() already used. Keeping those structural/legal
// parts consistent across every organization is deliberate: what genuinely
// varies per org is how they phrase the intro paragraph and the footer
// (and where they put their logo/seal/firma), not the shape of a donation
// receipt table.
const DEFAULT_BODY_HTML =
  '<p>La <strong>{{organizationName}}</strong> identificada con RUC {{organizationRuc}}, con domicilio legal en {{organizationAddress}}; bajo el amparo de la <strong>Resolución de Intendencia N° {{resolutionNumber}}</strong> de fecha {{resolutionDate}} emitida por la SUNAT, que nos reconoce como entidad perceptora de donaciones; extendemos el presente comprobante declarando haber recibido la siguiente donación:</p>';

const DEFAULT_FOOTER_HTML =
  '<p class="ql-align-center">{{organizationAddress}} · Telf. {{organizationPhone}}</p>' +
  '<p class="ql-align-center">{{organizationEmail}}</p>';

// The signature name/title block — unlike the logo/seal/signature IMAGES,
// this text sits at a FIXED position on the page (see app/core/certificate/
// template_generator.py's _SIGNATURE_TEXT_X/_W/_LINE_Y) independent of
// wherever the signature image gets dragged to, since coupling the two was
// exactly the "moving the image moves all the text" bug reported earlier.
const DEFAULT_SIGNATURE_HTML =
  '<p class="ql-align-center"><strong>{{legalRepresentativeName}}</strong></p>' +
  '<p class="ql-align-center">{{legalRepresentativeTitle}}</p>';

type EditorKey = 'body' | 'footer' | 'signature';
type AlignValue = '' | 'center' | 'right' | 'justify';

// mm → px for the signature block's fixed HORIZONTAL position. The backend
// draws at an ABSOLUTE x=105mm measured from the true page edge (_LEFT=
// 25mm, _RIGHT_EDGE=185mm — see app/core/certificate/template_generator.py).
// Here the block sits in normal flow *inside* .cert-page, which already has
// `padding-left: $page-margin-x` (=_LEFT) applied — so its own margin-left
// must be expressed relative to that already-inset content box (105 - 25 =
// 80mm from the content edge), not the page's true edge, or it double-counts
// the left margin and overshoots the right edge. Width stays 80mm either
// way (105+80=185=_RIGHT_EDGE), which is exactly _CONTENT_W (160mm) once
// offset from the content box — i.e. it reaches the content's own right
// edge, flush with the paragraph's right margin above it.
const SIGNATURE_TEXT_X_PX = Math.round((105 - 25) * PX_PER_MM);
const SIGNATURE_TEXT_W_PX = Math.round(80 * PX_PER_MM);

// Signature line default (mm), same as the backend's fixed line before it
// became configurable: from _SIGNATURE_TEXT_X (105) to 105 + 80 - 5.
const SIGNATURE_TEXT_X_MM = 105;
const DEFAULT_SIGNATURE_LINE_MM: SignatureLinePosition = { x: SIGNATURE_TEXT_X_MM, w: 75 };

// Fallback aspect ratios (w/h) used only until the real image loads — see
// onImageLoaded(), which replaces the height with the image's natural one
// whenever no explicit height was saved.
const FALLBACK_ASPECT_RATIO: Record<ImageKey, number> = { logo: 2.5, seal: 1, signature: 2.2 };

const IMAGE_ALT: Record<ImageKey, string> = { logo: 'Logo', seal: 'Sello', signature: 'Firma' };

function mmToPx(pos: ImagePosition, aspectRatio: number): CroppableImageValue {
  const w = pos.w * PX_PER_MM;
  const h = (pos.h ?? pos.w / aspectRatio) * PX_PER_MM;
  return { rect: { x: pos.x * PX_PER_MM, y: pos.y * PX_PER_MM, w, h }, crop: normalizeCrop(pos.crop) };
}

function pxToMm({ rect, crop }: CroppableImageValue): ImagePosition {
  return {
    x: rect.x / PX_PER_MM,
    y: rect.y / PX_PER_MM,
    w: rect.w / PX_PER_MM,
    h: rect.h / PX_PER_MM,
    crop: hasCrop(crop) ? crop : null,
  };
}

function normalizeCrop(crop: ImageCrop | null | undefined): ImageCrop {
  return crop ? { ...NO_CROP, ...crop } : NO_CROP;
}

function hasCrop(crop: ImageCrop): boolean {
  return crop.left > 0 || crop.top > 0 || crop.right > 0 || crop.bottom > 0;
}

// ── Slash command menu ────────────────────────────────────────────────────
// Typing "/" inside any of the three editors opens a small Notion-style
// command menu near the cursor instead of the old standalone "Insertar
// variable" dropdown row. "main" lists block commands plus "Insertar
// variable"; picking that switches to "variables", a searchable, flat list
// of the real catalog (see variable-blot.ts) grouped by category in each
// item's label. Both modes share one flat, keyboard-navigable item list.
interface SlashItem {
  kind: 'command' | 'variable';
  id: string;
  label: string;
  icon: string;
  variable?: CertificateVariable;
}

const MAIN_COMMANDS: SlashItem[] = [
  { kind: 'command', id: 'variable', label: 'Insertar variable', icon: 'ti ti-braces' },
  { kind: 'command', id: 'heading', label: 'Encabezado', icon: 'ti ti-heading' },
  { kind: 'command', id: 'paragraph', label: 'Texto normal', icon: 'ti ti-text-size' },
  { kind: 'command', id: 'list', label: 'Lista con viñetas', icon: 'ti ti-list' },
];

interface SlashState {
  open: boolean;
  mode: 'main' | 'variables';
  editorKey: EditorKey;
  anchorIndex: number;
  query: string;
  activeIndex: number;
  x: number;
  y: number;
}

const SLASH_CLOSED: SlashState = {
  open: false,
  mode: 'main',
  editorKey: 'body',
  anchorIndex: 0,
  query: '',
  activeIndex: 0,
  x: 0,
  y: 0,
};

/**
 * The "hoja" — an A4-proportioned canvas (scaled down for screen, see
 * PAGE_SCALE) with three Quill text areas (intro paragraph + footer +
 * signature name/title) and three draggable/resizable image overlays
 * (logo/sello/firma). A shared toolbar (outside the page) acts on whichever
 * editor last had focus. Variables are represented as non-editable badges
 * (see variable-blot.ts) inserted via a "/" command menu — the editor never
 * shows literal {{token}} text; that conversion happens automatically when
 * Quill serializes/parses the editor's HTML. See app/core/certificate/
 * template_generator.py (backend) for how the saved HTML (tokens, not
 * badges) is rendered into the actual PDF.
 */
@Component({
  selector: 'app-certificate-template-editor',
  imports: [ReactiveFormsModule, FormsModule, Editor, Button, Message, ColorPicker, CroppableImage, AdjustableLine],
  templateUrl: './certificate-template-editor.html',
  styleUrl: './certificate-template-editor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CertificateTemplateEditor implements AfterViewInit {
  readonly organization = input.required<Organization>();
  readonly template = input<CertificateTemplate | null>(null);
  readonly variables = input<CertificateVariable[]>([]);

  readonly saved = output<void>();
  readonly deleted = output<void>();

  @ViewChild('bodyEditor') protected bodyEditorRef?: Editor;
  @ViewChild('footerEditor') protected footerEditorRef?: Editor;
  @ViewChild('signatureEditor') protected signatureEditorRef?: Editor;

  readonly #api = inject(CertificateTemplateApi);
  readonly #fb = inject(FormBuilder);
  readonly #confirm = inject(ConfirmationService);
  readonly #message = inject(MessageService);
  readonly #destroyRef = inject(DestroyRef);

  protected readonly saveOp = operationState();
  protected readonly deleteOp = operationState();
  protected readonly previewOp = operationState();

  protected readonly pageWidth = PAGE_WIDTH_PX;
  protected readonly pageHeight = PAGE_HEIGHT_PX;

  @ViewChild('workspace') protected workspaceRef?: ElementRef<HTMLElement>;

  protected readonly zoomOptions = ZOOM_OPTIONS;
  protected readonly zoomPercent = signal(DEFAULT_ZOOM_PERCENT);
  protected readonly zoomValue = computed(() => String(this.zoomPercent()));
  protected readonly isCustomZoom = computed(() => !ZOOM_OPTIONS.some((o) => o.value === this.zoomValue()));
  protected readonly pageScale = computed(() => this.zoomPercent() / 100);

  protected readonly signatureTextX = SIGNATURE_TEXT_X_PX;
  protected readonly signatureTextW = SIGNATURE_TEXT_W_PX;

  // Signature line in mm (saved as-is). On screen it lives inside the
  // signature block, which starts at x=105mm, so its px x is relative to
  // that, bounded by the page edges.
  protected readonly signatureLine = signal<SignatureLinePosition>(DEFAULT_SIGNATURE_LINE_MM);
  protected readonly signatureLineX = computed(() => (this.signatureLine().x - SIGNATURE_TEXT_X_MM) * PX_PER_MM);
  protected readonly signatureLineW = computed(() => this.signatureLine().w * PX_PER_MM);
  protected readonly signatureLineMinX = -SIGNATURE_TEXT_X_MM * PX_PER_MM;
  protected readonly signatureLineMaxRight = (PAGE_WIDTH_MM - SIGNATURE_TEXT_X_MM) * PX_PER_MM;

  // Custom clipboard matcher turns {{variableName}} tokens in the loaded
  // HTML into badge blots; no built-in toolbar module (the external shared
  // toolbar below drives Quill directly via quill.format()/formatLine()).
  protected readonly quillModules = {
    toolbar: false,
    clipboard: { matchers: [[Node.TEXT_NODE, variableTokenMatcher]] },
  };

  protected readonly activeEditorKey = signal<EditorKey>('body');
  protected readonly activeFormats = signal<Record<string, unknown>>({});

  protected readonly slash = signal<SlashState>(SLASH_CLOSED);
  protected readonly slashMainItems = computed<SlashItem[]>(() => {
    const q = this.slash().query.trim().toLowerCase();
    return q ? MAIN_COMMANDS.filter((c) => c.label.toLowerCase().includes(q)) : MAIN_COMMANDS;
  });
  protected readonly slashVariableItems = computed<SlashItem[]>(() => {
    const q = this.slash().query.trim().toLowerCase();
    const list = q
      ? this.variables().filter(
          (v) => v.label.toLowerCase().includes(q) || v.name.toLowerCase().includes(q),
        )
      : this.variables();
    return list.map((v) => ({
      kind: 'variable' as const,
      id: v.name,
      label: `${v.category} · ${v.label}`,
      icon: 'ti ti-braces',
      variable: v,
    }));
  });
  protected readonly slashActiveItems = computed<SlashItem[]>(() =>
    this.slash().mode === 'main' ? this.slashMainItems() : this.slashVariableItems(),
  );

  protected readonly headingOptions = [
    { label: 'Texto normal', value: 0 },
    { label: 'Encabezado 1', value: 1 },
    { label: 'Encabezado 2', value: 2 },
  ];
  protected readonly fontOptions = [
    { label: 'Normal', value: '' },
    { label: 'Serif', value: 'serif' },
    { label: 'Monospace', value: 'monospace' },
  ];
  protected readonly sizeOptions = [
    { label: 'Normal', value: '' },
    { label: 'Pequeño', value: 'small' },
    { label: 'Grande', value: 'large' },
    { label: 'Enorme', value: 'huge' },
  ];

  protected readonly currentHeading = computed(() => Number(this.activeFormats()['header']) || 0);
  protected readonly currentFont = computed(() => (this.activeFormats()['font'] as string) || '');
  protected readonly currentSize = computed(() => (this.activeFormats()['size'] as string) || '');
  protected readonly currentColor = computed(() => (this.activeFormats()['color'] as string) || '#141414');

  /** Sample value for the read-only preview of the fixed data table — real
   * org data where available, placeholder donation data otherwise (same
   * placeholders the backend's own preview endpoint uses). */
  protected readonly sample = (name: string): string =>
    this.variables().find((v) => v.name === name)?.sampleValue ?? '';

  readonly form: FormGroup<CertificateTemplateFormFields> = this.#fb.group({
    bodyHtml: this.#fb.control(DEFAULT_BODY_HTML, { nonNullable: true }),
    footerHtml: this.#fb.control(DEFAULT_FOOTER_HTML, { nonNullable: true }),
    signatureHtml: this.#fb.control(DEFAULT_SIGNATURE_HTML, { nonNullable: true }),
  });

  // Position/size (page px) + crop of each image overlay; converted to mm
  // only on save (pxToMm).
  protected readonly imageLayout = signal<Record<ImageKey, CroppableImageValue>>({
    logo: mmToPx(DEFAULT_LAYOUT_MM.logo, FALLBACK_ASPECT_RATIO.logo),
    seal: mmToPx(DEFAULT_LAYOUT_MM.seal, FALLBACK_ASPECT_RATIO.seal),
    signature: mmToPx(DEFAULT_LAYOUT_MM.signature, FALLBACK_ASPECT_RATIO.signature),
  });

  protected readonly logoUrl = () => this.#imageUrl(this.organization().logoPath);
  protected readonly sealUrl = () => this.#imageUrl(this.organization().sealPath);
  protected readonly signatureUrl = () => this.#imageUrl(this.organization().signaturePath);

  /** Images actually uploaded for this organization, in drawing order. */
  protected readonly images = computed(() =>
    (['logo', 'signature', 'seal'] as const)
      .map((key) => ({ key, alt: IMAGE_ALT[key], url: this.#imageUrlFor(key) }))
      .filter((img): img is { key: ImageKey; alt: string; url: string } => !!img.url),
  );

  protected readonly selectedImage = signal<ImageKey | null>(null);
  protected readonly croppingImage = signal<ImageKey | null>(null);
  protected readonly selectedHasCrop = computed(() => {
    const key = this.selectedImage();
    return !!key && hasCrop(this.imageLayout()[key].crop);
  });

  // Keyed by image URL (not ImageKey) so switching organization never reuses
  // another organization's image proportions.
  readonly #naturalSizeByUrl = new Map<string, ImageNaturalSize>();
  // Images whose height wasn't saved explicitly (new template, or a legacy
  // layout with h: null) — their height is derived from the real image once
  // it loads, the same way the PDF keeps the natural ratio when h is null.
  readonly #pendingNaturalHeight = new Set<ImageKey>();

  readonly #quillByKey: Partial<Record<EditorKey, QuillInstance>> = {};

  constructor() {
    // Reinicializa al cambiar de organización o al recargar su plantilla
    // (tras guardar/eliminar) — mismo patrón que EmailSettingsForm.
    //
    // `template` and `variables` are two INDEPENDENT httpResources (see
    // certificate-template.facade.ts) that rarely resolve in the same tick,
    // and the page only gates on the template resource's loading state — so
    // this single effect deliberately reads BOTH signals and re-converts
    // every time either changes. Splitting this into two effects (catalog
    // first, form value second) looked cleaner but had a real race: if
    // `template` resolved before `variables`, the clipboard matcher below
    // would bake every badge in as "Sin valor" permanently, since nothing
    // re-triggers Quill's HTML→Delta conversion once `variables` arrives
    // later on its own.
    effect(() => {
      this.organization();
      const current = this.template();
      setVariableCatalog(this.variables());

      this.form.setValue({
        bodyHtml: current?.bodyHtml ?? DEFAULT_BODY_HTML,
        footerHtml: current?.footerHtml || DEFAULT_FOOTER_HTML,
        signatureHtml: current?.signatureHtml || DEFAULT_SIGNATURE_HTML,
      });
      this.#pendingNaturalHeight.clear();
      this.imageLayout.set({
        logo: this.#resolveLayout('logo', current),
        seal: this.#resolveLayout('seal', current),
        signature: this.#resolveLayout('signature', current),
      });
      this.signatureLine.set(current?.imageLayout?.signatureLine ?? DEFAULT_SIGNATURE_LINE_MM);
      this.selectedImage.set(null);
      this.croppingImage.set(null);
      this.#closeSlash();
    });

    const onOutsidePointerDown = (e: PointerEvent) => {
      if (!this.slash().open) return;
      const target = e.target as Node;
      if (!(target instanceof Element) || !target.closest('.slash-menu')) {
        this.#closeSlash();
      }
    };
    window.addEventListener('pointerdown', onOutsidePointerDown, true);
    this.#destroyRef.onDestroy(() => window.removeEventListener('pointerdown', onOutsidePointerDown, true));
  }

  // Defaults to "Ajustar" instead of a fixed 100% so the page always fits
  // the available width on load — no internal horizontal scrollbar, which
  // was the "looks like a scrollable Word document" complaint.
  ngAfterViewInit(): void {
    this.setZoom('fit');
  }

  // ── Shared toolbar — operates on whichever editor last had focus ───────

  protected onEditorFocus(key: EditorKey): void {
    this.activeEditorKey.set(key);
    this.#syncActiveFormats();
  }

  toggleFormat(name: 'bold' | 'italic' | 'underline'): void {
    const quill = this.#activeEditor()?.getQuill();
    if (!quill) return;
    const current = quill.getFormat();
    // 'user' is required as the source — PrimeNG's p-editor only writes the
    // new HTML back into the bound FormControl when Quill's 'text-change'
    // event fires with source === 'user' (see primeng-editor.mjs); calling
    // format() without it defaults to source 'api', so the toolbar's change
    // was applied on screen but silently never reached the form, and the
    // next save (or organization/template reload) wiped it out again.
    quill.format(name, !current[name], 'user');
    this.#syncActiveFormats();
  }

  setAlign(value: AlignValue): void {
    const quill = this.#activeEditor()?.getQuill();
    if (!quill) return;
    quill.format('align', value || false, 'user');
    this.#syncActiveFormats();
  }

  setHeading(level: number): void {
    const quill = this.#activeEditor()?.getQuill();
    if (!quill) return;
    quill.format('header', level || false, 'user');
    this.#syncActiveFormats();
  }

  setFont(font: string): void {
    const quill = this.#activeEditor()?.getQuill();
    if (!quill) return;
    quill.format('font', font || false, 'user');
    this.#syncActiveFormats();
  }

  setSize(size: string): void {
    const quill = this.#activeEditor()?.getQuill();
    if (!quill) return;
    quill.format('size', size || false, 'user');
    this.#syncActiveFormats();
  }

  setColor(hex: string): void {
    const quill = this.#activeEditor()?.getQuill();
    if (!quill) return;
    quill.format('color', hex, 'user');
    this.#syncActiveFormats();
  }

  setLink(): void {
    const quill = this.#activeEditor()?.getQuill();
    if (!quill) return;
    const current = quill.getFormat()['link'] as string | undefined;
    const url = window.prompt('URL del enlace', current ?? 'https://');
    if (url === null) return;
    quill.format('link', url || false, 'user');
    this.#syncActiveFormats();
  }

  setList(type: 'bullet' | 'ordered'): void {
    const quill = this.#activeEditor()?.getQuill();
    if (!quill) return;
    const current = quill.getFormat()['list'];
    quill.format('list', current === type ? false : type, 'user');
    this.#syncActiveFormats();
  }

  indent(delta: 1 | -1): void {
    const quill = this.#activeEditor()?.getQuill();
    if (!quill) return;
    const current = Number(quill.getFormat()['indent'] ?? 0);
    const next = Math.min(8, Math.max(0, current + delta));
    quill.format('indent', next || false, 'user');
  }

  undo(): void {
    this.#activeEditor()?.getQuill()?.history.undo();
  }

  redo(): void {
    this.#activeEditor()?.getQuill()?.history.redo();
  }

  /** Google Docs-style zoom selector. 'fit' measures the workspace's
   * current width and picks the largest zoom that keeps the page from
   * needing horizontal scroll (clamped to the same range as the fixed
   * presets) — a one-off measurement, not a live ResizeObserver, since
   * Google Docs' own "Ajustar" only recomputes when explicitly chosen too. */
  setZoom(value: string): void {
    if (value !== 'fit') {
      this.zoomPercent.set(Number(value));
      return;
    }
    const workspaceWidth = this.workspaceRef?.nativeElement.clientWidth;
    if (!workspaceWidth) return;
    const available = workspaceWidth - 64; // cert-workspace's own horizontal padding
    const fitScale = available / this.pageWidth;
    this.zoomPercent.set(Math.round(Math.min(2, Math.max(0.3, fitScale)) * 100));
  }

  // ── Per-editor wiring: slash menu detection + active-format tracking ───

  protected onEditorInit(key: EditorKey, event: EditorInitEvent): void {
    const quill = event.editor as QuillInstance;
    this.#quillByKey[key] = quill;
    quill.root.addEventListener('keydown', (e: KeyboardEvent) => this.#onEditorKeydown(key, e));
  }

  protected onEditorTextChange(key: EditorKey, event: EditorTextChangeEvent): void {
    if (event.source !== 'user') return;
    this.activeEditorKey.set(key);
    this.#syncActiveFormats();
    this.#updateSlashFromCursor(key);
  }

  protected onEditorSelectionChange(key: EditorKey, event: EditorSelectionChangeEvent): void {
    if (!event.range) return;
    this.activeEditorKey.set(key);
    this.#syncActiveFormats();
  }

  #syncActiveFormats(): void {
    const quill = this.#activeEditor()?.getQuill();
    if (!quill) {
      this.activeFormats.set({});
      return;
    }
    const range = quill.getSelection();
    this.activeFormats.set(range ? quill.getFormat(range) : {});
  }

  #updateSlashFromCursor(key: EditorKey): void {
    const quill = this.#quillByKey[key];
    if (!quill) return;
    const range = quill.getSelection();
    const state = this.slash();

    if (!range) {
      if (state.open && state.editorKey === key) this.#closeSlash();
      return;
    }
    const cursor = range.index;

    if (!state.open || state.editorKey !== key) {
      if (cursor < 1) return;
      if (quill.getText(cursor - 1, 1) !== '/') return;
      const charBeforeSlash = cursor >= 2 ? quill.getText(cursor - 2, 1) : '\n';
      if (!/[\s\n]/.test(charBeforeSlash)) return; // avoid triggering mid-word
      const bounds = quill.getBounds(cursor - 1);
      if (!bounds) return;
      const rootRect = quill.root.getBoundingClientRect();
      this.slash.set({
        open: true,
        mode: 'main',
        editorKey: key,
        anchorIndex: cursor - 1,
        query: '',
        activeIndex: 0,
        x: rootRect.left + bounds.left * this.pageScale(),
        y: rootRect.top + (bounds.top + bounds.height) * this.pageScale() + 4,
      });
      return;
    }

    if (cursor <= state.anchorIndex) {
      this.#closeSlash();
      return;
    }
    const query = quill.getText(state.anchorIndex + 1, cursor - state.anchorIndex - 1);
    if (/\s/.test(query)) {
      this.#closeSlash();
      return;
    }
    this.slash.update((s) => ({ ...s, query, activeIndex: 0 }));
  }

  #onEditorKeydown(key: EditorKey, e: KeyboardEvent): void {
    const state = this.slash();
    if (!state.open || state.editorKey !== key) return;

    const items = this.slashActiveItems();
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.slash.update((s) => ({ ...s, activeIndex: Math.min(s.activeIndex + 1, Math.max(items.length - 1, 0)) }));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.slash.update((s) => ({ ...s, activeIndex: Math.max(s.activeIndex - 1, 0) }));
    } else if (e.key === 'Escape') {
      e.preventDefault();
      this.#closeSlash();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = items[state.activeIndex];
      if (item) this.onSlashItemActivate(item);
      else this.#closeSlash();
    }
  }

  /** Confirms the highlighted/clicked slash-menu item — shared by keyboard
   * (Enter) and mouse (click) activation. */
  protected onSlashItemActivate(item: SlashItem): void {
    const state = this.slash();
    const quill = this.#quillByKey[state.editorKey];
    if (!quill) {
      this.#closeSlash();
      return;
    }

    if (item.kind === 'command' && item.id === 'variable') {
      this.slash.update((s) => ({ ...s, mode: 'variables', query: '', activeIndex: 0 }));
      return;
    }

    const consumed = 1 + state.query.length; // the "/" plus whatever was typed as a search query
    quill.deleteText(state.anchorIndex, consumed, 'user');

    if (item.kind === 'variable' && item.variable) {
      const value: VariableBlotValue = { name: item.variable.name, label: item.variable.sampleValue || 'Sin valor' };
      quill.insertEmbed(state.anchorIndex, 'variable', value, 'user');
      quill.setSelection(state.anchorIndex + 1, 0, 'user');
    } else if (item.kind === 'command') {
      if (item.id === 'heading') quill.formatLine(state.anchorIndex, 1, 'header', 2, 'user');
      else if (item.id === 'paragraph') quill.formatLine(state.anchorIndex, 1, 'header', false, 'user');
      else if (item.id === 'list') quill.formatLine(state.anchorIndex, 1, 'list', 'bullet', 'user');
      quill.setSelection(state.anchorIndex, 0, 'user');
    }
    this.#closeSlash();
  }

  #closeSlash(): void {
    this.slash.set(SLASH_CLOSED);
  }

  // ── Image overlays: move/resize/crop ────────────────────────────────────

  protected onImageChanged(key: ImageKey, value: CroppableImageValue): void {
    this.#pendingNaturalHeight.delete(key);
    this.imageLayout.update((layout) => ({ ...layout, [key]: value }));
  }

  protected onImageLoaded(key: ImageKey, natural: ImageNaturalSize): void {
    const url = this.#imageUrlFor(key);
    if (url) this.#naturalSizeByUrl.set(url, natural);
    if (this.#pendingNaturalHeight.delete(key)) this.resetAspectRatio(key);
  }

  protected onImageSelected(key: ImageKey, selected: boolean): void {
    if (selected) this.selectedImage.set(key);
    else if (this.selectedImage() === key) this.selectedImage.set(null);
  }

  protected onImageCropping(key: ImageKey, cropping: boolean): void {
    if (cropping) this.croppingImage.set(key);
    else if (this.croppingImage() === key) this.croppingImage.set(null);
  }

  toggleCrop(): void {
    const key = this.selectedImage();
    if (!key) return;
    this.croppingImage.set(this.croppingImage() === key ? null : key);
  }

  resetCrop(): void {
    const key = this.selectedImage();
    if (!key) return;
    const { rect, crop } = this.imageLayout()[key];
    // Restore the full image at its current scale, anchored where the
    // uncropped image sat, so removing the crop doesn't zoom the image.
    const fullW = rect.w / (1 - crop.left - crop.right);
    const fullH = rect.h / (1 - crop.top - crop.bottom);
    const next: ImageFrameRect = {
      x: Math.max(0, rect.x - crop.left * fullW),
      y: Math.max(0, rect.y - crop.top * fullH),
      w: Math.min(fullW, PAGE_WIDTH_PX),
      h: Math.min(fullH, PAGE_HEIGHT_PX),
    };
    this.croppingImage.set(null);
    this.onImageChanged(key, { rect: next, crop: NO_CROP });
  }

  /** Undoes any stretching: keeps the width and sets the height matching
   * the (cropped) image's real proportions. */
  resetAspectRatio(key: ImageKey | null = this.selectedImage()): void {
    if (!key) return;
    const natural = this.#naturalSizeFor(key);
    if (!natural) return;
    const { rect, crop } = this.imageLayout()[key];
    const h = rect.w / this.#visibleAspectRatio(natural, crop);
    this.imageLayout.update((layout) => ({ ...layout, [key]: { crop, rect: { ...rect, h } } }));
  }

  protected onSignatureLineChanged({ x, w }: AdjustableLineValue): void {
    // Rounded to 0.01mm and re-clamped so float noise can never push x + w
    // past the page width the backend validates (x >= 0, x + w <= 210).
    const xMm = Math.max(0, Math.round((x / PX_PER_MM + SIGNATURE_TEXT_X_MM) * 100) / 100);
    const wMm = Math.min(Math.round((w / PX_PER_MM) * 100) / 100, PAGE_WIDTH_MM - xMm);
    this.signatureLine.set({ x: xMm, w: wMm });
  }

  // ── Save / preview / reset ──────────────────────────────────────────────

  save(): void {
    const raw = this.form.getRawValue();
    this.saveOp
      .run(
        this.#api.upsert(this.organization().id, {
          bodyHtml: raw.bodyHtml,
          footerHtml: raw.footerHtml,
          signatureHtml: raw.signatureHtml,
          imageLayout: {
            logo: pxToMm(this.imageLayout().logo),
            seal: pxToMm(this.imageLayout().seal),
            signature: pxToMm(this.imageLayout().signature),
            signatureLine: this.signatureLine(),
          },
        }),
        'Plantilla de certificado guardada.',
      )
      .subscribe({ next: () => this.saved.emit() });
  }

  preview(): void {
    // Opened synchronously, inside the click handler, so the browser still
    // sees it as a direct user gesture — opening it only once the PDF blob
    // arrives (after an async HTTP round-trip) gets silently blocked as a
    // popup in Chrome/Firefox. The actual PDF is loaded into this blank tab
    // once ready, via location.href.
    const tab = window.open('', '_blank');

    this.previewOp.run(this.#api.previewPdf(this.organization().id)).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        if (tab) tab.location.href = url;
        else window.open(url, '_blank');
      },
      error: () => {
        tab?.close();
        this.#message.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo generar la vista previa.',
        });
      },
    });
  }

  confirmDelete(): void {
    this.#confirm.confirm({
      message:
        'Se eliminará la plantilla personalizada y el certificado volverá al diseño por defecto de la plataforma. ¿Deseas continuar?',
      header: 'Restablecer plantilla de certificado',
      icon: 'ti ti-trash',
      rejectLabel: 'No',
      acceptLabel: 'Sí, restablecer',
      acceptButtonProps: { severity: 'danger' },
      accept: () => this.#delete(),
    });
  }

  #delete(): void {
    this.deleteOp
      .run(this.#api.delete(this.organization().id), 'Plantilla de certificado eliminada.')
      .subscribe({ next: () => this.deleted.emit() });
  }

  #resolveLayout(key: ImageKey, current: CertificateTemplate | null): CroppableImageValue {
    const position = current?.imageLayout?.[key] ?? DEFAULT_LAYOUT_MM[key];
    const natural = this.#naturalSizeFor(key);
    if (position.h == null) {
      if (natural) return mmToPx(position, this.#visibleAspectRatio(natural, normalizeCrop(position.crop)));
      this.#pendingNaturalHeight.add(key);
    }
    return mmToPx(position, FALLBACK_ASPECT_RATIO[key]);
  }

  #visibleAspectRatio(natural: ImageNaturalSize, crop: ImageCrop): number {
    return (natural.width * (1 - crop.left - crop.right)) / (natural.height * (1 - crop.top - crop.bottom));
  }

  #naturalSizeFor(key: ImageKey): ImageNaturalSize | undefined {
    const url = this.#imageUrlFor(key);
    return url ? this.#naturalSizeByUrl.get(url) : undefined;
  }

  #imageUrlFor(key: ImageKey): string | null {
    switch (key) {
      case 'logo':
        return this.logoUrl();
      case 'seal':
        return this.sealUrl();
      default:
        return this.signatureUrl();
    }
  }

  #imageUrl(path: string | null): string | null {
    return path ? `${environment.apiUrl}${path}` : null;
  }

  #activeEditor(): Editor | undefined {
    switch (this.activeEditorKey()) {
      case 'footer':
        return this.footerEditorRef;
      case 'signature':
        return this.signatureEditorRef;
      default:
        return this.bodyEditorRef;
    }
  }
}
