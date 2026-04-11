import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Stack, Paper, Button, TextField, Switch,
  FormControlLabel, CircularProgress, Chip, Tooltip, Divider,
  InputAdornment, IconButton, Alert, Fade,
  Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import {
  SmartToy as AIIcon,
  CheckCircle as CheckIcon,
  Cancel as ErrorIcon,
  Visibility as ShowIcon,
  VisibilityOff as HideIcon,
  Save as SaveIcon,
  WifiTethering as TestIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchAISettings,
  updateAISettings,
  testAIConnection,
  clearAIError,
  clearTestResult,
} from '../../store/slices/aiSlice';
import {
  PROVIDER_META,
  AI_SETTING_KEYS,
  SECRET_MASK,
} from '../../constants/ai';

// ── Main Component ─────────────────────────────────────────────────────────────

const AIEngineSection: React.FC = () => {
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();

  // Redux State
  const { settings: data, loading, saving, testing, error, testResult } = useAppSelector((state) => state.ai);

  // Local editable state for form fields
  const [enabled, setEnabled] = useState(false);
  const [activeProvider, setActiveProvider] = useState('gemini');
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [modelOverride, setModelOverride] = useState('');
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState('llama3.1');

  // ── Load ──────────────────────────────────────────────────────────────────────
  const loadSettings = useCallback(() => {
    dispatch(fetchAISettings());
  }, [dispatch]);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  // Sync redux settings to local form state on load
  useEffect(() => {
    if (data) {
      const settingMap: Record<string, string | null> = {};
      data.settings.forEach(s => { settingMap[s.key] = s.value; });

      setEnabled(settingMap[AI_SETTING_KEYS.ENABLED] === 'true');
      setActiveProvider(data.active_provider || 'gemini');
      setModelOverride(settingMap[AI_SETTING_KEYS.MODEL_OVERRIDE] || '');
      setOllamaUrl(settingMap[AI_SETTING_KEYS.OLLAMA_URL] || 'http://localhost:11434');
      setOllamaModel(settingMap[AI_SETTING_KEYS.OLLAMA_MODEL] || 'llama3.1');
    }
  }, [data]);

  // Error handling
  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
      dispatch(clearAIError());
    }
  }, [error, enqueueSnackbar, dispatch]);

  // ── Save ──────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const payload: Record<string, string> = {
      [AI_SETTING_KEYS.ENABLED]: enabled ? 'true' : 'false',
      [AI_SETTING_KEYS.PROVIDER]: activeProvider,
      [AI_SETTING_KEYS.MODEL_OVERRIDE]: modelOverride,
      [AI_SETTING_KEYS.OLLAMA_URL]: ollamaUrl,
      [AI_SETTING_KEYS.OLLAMA_MODEL]: ollamaModel,
    };

    // Add API keys only if user typed something new (not masked)
    Object.entries(apiKeys).forEach(([key, val]) => {
      if (val && val !== SECRET_MASK) {
        payload[key] = val;
      }
    });

    const result = await dispatch(updateAISettings(payload));
    if (updateAISettings.fulfilled.match(result)) {
      enqueueSnackbar('AI Engine settings saved successfully', { variant: 'success' });
      setApiKeys({}); // Clear local keys after save
      loadSettings(); // Refresh from backend
    }
  };

  // ── Test Connection ────────────────────────────────────────────────────────────
  const handleTest = async (providerName: string) => {
    dispatch(clearTestResult());
    const keyName = getKeyName(providerName);
    const localKey = keyName ? apiKeys[keyName] : undefined;

    const result = await dispatch(testAIConnection({ provider: providerName, apiKey: localKey }));
    if (testAIConnection.fulfilled.match(result)) {
      const res = result.payload;
      enqueueSnackbar(
        res.success ? `${PROVIDER_META[providerName]?.label} connected!` : res.message,
        { variant: res.success ? 'success' : 'error' }
      );
    }
  };

  const getKeyName = (provider: string): string | null => {
    switch (provider) {
      case 'gemini': return AI_SETTING_KEYS.GEMINI_KEY;
      case 'openai': return AI_SETTING_KEYS.OPENAI_KEY;
      case 'anthropic': return AI_SETTING_KEYS.ANTHROPIC_KEY;
      case 'groq': return AI_SETTING_KEYS.GROQ_KEY;
      case 'mistral': return AI_SETTING_KEYS.MISTRAL_KEY;
      case 'together': return AI_SETTING_KEYS.TOGETHER_KEY;
      case 'cohere': return AI_SETTING_KEYS.COHERE_KEY;
      default: return null;
    }
  };

  const isKeySet = (providerName: string): boolean => {
    const keyName = getKeyName(providerName);
    if (!keyName) return true; // Ollama needs no key
    const setting = data?.settings.find(s => s.key === keyName);
    return setting?.is_set === true || (!!apiKeys[keyName] && apiKeys[keyName] !== SECRET_MASK);
  };

  if (loading && !data) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 12, gap: 2 }}>
        <CircularProgress size={36} thickness={4} />
        <Typography variant="body2" sx={{ color: '#64748b' }}>Loading AI Engine settings...</Typography>
      </Box>
    );
  }

  const meta = PROVIDER_META[activeProvider] || PROVIDER_META.gemini;
  const activeKeyName = getKeyName(activeProvider);

  return (
    <Box>
      {/* ── Header ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, pb: 3, borderBottom: '1px solid #f2f3f3' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 40, height: 40, bgcolor: '#f1f0ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AIIcon sx={{ color: '#6366f1', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1c21' }}>AI Engine</Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Connect an LLM provider to enable intelligent automation
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {loading && data && <CircularProgress size={20} sx={{ mt: 1 }} />}
          <Button
            variant="contained"
            disableElevation
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
            onClick={handleSave}
            disabled={saving || loading}
            id="ai-settings-save-btn"
            sx={{ bgcolor: '#6366f1', borderRadius: '6px', textTransform: 'none', fontWeight: 600, px: 3, '&:hover': { bgcolor: '#4f46e5' } }}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </Box>
      </Box>

      <Stack spacing={4}>

        {/* ── Enable Toggle ── */}
        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: enabled ? '#6366f1' : '#e2e8f0', borderRadius: '10px', bgcolor: enabled ? '#f5f3ff' : '#fff', transition: 'all 0.2s' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b' }}>Enable AI Engine</Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
                When enabled, the AI engine can automate tasks like creating leads from WhatsApp enquiries,
                parsing JDs, and scheduling interviews.
              </Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={enabled}
                  onChange={e => setEnabled(e.target.checked)}
                  id="ai-engine-toggle"
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: '#6366f1' },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#6366f1' },
                  }}
                />
              }
              label=""
              sx={{ m: 0 }}
            />
          </Box>
          {enabled && (
            <Fade in>
              <Alert severity="info" sx={{ mt: 2, borderRadius: '8px', '& .MuiAlert-icon': { color: '#6366f1' } }}>
                AI Engine is <strong>active</strong>. Select a provider and enter your API key below.
              </Alert>
            </Fade>
          )}
        </Paper>

        {/* ── Provider Selection ── */}
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b', mb: 2 }}>
            Choose LLM Provider
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 2 }}>
            {Object.entries(PROVIDER_META).map(([providerName, pm]) => {
              const isActive = activeProvider === providerName;
              const keyConfigured = isKeySet(providerName);

              return (
                <Paper
                  key={providerName}
                  elevation={0}
                  onClick={() => setActiveProvider(providerName)}
                  id={`provider-card-${providerName}`}
                  sx={{
                    p: 2,
                    borderRadius: '10px',
                    border: '2px solid',
                    borderColor: isActive ? pm.borderColor : '#e2e8f0',
                    bgcolor: isActive ? pm.bgColor : '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': { borderColor: pm.borderColor, transform: 'translateY(-1px)', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' },
                  }}
                >
                  {isActive && (
                    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, bgcolor: pm.borderColor }} />
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ color: pm.color }}>
                      {pm.icon}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {keyConfigured && providerName !== 'ollama' && (
                        <Tooltip title="API key configured">
                          <CheckIcon sx={{ color: '#10a37f', fontSize: 16 }} />
                        </Tooltip>
                      )}
                    </Box>
                  </Box>

                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>{pm.label}</Typography>

                  <Box sx={{ mt: 1 }}>
                    <Chip
                      label={pm.badge}
                      size="small"
                      sx={{ bgcolor: pm.bgColor, color: pm.badgeColor, fontWeight: 600, fontSize: '0.65rem', height: 20, border: `1px solid ${pm.borderColor}` }}
                    />
                  </Box>
                </Paper>
              );
            })}
          </Box>
        </Box>

        {/* ── Active Provider Configuration ── */}
        <Paper elevation={0} sx={{ p: 3, border: `1px solid ${meta.borderColor}`, borderRadius: '10px', bgcolor: '#fff' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Box sx={{ color: meta.color }}>{meta.icon}</Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b' }}>
                {meta.label} Configuration
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Get your API key from{' '}
                <a href={meta.docsUrl} target="_blank" rel="noopener noreferrer" style={{ color: meta.color }}>
                  {meta.docsUrl}
                </a>
              </Typography>
            </Box>
          </Box>

          <Stack spacing={3}>
            {/* API Key Input */}
            {activeProvider === 'ollama' ? (
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Ollama Server URL"
                  value={ollamaUrl}
                  onChange={e => setOllamaUrl(e.target.value)}
                  placeholder="http://localhost:11434"
                  helperText="The URL where your Ollama server is running"
                  id="ollama-url-input"
                  sx={{ '& .MuiInputBase-root': { borderRadius: '8px' } }}
                />
                <TextField
                  fullWidth
                  label="Model Name"
                  value={ollamaModel}
                  onChange={e => setOllamaModel(e.target.value)}
                  placeholder="llama3.1"
                  id="ollama-model-input"
                  sx={{ '& .MuiInputBase-root': { borderRadius: '8px' } }}
                />
              </Stack>
            ) : (
              <>
                {activeKeyName && (
                  <TextField
                    fullWidth
                    label={`${meta.label} API Key`}
                    type={showKeys[activeKeyName] ? 'text' : 'password'}
                    value={apiKeys[activeKeyName] || ''}
                    onChange={e => setApiKeys(prev => ({ ...prev, [activeKeyName]: e.target.value }))}
                    placeholder={
                      isKeySet(activeProvider)
                        ? '•••••••• (key saved — enter new value to update)'
                        : meta.keyPlaceholder
                    }
                    id={`api-key-input-${activeProvider}`}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowKeys(p => ({ ...p, [activeKeyName]: !p[activeKeyName] }))}
                            size="small"
                            id={`toggle-key-visibility-${activeProvider}`}
                          >
                            {showKeys[activeKeyName] ? <HideIcon fontSize="small" /> : <ShowIcon fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    inputProps={{
                      autoComplete: 'new-password'
                    }}
                    sx={{ '& .MuiInputBase-root': { borderRadius: '8px' } }}
                    helperText={
                      isKeySet(activeProvider)
                        ? '✓ API key is configured. Leave blank to keep the current key.'
                        : 'Your key is stored securely in the database and never exposed in the UI.'
                    }
                  />
                )}

                {/* Model Override */}
                <FormControl fullWidth>
                  <InputLabel id="model-select-label">Model</InputLabel>
                  <Select
                    labelId="model-select-label"
                    value={modelOverride || meta.models[0]}
                    label="Model"
                    onChange={e => setModelOverride(e.target.value)}
                    id={`model-select-${activeProvider}`}
                    sx={{ borderRadius: '8px' }}
                  >
                    {meta.models.map(m => (
                      <MenuItem key={m} value={m}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2">{m}</Typography>
                          {m === meta.models[0] && (
                            <Chip label="Recommended" size="small" sx={{ height: 16, fontSize: '0.6rem', bgcolor: meta.bgColor, color: meta.color }} />
                          )}
                        </Box>
                      </MenuItem>
                    ))}
                    <MenuItem value="">
                      <Typography variant="body2" sx={{ color: '#64748b' }}>Use default model</Typography>
                    </MenuItem>
                  </Select>
                </FormControl>
              </>
            )}

            {/* Test Connection */}
            <Divider />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>Test Connection</Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  Verify your configuration with a quick API ping
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={testing
                  ? <CircularProgress size={14} />
                  : <TestIcon />
                }
                onClick={() => handleTest(activeProvider)}
                disabled={testing || loading}
                id={`test-connection-btn-${activeProvider}`}
                sx={{
                  borderColor: meta.borderColor,
                  color: meta.color,
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': { borderColor: meta.color, bgcolor: meta.bgColor },
                }}
              >
                {testing ? 'Testing...' : 'Test Connection'}
              </Button>
            </Box>

            {/* Test Result */}
            {testResult && (
              <Fade in>
                <Alert
                  severity={testResult.success ? 'success' : 'error'}
                  icon={testResult.success ? <CheckIcon /> : <ErrorIcon />}
                  sx={{ borderRadius: '8px' }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{testResult.message}</Typography>
                      {testResult.success && testResult.model && (
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          Model: {testResult.model}
                        </Typography>
                      )}
                    </Box>
                    {testResult.latency_ms && (
                      <Chip
                        icon={<SpeedIcon />}
                        label={`${testResult.latency_ms}ms`}
                        size="small"
                        sx={{ bgcolor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}
                      />
                    )}
                  </Box>
                </Alert>
              </Fade>
            )}
          </Stack>
        </Paper>

        {/* ── Tips ── */}
        <Paper elevation={0} sx={{ p: 3, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b', mb: 2 }}>
            Provider Recommendations
          </Typography>
          <Stack spacing={1}>
            {[
              { label: 'Development / Testing', value: 'Groq (free tier, fastest response)', color: '#7c3aed' },
              { label: 'Production (intelligent tasks)', value: 'Anthropic Claude (best reasoning)', color: '#d97706' },
              { label: 'Cost-optimized production', value: 'Google Gemini Flash (best value)', color: '#1a73e8' },
              { label: 'Privacy / On-premise', value: 'Ollama (runs locally, zero cost)', color: '#374151' },
            ].map(item => (
              <Box key={item.label} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color, mt: 0.8, flexShrink: 0 }} />
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569', display: 'block' }}>{item.label}</Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>{item.value}</Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </Paper>

      </Stack>
    </Box>
  );
};

export default AIEngineSection;
