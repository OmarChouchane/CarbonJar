export const dynamic = 'force-static';

export default function ApiDocsPage() {
  return (
    <iframe
      title="CarbonJar API Docs"
      src="/swagger.html?url=/openapi.yml"
      style={{ width: '100%', height: '100vh', border: '0' }}
    />
  );
}
