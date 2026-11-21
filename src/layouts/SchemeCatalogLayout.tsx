import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/store/useLanguageStore';
import { loadSchemeCatalog, useSchemeStore } from '@/store/useSchemeStore';

export function SchemeCatalogLayout() {
  const { catalogStatus } = useSchemeStore();
  const { pick, getFontClass } = useLanguage();

  useEffect(() => {
    if (catalogStatus === 'idle') void loadSchemeCatalog();
  }, [catalogStatus]);

  if (catalogStatus === 'ready') return <Outlet />;

  if (catalogStatus === 'error') {
    return (
      <div className={`px-4 py-12 text-center space-y-4 ${getFontClass()}`}>
        <h1 role="alert" className="text-xl font-bold text-body">
          {pick(
            'The scheme catalog is temporarily unavailable.',
            'పథకాల జాబితా తాత్కాలికంగా అందుబాటులో లేదు.',
            'योजनाओं की सूची अभी उपलब्ध नहीं है।'
          )}
        </h1>
        <Button onClick={() => void loadSchemeCatalog()}>
          {pick('Try again', 'మళ్లీ ప్రయత్నించండి', 'फिर से कोशिश करें')}
        </Button>
      </div>
    );
  }

  return (
    <div role="status" className={`px-4 py-12 text-center text-muted ${getFontClass()}`}>
      {pick('Loading schemes…', 'పథకాలు లోడ్ అవుతున్నాయి…', 'योजनाएँ लोड हो रही हैं…')}
    </div>
  );
}
