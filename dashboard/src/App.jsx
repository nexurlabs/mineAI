import { useState, useEffect, useRef, useCallback } from 'react';

const API = '';

const BUILT_IN_PROMPT = `You are mineAI, an intelligent Minecraft bot created by NexurLabs.

Your role:
- You live inside a Minecraft server as a player.
- You respond to chat messages that mention your trigger word.
- You can perform in-game actions using tool calls: chat, goTo, and attackEntity.
- You are helpful, concise, and aware of your in-game surroundings.

Rules:
- Always use tools when a player asks you to do something in-game.
- If a player just wants to talk, respond with conversational text.
- Keep chat messages SHORT — Minecraft chat has a 256 character limit.
- Be aware of your health and hunger levels.`;

const MODELS = {
  openai: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  groq: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma2-9b-it'],
  gemini: ['gemini-2.0-flash', 'gemini-2.5-flash-preview-04-17', 'gemini-1.5-pro'],
  anthropic: ['claude-sonnet-4-20250514', 'claude-3-5-haiku-20241022'],
};

const NAV = [
  { id: 'status', label: 'Status', icon: '📊' },
  { id: 'config', label: 'Configuration', icon: '⚙️' },
  { id: 'prompts', label: 'Prompts', icon: '💬' },
  { id: 'chat', label: 'Chat Feed', icon: '💭' },
  { id: 'logs', label: 'Logs', icon: '📋' },
  { id: 'about', label: 'About', icon: 'ℹ️' },
];

