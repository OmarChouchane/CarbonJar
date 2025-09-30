import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import CertificateCard from '@/components/certificate-card';
import type { Certificate } from '@/types/certificate';

describe('CertificateCard', () => {
  const baseCertificate: Certificate = {
    id: 'cert-123',
    title: 'Life Cycle Assessment Foundations',
    description: 'Comprehensive introduction to LCA methodologies and tooling.',
    issuedAt: '2024-05-12T00:00:00.000Z',
    certificateUrl: 'https://cdn.example.com/certificates/cert-123.pdf',
    credentialUrl: 'https://credentials.carbonjar.com/certificates/lca-foundations-jane-doe',
    certId: 'LCA-1234',
    expirationAt: null,
    organizationName: 'Carbon Jar',
    slug: 'lca-foundations-jane-doe',
  };

  it('surfaces the public credential link in the card body', () => {
    render(<CertificateCard certificate={baseCertificate} />);

    const credentialLink = screen.getByRole('link', {
      name: /https:\/\/credentials\.carbonjar\.com\/certificates\/lca-foundations-jane-doe/i,
    });

    expect(credentialLink).toBeInTheDocument();
    expect(credentialLink).toHaveAttribute(
      'href',
      'https://credentials.carbonjar.com/certificates/lca-foundations-jane-doe',
    );
  });

  it('injects the credential url into the LinkedIn add-to-profile link', () => {
    render(<CertificateCard certificate={baseCertificate} />);

    const linkedInButton = screen.getByRole('link', { name: /add to linkedin/i });
    const href = linkedInButton.getAttribute('href');
    expect(href).toBeTruthy();

    const url = new URL(href ?? '');
    expect(url.hostname).toBe('www.linkedin.com');
    expect(url.searchParams.get('certUrl')).toBe(
      'https://credentials.carbonjar.com/certificates/lca-foundations-jane-doe',
    );
    expect(url.searchParams.get('certId')).toBe('LCA-1234');
  });
});
