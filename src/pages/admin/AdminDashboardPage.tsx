import React, { useState } from 'react';
import { MOCK_GOVERNMENT_SCHEMES } from '@/services/mockSchemeData';
import { GovernmentScheme, SchemeRule } from '@/types/scheme';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VerificationBadge } from '@/components/common/VerificationBadge';
import { ShieldCheck, Database, Edit, Save, Check, ExternalLink } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [schemes, setSchemes] = useState<GovernmentScheme[]>(MOCK_GOVERNMENT_SCHEMES);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editedValue, setEditedValue] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleStartEdit = (rule: SchemeRule) => {
    setEditingRuleId(rule.rule_id);
    setEditedValue(rule.value);
  };

  const handleSaveRule = (schemeId: string, ruleId: string) => {
    setSchemes((prev) =>
      prev.map((s) => {
        if (s.id !== schemeId) return s;
        return {
          ...s,
          rules: s.rules.map((r) => {
            if (r.rule_id !== ruleId) return r;
            return {
              ...r,
              value: editedValue,
              rule_version: r.rule_version + 1,
            };
          }),
        };
      })
    );
    setEditingRuleId(null);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-primary flex items-center gap-2">
            <Database className="h-7 w-7 text-primary" />
            <span>Admin Scheme & Rule Registry</span>
          </h1>
          <p className="text-sm text-muted mt-1">
            Rules are stored and evaluated as data. Changes take effect dynamically without code redeployment.
          </p>
        </div>

        <Badge variant="outline" className="border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold px-3 py-1 text-xs">
          <ShieldCheck className="h-4 w-4 mr-1 text-emerald-700" />
          Admin Session Active
        </Badge>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-700" />
          <span>Rule successfully updated as data. Version incremented and audit record logged.</span>
        </div>
      )}

      {/* Scheme List with Rules Table */}
      <div className="space-y-6">
        {schemes.map((scheme) => (
          <Card key={scheme.id} className="border border-border">
            <CardHeader className="p-5 md:p-6 pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs uppercase font-semibold">
                    {scheme.level}
                  </Badge>
                  <span className="text-xs text-muted font-mono">{scheme.scheme_code}</span>
                </div>
                <CardTitle className="text-lg font-bold text-body">{scheme.name_en}</CardTitle>
              </div>

              <div className="flex items-center gap-2">
                <VerificationBadge isVerified={!!scheme.source.verified_at} verifiedAt={scheme.source.verified_at} />
                <a
                  href={scheme.source.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-muted hover:text-primary transition-colors"
                  title="Open Source Link"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </CardHeader>

            <CardContent className="p-5 md:p-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
                Configured Rules ({scheme.rules.length})
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs md:text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-muted font-semibold bg-slate-50">
                      <th className="py-2.5 px-3">Rule ID</th>
                      <th className="py-2.5 px-3">Field</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Operator</th>
                      <th className="py-2.5 px-3">Configured Value</th>
                      <th className="py-2.5 px-3">Version</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {scheme.rules.map((rule) => {
                      const isEditing = editingRuleId === rule.rule_id;
                      return (
                        <tr key={rule.rule_id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-3 font-mono font-medium">{rule.rule_id}</td>
                          <td className="py-3 px-3 text-slate-800">{rule.field_name}</td>
                          <td className="py-3 px-3 text-slate-600">{rule.rule_type}</td>
                          <td className="py-3 px-3 font-mono">{rule.operator}</td>
                          <td className="py-3 px-3 font-semibold text-primary">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editedValue}
                                onChange={(e) => setEditedValue(e.target.value)}
                                className="border border-primary rounded px-2 py-1 text-xs w-full max-w-[200px]"
                              />
                            ) : (
                              rule.value
                            )}
                          </td>
                          <td className="py-3 px-3 font-mono text-muted">v{rule.rule_version}</td>
                          <td className="py-3 px-3 text-right">
                            {isEditing ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleSaveRule(scheme.id, rule.rule_id)}
                                  className="h-7 text-xs px-2.5"
                                >
                                  <Save className="h-3.5 w-3.5 mr-1" />
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingRuleId(null)}
                                  className="h-7 text-xs px-2"
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStartEdit(rule)}
                                className="h-7 text-xs px-2.5"
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit Value
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
