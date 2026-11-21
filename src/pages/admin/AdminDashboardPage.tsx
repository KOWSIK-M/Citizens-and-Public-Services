import React, { useEffect, useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSchemeStore } from '@/store/useSchemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { RuleOperator, SchemeRule } from '@/types/scheme';
import { evaluateDeterministicEligibility } from '@/services/deterministicEngine';
import { SYNTHETIC_SCENARIOS } from '@/config/constants';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VerificationBadge } from '@/components/common/VerificationBadge';
import { ROUTES } from '@/config/routes';
import {
  ShieldCheck,
  Database,
  Edit,
  Save,
  Check,
  ExternalLink,
  RotateCcw,
  Lock,
  LogOut,
  History,
  FlaskConical,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const OPERATORS: RuleOperator[] = ['eq', 'neq', 'in', 'lte', 'gte', 'between'];

export const AdminDashboardPage: React.FC = () => {
  const {
    schemes,
    auditLog,
    reloadCatalog,
    loadAdminAuditLog,
    updateRule,
    verifySchemeSource,
    markSourcePending,
    toggleSchemePublished,
  } = useSchemeStore();
  const { isAdmin, user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editedOperator, setEditedOperator] = useState<RuleOperator>('eq');
  const [editedValue, setEditedValue] = useState<string>('');
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [showSimulator, setShowSimulator] = useState(true);

  const currentTab = location.pathname.endsWith('/audit-log') ? 'audit' : 'schemes';

  useEffect(() => {
    if (isAdmin) {
      void reloadCatalog({ force: true, includeUnpublished: true });
      void loadAdminAuditLog();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const flashBanner = (msg: string) => {
    setStatusBanner(msg);
    setTimeout(() => setStatusBanner(null), 3500);
  };

  // --- JWT RBAC Authorization Gate ---
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-14 px-4">
        <Card className="border border-border shadow-md bg-white">
          <CardHeader className="p-6 pb-3 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <Lock className="h-6 w-6" aria-hidden="true" />
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-primary">
              Admin Authorization Required
            </h1>
            <p className="text-sm text-muted">
              This Governance Studio writes directly to Neon PostgreSQL and requires a JWT account with <strong>admin</strong> role authorization.
            </p>
          </CardHeader>
          <CardContent className="p-6 pt-3 text-center space-y-3">
            <Button
              type="button"
              onClick={() => navigate(ROUTES.AUTH)}
              className="w-full min-h-[44px] font-bold"
            >
              Sign In with Admin JWT Account
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(ROUTES.HOME)}
              className="w-full min-h-[44px]"
            >
              Return to Citizen Portal
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleStartEdit = (rule: SchemeRule) => {
    setEditingRuleId(rule.rule_id);
    setEditedOperator(rule.operator);
    setEditedValue(rule.value);
  };

  const handleSaveRule = (schemeId: string, ruleId: string) => {
    updateRule(schemeId, ruleId, { operator: editedOperator, value: editedValue });
    setEditingRuleId(null);
    flashBanner(
      `Rule ${ruleId} saved as live data! Active citizen results & Scheme Detail pages updated immediately without redeploy.`
    );
  };

  // Compute live synthetic persona outcomes against current live `schemes`
  const personaMatrix = SYNTHETIC_SCENARIOS.map((sc) => {
    const evalRes = evaluateDeterministicEligibility(sc.profile, schemes);
    return {
      scenario: sc,
      likelyIds: new Set(evalRes.results.likely_eligible.map((r) => r.scheme_id)),
      needsInfoIds: new Set(evalRes.results.needs_more_info.map((r) => r.scheme_id)),
      totalDbt: evalRes.summary_metrics.total_annual_dbt_inr,
    };
  });

  return (
    <div className="max-w-6xl mx-auto py-8 md:py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Studio Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-primary flex items-center gap-2">
            <Database className="h-7 w-7 text-primary shrink-0" aria-hidden="true" />
            <span>Admin Scheme & Rule Governance Studio</span>
          </h1>
          <p className="text-sm text-muted mt-1">
            Rules & G.O. verifications are stored in the shared reactive registry. Edits propagate immediately to citizen eligibility results.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="success" className="font-semibold px-3 py-1.5 text-sm">
            <ShieldCheck className="h-4 w-4 mr-1.5" aria-hidden="true" />
            Admin JWT: {user?.display_name}
          </Badge>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowSimulator(!showSimulator)}
            className="min-h-[44px] bg-white text-sm inline-flex items-center gap-1.5"
          >
            <FlaskConical className="h-4 w-4 text-primary" aria-hidden="true" />
            <span>{showSimulator ? 'Hide Persona Simulator' : 'Show Persona Simulator'}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              void reloadCatalog({ force: true, includeUnpublished: true });
              void loadAdminAuditLog();
              flashBanner('Refreshed live schemes & audit log from Neon PostgreSQL.');
            }}
            className="min-h-[44px] bg-white text-sm inline-flex items-center gap-1.5"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>Sync Neon</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={async () => {
              await logout();
              navigate(ROUTES.HOME);
            }}
            className="min-h-[44px] text-sm text-slate-700"
          >
            <LogOut className="h-4 w-4 mr-1" aria-hidden="true" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>

      {statusBanner && (
        <div
          role="status"
          aria-live="polite"
          className="bg-emerald-50 border-2 border-emerald-400 text-emerald-950 px-4 py-3 rounded-lg text-sm font-semibold flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-emerald-700 shrink-0" aria-hidden="true" />
            <span>{statusBanner}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(ROUTES.RESULTS)}
            className="min-h-[40px] bg-white text-emerald-900 border-emerald-400 shrink-0"
          >
            View Live Citizen Results →
          </Button>
        </div>
      )}

      {/* Synthetic Persona Regression & Impact Simulator */}
      {showSimulator && (
        <Card className="border-2 border-primary/25 bg-blue-50/40 shadow-sm">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-base md:text-lg font-bold text-primary flex items-center gap-2">
              <FlaskConical className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span>Live Synthetic Persona Regression Matrix (Updates Automatically on Rule Save)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0 grid grid-cols-1 md:grid-cols-3 gap-4">
            {personaMatrix.map(({ scenario, likelyIds, needsInfoIds, totalDbt }) => (
              <div
                key={scenario.id}
                className="rounded-lg border border-slate-300 bg-white p-4 space-y-2"
              >
                <div className="font-bold text-sm text-body">{scenario.title_en}</div>
                <div className="text-sm font-extrabold text-emerald-800">
                  {likelyIds.size} Likely Eligible • ₹{totalDbt.toLocaleString('en-IN')}/yr DBT
                </div>
                <div className="text-sm text-muted">
                  {needsInfoIds.size} Pending Verify / Need Info
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Tabs: Scheme Rules vs Append-Only Audit Log */}
      <Tabs.Root
        value={currentTab}
        onValueChange={(val) =>
          navigate(val === 'audit' ? ROUTES.ADMIN_AUDIT_LOG : ROUTES.ADMIN, { replace: true })
        }
        className="space-y-6"
      >
        <Tabs.List
          aria-label="Admin Governance Views"
          className="flex items-center gap-2 border-b border-slate-200 pb-1"
        >
          <Tabs.Trigger
            value="schemes"
            className="min-h-[44px] px-4 py-2 text-sm font-bold rounded-t-md border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=inactive]:border-transparent data-[state=inactive]:text-muted"
          >
            Editable Scheme Rules ({schemes.length})
          </Tabs.Trigger>
          <Tabs.Trigger
            value="audit"
            className="min-h-[44px] px-4 py-2 text-sm font-bold rounded-t-md border-b-2 inline-flex items-center gap-1.5 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=inactive]:border-transparent data-[state=inactive]:text-muted"
          >
            <History className="h-4 w-4" aria-hidden="true" />
            <span>Append-Only Audit Log ({auditLog.length})</span>
          </Tabs.Trigger>
        </Tabs.List>

        {/* Tab 1: Editable Scheme Rules */}
        <Tabs.Content value="schemes" className="space-y-6 focus:outline-none">
          {schemes.map((scheme) => {
            const isVerified = Boolean(scheme.source.verified_at);
            return (
              <Card key={scheme.id} className="border border-border bg-white shadow-sm">
                <CardHeader className="p-5 md:p-6 pb-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-sm font-semibold">
                        {scheme.level.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-muted font-mono">{scheme.scheme_code}</span>
                      {!scheme.is_published && (
                        <Badge variant="danger" className="text-sm">Hidden Draft</Badge>
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-body">{scheme.name_en}</h2>
                    {scheme.source.go_reference && (
                      <p className="text-sm text-muted mt-0.5">{scheme.source.go_reference}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <VerificationBadge
                      isVerified={isVerified}
                      verifiedAt={scheme.source.verified_at}
                    />

                    {isVerified ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          markSourcePending(scheme.id);
                          flashBanner(
                            `Marked ${scheme.scheme_code} as PENDING VERIFICATION. FR-09 guardrail now withholds Likely Eligible status.`
                          );
                        }}
                        className="min-h-[44px] text-sm bg-white border-amber-400 text-amber-900 hover:bg-amber-50 inline-flex items-center gap-1"
                      >
                        <AlertCircle className="h-4 w-4" aria-hidden="true" />
                        <span>Mark Pending Verify</span>
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="default"
                        onClick={() => {
                          verifySchemeSource(scheme.id, 'AP Welfare Verifier (Live Demo)');
                          flashBanner(
                            `Verified ${scheme.scheme_code} primary G.O. source! Matching citizens now promote to Likely Eligible.`
                          );
                        }}
                        className="min-h-[44px] text-sm bg-emerald-700 hover:bg-emerald-800 text-white inline-flex items-center gap-1"
                      >
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        <span>Verify G.O. Source Today</span>
                      </Button>
                    )}

                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleSchemePublished(scheme.id)}
                      className="min-h-[44px] text-sm"
                    >
                      {scheme.is_published ? 'Unpublish' : 'Publish'}
                    </Button>

                    <a
                      href={scheme.source.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-muted hover:text-primary transition-colors rounded border border-slate-200"
                      aria-label={`Open official source for ${scheme.name_en}`}
                    >
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </div>
                </CardHeader>

                <CardContent className="p-5 md:p-6">
                  <h3 className="text-sm font-bold text-slate-700 mb-3">
                    Configured Deterministic Rules ({scheme.rules.length})
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-700 font-semibold bg-slate-50">
                          <th className="py-2.5 px-3">Rule ID</th>
                          <th className="py-2.5 px-3">Field</th>
                          <th className="py-2.5 px-3">OR-Group</th>
                          <th className="py-2.5 px-3">Operator</th>
                          <th className="py-2.5 px-3">Configured Value</th>
                          <th className="py-2.5 px-3">Version</th>
                          <th className="py-2.5 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {scheme.rules.map((rule) => {
                          const isEditing = editingRuleId === rule.rule_id;
                          return (
                            <tr key={rule.rule_id} className="hover:bg-slate-50/70">
                              <td className="py-3 px-3 font-mono font-medium">{rule.rule_id}</td>
                              <td className="py-3 px-3 text-slate-800">{rule.field_name}</td>
                              <td className="py-3 px-3 text-slate-600 font-mono">
                                {rule.condition_group || 'AND'}
                              </td>
                              <td className="py-3 px-3 font-mono">
                                {isEditing ? (
                                  <select
                                    aria-label={`Operator for ${rule.rule_id}`}
                                    value={editedOperator}
                                    onChange={(e) => setEditedOperator(e.target.value as RuleOperator)}
                                    className="min-h-[44px] border border-slate-500 rounded px-2 py-1 text-sm bg-white"
                                  >
                                    {OPERATORS.map((op) => (
                                      <option key={op} value={op}>
                                        {op}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  rule.operator
                                )}
                              </td>
                              <td className="py-3 px-3 font-semibold text-primary">
                                {isEditing ? (
                                  <Input
                                    type="text"
                                    aria-label={`Rule value for ${rule.rule_id}`}
                                    value={editedValue}
                                    onChange={(e) => setEditedValue(e.target.value)}
                                    className="max-w-[240px]"
                                  />
                                ) : (
                                  rule.value
                                )}
                              </td>
                              <td className="py-3 px-3 font-mono text-muted">v{rule.rule_version}</td>
                              <td className="py-3 px-3 text-right">
                                {isEditing ? (
                                  <div className="flex items-center justify-end gap-2">
                                    <Button
                                      size="sm"
                                      variant="default"
                                      onClick={() => handleSaveRule(scheme.id, rule.rule_id)}
                                      className="min-h-[44px] text-sm px-3"
                                    >
                                      <Save className="h-4 w-4 mr-1" aria-hidden="true" />
                                      Save
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setEditingRuleId(null)}
                                      className="min-h-[44px] text-sm px-3"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleStartEdit(rule)}
                                    className="min-h-[44px] text-sm px-3 bg-white"
                                  >
                                    <Edit className="h-4 w-4 mr-1" aria-hidden="true" />
                                    Edit Rule
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
            );
          })}
        </Tabs.Content>

        {/* Tab 2: Append-Only Audit Log */}
        <Tabs.Content value="audit" className="focus:outline-none">
          <Card className="border border-border bg-white shadow-sm">
            <CardHeader className="p-6 pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-body">
                Immutable Governance Audit Trail ({auditLog.length} Records)
              </h2>
            </CardHeader>
            <CardContent className="p-6 overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-700">
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Actor</th>
                    <th className="py-2.5 px-3">Scheme / Rule</th>
                    <th className="py-2.5 px-3">Previous → New Value</th>
                    <th className="py-2.5 px-3">Citation / Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {auditLog.map((entry) => (
                    <tr key={entry.id}>
                      <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                        {entry.timestamp.replace('T', ' ').slice(0, 19)}
                      </td>
                      <td className="py-3 px-3 font-medium text-body">{entry.actor}</td>
                      <td className="py-3 px-3 font-mono">
                        {entry.scheme_code}
                        {entry.rule_id ? ` • ${entry.rule_id}` : ''}
                      </td>
                      <td className="py-3 px-3">
                        <span className="line-through text-muted mr-1.5">{entry.previous_value}</span>
                        <span className="font-bold text-primary">→ {entry.new_value}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-700">{entry.source_note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
};
