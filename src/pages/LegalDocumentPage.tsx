import { Navigate, useParams } from 'react-router-dom';
import { LegalPageLayout } from '../components/LegalPageLayout';
import { LEGAL_DOCUMENTS } from '../data/legalContent';
import type { LegalDocId } from '../data/legalContent';

function isLegalDocId(value: string | undefined): value is LegalDocId {
  return Boolean(value && value in LEGAL_DOCUMENTS);
}

export function LegalDocumentPage() {
  const { doc } = useParams<{ doc: string }>();

  if (!isLegalDocId(doc)) {
    return <Navigate to="/" replace />;
  }

  const document = LEGAL_DOCUMENTS[doc];

  return (
    <LegalPageLayout title={document.title} updatedAt={document.updatedAt}>
      <div className="flex flex-col gap-5">
        {document.sections.map((section) => (
          <div key={section.heading}>
            <h2 className="mb-1.5 text-sm font-semibold text-gray-800">{section.heading}</h2>
            <div className="flex flex-col gap-1.5">
              {section.body.map((paragraph, index) => (
                <p key={index} className="text-sm leading-relaxed text-gray-500">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </LegalPageLayout>
  );
}
