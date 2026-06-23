import React, { useEffect, useRef, useState } from 'react';
import {
  Box, Paper, Typography, TextField, IconButton, Fab, Chip,
  CircularProgress, Tooltip, Button,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const baseUrl = process.env.REACT_APP_API_URL;

// Renders assistant text as markdown with compact, chat-friendly spacing.
// MUI components map keeps typography consistent with the rest of the app.
function AssistantMarkdown({ children }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ node, ...props }) => (
          <Typography variant="body2" sx={{ fontSize: '0.9rem', mb: 1, '&:last-child': { mb: 0 }, lineHeight: 1.5 }} {...props} />
        ),
        ul: ({ node, ...props }) => (
          <Box component="ul" sx={{ pl: 2.5, my: 0.5 }} {...props} />
        ),
        ol: ({ node, ...props }) => (
          <Box component="ol" sx={{ pl: 2.5, my: 0.5 }} {...props} />
        ),
        li: ({ node, ...props }) => (
          <Typography component="li" variant="body2" sx={{ fontSize: '0.9rem', mb: 0.25, lineHeight: 1.4 }} {...props} />
        ),
        strong: ({ node, ...props }) => (
          <Box component="strong" sx={{ fontWeight: 700 }} {...props} />
        ),
        h1: ({ node, ...props }) => (
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 0.5, mb: 0.5 }} {...props} />
        ),
        h2: ({ node, ...props }) => (
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 0.5, mb: 0.5 }} {...props} />
        ),
        h3: ({ node, ...props }) => (
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 0.5, mb: 0.5 }} {...props} />
        ),
        hr: ({ node, ...props }) => (
          <Box component="hr" sx={{ border: 0, borderTop: '1px solid #e0e0e0', my: 1 }} {...props} />
        ),
        a: ({ node, ...props }) => (
          <Box component="a" sx={{ color: 'primary.main' }} target="_blank" rel="noopener noreferrer" {...props} />
        ),
        code: ({ node, ...props }) => (
          <Box component="code" sx={{ bgcolor: '#f0f0f0', px: 0.5, borderRadius: 0.5, fontFamily: 'monospace', fontSize: '0.85em' }} {...props} />
        ),
        table: ({ node, ...props }) => (
          <Box component="table" sx={{ borderCollapse: 'collapse', my: 1, fontSize: '0.85rem', '& td, & th': { border: '1px solid #e0e0e0', px: 1, py: 0.5, textAlign: 'left' } }} {...props} />
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

const GREETING = {
  role: 'assistant',
  content: "Hi! I'm Henry, the SAMS Instant Response Agent.\n\nI can help you add student assignments, look up class or student assignment information, and answer questions about how SAMS works.\n\nHow can I help you today?",
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading, open]);

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const next = [...messages, { role: 'user', content }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const r = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        // Skip the canned greeting — backend builds its own system prompt.
        body: JSON.stringify({ messages: next.filter((m) => m !== GREETING) }),
      });
      if (!r.ok) throw new Error(`Chat failed (${r.status})`);
      const data = await r.json();
      setMessages((m) => [...m, { role: 'assistant', content: data.reply, actions: data.actions || [] }]);
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', content: 'Sorry — something went wrong. Please try again.' }]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <Tooltip title="Assistant">
          <Fab
            color="primary"
            onClick={() => setOpen(true)}
            sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1300 }}
          >
            <ChatIcon />
          </Fab>
        </Tooltip>
      )}

      {/* Chat panel */}
      {open && (
        <Paper
          elevation={8}
          sx={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 1300,
            width: expanded ? 720 : 380, maxWidth: 'calc(100vw - 48px)',
            height: expanded ? 'calc(100vh - 48px)' : 540, maxHeight: 'calc(100vh - 48px)',
            display: 'flex', flexDirection: 'column', borderRadius: 3, overflow: 'hidden',
            transition: 'width 0.15s ease, height 0.15s ease',
          }}
        >
          {/* Header */}
          <Box sx={{
            px: 2, py: 1.5, bgcolor: 'primary.main', color: 'primary.contrastText',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Instant Response Agent (IRA)</Typography>
            <Box>
              <Tooltip title="New conversation">
                <IconButton size="small" sx={{ color: 'inherit' }} onClick={() => setMessages([GREETING])}>
                  <RestartAltIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={expanded ? 'Shrink' : 'Expand'}>
                <IconButton size="small" sx={{ color: 'inherit' }} onClick={() => setExpanded((v) => !v)}>
                  {expanded ? <CloseFullscreenIcon fontSize="small" /> : <OpenInFullIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
              <IconButton size="small" sx={{ color: 'inherit' }} onClick={() => setOpen(false)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* Messages */}
          <Box ref={scrollRef} sx={{ flex: 1, overflowY: 'auto', p: 1.5, bgcolor: '#fafafa' }}>
            {messages.map((m, i) => {
              // Only the latest message shows its action buttons, so stale
              // confirm buttons disappear once the conversation moves on.
              const showActions = i === messages.length - 1 && !loading && Array.isArray(m.actions) && m.actions.length > 0;
              return (
                <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start', mb: 1 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      px: 1.5, py: 1, maxWidth: '85%',
                      bgcolor: m.role === 'user' ? 'primary.main' : '#fff',
                      color: m.role === 'user' ? 'primary.contrastText' : 'text.primary',
                      border: m.role === 'user' ? 'none' : '1px solid #e0e0e0',
                      borderRadius: 2, fontSize: '0.9rem',
                      whiteSpace: m.role === 'user' ? 'pre-wrap' : 'normal',
                      '& > *:first-of-type': { mt: 0 },
                      '& > *:last-child': { mb: 0 },
                    }}
                  >
                    {m.role === 'user'
                      ? m.content
                      : <AssistantMarkdown>{m.content}</AssistantMarkdown>}
                  </Paper>
                  {showActions && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.75 }}>
                      {m.actions.map((a, ai) => (
                        <Button
                          key={ai}
                          variant="contained"
                          size="small"
                          disableElevation
                          onClick={() => send(a.send)}
                          sx={{ textTransform: 'none', borderRadius: 2 }}
                        >
                          {a.label}
                        </Button>
                      ))}
                    </Box>
                  )}
                </Box>
              );
            })}
            {/* Prominent starter action — only on a fresh conversation */}
            {messages.length <= 1 && !loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                  variant="contained"
                  disableElevation
                  onClick={() => send('Add Student Assignment')}
                  sx={{ textTransform: 'none', borderRadius: 2, px: 3, py: 1 }}
                >
                  Add Student Assignment
                </Button>
              </Box>
            )}
            {loading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, m: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>thinking…</Typography>
              </Box>
            )}
          </Box>

          {/* Quick action */}
          {messages.length <= 1 && (
            <Box sx={{ px: 1.5, pb: 0.5 }}>
              <Chip
                label="Add Student Assignment"
                color="primary"
                variant="outlined"
                size="small"
                onClick={() => send('Add Student Assignment')}
              />
            </Box>
          )}

          {/* Input */}
          <Box sx={{ display: 'flex', gap: 1, p: 1.5, borderTop: '1px solid #e0e0e0', bgcolor: '#fff' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Ask me anything…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              multiline
              maxRows={3}
            />
            <IconButton color="primary" onClick={() => send()} disabled={loading || !input.trim()}>
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      )}
    </>
  );
}
