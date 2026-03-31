import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Settings, MessageSquare, Activity, Save, RefreshCw } from 'lucide-react';
import { fetchConfig, saveConfig, fetchStatus } from './api';
import type { MineAIConfig } from './api';

function Sidebar() {
  const loc = useLocation();
  return (
    <div className="sidebar">
      <div className="sidebar-title">
        🌹 mineAI
      </div>
      <Link to="/" className={`nav-item ${loc.pathname === '/' ? 'active' : ''}`}>
        <Activity size={20} /> Status
      </Link>
      <Link to="/config" className={`nav-item ${loc.pathname === '/config' ? 'active' : ''}`}>
        <Settings size={20} /> Config
      </Link>
      <Link to="/prompt" className={`nav-item ${loc.pathname === '/prompt' ? 'active' : ''}`}>
        <MessageSquare size={20} /> Prompt Engine
      </Link>
    </div>
  );
}

function StatusBadge({ running }: { running: boolean }) {
  if (running) {
    return (
      <div className="status-badge">
        <div className="status-indicator" /> Online
      </div>
    );
  }
  return (
    <div className="status-badge offline">
      <div className="status-indicator" /> Offline
    </div>
  );
}

function HomePage() {
  const [status, setStatus] = useState(false);
  const [config, setConfig] = useState<MineAIConfig | null>(null);

  useEffect(() => {
    fetchStatus().then(s => setStatus(s.running)).catch(() => setStatus(false));
    fetchConfig().then(c => setConfig(c)).catch(console.error);
    const interval = setInterval(() => {
       fetchStatus().then(s => setStatus(s.running));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel">
      <h1 className="page-title">Bot Dashboard</h1>
      <div className="grid-2">
        <div>
          <h2 className="section-title">Connection Status</h2>
          <div style={{ marginBottom: '1rem' }}>
            <StatusBadge running={status} />
          </div>
          <p style={{ color: 'var(--text-muted)' }}>
            The mineAI local daemon is {status ? 'currently running and active.' : 'offline. Please run "mineai start -d" in your terminal.'}
          </p>
        </div>
        <div>
          <h2 className="section-title">Current Profile</h2>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
              <span className="form-label">Active Provider</span>
              <div>{config?.llm.provider.toUpperCase() || 'Loading...'}</div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <span className="form-label">Target Server</span>
              <div>{config ? `${config.minecraft.host}:${config.minecraft.port}` : '...'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfigPage() {
  const [config, setConfig] = useState<MineAIConfig | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig().then(setConfig).catch(console.error);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setSaving(true);
    try {
      await saveConfig(config);
      alert('Config saved! The bot will automatically restart in the background to apply changes.');
    } catch(err) {
      alert('Failed to save configuration.');
    } finally {
      setSaving(false);
    }
  };

  if (!config) return <div className="glass-panel">Loading configuration...</div>;

  return (
    <div className="glass-panel">
      <h1 className="page-title"><Settings size={28} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }}/> AI & Server Config</h1>
      <form onSubmit={handleSave}>
        <div className="grid-2">
          <div>
            <h2 className="section-title">LLM Credentials</h2>
            <div className="form-group">
              <label className="form-label">AI Provider</label>
              <select className="form-select" value={config.llm.provider} onChange={e => setConfig({...config, llm: {...config.llm, provider: e.target.value}} as MineAIConfig)}>
                <option value="groq">Groq (Recommended)</option>
                <option value="openai">OpenAI</option>
                <option value="gemini">Google Gemini</option>
                <option value="anthropic">Anthropic</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Model Name</label>
              <input type="text" className="form-input" value={config.llm.model} onChange={e => setConfig({...config, llm: {...config.llm, model: e.target.value}})} required />
            </div>
            <div className="form-group">
              <label className="form-label">API Key</label>
              <input type="password" placeholder="sk-..." className="form-input" value={config.llm.api_key} onChange={e => setConfig({...config, llm: {...config.llm, api_key: e.target.value}})} />
            </div>
          </div>
          <div>
            <h2 className="section-title">Minecraft Server</h2>
            <div className="form-group">
              <label className="form-label">Server IP / Host</label>
              <input type="text" className="form-input" value={config.minecraft.host} onChange={e => setConfig({...config, minecraft: {...config.minecraft, host: e.target.value}})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Server Port</label>
              <input type="number" className="form-input" value={config.minecraft.port} onChange={e => setConfig({...config, minecraft: {...config.minecraft, port: parseInt(e.target.value, 10)}})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Bot Username</label>
              <input type="text" className="form-input" value={config.minecraft.username} onChange={e => setConfig({...config, minecraft: {...config.minecraft, username: e.target.value}})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Auth Mode</label>
              <select className="form-select" value={config.minecraft.auth} onChange={e => setConfig({...config, minecraft: {...config.minecraft, auth: e.target.value as "offline" | "microsoft"}})}>
                <option value="offline">Offline / Cracked</option>
                <option value="microsoft">Microsoft Account</option>
              </select>
            </div>
          </div>
        </div>
        <div style={{ marginTop: '2rem', textAlign: 'right' }}>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />} 
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
}

function PromptPage() {
  const [config, setConfig] = useState<MineAIConfig | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig().then(setConfig).catch(console.error);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setSaving(true);
    try {
      await saveConfig(config);
      alert('Prompt updated! The agent has automatically restarted in the background.');
    } catch(err) {
      alert('Failed to save prompt.');
    } finally {
      setSaving(false);
    }
  };

  if (!config) return <div className="glass-panel">Loading...</div>;

  return (
    <div className="glass-panel">
      <h1 className="page-title"><MessageSquare size={28} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }}/> Agent Personality</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
        Configure how your mineAI bot behaves when triggered by the word "rose". 
        The system continuously updates the LLM context with current coordinates, health, and nearby blocks.
      </p>
      <form onSubmit={handleSave}>
        <div className="form-group">
          <label className="form-label">System Prompt</label>
          <textarea 
            className="form-textarea" 
            value={config.llm.systemPrompt || ''} 
            onChange={e => setConfig({...config, llm: {...config.llm, systemPrompt: e.target.value}})} 
            placeholder="You are mineAI, an intelligent Minecraft agent..."
            required 
          />
        </div>
        <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />} 
            {saving ? 'Updating Brain...' : 'Save Prompt'}
          </button>
        </div>
      </form>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/config" element={<ConfigPage />} />
            <Route path="/prompt" element={<PromptPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