function useWebSocket() {
  const [botStatus, setBotStatus] = useState(null);
  const [chatMsgs, setChatMsgs] = useState([]);
  const [logs, setLogs] = useState([]);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    function connect() {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}`);
      wsRef.current = ws;

      ws.onopen = () => setWsConnected(true);
      ws.onclose = () => {
        setWsConnected(false);
        setTimeout(connect, 3000);
      };

      ws.onmessage = (evt) => {
        try {
          const { event, data } = JSON.parse(evt.data);
          if (event === 'bot_status') setBotStatus(data);
          else if (event === 'chat') setChatMsgs(prev => [...prev.slice(-200), { ...data, time: new Date().toLocaleTimeString() }]);
          else if (event === 'log') setLogs(prev => [...prev.slice(-400), data.line]);
          else if (event === 'logs_init') setLogs(data.logs || []);
        } catch {}
      };
    }
    connect();
    return () => wsRef.current?.close();
  }, []);

  return { botStatus, chatMsgs, logs, wsConnected };
}

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return <div className={`toast ${type}`}>{message}</div>;
}

export default function App() {
  const [page, setPage] = useState('status');
  const [toast, setToast] = useState(null);
  const { botStatus, chatMsgs, logs, wsConnected } = useWebSocket();

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  return (
    <div className="app-layout">
      <nav className="sidebar">
        <div className="sidebar-brand">
          <div className="logo">🌹</div>
          <div>
            <h1>mineAI</h1>
            <span>Dashboard</span>
          </div>
        </div>
        <div className="sidebar-nav">
          {NAV.map(n => (
            <button key={n.id} className={`nav-item ${page === n.id ? 'active' : ''}`} onClick={() => setPage(n.id)}>
              <span className="icon">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </div>
        <div className="sidebar-footer">
          <a href="https://github.com/nexurlabs/mineAI" target="_blank" rel="noreferrer">GitHub</a>
          {' · '}
          <span>NexurLabs</span>
        </div>
      </nav>

      <main className="main-content">
        {page === 'status' && <StatusPage botStatus={botStatus} wsConnected={wsConnected} chatMsgs={chatMsgs} />}
        {page === 'config' && <ConfigPage showToast={showToast} />}
        {page === 'prompts' && <PromptsPage showToast={showToast} />}
        {page === 'chat' && <ChatPage chatMsgs={chatMsgs} />}
        {page === 'logs' && <LogsPage logs={logs} />}
        {page === 'about' && <AboutPage />}
      </main>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}

/* ═══ Status Page ═══ */
function StatusPage({ botStatus, wsConnected, chatMsgs }) {
  const health = botStatus?.health ?? 0;
  const food = botStatus?.food ?? 0;
  const pos = botStatus?.position;

  return (
    <>
      <div className="page-header">
        <h2>Bot Status</h2>
        <p>Live overview of your Minecraft bot</p>
      </div>

      <div className="card-grid">
        <div className={`stat-card ${wsConnected ? 'green' : 'red'}`}>
          <span className="stat-label">Connection</span>
          <span className="stat-value">{wsConnected ? 'Online' : 'Offline'}</span>
          <span className={`connection-badge ${wsConnected ? 'connected' : 'disconnected'}`}>
            <span className="dot"></span>
            {wsConnected ? 'WebSocket Connected' : 'Disconnected'}
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Username</span>
          <span className="stat-value accent" style={{ fontSize: 20, color: 'var(--accent)' }}>
            {botStatus?.username || '—'}
          </span>
        </div>

        <div className="stat-card accent">
          <span className="stat-label">Position</span>
          <span className="stat-value" style={{ fontSize: 16, fontFamily: "'JetBrains Mono', monospace" }}>
            {pos ? `${Math.floor(pos.x)}, ${Math.floor(pos.y)}, ${Math.floor(pos.z)}` : '—'}
          </span>
        </div>
      </div>

      <div className="card section-gap">
        <div className="card-title">Health &amp; Hunger</div>
        <div className="bar-container">
          <span style={{ fontSize: 18 }}>❤️</span>
          <div className="bar-track">
            <div className="bar-fill health" style={{ width: `${(health / 20) * 100}%` }}></div>
          </div>
          <span className="bar-label">{health}/20</span>
        </div>
        <div className="bar-container" style={{ marginTop: 12 }}>
          <span style={{ fontSize: 18 }}>🍗</span>
          <div className="bar-track">
            <div className="bar-fill hunger" style={{ width: `${(food / 20) * 100}%` }}></div>
          </div>
          <span className="bar-label">{food}/20</span>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Recent Chat</div>
        {chatMsgs.length === 0 ? (
          <div className="empty-state"><div className="icon">💭</div><p>No chat messages yet</p></div>
        ) : (
          <div className="chat-feed">
            {chatMsgs.slice(-10).map((m, i) => (
              <div className="chat-msg" key={i}>
                <span className="username">{m.username}</span>
                <span className="message">{m.message}</span>
                <span className="time">{m.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* ═══ Config Page ═══ */
function ConfigPage({ showToast }) {
  const [config, setConfig] = useState(null);
  const [newKey, setNewKey] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/config`).then(r => r.json()).then(setConfig).catch(() => {});
  }, []);

  const saveConfig = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success) showToast(data.message || 'Config saved!');
      else showToast(data.error || 'Save failed', 'error');
    } catch { showToast('Network error', 'error'); }
    setSaving(false);
  };

  const updateKey = async () => {
    if (!newKey.trim()) return;
    try {
      const res = await fetch(`${API}/api/config/key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: newKey }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('API key updated!');
        setNewKey('');
        fetch(`${API}/api/config`).then(r => r.json()).then(setConfig);
      } else showToast(data.error, 'error');
    } catch { showToast('Network error', 'error'); }
  };

  if (!config) return <div className="empty-state"><div className="icon">⏳</div><p>Loading config...</p></div>;

  const updateLlm = (key, val) => setConfig({ ...config, llm: { ...config.llm, [key]: val } });
  const updateMc = (key, val) => setConfig({ ...config, minecraft: { ...config.minecraft, [key]: val } });

  return (
    <>
      <div className="page-header">
        <h2>Configuration</h2>
        <p>Manage your AI provider, model, and Minecraft connection</p>
      </div>

      <div className="card section-gap">
        <div className="card-title">AI Provider</div>
        <div className="form-row">
          <div className="form-group">
            <label>Provider</label>
            <select value={config.llm.provider} onChange={e => { updateLlm('provider', e.target.value); updateLlm('model', MODELS[e.target.value]?.[0] || ''); }}>
              <option value="groq">Groq</option>
              <option value="openai">OpenAI</option>
              <option value="gemini">Google Gemini</option>
              <option value="anthropic">Anthropic</option>
            </select>
          </div>
          <div className="form-group">
            <label>Model</label>
            <select value={config.llm.model} onChange={e => updateLlm('model', e.target.value)}>
              {(MODELS[config.llm.provider] || []).map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Current API Key</label>
          <input type="text" value={config.llm.api_key} disabled style={{ opacity: 0.6 }} />
        </div>
        <div className="form-group">
          <label>New API Key</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="password" placeholder="Paste new key here..." value={newKey} onChange={e => setNewKey(e.target.value)} />
            <button className="btn btn-ghost" onClick={updateKey}>Update</button>
          </div>
        </div>
        <div className="form-group">
          <label>Trigger Word</label>
          <input type="text" value={config.llm.triggerWord || ''} onChange={e => updateLlm('triggerWord', e.target.value)} placeholder="rose" />
        </div>
      </div>

      <div className="card section-gap">
        <div className="card-title">Minecraft Server</div>
        <div className="form-row">
          <div className="form-group">
            <label>Server Host</label>
            <input type="text" value={config.minecraft.host} onChange={e => updateMc('host', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Port</label>
            <input type="number" value={config.minecraft.port} onChange={e => updateMc('port', parseInt(e.target.value) || 25565)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Bot Username</label>
            <input type="text" value={config.minecraft.username} onChange={e => updateMc('username', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Auth Mode</label>
            <select value={config.minecraft.auth} onChange={e => updateMc('auth', e.target.value)}>
              <option value="offline">Offline (LAN / Cracked)</option>
              <option value="microsoft">Microsoft Account</option>
            </select>
          </div>
        </div>
      </div>

      <button className="btn btn-primary" onClick={saveConfig} disabled={saving}>
        {saving ? '⏳ Saving...' : '💾 Save Configuration'}
      </button>
    </>
  );
}

/* ═══ Prompts Page ═══ */
function PromptsPage({ showToast }) {
  const [config, setConfig] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/config`).then(r => r.json()).then(setConfig).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success) showToast('Prompt saved!');
      else showToast(data.error, 'error');
    } catch { showToast('Network error', 'error'); }
    setSaving(false);
  };

  if (!config) return <div className="empty-state"><div className="icon">⏳</div><p>Loading...</p></div>;

  return (
    <>
      <div className="page-header">
        <h2>Prompt Editor</h2>
        <p>Configure how mineAI thinks and behaves in-game</p>
      </div>

      <div className="card section-gap">
        <div className="card-title">Built-in System Prompt (Read Only)</div>
        <div className="prompt-info">
          <h4>🔒 Core Identity — Always Active</h4>
          <pre>{BUILT_IN_PROMPT}</pre>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          This prompt is always prepended to every LLM call. It defines mineAI's core behavior and cannot be changed from the dashboard.
        </p>
      </div>

      <div className="card section-gap">
        <div className="card-title">Custom Behavior Prompt</div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
          Add additional instructions to customize your bot's personality and behavior. This is appended after the built-in prompt.
        </p>
        <div className="form-group">
          <label>Your Custom Prompt</label>
          <textarea
            value={config.llm.userPrompt || ''}
            onChange={e => setConfig({ ...config, llm: { ...config.llm, userPrompt: e.target.value } })}
            placeholder="e.g., You are a friendly guard bot. Protect spawn area. Be sarcastic but helpful..."
            style={{ minHeight: 150 }}
          />
        </div>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? '⏳ Saving...' : '💾 Save Prompt'}
        </button>
      </div>
    </>
  );
}

