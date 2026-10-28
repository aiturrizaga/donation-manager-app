import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CertificateTemplateFacade } from '../../facade/certificate-template.facade';
import { CertificateTemplateEditor } from '../../components/certificate-template-editor/certificate-template-editor';
import { SelectedOrganizationContext } from '@shared/context/selected-organization.context';
import { OrganizationSelector } from '@shared/ui/organization-selector/organization-selector';
import { InlineError } from '@shared/ui/inline-error/inline-error';

@Component({
  selector: 'app-certificate-template-page',
  imports: [OrganizationSelector, CertificateTemplateEditor, InlineError],
  providers: [CertificateTemplateFacade],
  templateUrl: './certificate-template-page.html',
  styleUrl: './certificate-template-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CertificateTemplatePage {
  protected readonly facade = inject(CertificateTemplateFacade);
  protected readonly orgContext = inject(SelectedOrganizationContext);

  constructor() {
    this.facade.connect(() => this.orgContext.selectedId());
  }
}
