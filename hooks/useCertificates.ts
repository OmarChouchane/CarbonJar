import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import type { Certificate } from '@/types/certificate';

interface UseCertificatesReturn {
  certificates: Certificate[];
  loading: boolean;
  error: string | null;
  refetchCertificates: () => Promise<void>;
  generateTestData: () => Promise<void>;
}

export function useCertificates(): UseCertificatesReturn {
  const { user, isLoaded } = useUser();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/certificates', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch certificates: ${response.statusText}`);
      }

      const data = await response.json();
      setCertificates(data.data || []);
    } catch (err) {
      console.error('Error fetching certificates:', err);
      setError(err instanceof Error ? err.message : 'Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const generateTestData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/certificates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to generate test data: ${response.statusText}`);
      }

      // Refresh the certificates list
      await fetchCertificates();
    } catch (err) {
      console.error('Error generating test data:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate test data');
    }
  };

  useEffect(() => {
    if (isLoaded && user) {
      fetchCertificates();
    }
  }, [isLoaded, user]);

  return {
    certificates,
    loading,
    error,
    refetchCertificates: fetchCertificates,
    generateTestData,
  };
}