/* ═══ Chat Page ═══ */
function ChatPage({ chatMsgs }) {
  const feedRef = useRef(null);
  useEffect(() => { feedRef.current?.scrollTo(0, feedRef.current.scrollHeight); }, [chatMsgs]);

  return (
    <>
      <div className="page-header">
        <h2>Chat Feed</h2>
        <p>Real-time messages from the Minecraft server</p>
      </div>

      <div className="card">
        {chatMsgs.length === 0 ? (
          <div className="empty-state"><div className="icon">💭</div><p>No messages yet. Chat will appear here when players talk.</p></div>
        ) : (
          <div className="chat-feed" ref={feedRef} style={{ maxHeight: 600 }}>
            {chatMsgs.map((m, i) => (
              <div className="chat-msg" key={i}>
                <span className="username">{m.username}</span>
                <span className="message">{m.message}</span>
                <span className="time">{m.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* ═══ Logs Page ═══ */
function LogsPage({ logs }) {
  const logRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (autoScroll && logRef.current) logRef.current.scrollTo(0, logRef.current.scrollHeight);
  }, [logs, autoScroll]);

  return (
    <>
      <div className="page-header">
        <h2>Logs</h2>
        <p>Real-time daemon output</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button className={`btn ${autoScroll ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setAutoScroll(!autoScroll)}>
          {autoScroll ? '⏬ Auto-scroll ON' : '⏸️ Auto-scroll OFF'}
        </button>
      </div>

      <div className="log-container" ref={logRef}>
        {logs.length === 0 ? (
          <div className="empty-state" style={{ padding: 20 }}>No logs yet</div>
        ) : (
          logs.map((line, i) => <div className="log-line" key={i}>{line}</div>)
        )}
      </div>
    </>
  );
}

/* ═══ About Page ═══ */
function AboutPage() {
  const [version, setVersion] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/version`).then(r => r.json()).then(setVersion).catch(() => {});
  }, []);

  return (
    <>
      <div className="page-header">
        <h2>About mineAI</h2>
        <p>Version info and links</p>
      </div>

      <div className="card section-gap">
        <div className="card-title">Version</div>
        {version ? (
          <div className="version-info">
            <div>
              <span className="version-badge current">v{version.current}</span>
              {version.updateAvailable && (
                <span className="version-badge update" style={{ marginLeft: 8 }}>
                  ✨ v{version.latest} available
                </span>
              )}
            </div>
            {version.updateAvailable && (
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Run <code style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>git pull && npm run build</code> to update.
              </p>
            )}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>Loading version info...</p>
        )}
      </div>

      <div className="card section-gap">
        <div className="card-title">Links</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <a href="https://github.com/nexurlabs/mineAI" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 14 }}>
            📦 GitHub Repository
          </a>
          <a href="https://github.com/nexurlabs/mineAI/issues" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 14 }}>
            🐛 Report a Bug
          </a>
          <a href="https://github.com/nexurlabs" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 14 }}>
            🏢 NexurLabs
          </a>
        </div>
      </div>

      <div className="card">
        <div className="card-title">About</div>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          mineAI is an intelligent LLM-powered Minecraft bot built by NexurLabs.
          It uses AI to interact with players in-game, perform actions like pathfinding
          and combat, and respond to chat messages. Self-hosted, open-source, and BYOK.
        </p>
      </div>
    </>
  );
}
